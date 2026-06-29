<template>
  <div v-if="board" :class="$style.wrap">
    <header :class="$style.head">
      <div>
        <router-link to="/robe" class="text-xs opacity-70">← Robe</router-link>
        <h1 class="font-pixel text-xs mt-1">{{ board.title }}</h1>
        <p class="text-xs opacity-60">{{ chronicle?.title }} · {{ frames.length }} scenes</p>
      </div>
      <div class="flex gap-1 flex-wrap">
        <GotchiTooltip :tip="ROBE_ACTIONS.sync">
          <button type="button" class="btn-pixel text-[8px]" :disabled="syncing" @click="syncBoard">
            {{ syncing ? '…' : 'Sync scenes' }}
          </button>
        </GotchiTooltip>
        <GotchiTooltip :tip="ROBE_ACTIONS.generateMissing">
          <button type="button" class="btn-pixel text-[8px]" :disabled="generating" @click="generateMissing">
            {{ generating ? '…' : 'Fill gaps' }}
          </button>
        </GotchiTooltip>
        <GotchiTooltip :tip="ROBE_ACTIONS.flatten">
          <button type="button" class="btn-pixel text-[8px]" :disabled="saving" @click="flattenFrame">
            {{ saving ? '…' : 'Flatten frame' }}
          </button>
        </GotchiTooltip>
        <GotchiTooltip :tip="ROBE_ACTIONS.generateFrame">
          <button type="button" class="btn-pixel text-[8px]" :disabled="generatingOne" @click="generateCurrent">
            {{ generatingOne ? '…' : '✨ Pixel Lab' }}
          </button>
        </GotchiTooltip>
        <button type="button" class="btn-pixel text-[8px] opacity-80" @click="openPixelLabPanel">Art bot</button>
        <router-link :to="`/robe/${chronicleId}/preview`" class="btn-pixel text-[8px]">Preview</router-link>
      </div>
    </header>
    <p v-if="pixelLabStatus || fillGapsStatus" :class="$style.status">
      {{ pixelLabStatus || fillGapsStatus }}
    </p>

    <div :class="$style.body">
      <RobeWorkspaceRail :chronicle-id="chronicleId" active="storyboard" />
      <div :class="$style.main">
        <RobeFrameTimeline :frames="frames" :selected-id="selectedFrameId" @select="selectFrame" />
        <template v-if="currentFrame">
          <RobePresetPicker
            :model-value="currentFrame.preset"
            @update:model-value="onPresetChange"
          />
          <RobeTransitionPicker
            :model-value="currentFrame.transition || board.defaultTransition"
            @update:model-value="patchFrame({ transition: $event })"
          />
          <RobeTimingControl
            :caption-text="captionText"
            :hold-duration-ms="currentFrame.holdDurationMs"
            @update:hold-duration-ms="patchFrame({ holdDurationMs: $event })"
          />
          <div :class="$style.editor">
            <RobeFrameComposer
              :frame="currentFrame"
              :selected-layer-id="selectedLayerId"
              @update:layers="patchFrame({ layers: $event })"
              @generate-pixel-lab="generateCurrent"
            />
            <RobeLayerPanel
              :layers="currentFrame.layers || []"
              :selected-layer-id="selectedLayerId"
              @select-layer="selectedLayerId = $event"
              @remove-layer="removeLayer"
              @add-image="addImageLayer"
              @add-text="addTextLayer"
            />
          </div>
        </template>
        <p v-else class="text-sm opacity-60 p-4">No scene frames — add scenes in Tome or sync.</p>
      </div>
    </div>
  </div>
  <p v-else-if="loadError" class="text-sm text-red-300">{{ loadError }}</p>
  <p v-else class="text-sm opacity-60">Loading storyboard…</p>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { robeApi, tomeApi, loreApi, aibotApi } from '@/services/api';
