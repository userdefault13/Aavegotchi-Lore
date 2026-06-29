<template>
  <div v-if="world" :class="$style.workspace">
    <header :class="$style.head">
      <div>
        <router-link to="/lore" class="text-xs opacity-70">← Lore</router-link>
        <h1 class="font-pixel text-xs mt-1">{{ world.title }}</h1>
        <p v-if="world.upstreamWorldId" :class="$style.branchBadge">
          Branch · {{ syncStatus?.commitsBehind ? `${syncStatus.commitsBehind} behind canon` : 'up to date' }}
          · {{ world.slug }}
        </p>
        <p v-else-if="world.visibility === 'canonical'" :class="$style.canonBadge">
          DAO canon{{ canWrite ? '' : ' · read-only' }}
        </p>
      </div>
      <div :class="$style.actions">
        <div :class="$style.primaryActions">
          <GotchiTooltip v-if="canWrite && world.upstreamWorldId" :tip="LORE_ACTIONS.commit">
            <button type="button" class="btn-pixel text-[8px]" :disabled="committing" @click="checkpointCommit">
              {{ committing ? '…' : 'Commit' }}
            </button>
          </GotchiTooltip>
          <GotchiTooltip v-if="world.upstreamWorldId" :tip="LORE_ACTIONS.pushReview">
            <router-link
              :to="`/lore/${worldId}/proposals?new=1`"
              class="btn-pixel text-[8px]"
            >
              Push for review
            </router-link>
          </GotchiTooltip>
          <GotchiTooltip v-else-if="canWrite" :tip="world.visibility === 'canonical' ? LORE_ACTIONS.recordEdit : LORE_ACTIONS.checkpoint">
            <button type="button" class="btn-pixel text-[8px]" :disabled="committing" @click="checkpointCommit">
              {{ committing ? '…' : world.visibility === 'canonical' ? 'Record edit' : 'Checkpoint' }}
            </button>
          </GotchiTooltip>
          <GotchiTooltip v-if="world.visibility === 'canonical' && !world.upstreamWorldId" :tip="LORE_ACTIONS.branch">
            <button type="button" class="btn-pixel text-[8px]" @click="openBranch">Branch</button>
          </GotchiTooltip>
        </div>
        <details :class="$style.moreMenu">
          <summary class="btn-pixel text-[8px]">More</summary>
          <div :class="$style.morePanel">
            <GotchiTooltip :tip="LORE_ACTIONS.exportMd">
              <button type="button" class="btn-pixel text-[8px]" @click="exportMd">Export MD</button>
            </GotchiTooltip>
            <GotchiTooltip :tip="LORE_ACTIONS.exportPdf">
              <button type="button" class="btn-pixel text-[8px]" @click="exportPdf">Export PDF</button>
            </GotchiTooltip>
            <GotchiTooltip :tip="LORE_ACTIONS.maps">
              <router-link :to="`/lore/${worldId}/maps`" class="btn-pixel text-[8px]">Maps</router-link>
            </GotchiTooltip>
            <GotchiTooltip :tip="LORE_ACTIONS.aiArt">
              <button type="button" class="btn-pixel text-[8px]" @click="openAiArt">✨ AI art</button>
            </GotchiTooltip>
            <GotchiTooltip :tip="LORE_ACTIONS.importGotchi">
              <button type="button" class="btn-pixel text-[8px]" @click="importGotchi">Import Gotchi</button>
            </GotchiTooltip>
          </div>
        </details>
      </div>
    </header>

    <div :class="$style.body">
      <aside :class="$style.sidebar">
        <LoreWorkspaceRail
          variant="sidebar"
          :world-id="worldId"
          active="lore"
          :is-branch="!!world.upstreamWorldId"
          :is-canon="world.visibility === 'canonical'"
        />
        <PageTree
          embedded
          :pages="pages"
          :selected-id="selectedPageId"
          @select="selectPage"
          @add="addPage"
          @add-child="addChildPage"
          @delete="deletePage"
          @reorder="onReorderPages"
        />
      </aside>

      <main :class="$style.main">
        <template v-if="page">
          <div :class="$style.meta">
            <input v-model="page.title" class="input-gotchi" @change="savePage" />
            <div :class="$style.metaRow">
              <select v-model="page.templateId" class="input-gotchi w-auto text-xs" @change="onTemplateChange">
                <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.icon }} {{ t.name }}</option>
              </select>
              <select v-model="page.frame" class="input-gotchi w-auto text-xs" @change="savePage">
                <option :value="null">No frame</option>
                <option value="purple">Purple frame</option>
                <option value="pink">Pink frame</option>
                <option value="cyan">Cyan frame</option>
                <option value="gold">Gold frame</option>
              </select>
            </div>
            <div class="flex gap-1 flex-wrap mt-1">
              <TagChip v-for="(t, i) in page.tags" :key="i" :label="t.label" :color="t.color" />
              <select v-model="newTagColor" class="input-gotchi w-auto text-xs" @change="addTag">
                <option value="">+ Tag</option>
                <option v-for="c in TAG_COLORS" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <template v-if="orphanRuneFields.length">
            <div :class="$style.runeSection" :style="{ height: `${runeSectionHeight}px` }">
              <RuneFieldEditor
                :fields="orphanRuneFields"
                v-model="page.runes"
                :textarea-pane-height="textareaPaneHeight"
                @update:model-value="savePage"
                @resize-delta="onMembersPaneResize"
              />
            </div>
            <VerticalResizeHandle @resize-delta="onRuneSectionResize" />
          </template>

          <div :class="$style.canvasRow">
            <PageLayoutEditor
              :world-id="worldId"
              :page-title="page.title"
              :template-id="page.templateId"
              :blocks="page.blocks"
              :layout="page.layout"
              :frame="page.frame"
              :runes="page.runes"
              :rune-fields="template?.runeFields || []"
              v-model:selected-block-id="selectedBlockId"
              @add-from-palette="addFromPalette"
              @update-block="patchBlock"
              @remove-block="removeBlock"
              @update-runes="patchRunes"
            />
          </div>
        </template>
        <p v-else class="text-sm opacity-60">Select or create a page</p>
      </main>

      <LorePageUtilSidebar
        v-if="world.upstreamWorldId || page || isCanon || linkedChronicles.length"
        :world-id="worldId"
        :page="page"
        :page-id="page?.id || ''"
        :pages="pages"
        :cross-links="page?.crossLinks || []"
        :mirror-links="page?.mirrorLinks || []"
        :backlinks="backlinks"
        :map-pins="mapPinsForPage"
        :diagram-nodes="diagramNodesForPage"
        :rune-fields="template?.runeFields || []"
        :blocks="page?.blocks || []"
        :revisions="revisions"
        :revisions-loading="revisionsLoading"
        :restoring-revision-id="restoringRevisionId"
        :sync-status="syncStatus"
        :fork-commits="forkCommits"
        :sync-loading="syncLoading"
        :canon-commits="canonCommits"
        :linked-chronicles="linkedChronicles"
        :mirror-toast="mirrorToast"
        :is-canon="isCanon"
        :is-branch="!!world.upstreamWorldId"
        :can-write="canWrite"
        :committing="committing"
        @checkpoint="checkpointCommit"
        @record-edit="recordDaoEdit"
        @update:cross-links="onCrossLinks"
        @update:mirror-links="onMirrorLinks"
        @navigate="selectPage"
        @navigate-map="navigateToMapPin"
        @navigate-diagram="navigateToDiagramNode"
        @apply-now="applyMirrorsNow"
        @restore="restoreRevision"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loreApi, tomeApi } from '@/services/api';
