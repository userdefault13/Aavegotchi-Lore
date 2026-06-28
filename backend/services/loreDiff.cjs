/** Field-level diff between lore world snapshots (by pageKey). */

function stableJson(value) {
  return JSON.stringify(value ?? null);
}

function eq(a, b) {
  return stableJson(a) === stableJson(b);
}

function pagesByKey(snapshot) {
  const map = new Map();
  for (const page of snapshot?.pages || []) {
    if (page.pageKey) map.set(page.pageKey, page);
  }
  return map;
}

function getPagePathValue(page, path) {
  if (!page || !path) return undefined;
  if (path === 'title') return page.title;
  if (path === 'templateId') return page.templateId;
  if (path === 'frame') return page.frame;
  if (path === 'tags') return page.tags;
  if (path.startsWith('runes.')) {
    return page.runes?.[path.slice(6)];
  }
  if (path.startsWith('blocks.')) {
    const parts = path.split('.');
    const blockId = parts[1];
    const field = parts[2];
    const block = (page.blocks || []).find((b) => b.id === blockId);
    if (!block) return undefined;
    if (field === 'grid') return block.grid;
    return block[field];
  }
  return undefined;
}

function pushHunk(hunks, hunk) {
  hunks.push(hunk);
}

function diffRunes(baseRunes, sourceRunes, hunks) {
  const keys = new Set([...Object.keys(baseRunes || {}), ...Object.keys(sourceRunes || {})]);
  for (const key of keys) {
    const before = baseRunes?.[key] ?? null;
    const after = sourceRunes?.[key] ?? null;
    if (eq(before, after)) continue;
    pushHunk(hunks, { path: `runes.${key}`, kind: 'rune', before, after });
  }
}

function diffBlocks(baseBlocks, sourceBlocks, hunks) {
  const baseMap = new Map((baseBlocks || []).map((b) => [b.id, b]));
  const sourceMap = new Map((sourceBlocks || []).map((b) => [b.id, b]));
  const ids = new Set([...baseMap.keys(), ...sourceMap.keys()]);

  for (const id of ids) {
    const base = baseMap.get(id);
    const source = sourceMap.get(id);
    if (!base && source) {
      pushHunk(hunks, {
        path: `blocks.${id}`,
        kind: 'block',
        before: null,
        after: { label: source.label, type: source.type },
        action: 'add',
      });
      continue;
    }
    if (base && !source) {
      pushHunk(hunks, {
        path: `blocks.${id}`,
        kind: 'block',
        before: { label: base.label, type: base.type },
        after: null,
        action: 'remove',
      });
      continue;
    }
    for (const field of ['content', 'url', 'alt', 'label']) {
      const before = base[field] ?? null;
      const after = source[field] ?? null;
      if (eq(before, after)) continue;
      pushHunk(hunks, {
        path: `blocks.${id}.${field}`,
        kind: 'block',
        before,
        after,
      });
    }
    if (!eq(base.grid, source.grid)) {
      pushHunk(hunks, {
        path: `blocks.${id}.grid`,
        kind: 'layout',
        before: base.grid ?? null,
        after: source.grid ?? null,
      });
    }
  }
}

function diffPage(basePage, sourcePage) {
  const hunks = [];
  if (!basePage || !sourcePage) return hunks;

  for (const field of ['title', 'templateId', 'frame']) {
    const before = basePage[field] ?? null;
    const after = sourcePage[field] ?? null;
    if (!eq(before, after)) {
      pushHunk(hunks, { path: field, kind: 'field', before, after });
    }
  }

  if (!eq(basePage.tags, sourcePage.tags)) {
    pushHunk(hunks, {
      path: 'tags',
      kind: 'meta',
      before: basePage.tags || [],
      after: sourcePage.tags || [],
    });
  }

  diffRunes(basePage.runes, sourcePage.runes, hunks);
  diffBlocks(basePage.blocks, sourcePage.blocks, hunks);
  return hunks;
}

function annotateConflicts(hunks, basePage, upstreamPage) {
  if (!upstreamPage) {
    return hunks.map((h) => ({ ...h, conflict: false }));
  }
  return hunks.map((h) => {
    const baseVal = h.before;
    const upstreamVal = getPagePathValue(upstreamPage, h.path);
    const conflict = !eq(upstreamVal, baseVal) && !eq(upstreamVal, h.after);
    return {
      ...h,
      conflict,
      upstream: conflict ? upstreamVal : undefined,
    };
  });
}

function summarizePatches(patches) {
  let hunksCount = 0;
  let conflictCount = 0;
  for (const patch of patches) {
    hunksCount += patch.hunks?.length || 0;
    conflictCount += (patch.hunks || []).filter((h) => h.conflict).length;
  }
  return {
    pagesChanged: patches.length,
    hunksCount,
    conflictCount,
  };
}

/**
 * Compute PR patches: changes from base → source (fork),
 * with conflict flags vs upstream canon.
 */
