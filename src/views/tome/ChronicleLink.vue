<template>
  <div v-if="chronicle">
    <router-link :to="`/tome/${chronicleId}`" class="text-xs opacity-70">← {{ chronicle.title }}</router-link>
    <h1 class="font-pixel text-xs mt-2 mb-3">Link Lore World</h1>
    <p class="text-sm opacity-80 mb-3">Connect this chronicle to a Gotchiverse codex for inline lore references.</p>
    <div :class="$style.grid">
      <button
        v-for="w in worlds"
        :key="w.id"
        type="button"
        :class="['card-gotchi text-left', { 'ring-2 ring-purple-bright': chronicle.linkedWorldId === w.id }]"
        @click="link(w.id)"
      >
        <strong>{{ w.title }}</strong>
        <p class="text-xs opacity-70 mt-1">{{ w.description }}</p>
      </button>
    </div>
    <p v-if="chronicle.linkedWorldId" class="text-sm text-cyan mt-3">
      Linked to world {{ chronicle.linkedWorldId }}
      <router-link :to="`/lore/${chronicle.linkedWorldId}`" class="underline ml-1">Open codex</router-link>
    </p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loreApi, tomeApi } from '@/services/api';

const route = useRoute();
const router = useRouter();
const chronicleId = computed(() => route.params.chronicleId);
const chronicle = ref(null);
const worlds = ref([]);

onMounted(async () => {
  [chronicle.value, worlds.value] = await Promise.all([
    tomeApi.getChronicle(chronicleId.value),
    loreApi.listWorlds(),
  ]);
});

async function link(worldId) {
  await tomeApi.updateChronicle(chronicleId.value, { linkedWorldId: worldId });
  chronicle.value.linkedWorldId = worldId;
  router.push(`/tome/${chronicleId.value}`);
}
</script>

<style module>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
</style>
