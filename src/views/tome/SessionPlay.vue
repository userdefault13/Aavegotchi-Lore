<template>
  <div v-if="chronicle" :class="$style.root">
    <header :class="$style.head">
      <router-link :to="`/tome/${chronicleId}`" class="text-xs opacity-70">← Edit</router-link>
      <h1 class="font-pixel text-xs mt-1">Session Play — {{ chronicle.title }}</h1>
    </header>
    <div :class="$style.play">
      <aside :class="$style.scenes">
        <button
          v-for="n in scenes"
          :key="n.id"
          type="button"
          :class="[$style.sceneBtn, { [$style.active]: n.id === activeId }, $style[n.status]]"
          @click="activeId = n.id"
        >
          {{ n.title }} ({{ n.status }})
        </button>
      </aside>
      <main :class="$style.stage">
        <article v-if="activeScene" :class="[$style.scene, activeScene.frame ? `frame-${activeScene.frame}` : '']">
          <h2>{{ activeScene.title }}</h2>
          <div v-html="activeScene.content" />
          <div class="flex gap-2 mt-3">
            <button type="button" class="btn-pixel text-[8px]" @click="setStatus('played')">Played</button>
            <button type="button" class="btn-pixel text-[8px]" @click="setStatus('skipped')">Skipped</button>
          </div>
          <textarea v-model="improvNote" class="input-gotchi mt-3" placeholder="Improv memo…" rows="2" @change="saveImprov" />
        </article>
        <GotchiverseMapCanvas
          v-if="map"
          class="mt-3"
          :map-preset="map.mapPreset || 'gotchiverse'"
          :image-url="map.imageUrl"
          :map-width="map.mapWidth"
          :map-height="map.mapHeight"
          :pins="map.pins"
        />
      </main>
      <Toolboard />
    </div>
    <a :href="pdfUrl" class="btn-pixel text-[8px] mt-3 inline-block" download>Export PDF</a>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { tomeApi } from '@/services/api';
import Toolboard from '@/components/tome/Toolboard.vue';
import GotchiverseMapCanvas from '@/components/lore/GotchiverseMapCanvas.vue';

const route = useRoute();
const chronicleId = computed(() => route.params.chronicleId);
const chronicle = ref(null);
const nodes = ref([]);
const activeId = ref('');
const map = ref(null);
const improvNote = ref('');

const scenes = computed(() => nodes.value.filter((n) => n.type === 'scene'));
const activeScene = computed(() => nodes.value.find((n) => n.id === activeId.value));
const pdfUrl = computed(() => tomeApi.exportPdf('chronicle', chronicleId.value));

onMounted(async () => {
  chronicle.value = await tomeApi.getChronicle(chronicleId.value);
  nodes.value = await tomeApi.listNodes(chronicleId.value);
  const maps = await tomeApi.listMaps(chronicleId.value);
  map.value = maps[0] || null;
  activeId.value = scenes.value.find((s) => s.status === 'pending')?.id || scenes.value[0]?.id || '';
});

async function setStatus(status) {
  if (!activeScene.value) return;
  await tomeApi.updateNode(activeScene.value.id, { status });
  activeScene.value.status = status;
  const i = nodes.value.findIndex((n) => n.id === activeScene.value.id);
  if (i >= 0) nodes.value[i].status = status;
}

async function saveImprov() {
  if (!activeScene.value) return;
  const memoSheets = [...(activeScene.value.memoSheets || []), { type: 'improv', text: improvNote.value, at: new Date().toISOString() }];
  await tomeApi.updateNode(activeScene.value.id, { memoSheets });
}

async function updateSituational(situational) {
  if (!activeScene.value) return;
  await tomeApi.updateNode(activeScene.value.id, { situational });
  activeScene.value.situational = situational;
}
</script>

<style module>
.root {
  display: block;
}
.head {
  margin-bottom: 1rem;
}
.play {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  gap: 1rem;
  min-height: 400px;
}
.scenes {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.sceneBtn {
  text-align: left;
  background: #1a142d;
  border: 1px solid #8b7db8;
  color: #fff;
  padding: 0.4rem;
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 4px;
}
.active {
  border-color: #651fff;
  background: #651fff33;
}
.played {
  border-left: 3px solid #22c55e;
}
.skipped {
  opacity: 0.6;
}
.stage {
  background: #0f0b1e;
  border: 2px solid #8b7db8;
  border-radius: 8px;
  padding: 1rem;
}
.scene h2 {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.65rem;
  color: #c084fc;
}
</style>

<style>
.frame-purple { border-left: 4px solid #651fff; padding-left: 0.5rem; }
</style>