import { useWalletStore } from '@/stores';
import { useAibotStore } from '@/stores/aibot';
import { buildStoryboardFramePrompt } from '@/utils/aibotPrompts';
import {
  applyPreset,
  newLayerId,
  flattenFrame as flattenFrameUtil,
  frameCaptionText,
  layersWithGeneratedBackground,
} from '@/utils/robeCompositor';
import RobeWorkspaceRail from '@/components/robe/RobeWorkspaceRail.vue';
import RobeFrameTimeline from '@/components/robe/RobeFrameTimeline.vue';
import RobeFrameComposer from '@/components/robe/RobeFrameComposer.vue';
import RobeLayerPanel from '@/components/robe/RobeLayerPanel.vue';
import RobePresetPicker from '@/components/robe/RobePresetPicker.vue';
import RobeTransitionPicker from '@/components/robe/RobeTransitionPicker.vue';
import RobeTimingControl from '@/components/robe/RobeTimingControl.vue';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { ROBE_ACTIONS } from '@/utils/workspaceHints';

const route = useRoute();
const wallet = useWalletStore();
const aibot = useAibotStore();
const chronicleId = computed(() => route.params.chronicleId);

const board = ref(null);
const chronicle = ref(null);
const frames = ref([]);
const nodes = ref([]);
const selectedFrameId = ref('');
const selectedLayerId = ref('');
const loadError = ref('');
const syncing = ref(false);
const generating = ref(false);
const generatingOne = ref(false);
const saving = ref(false);
const pixelLabStatus = ref('');
const fillGapsStatus = ref('');
const lorePageTitles = ref({});

const currentFrame = computed(() => frames.value.find((f) => f.id === selectedFrameId.value));
const captionText = computed(() => (currentFrame.value ? frameCaptionText(currentFrame.value) : ''));

async function loadLoreTitles() {
  const worldId =
    board.value?.linkedWorldId ||
    chronicle.value?.linkedWorldBranchId ||
    chronicle.value?.linkedWorldId;
  if (!worldId) return;
  const pageIds = new Set();
  for (const node of nodes.value) {
    for (const link of node.crossLinks || []) {
      if (link.pageId) pageIds.add(link.pageId);
    }
  }
  const titles = {};
  await Promise.all(
    [...pageIds].map(async (id) => {
      try {
        const page = await loreApi.getPage(id);
        if (page?.title) titles[id] = page.title;
      } catch {
        /* skip missing pages */
      }
    }),
  );
  lorePageTitles.value = titles;
}

function loreTitlesForNode(node) {
  if (!node?.crossLinks?.length) return [];
  return node.crossLinks
    .map((link) => link.title || lorePageTitles.value[link.pageId])
    .filter(Boolean);
}

function buildPromptForFrame(frame) {
  const node = nodes.value.find((n) => n.id === frame?.storyNodeId);
  return buildStoryboardFramePrompt({
    sceneTitle: frame?.sceneTitle,
    sceneContent: node?.content,
    loreTitles: loreTitlesForNode(node),
  });
}

async function load() {
  loadError.value = '';
  try {
    chronicle.value = await tomeApi.getChronicle(chronicleId.value);
    board.value = await robeApi.getBoardForChronicle(chronicleId.value);
    frames.value = await robeApi.listFrames(board.value.id);
    nodes.value = await tomeApi.listNodes(chronicleId.value);
    await loadLoreTitles();
    if (!selectedFrameId.value && frames.value.length) {
      selectedFrameId.value = frames.value[0].id;
    }
  } catch (err) {
    loadError.value = err.message;
  }
}

async function patchFrame(patch) {
  if (!currentFrame.value || !board.value) return;
  const updated = await robeApi.updateFrame(board.value.id, currentFrame.value.id, patch);
  frames.value = frames.value.map((f) => (f.id === updated.id ? updated : f));
}

function selectFrame(id) {
  selectedFrameId.value = id;
  selectedLayerId.value = '';
}

async function onPresetChange(presetId) {
  const layers = presetId ? applyPreset(presetId) : currentFrame.value?.layers || [];
  await patchFrame({ preset: presetId, layers });
}

function addImageLayer(url) {
  const layers = [...(currentFrame.value?.layers || [])];
  layers.push({
    id: newLayerId('img'),
    kind: 'image',
    assetUrl: url,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    z: layers.length,
    opacity: 1,
  });
  patchFrame({ layers });
}

