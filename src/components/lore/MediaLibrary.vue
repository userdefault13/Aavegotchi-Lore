<template>
  <div :class="[$style.library, compact && $style.compact]">
    <div :class="$style.head">
      <span :class="$style.title">{{ title }}</span>
      <label class="btn-pixel text-[8px] cursor-pointer">
        Upload
        <input type="file" accept="image/*" hidden @change="onUpload" />
      </label>
    </div>

    <p v-if="loading" class="text-xs opacity-50">Loading…</p>
    <p v-else-if="error" class="text-xs text-red-300">{{ error }}</p>
    <p v-else-if="!assets.length" class="text-xs opacity-50">No images yet — upload one.</p>

    <div v-else :class="$style.grid">
      <button
        v-for="asset in assets"
        :key="asset.id"
        type="button"
        :class="[$style.thumb, selectedUrl === asset.url && $style.thumbActive]"
        :title="asset.filename"
        @click="$emit('select', asset.url)"
      >
        <img :src="asset.url" :alt="asset.filename" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { loreApi } from '@/services/api';

defineProps({
  title: { type: String, default: 'Media library' },
  compact: { type: Boolean, default: false },
  selectedUrl: { type: String, default: '' },
});

defineEmits(['select']);

const assets = ref([]);
const loading = ref(false);
const error = ref('');

onMounted(load);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    assets.value = await loreApi.listAssets();
  } catch (err) {
    error.value = err.message || 'Could not load library';
    assets.value = [];
  } finally {
    loading.value = false;
  }
}

async function onUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const uploaded = await loreApi.uploadAsset(file);
    assets.value = [uploaded, ...assets.value.filter((a) => a.url !== uploaded.url)];
  } catch (err) {
    error.value = err.message || 'Upload failed';
  } finally {
    e.target.value = '';
  }
}

defineExpose({ reload: load });
</script>

<style module>
.library {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.compact .grid {
  max-height: 120px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
}
.title {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3rem;
  max-height: 180px;
  overflow-y: auto;
}
.thumb {
  aspect-ratio: 1;
  padding: 0;
  border: 1px solid rgba(139, 125, 184, 0.35);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.25);
  cursor: pointer;
  overflow: hidden;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumbActive {
  border-color: #a78bfa;
  box-shadow: 0 0 0 1px #a78bfa;
}
</style>
