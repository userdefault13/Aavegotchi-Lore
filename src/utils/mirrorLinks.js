/** Mirror link helpers for lore page automation. */

export const MIRROR_KINDS = {
  title: 'Page title',
  rune: 'Rune field',
  block: 'Block content',
};

/** Normalize legacy `fields` + new `sync` into a single sync spec. */
export function normalizeMirrorLink(link) {
  const sync = link.sync || {};
  return {
    targetPageId: link.targetPageId,
    title: sync.title === true,
    runes: [...(link.fields || []), ...(sync.runes || [])].filter((v, i, a) => a.indexOf(v) === i),
    blocks: sync.blocks || [],
  };
}

export function buildMirrorLink({ targetPageId, title, runes, blocks }) {
  const link = { targetPageId };
  const sync = {};
  if (title) sync.title = true;
  if (runes?.length) sync.runes = runes;
  if (blocks?.length) sync.blocks = blocks;
  if (Object.keys(sync).length) link.sync = sync;
  if (sync.runes?.length) link.fields = sync.runes;
  return link;
}

export function mirrorLinkLabel(link, pages) {
  const spec = normalizeMirrorLink(link);
  const target = pages.find((p) => p.id === link.targetPageId);
  const parts = [];
  if (spec.title) parts.push('title');
  if (spec.runes.length) parts.push(`${spec.runes.length} rune(s)`);
  if (spec.blocks.length) parts.push(`${spec.blocks.length} block(s)`);
  return `${target?.title || 'Page'} — ${parts.join(', ') || 'nothing'}`;
}

export function findIncomingMirrors(pages, pageId) {
  const incoming = [];
  for (const source of pages) {
    for (const link of source.mirrorLinks || []) {
      if (link.targetPageId !== pageId) continue;
      incoming.push({
        sourcePageId: source.id,
        sourceTitle: source.title,
        link,
        spec: normalizeMirrorLink(link),
      });
    }
  }
  return incoming;
}

export function blockLabelOptions(blocks) {
  return (blocks || [])
    .filter((b) => ['prose', 'image', 'diagram', 'rune'].includes(b.type))
    .map((b) => ({ id: b.id, label: b.label || b.type, type: b.type }));
}

export function findBlockByLabel(blocks, label) {
  if (!label) return null;
  return (blocks || []).find((b) => b.label === label) || null;
}

export function copyBlockContent(sourceBlock, targetBlock) {
  if (!sourceBlock || !targetBlock) return targetBlock;
  const next = { ...targetBlock };
  if (sourceBlock.type === 'prose' || targetBlock.type === 'prose') {
    next.content = sourceBlock.content ?? '';
  }
  if (sourceBlock.type === 'image' || targetBlock.type === 'image') {
    next.url = sourceBlock.url ?? '';
    next.alt = sourceBlock.alt ?? '';
  }
  if (sourceBlock.type === 'diagram' || targetBlock.type === 'diagram') {
    next.content = sourceBlock.content ?? '';
  }
  return next;
}
