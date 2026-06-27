<template>
  <div v-if="world" :class="$style.wrap">
    <div :class="$style.body">
      <LoreWorkspaceRail :world-id="worldId" active="templates" />
      <div :class="$style.content">
        <router-link :to="`/lore/${worldId}`" class="text-xs opacity-70">← {{ world.title }}</router-link>
        <h1 class="font-pixel text-xs mt-2 mb-3">Templates & Runes</h1>

        <div v-if="!editing" :class="$style.grid">
          <article v-for="t in templates" :key="t.id" class="card-gotchi">
            <h2>{{ t.icon }} {{ t.name }}</h2>
            <p class="text-xs opacity-70 mt-1">
              {{ t.runeFields?.length || 0 }} runes · {{ t.blocks?.length || 0 }} blocks
            </p>
            <ul class="text-xs mt-2">
              <li v-for="f in t.runeFields" :key="f.id">{{ f.label }} ({{ f.type }})</li>
            </ul>
            <div :class="$style.cardActions">
              <button type="button" class="btn-pixel text-[8px]" @click="openDesigner(t)">Edit layout</button>
              <button type="button" class="btn-pixel text-[8px]" @click="refactor(t)">Apply to pages</button>
            </div>
          </article>
        </div>

        <div v-else :class="$style.designer">
          <header :class="$style.designerHead">
            <div>
              <h2 class="font-pixel text-[9px]">{{ editing.icon }} {{ editing.name }} — layout</h2>
              <p class="text-xs opacity-60 mt-1">Sandbox preview — save updates this world's template defaults.</p>
            </div>
            <div :class="$style.designerActions">
              <button type="button" class="btn-pixel text-[8px]" @click="saveTemplate">Save template</button>
              <button type="button" class="btn-pixel text-[8px]" @click="closeDesigner">Done</button>
            </div>
          </header>

          <PageLayoutEditor
            :world-id="worldId"
            :blocks="draftBlocks"
            :layout="draftLayout"
            :runes="sampleRunes"
            :rune-fields="editing.runeFields || []"
            v-model:selected-block-id="selectedBlockId"
            @add-from-palette="addFromPalette"
            @update-block="patchBlock"
            @remove-block="removeBlock"
            @update-runes="patchRunes"
          />
        </div>

        <section v-if="!editing" class="mt-4">
          <button type="button" class="btn-pixel text-[8px]" @click="exportTemplates">Export JSON</button>
          <button type="button" class="btn-pixel text-[8px] ml-2" @click="importTemplates">Import JSON</button>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loreApi } from '@/services/api';
import { GOTCHI_TEMPLATES } from '@/seed/gotchiTemplates';
import LoreWorkspaceRail from '@/components/lore/LoreWorkspaceRail.vue';
import PageLayoutEditor from '@/components/lore/PageLayoutEditor.vue';
import {
  createBlockFromPalette,
  removeBlock as removeLayoutBlock,
  sandboxBlocksFromTemplate,
  templateBlockSpecs,
  updateBlock as updateLayoutBlock,
} from '@/utils/layoutEngine';

const route = useRoute();
const router = useRouter();
const worldId = computed(() => route.params.worldId);
const world = ref(null);
const templates = ref(GOTCHI_TEMPLATES);
const editing = ref(null);
const draftLayout = ref(null);
const draftBlocks = ref([]);
const selectedBlockId = ref('');
const sampleRunes = ref({});

onMounted(load);
watch(
  () => route.query.edit,
  (id) => {
    if (id && typeof id === 'string') {
      const t = templates.value.find((x) => x.id === id);
      if (t) openDesigner(t);
    }
  },
);

async function load() {
  world.value = await loreApi.getWorld(worldId.value);
  if (world.value.templateDefs?.length) {
    templates.value = mergeTemplateDefs(GOTCHI_TEMPLATES, world.value.templateDefs);
  }
  const editId = route.query.edit;
  if (editId && typeof editId === 'string') {
    const t = templates.value.find((x) => x.id === editId);
    if (t) openDesigner(t);
  }
}

function mergeTemplateDefs(base, overrides) {
  const byId = Object.fromEntries(overrides.map((t) => [t.id, t]));
  return base.map((t) => ({ ...t, ...byId[t.id] }));
}

function openDesigner(template) {
  editing.value = { ...template };
  const sandbox = sandboxBlocksFromTemplate(template);
  draftLayout.value = sandbox.layout;
  draftBlocks.value = sandbox.blocks.map((b) => ({ ...b }));
  sampleRunes.value = Object.fromEntries(
    (template.runeFields || []).map((f) => [f.id, f.type === 'number' ? 0 : '']),
  );
  selectedBlockId.value = '';
  router.replace({ query: { ...route.query, edit: template.id } });
}

function closeDesigner() {
  editing.value = null;
  selectedBlockId.value = '';
  const q = { ...route.query };
  delete q.edit;
  router.replace({ query: q });
}

async function saveTemplate() {
  if (!editing.value) return;
  const specs = templateBlockSpecs(draftBlocks.value);
  const updated = {
    ...editing.value,
    layout: { ...draftLayout.value },
    blocks: specs,
  };
  const next = templates.value.map((t) => (t.id === updated.id ? updated : t));
  templates.value = next;
  world.value = await loreApi.updateWorld(worldId.value, { templateDefs: next });
  editing.value = updated;
  alert('Template layout saved.');
}

async function refactor(t) {
  const tpl = templates.value.find((x) => x.id === t.id) || t;
  const msg = `Apply "${tpl.name}" layout to all pages using this template? Existing block content is preserved where possible.`;
  if (!confirm(msg)) return;
  const spec = tpl.blocks?.some((b) => b.grid)
    ? { layout: tpl.layout, blocks: tpl.blocks }
    : { blockOrder: tpl.blocks?.map((b) => b.type || b) || ['prose'] };
  const { updated } = await loreApi.refactorTemplate(worldId.value, tpl.id, spec);
  alert(`Updated ${updated} page(s).`);
}

function addFromPalette(item) {
  const block = createBlockFromPalette(item, draftBlocks.value, editing.value);
  draftBlocks.value = [...draftBlocks.value, block];
  selectedBlockId.value = block.id;
}

function patchBlock(blockId, patch) {
  draftBlocks.value = updateLayoutBlock(draftBlocks.value, blockId, patch);
}

function removeBlock(blockId) {
  draftBlocks.value = removeLayoutBlock(draftBlocks.value, blockId);
  if (selectedBlockId.value === blockId) selectedBlockId.value = '';
}

function patchRunes(patch) {
  sampleRunes.value = { ...sampleRunes.value, ...patch };
}

async function exportTemplates() {
  const data = await loreApi.exportTemplates(worldId.value);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `gotchi-lore-templates-${worldId.value}.json`;
  a.click();
}

async function importTemplates() {
  const raw = prompt('Paste template JSON array');
  if (!raw) return;
  const imported = JSON.parse(raw);
  await loreApi.importTemplates(imported);
  await load();
  alert('Imported');
}
</script>

<style module>
.wrap {
  display: flex;
  flex-direction: column;
}
.body {
  display: flex;
  border: 2px solid #47238d;
  border-radius: 4px;
  overflow: hidden;
  background: #0f0b1e;
  min-height: 520px;
}
.content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
.cardActions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.5rem;
}
.designer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
}
.designerHead {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.designerActions {
  display: flex;
  gap: 0.35rem;
}
</style>
