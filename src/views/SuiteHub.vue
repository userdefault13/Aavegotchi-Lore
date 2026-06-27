<template>
  <div>
    <header :class="$style.hero">
      <h1 class="font-pixel text-sm text-purple-bright">Gotchiverse Suite</h1>
      <p class="text-sm opacity-80 mt-2">Lore codex + Tome chronicles for the Aavegotchi ecosystem</p>
    </header>
    <div :class="$style.grid">
      <section class="card-gotchi">
        <h2 class="font-pixel text-[10px] mb-2">🌍 Lore</h2>
        <p class="text-sm opacity-80 mb-3">Build your REALM codex — parcels, installations, landmarks.</p>
        <router-link to="/lore" class="btn-pixel inline-block">Open Lore</router-link>
        <router-link to="/lore/canon" class="btn-pixel inline-block ml-2 text-[8px]">Canon</router-link>
      </section>
      <section class="card-gotchi">
        <h2 class="font-pixel text-[10px] mb-2">📖 Tome</h2>
        <p class="text-sm opacity-80 mb-3">Run campaigns — arcs, scenes, choices, session play.</p>
        <router-link to="/tome" class="btn-pixel inline-block">Open Tome</router-link>
      </section>
    </div>
    <section v-if="worlds.length || chronicles.length" :class="$style.recent">
      <h3 class="font-pixel text-[9px] mb-2">Recent</h3>
      <div :class="$style.recentGrid">
        <router-link v-for="w in worlds.slice(0, 4)" :key="w.id" :to="`/lore/${w.id}`" class="card-gotchi text-sm">{{ w.title }}</router-link>
        <router-link v-for="c in chronicles.slice(0, 4)" :key="c.id" :to="`/tome/${c.id}`" class="card-gotchi text-sm">{{ c.title }}</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { loreApi, tomeApi } from '@/services/api';

const worlds = ref([]);
const chronicles = ref([]);

onMounted(async () => {
  try {
    [worlds.value, chronicles.value] = await Promise.all([loreApi.listWorlds(), tomeApi.listChronicles()]);
  } catch {
    worlds.value = [];
    chronicles.value = [];
  }
});
</script>

<style module>
.hero {
  margin-bottom: 1.5rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}
.recent {
  margin-top: 2rem;
}
.recentGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}
.recentGrid a {
  text-decoration: none;
  color: inherit;
}
</style>
