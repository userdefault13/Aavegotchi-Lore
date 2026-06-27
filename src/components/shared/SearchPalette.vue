<template>
  <div :class="$style.overlay" @click.self="$emit('close')">
    <div :class="$style.panel">
      <input v-model="q" class="input-gotchi" placeholder="Search worlds and pages…" autofocus @input="onSearch" />
      <ul v-if="results.length" :class="$style.list">
        <li v-for="r in results" :key="r.key">
          <router-link :to="r.to" @click="$emit('close')">{{ r.label }}</router-link>
        </li>
      </ul>
      <p v-else-if="q" class="text-sm opacity-60 mt-2">No results</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { loreApi } from '@/services/api';

defineEmits(['close']);
const q = ref('');
const results = ref([]);
let timer;

async function onSearch() {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (!q.value.trim()) {
      results.value = [];
      return;
    }
    try {
      const [worlds, pages] = await Promise.all([
        loreApi.searchWorlds(q.value),
        loreApi.searchPages(q.value),
      ]);
      const worldRows = worlds.map((w) => ({
        key: `w-${w.id}`,
        label: `🌍 ${w.title}`,
        to: `/lore/${w.id}`,
      }));
      const pageRows = pages.map((p) => ({
        key: `p-${p.id}`,
        label: `📄 ${p.title}`,
        to: `/lore/${p.worldId}?page=${p.id}`,
      }));
      results.value = [...pageRows, ...worldRows];
    } catch {
      results.value = [];
    }
  }, 300);
}
</script>

<style module>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  justify-content: center;
  padding-top: 10vh;
}
.panel {
  width: min(480px, 90vw);
  background: #1a142d;
  border: 2px solid #8b7db8;
  border-radius: 8px;
  padding: 1rem;
}
.list {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
}
.list a {
  display: block;
  padding: 0.5rem;
  color: #c084fc;
  text-decoration: none;
}
.list a:hover {
  background: #2d1b3d;
}
</style>