import { GOTCHI_TEMPLATES, TAG_COLORS } from '@/seed/gotchiTemplates';
import PageTree from '@/components/lore/PageTree.vue';
import PageLayoutEditor from '@/components/lore/PageLayoutEditor.vue';
import RuneFieldEditor from '@/components/lore/RuneFieldEditor.vue';
import VerticalResizeHandle from '@/components/shared/VerticalResizeHandle.vue';
import LorePageUtilSidebar from '@/components/lore/LorePageUtilSidebar.vue';
import LoreWorkspaceRail from '@/components/lore/LoreWorkspaceRail.vue';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { LORE_ACTIONS } from '@/utils/workspaceHints';
import TagChip from '@/components/shared/TagChip.vue';
import { applyPageUpdates, computeMoveUpdates } from '@/utils/pageTree';
import { useAibotStore, useWalletStore } from '@/stores';
import { buildPageIllustrationPrompt } from '@/utils/aibotPrompts';
import { mapsUrl } from '@/utils/mapPins';
import { diagramsUrl, findDiagramNodesForPage } from '@/utils/diagramDeepLink';
import { MEDIA_PALETTE } from '@/utils/blockPalette';
import {
  blocksFromTemplate,
  createBlockFromPalette,
  layoutNeedsMigration,
  normalizePageLayout,
  removeBlock as removeLayoutBlock,
  runeFieldsOnCanvas,
  updateBlock as updateLayoutBlock,
} from '@/utils/layoutEngine';

