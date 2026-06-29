<template>
  <div v-if="board" :class="$style.wrap">
    <header :class="$style.head">
      <router-link :to="`/robe/${chronicleId}`" class="text-xs opacity-70">← Storyboard</router-link>
      <h1 class="font-pixel text-xs mt-1">Preview · {{ board.title }}</h1>
    </header>
    <div :class="$style.body">
      <RobeWorkspaceRail :chronicle-id="chronicleId" active="preview" />
      <div :class="$style.main">
        <RobePreviewPlayer v-if="frames.length" :frames="frames" :board="board" />
        <p v-else class="text-sm opacity-60">No frames to preview.</p>
      </div>
    </div>
  </div>
  <p v-else class="text-sm opacity-60">Loading…</p>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { robeApi } from '@/services/api';
import RobeWorkspaceRail from '@/components/robe/RobeWorkspaceRail.vue';
import RobePreviewPlayer from '@/components/robe/RobePreviewPlayer.vue';

const route = useRoute();
const chronicleId = computed(() => route.params.chronicleId);
const board = ref(null);
const frames = ref([]);

onMounted(async () => {
  board.value = await robeApi.getBoardForChronicle(chronicleId.value);
  frames.value = await robeApi.listFrames(board.value.id);
});
</script>

<style module>
.head {
  margin-bottom: 0.75rem;
}
.body {
  display: flex;
  border: 2px solid #47238d;
  border-radius: 4px;
  min-height: 480px;
  background: #0f0b1e;
}
.main {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