function addTextLayer() {
  const layers = [...(currentFrame.value?.layers || [])];
  layers.push({
    id: newLayerId('txt'),
    kind: 'text',
    text: 'Caption…',
    x: 80,
    y: 560,
    w: 1120,
    h: 100,
    z: 20,
    opacity: 1,
  });
  patchFrame({ layers });
  selectedLayerId.value = layers[layers.length - 1].id;
}

function removeLayer(id) {
  patchFrame({ layers: (currentFrame.value?.layers || []).filter((l) => l.id !== id) });
}

async function syncBoard() {
  syncing.value = true;
  try {
    await robeApi.syncBoard(board.value.id);
    frames.value = await robeApi.listFrames(board.value.id);
  } finally {
    syncing.value = false;
  }
}

async function generateMissing() {
  generating.value = true;
  fillGapsStatus.value = '';
  try {
    const result = await robeApi.generateMissing(board.value.id, 5);
    frames.value = await robeApi.listFrames(board.value.id);
    const count = result?.generated ?? 0;
    fillGapsStatus.value = count
      ? `Filled ${count} empty frame${count === 1 ? '' : 's'} with Pixel Lab art`
      : 'No empty frames left to fill (or generation returned no image)';
  } catch (err) {
    fillGapsStatus.value = err.message || 'Fill gaps failed';
  } finally {
    generating.value = false;
  }
}

async function applyGeneratedImage(imageUrl, prompt) {
  if (!currentFrame.value || !imageUrl) return;
  const layers = layersWithGeneratedBackground(currentFrame.value.layers, imageUrl);
  const aiGenerated = { prompt, generatedAt: new Date().toISOString() };
  const draft = { ...currentFrame.value, layers };
  let composedUrl = null;
  try {
    composedUrl = await flattenFrameUtil(draft, (file) => loreApi.uploadAsset(file));
  } catch {
    /* thumbnail optional */
  }
  await patchFrame({
    layers,
    aiGenerated,
    ...(composedUrl ? { composedUrl } : {}),
  });
}

function openPixelLabPanel() {
  if (!currentFrame.value) return;
  const prompt = buildPromptForFrame(currentFrame.value);
  aibot.open({
    prompt,
    contextLabel: currentFrame.value.sceneTitle || 'Storyboard frame',
    onImageGenerated: (url) => {
      applyGeneratedImage(url, prompt);
      pixelLabStatus.value = 'Applied to frame from art bot';
    },
  });
}

async function generateCurrent() {
  if (!currentFrame.value) return;
  generatingOne.value = true;
  pixelLabStatus.value = '';
  try {
    const prompt = buildPromptForFrame(currentFrame.value);
    const result = await aibotApi.generate(prompt, wallet.address);
    if (result.imageUrl) {
      await applyGeneratedImage(result.imageUrl, prompt);
      pixelLabStatus.value = 'Pixel Lab art applied to frame';
      return;
    }
    openPixelLabPanel();
    pixelLabStatus.value =
      result.reply?.slice(0, 160) || 'No image returned — use Generate & save in the art bot panel.';
  } catch (err) {
    pixelLabStatus.value = err.message || 'Generation failed';
    openPixelLabPanel();
  } finally {
    generatingOne.value = false;
  }
}

async function flattenFrame() {
  if (!currentFrame.value) return;
  saving.value = true;
  try {
    const url = await flattenFrameUtil(currentFrame.value, (file) => loreApi.uploadAsset(file));
    if (url) await patchFrame({ composedUrl: url });
  } finally {
    saving.value = false;
  }
}

onMounted(load);
watch(chronicleId, load);
</script>

<style module>
.wrap {
  min-height: 520px;
}
.head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}
.body {
  display: flex;
  border: 2px solid #47238d;
  border-radius: 4px;
  overflow: hidden;
  min-height: 480px;
  background: #0f0b1e;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0.75rem;
}
.editor {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 0;
}
.status {
  font-size: 0.7rem;
  opacity: 0.75;
  margin-top: 0.35rem;
  max-width: 42rem;
}
</style>