const aibot = useAibotStore();
const wallet = useWalletStore();
const route = useRoute();
const router = useRouter();
const worldId = computed(() => route.params.worldId);
const world = ref(null);
const pages = ref([]);
const maps = ref([]);
const diagrams = ref([]);
const selectedPageId = ref('');
const page = ref(null);
const newTagColor = ref('');
const backlinks = ref([]);
const revisions = ref([]);
const revisionsLoading = ref(false);
const restoringRevisionId = ref('');
const selectedBlockId = ref('');
const mirrorToast = ref('');
const syncStatus = ref(null);
const forkCommits = ref([]);
const canonCommits = ref([]);
const syncLoading = ref(false);
const committing = ref(false);
const daoEditTimer = ref(null);
const daoEditPages = ref(new Set());
const linkedChronicles = ref([]);
const templates = ref(GOTCHI_TEMPLATES);

const RUNE_SECTION_STORAGE_KEY = 'gotchi-lore-rune-section-height';
const TEXTAREA_PANE_STORAGE_KEY = 'gotchi-lore-rune-textarea-height';
const RUNE_TOP_CHROME = 92;
const MIN_RUNE_SECTION = 160;
const MAX_RUNE_SECTION = 560;
const MIN_TEXTAREA_PANE = 96;
const MAX_TEXTAREA_PANE = 440;
const DEFAULT_TEXTAREA_PANE = 160;
const DEFAULT_RUNE_SECTION = RUNE_TOP_CHROME + DEFAULT_TEXTAREA_PANE + 12;

const textareaPaneHeight = ref(DEFAULT_TEXTAREA_PANE);
const runeSectionHeight = ref(DEFAULT_RUNE_SECTION);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampRuneSection(value) {
  return clamp(value, MIN_RUNE_SECTION, MAX_RUNE_SECTION);
}

function clampTextareaPane(value) {
  return clamp(value, MIN_TEXTAREA_PANE, MAX_TEXTAREA_PANE);
}

function syncSectionHeightFromTextarea() {
  runeSectionHeight.value = clampRuneSection(RUNE_TOP_CHROME + textareaPaneHeight.value + 12);
}

function persistRuneLayout() {
  localStorage.setItem(RUNE_SECTION_STORAGE_KEY, String(runeSectionHeight.value));
  localStorage.setItem(TEXTAREA_PANE_STORAGE_KEY, String(textareaPaneHeight.value));
}

function onMembersPaneResize(deltaY) {
  textareaPaneHeight.value = clampTextareaPane(textareaPaneHeight.value + deltaY);
  syncSectionHeightFromTextarea();
  persistRuneLayout();
}

function onRuneSectionResize(deltaY) {
  const nextSection = clampRuneSection(runeSectionHeight.value + deltaY);
  const applied = nextSection - runeSectionHeight.value;
  if (applied === 0) return;
  runeSectionHeight.value = nextSection;
  textareaPaneHeight.value = clampTextareaPane(textareaPaneHeight.value + applied);
  persistRuneLayout();
}

const canWrite = computed(() => {
  if (!world.value) return false;
  const addr = (wallet.address || '').toLowerCase();
  if (!addr) return false;
  if (world.value.ownerWallet === addr) return true;
  if (world.value.maintainers?.includes(addr)) return true;
  return false;
});

const isCanon = computed(
  () => world.value?.visibility === 'canonical' && !world.value?.upstreamWorldId,
);

