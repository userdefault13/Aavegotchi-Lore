<template>
  <div>
    <header :class="$style.hero">
      <h1 class="font-pixel text-sm text-pink-300">Robe</h1>
      <p class="text-sm opacity-80 mt-2">Storyboard your Tome scenes into 720p pixel video.</p>
    </header>
    <div v-if="loading" class="text-sm opacity-70">Loading boards…</div>
    <div v-else-if="boards.length" :class="$style.grid">
      <router-link
        v-for="b in boards"
        :key="b.id"
        :to="`/robe/${b.chronicleId}`"
        class="card-gotchi text-sm no-underline text-inherit"
      >
        <h2 class="font-pixel text-[9px] text-pink-200">{{ b.title }}</h2>
        <p class="text-xs opacity-60 mt-1">{{ b.slug }}</p>
      </router-link>
    </div>
    <p v-else class="text-sm opacity-60">
      Open a Tome chronicle and use the Robe rail, or browse
      <router-link to="/tome" class="text-purple-300">campaigns</router-link>.
    </p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { robeApi } from '@/services/api';

const boards = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    boards.value = await robeApi.listBoards();
  } catch {
    boards.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style module>
.hero {
  margin-bottom: 1.5rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}
</style>