function computeProposalPatches({ baseSnapshot, sourceSnapshot, upstreamSnapshot }) {
  const basePages = pagesByKey(baseSnapshot);
  const sourcePages = pagesByKey(sourceSnapshot);
  const upstreamPages = pagesByKey(upstreamSnapshot);
  const allKeys = new Set([...basePages.keys(), ...sourcePages.keys()]);
  const patches = [];

  for (const pageKey of allKeys) {
    const base = basePages.get(pageKey);
    const source = sourcePages.get(pageKey);
    const upstream = upstreamPages.get(pageKey);

    if (!base && source) {
      patches.push({
        pageKey,
        pageTitle: source.title,
        action: 'add',
        hunks: [{ path: '_page', kind: 'page', before: null, after: source.title, action: 'add' }],
      });
      continue;
    }

    if (base && !source) {
      patches.push({
        pageKey,
        pageTitle: base.title,
        action: 'delete',
        hunks: [{ path: '_page', kind: 'page', before: base.title, after: null, action: 'delete' }],
      });
      continue;
    }

    if (!base || !source) continue;

    const rawHunks = diffPage(base, source);
    if (!rawHunks.length) continue;

    const hunks = annotateConflicts(rawHunks, base, upstream);
    patches.push({
      pageKey,
      pageTitle: source.title,
      action: 'modify',
      hunks,
    });
  }

  patches.sort((a, b) => a.pageKey.localeCompare(b.pageKey));
  return patches;
}

/**
 * Pull plan: apply upstream (canon) changes since base into fork.
 * Auto-applies where fork unchanged; surfaces field conflicts otherwise.
 */
function computePullPlan({ baseSnapshot, upstreamSnapshot, forkSnapshot }) {
  const basePages = pagesByKey(baseSnapshot);
  const upstreamPages = pagesByKey(upstreamSnapshot);
  const forkPages = pagesByKey(forkSnapshot);
  const allKeys = new Set([...basePages.keys(), ...upstreamPages.keys(), ...forkPages.keys()]);

  const autoApply = [];
  const conflicts = [];

  for (const pageKey of [...allKeys].sort()) {
    const base = basePages.get(pageKey);
    const upstream = upstreamPages.get(pageKey);
    const fork = forkPages.get(pageKey);

    if (!base && upstream) {
      if (!fork) {
        autoApply.push({
          pageKey,
          pageTitle: upstream.title,
          action: 'add',
          hunks: [{ path: '_page', kind: 'page', before: null, after: upstream.title, action: 'add' }],
        });
      } else {
        conflicts.push({
          pageKey,
          pageTitle: fork.title || upstream.title,
          path: '_page',
          kind: 'page',
          action: 'add',
          base: null,
          ours: fork.title,
          theirs: upstream.title,
        });
      }
      continue;
    }

    if (base && !upstream) {
      const forkMods = fork ? diffPage(base, fork) : [];
      if (!fork || forkMods.length === 0) {
        autoApply.push({
          pageKey,
          pageTitle: base.title,
          action: 'delete',
          hunks: [{ path: '_page', kind: 'page', before: base.title, after: null, action: 'delete' }],
        });
      } else {
        conflicts.push({
          pageKey,
          pageTitle: fork?.title || base.title,
          path: '_page',
          kind: 'page',
          action: 'delete',
          base: base.title,
          ours: fork.title,
          theirs: null,
        });
      }
      continue;
    }

    if (base && upstream && !fork) {
      conflicts.push({
        pageKey,
        pageTitle: upstream.title,
        path: '_page',
        kind: 'page',
        action: 'missing_local',
        base: base.title,
        ours: null,
        theirs: upstream.title,
      });
      continue;
    }

    if (!base || !upstream || !fork) continue;

    const upstreamHunks = diffPage(base, upstream);
    if (!upstreamHunks.length) continue;

    const autoHunks = [];
    for (const hunk of upstreamHunks) {
      const forkVal = getPagePathValue(fork, hunk.path);
      const baseVal = hunk.before;
      if (eq(forkVal, baseVal)) {
        autoHunks.push({ ...hunk });
      } else if (!eq(forkVal, hunk.after)) {
        conflicts.push({
          pageKey,
          pageTitle: fork.title,
          path: hunk.path,
          kind: hunk.kind || 'field',
          action: hunk.action,
          base: baseVal,
          ours: forkVal,
          theirs: hunk.after,
        });
      }
    }

    if (autoHunks.length) {
      autoApply.push({
        pageKey,
        pageTitle: fork.title,
        action: 'modify',
        hunks: autoHunks,
      });
    }
  }

  const hunksCount = autoApply.reduce((n, p) => n + (p.hunks?.length || 0), 0);
  return {
    autoApply,
    conflicts,
    stats: {
      pagesChanged: autoApply.length,
      hunksCount,
      conflictCount: conflicts.length,
    },
  };
}

function conflictKey(pageKey, path) {
  return `${pageKey}::${path || ''}`;
}

module.exports = {
  computeProposalPatches,
  computePullPlan,
  summarizePatches,
  getPagePathValue,
  pagesByKey,
  conflictKey,
  diffPage,
};