const template = computed(() => {
  if (!page.value) return null;
  return templates.value.find((t) => t.id === page.value.templateId) || templates.value[0];
});

const selectedBlock = computed(
  () => page.value?.blocks?.find((b) => b.id === selectedBlockId.value) || null,
);

const orphanRuneFields = computed(() => {
  const onCanvas = runeFieldsOnCanvas(page.value?.blocks);
  return (template.value?.runeFields || []).filter((f) => !onCanvas.has(f.id));
});

const mapPinsForPage = computed(() => {
  if (!page.value) return [];
  const out = [];
  for (const m of maps.value) {
    for (const pin of m.pins || []) {
      if (pin.pageId === page.value.id) {
        out.push({ id: pin.id, mapId: m.id, mapTitle: m.title, label: pin.label });
      }
    }
  }
  return out;
});

const diagramNodesForPage = computed(() => {
  if (!page.value) return [];
  return findDiagramNodesForPage(diagrams.value, page.value.id);
});

onMounted(() => {
  const savedTextarea = Number.parseInt(localStorage.getItem(TEXTAREA_PANE_STORAGE_KEY) || '', 10);
  const savedSection = Number.parseInt(localStorage.getItem(RUNE_SECTION_STORAGE_KEY) || '', 10);
  if (Number.isFinite(savedTextarea)) {
    textareaPaneHeight.value = clampTextareaPane(savedTextarea);
  }
  if (Number.isFinite(savedSection)) {
    runeSectionHeight.value = clampRuneSection(savedSection);
    textareaPaneHeight.value = clampTextareaPane(
      runeSectionHeight.value - RUNE_TOP_CHROME - 12,
    );
  } else {
    syncSectionHeightFromTextarea();
  }
  load();
});
onUnmounted(() => {
  if (daoEditTimer.value) window.clearTimeout(daoEditTimer.value);
});
watch(worldId, load);
watch(
  () => route.query.page,
  (id) => {
    if (id && typeof id === 'string') selectPage(id);
  },
);

async function load() {
  world.value = await loreApi.getWorld(worldId.value);
  if (world.value.templateDefs?.length) templates.value = world.value.templateDefs;
  pages.value = await loreApi.listPages(worldId.value);
  maps.value = await loreApi.listMaps(worldId.value);
  diagrams.value = await loreApi.listDiagrams(worldId.value);
  await loadLinkedChronicles();
  await loadForkSync();
  await loadCanonCommits();
  const qPage = route.query.page;
  if (qPage && typeof qPage === 'string') {
    await selectPage(qPage);
  } else if (pages.value.length && !selectedPageId.value) {
    selectPage(pages.value[0].id);
  }
}

function navigateToMapPin(pin) {
  router.push(mapsUrl(worldId.value, { mapId: pin.mapId, pinId: pin.id }));
}

function navigateToDiagramNode(node) {
  router.push(diagramsUrl(worldId.value, { diagramId: node.diagramId, nodeId: node.nodeId }));
}

async function loadLinkedChronicles() {
  const ids = world.value?.linkedChronicleIds || [];
  if (!ids.length) {
    linkedChronicles.value = [];
    return;
  }
  try {
    linkedChronicles.value = await Promise.all(ids.map((id) => tomeApi.getChronicle(id)));
  } catch {
    linkedChronicles.value = [];
  }
}

async function loadCanonCommits() {
  if (!isCanon.value) {
    canonCommits.value = [];
    return;
  }
  try {
    canonCommits.value = await loreApi.listWorldCommits(worldId.value);
  } catch {
    canonCommits.value = [];
  }
}

async function loadForkSync() {
  if (!world.value?.upstreamWorldId) {
    syncStatus.value = null;
    forkCommits.value = [];
    return;
  }
  syncLoading.value = true;
  try {
    [syncStatus.value, forkCommits.value] = await Promise.all([
      loreApi.getWorldSyncStatus(worldId.value),
      loreApi.listWorldCommits(worldId.value),
    ]);
  } catch {
    syncStatus.value = null;
    forkCommits.value = [];
  } finally {
    syncLoading.value = false;
  }
}

async function checkpointCommit() {
  const defaultMsg = isCanon.value ? 'DAO direct edit' : 'Checkpoint';
  const message = prompt('Checkpoint message?', defaultMsg);
  if (message === null) return;
  committing.value = true;
  try {
    const kind = isCanon.value ? 'dao_edit' : 'checkpoint';
    await loreApi.createWorldCommit(worldId.value, message.trim() || defaultMsg, kind);
    world.value = await loreApi.getWorld(worldId.value);
    await loadForkSync();
    await loadCanonCommits();
  } catch (err) {
    alert(err.message || 'Checkpoint failed');
  } finally {
    committing.value = false;
  }
}

async function recordDaoEdit() {
  const message = prompt('Describe this DAO edit?', 'DAO direct edit');
  if (message === null) return;
  committing.value = true;
  try {
    await loreApi.createWorldCommit(worldId.value, message.trim() || 'DAO direct edit', 'dao_edit');
    world.value = await loreApi.getWorld(worldId.value);
    await loadCanonCommits();
  } catch (err) {
    alert(err.message || 'Record failed');
  } finally {
    committing.value = false;
  }
}

function scheduleDaoAutoCommit(pageTitle) {
  if (!isCanon.value || !canWrite.value || !pageTitle) return;
  daoEditPages.value.add(pageTitle);
  if (daoEditTimer.value) window.clearTimeout(daoEditTimer.value);
  daoEditTimer.value = window.setTimeout(flushDaoAutoCommit, 45000);
}

async function flushDaoAutoCommit() {
  daoEditTimer.value = null;
  if (!daoEditPages.value.size || committing.value) return;
  const titles = [...daoEditPages.value].slice(0, 3);
  daoEditPages.value.clear();
  const suffix = titles.length > 1 ? ` (+${titles.length - 1} more)` : '';
  const message = `DAO edit: ${titles[0]}${suffix}`;
  committing.value = true;
  try {
    await loreApi.createWorldCommit(worldId.value, message, 'dao_edit');
    world.value = await loreApi.getWorld(worldId.value);
    await loadCanonCommits();
  } catch {
    /* silent — manual record still available */
  } finally {
    committing.value = false;
  }
}

async function openBranch() {
  if (!world.value) return;
  try {
    if (!wallet.address) await wallet.connect();
    if (!wallet.token && window.ethereum) await wallet.signIn();
    const branch = await loreApi.branchWorld(world.value.id);
    router.push(`/lore/${branch.id}`);
  } catch (err) {
    alert(err.message || 'Could not open branch');
  }
}

async function selectPage(id) {
  selectedPageId.value = id;
  selectedBlockId.value = '';
  page.value = await loreApi.getPage(id);
  const tpl = templates.value.find((t) => t.id === page.value.templateId) || templates.value[0];
  if (layoutNeedsMigration(page.value)) {
    const normalized = normalizePageLayout(page.value, tpl);
    page.value.layout = normalized.layout;
    page.value.blocks = normalized.blocks;
    await loreApi.updatePage(page.value.id, { layout: normalized.layout, blocks: normalized.blocks });
  }
  try {
    const bl = await loreApi.getPageBacklinks(id);
    backlinks.value = bl.pages || [];
  } catch {
    backlinks.value = [];
  }
  loadRevisions(id);
}

async function loadRevisions(pageId) {
  revisionsLoading.value = true;
  try {
    revisions.value = await loreApi.listPageRevisions(pageId);
  } catch {
    revisions.value = [];
  } finally {
    revisionsLoading.value = false;
  }
}

async function restoreRevision(revisionId) {
  if (!page.value || !confirm('Restore this revision? Current content will be saved to history first.')) return;
  restoringRevisionId.value = revisionId;
  try {
    page.value = await loreApi.restorePageRevision(page.value.id, revisionId);
    const i = pages.value.findIndex((p) => p.id === page.value.id);
    if (i >= 0) pages.value[i] = { ...pages.value[i], title: page.value.title };
    await loadRevisions(page.value.id);
  } catch (err) {
    alert(err.message || 'Restore failed');
  } finally {
    restoringRevisionId.value = '';
  }
}

async function exportMd() {
  try {
    await loreApi.exportWorldMarkdown(worldId.value, `${world.value?.title || 'world'}-lore.zip`);
  } catch (err) {
    alert(err.message || 'Export failed');
  }
}

async function exportPdf() {
  try {
    await loreApi.exportWorldPdf(worldId.value, `${world.value?.title || 'world'}-lore.pdf`);
  } catch (err) {
    alert(err.message || 'Export failed');
  }
}

async function addPage(parentId = null) {
  const title = prompt('Page title?', parentId ? 'Sub-page' : 'New page');
  if (!title) return;
  const templateId = templates.value[0]?.id || 'aavegotchi';
  const tpl = templates.value.find((t) => t.id === templateId) || templates.value[0];
  const { layout, blocks } = blocksFromTemplate(tpl);
  const created = await loreApi.createPage({
    worldId: worldId.value,
    parentId,
    title,
    templateId,
    layout,
    blocks,
  });
  pages.value = await loreApi.listPages(worldId.value);
  selectPage(created.id);
}

function addChildPage(parentId) {
  addPage(parentId);
}

async function deletePage(id) {
  if (!confirm('Delete this page?')) return;
  await loreApi.deletePage(id);
  pages.value = await loreApi.listPages(worldId.value);
  if (selectedPageId.value === id) {
    selectedPageId.value = '';
    page.value = null;
    if (pages.value.length) selectPage(pages.value[0].id);
  }
}

async function onReorderPages({ draggedId, targetId, position }) {
  const updates = computeMoveUpdates(pages.value, draggedId, targetId, position);
  if (!updates?.length) return;
  pages.value = applyPageUpdates(pages.value, updates);
  try {
    pages.value = await loreApi.reorderPages(worldId.value, updates);
  } catch (err) {
    pages.value = await loreApi.listPages(worldId.value);
    alert(err.message || 'Reorder failed');
  }
}

function showMirrorSync(mirrorSync) {
  const synced = mirrorSync?.synced || [];
  if (!synced.length) return;
  const names = synced.map((s) => s.title).join(', ');
  mirrorToast.value = `Mirrored to ${synced.length} page(s): ${names}`;
  window.setTimeout(() => {
    mirrorToast.value = '';
  }, 4000);
}

async function savePage() {
  if (!page.value || !canWrite.value) return;
  const result = await loreApi.updatePage(page.value.id, {
    title: page.value.title,
    templateId: page.value.templateId,
    runes: page.value.runes,
    tags: page.value.tags,
    frame: page.value.frame,
    mirrorLinks: page.value.mirrorLinks,
    crossLinks: page.value.crossLinks,
  });
  showMirrorSync(result.mirrorSync);
  const i = pages.value.findIndex((p) => p.id === page.value.id);
  if (i >= 0) pages.value[i] = { ...pages.value[i], title: page.value.title };
  scheduleDaoAutoCommit(page.value.title);
}

async function saveBlocks(blocks, layout) {
  if (!page.value || !canWrite.value) return;
  page.value.blocks = blocks;
  if (layout) page.value.layout = layout;
  const result = await loreApi.updatePage(page.value.id, {
    blocks,
    ...(layout ? { layout } : {}),
  });
  showMirrorSync(result.mirrorSync);
  scheduleDaoAutoCommit(page.value.title);
}

function addFromPalette(item) {
  if (!page.value) return;
  const tpl = template.value;
  if (item.type === 'rune' && runeFieldsOnCanvas(page.value.blocks).has(item.runeId)) return;
  const block = createBlockFromPalette(item, page.value.blocks, tpl);
  const layout = page.value.layout || tpl?.layout;
  saveBlocks([...(page.value.blocks || []), block], layout);
  selectedBlockId.value = block.id;
}

function patchBlock(blockId, patch) {
  if (!page.value) return;
  const blocks = updateLayoutBlock(page.value.blocks, blockId, patch);
  saveBlocks(blocks, page.value.layout);
}

function removeBlock(blockId) {
  if (!page.value || !confirm('Remove this block?')) return;
  const blocks = removeLayoutBlock(page.value.blocks, blockId);
  if (selectedBlockId.value === blockId) selectedBlockId.value = '';
  saveBlocks(blocks, page.value.layout);
}

function patchRunes(patch) {
  if (!page.value) return;
  page.value.runes = { ...(page.value.runes || {}), ...patch };
  savePage();
}

async function onCrossLinks(links) {
  page.value.crossLinks = links;
  await savePage();
}

async function onMirrorLinks(links) {
  page.value.mirrorLinks = links;
  await savePage();
}

async function applyMirrorsNow() {
  if (!page.value) return;
  try {
    const { synced } = await loreApi.applyPageMirrors(page.value.id);
    showMirrorSync({ synced });
  } catch (err) {
    alert(err.message || 'Mirror apply failed');
  }
}

function onTemplateChange() {
  savePage();
}

function addTag() {
  if (!newTagColor.value || !page.value) return;
  const label = prompt('Tag label?', 'lore');
  if (!label) return;
  page.value.tags = [...(page.value.tags || []), { label, color: newTagColor.value }];
  newTagColor.value = '';
  savePage();
}

async function importGotchi() {
  const tokenId = prompt('Gotchi token ID?');
  if (!tokenId) return;
  const data = await loreApi.importGotchi(tokenId);
  const tpl = templates.value.find((t) => t.id === 'aavegotchi') || templates.value[0];
  const { layout, blocks } = blocksFromTemplate(tpl);
  if (data.imageUrl) {
    const portrait = blocks.find((b) => b.type === 'image');
    if (portrait) {
      portrait.url = data.imageUrl;
      portrait.alt = data.name;
    }
  }
  await loreApi.createPage({
    worldId: worldId.value,
    title: data.name,
    templateId: 'aavegotchi',
    layout,
    blocks,
    runes: { tokenId, brs: data.brs, spiritForce: data.spiritForce, traits: JSON.stringify(data.traits) },
  });
  pages.value = await loreApi.listPages(worldId.value);
}

function openAiArt() {
  if (!page.value) {
    alert('Select a page first');
    return;
  }
  const promptText = buildPageIllustrationPrompt({
    title: page.value.title,
    templateId: page.value.templateId,
    runes: page.value.runes || {},
  });
  aibot.open({
    prompt: promptText,
    contextLabel: page.value.title,
    onImageGenerated: (url) => {
      const item = MEDIA_PALETTE[0];
      const block = createBlockFromPalette(item, page.value.blocks || [], template.value);
      block.url = url;
      block.alt = page.value.title;
      saveBlocks([...(page.value.blocks || []), block], page.value.layout);
    },
  });
}
</script>

<style module>
.workspace {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.head {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.branchBadge {
  font-size: 0.65rem;
  color: #c4b5fd;
  opacity: 0.85;
  margin-top: 0.2rem;
}
.canonBadge {
  font-size: 0.65rem;
  color: #fcd34d;
  opacity: 0.85;
  margin-top: 0.2rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: flex-start;
}
.primaryActions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.moreMenu {
  position: relative;
}
.moreMenu summary {
  list-style: none;
  cursor: pointer;
}
.moreMenu summary::-webkit-details-marker {
  display: none;
}
.morePanel {
  position: absolute;
  right: 0;
  top: calc(100% + 0.35rem);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 9rem;
  padding: 0.55rem;
  background: #1a142d;
  border: 2px solid #8b7db8;
  border-radius: 6px;
  box-shadow: 4px 4px 0 rgba(139, 125, 184, 0.35);
}
.body {
  display: flex;
  gap: 0;
  min-height: min(720px, calc(100vh - 220px));
  max-height: calc(100vh - 180px);
  border: 2px solid #47238d;
  border-radius: 4px;
  overflow: hidden;
  background: #0f0b1e;
}
.sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: rgba(26, 10, 46, 0.9);
  border-right: 2px solid #47238d;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 1rem 1.25rem;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
  background: rgba(15, 11, 30, 0.5);
}
.meta {
  flex-shrink: 0;
  margin-bottom: 0.75rem;
}
.runeSection {
  flex-shrink: 0;
  min-height: 160px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.canvasRow {
  display: flex;
  flex: 1;
  min-height: 160px;
  min-width: 0;
  overflow: hidden;
}
.metaRow {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.35rem;
}
</style>
