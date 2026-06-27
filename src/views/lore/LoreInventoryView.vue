<template>
  <div v-if="world" :class="$style.workspace">
    <header :class="$style.head">
      <div>
        <router-link :to="`/lore/${worldId}`" class="text-xs opacity-70">← {{ world.title }}</router-link>
        <h1 class="font-pixel text-xs mt-1">Inventory</h1>
      </div>
      <div :class="$style.actions">
        <button type="button" class="btn-pixel text-[8px]" @click="importGotchi">+ Gotchi</button>
        <button type="button" class="btn-pixel text-[8px]" @click="importParcel">+ Parcel</button>
        <button type="button" class="btn-pixel text-[8px]" @click="addManual">+ Item</button>
      </div>
    </header>

    <div :class="$style.body">
      <LoreWorkspaceRail :world-id="worldId" active="inventory" />
      <main :class="$style.main">
        <div :class="$style.filters">
          <button
            v-for="f in filters"
            :key="f.id"
            type="button"
            :class="['btn-pixel text-[8px]', filter === f.id && 'opacity-100']"
            @click="filter = f.id"
          >
            {{ f.label }}
          </button>
        </div>

        <div v-if="filteredItems.length" :class="$style.grid">
          <article v-for="item in filteredItems" :key="item.id" :class="$style.card">
            <div :class="$style.cardHead">
              <span :class="$style.kind">{{ kindIcon(item.kind) }} {{ item.kind }}</span>
              <button type="button" :class="$style.remove" @click="removeItem(item.id)">×</button>
            </div>
            <div :class="$style.thumb">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.label || ''" />
              <span v-else>{{ kindIcon(item.kind) }}</span>
            </div>
            <div :class="$style.imageActions">
              <label class="btn-pixel text-[8px] cursor-pointer">
                Upload
                <input type="file" accept="image/*" hidden @change="onItemUpload(item, $event)" />
              </label>
              <button type="button" class="btn-pixel text-[8px]" @click="generateItemArt(item)">✨ AI</button>
            </div>
            <h2 class="font-pixel text-[8px]">{{ item.label || `#${item.tokenId || '?'}` }}</h2>
            <p v-if="item.tokenId" class="text-[10px] opacity-60">#{{ item.tokenId }}</p>
            <label :class="$style.linkField">
              <span>Linked page</span>
              <select
                :value="item.pageId || ''"
                class="input-gotchi text-xs w-full"
                @change="linkPage(item, $event.target.value)"
              >
                <option value="">— None —</option>
                <option v-for="p in pages" :key="p.id" :value="p.id">{{ p.title }}</option>
              </select>
            </label>
            <router-link
              v-if="item.pageId"
              :to="`/lore/${worldId}?page=${item.pageId}`"
              class="btn-pixel text-[8px] mt-1 inline-block"
            >
              Open page
            </router-link>
          </article>
        </div>
        <p v-else class="text-sm opacity-60 mt-4">
          No inventory items yet. Import a Gotchi, parcel, or add a custom item.
        </p>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { loreApi } from '@/services/api';
import { useAibotStore } from '@/stores';
import { buildPageIllustrationPrompt } from '@/utils/aibotPrompts';
import LoreWorkspaceRail from '@/components/lore/LoreWorkspaceRail.vue';

const aibot = useAibotStore();

const route = useRoute();
const worldId = computed(() => route.params.worldId);
const world = ref(null);
const pages = ref([]);
const items = ref([]);
const filter = ref('all');

const filters = [
  { id: 'all', label: 'All' },
  { id: 'gotchi', label: 'Gotchi' },
  { id: 'parcel', label: 'Parcels' },
  { id: 'item', label: 'Items' },
];

const filteredItems = computed(() => {
  if (filter.value === 'all') return items.value;
  return items.value.filter((i) => i.kind === filter.value);
});

onMounted(load);

async function load() {
  world.value = await loreApi.getWorld(worldId.value);
  pages.value = await loreApi.listPages(worldId.value);
  items.value = await loreApi.listInventory(worldId.value);
}

function kindIcon(kind) {
  return { gotchi: '👻', parcel: '🏝️', wearable: '👕', item: '📦' }[kind] || '📦';
}

async function importGotchi() {
  const tokenId = prompt('Gotchi token ID?');
  if (!tokenId) return;
  const data = await loreApi.importGotchi(tokenId);
  const page = await loreApi.createPage({
    worldId: worldId.value,
    title: data.name,
    templateId: 'aavegotchi',
    runes: { tokenId, brs: data.brs, spiritForce: data.spiritForce, traits: JSON.stringify(data.traits) },
  });
  pages.value.push(page);
  await loreApi.createInventoryItem({
    worldId: worldId.value,
    pageId: page.id,
    kind: 'gotchi',
    tokenId,
    label: data.name,
    imageUrl: data.imageUrl || '',
    meta: { brs: data.brs },
  });
  items.value = await loreApi.listInventory(worldId.value);
}

async function importParcel() {
  const tokenId = prompt('Parcel token ID?');
  if (!tokenId) return;
  const data = await loreApi.importParcel(tokenId);
  const page = await loreApi.createPage({
    worldId: worldId.value,
    title: data.threeWordName || `Parcel #${tokenId}`,
    templateId: 'realm-parcel',
    runes: { tokenId, zone: data.zone, size: data.size, threeWordName: data.threeWordName },
  });
  pages.value.push(page);
  await loreApi.createInventoryItem({
    worldId: worldId.value,
    pageId: page.id,
    kind: 'parcel',
    tokenId,
    label: data.threeWordName || `Parcel #${tokenId}`,
    meta: { zone: data.zone, size: data.size },
  });
  items.value = await loreApi.listInventory(worldId.value);
}

async function addManual() {
  const label = prompt('Item name?', 'Alchemica cache');
  if (!label) return;
  await loreApi.createInventoryItem({
    worldId: worldId.value,
    kind: 'item',
    label,
  });
  items.value = await loreApi.listInventory(worldId.value);
}

async function linkPage(item, pageId) {
  await loreApi.updateInventoryItem(item.id, { pageId: pageId || null });
  items.value = await loreApi.listInventory(worldId.value);
}

async function removeItem(id) {
  if (!confirm('Remove from inventory?')) return;
  await loreApi.deleteInventoryItem(id);
  items.value = items.value.filter((i) => i.id !== id);
}

async function onItemUpload(item, e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const { url } = await loreApi.uploadAsset(file);
    await loreApi.updateInventoryItem(item.id, { imageUrl: url });
    items.value = await loreApi.listInventory(worldId.value);
  } catch (err) {
    alert(err.message || 'Upload failed');
  } finally {
    e.target.value = '';
  }
}

function generateItemArt(item) {
  const promptText = buildPageIllustrationPrompt({
    title: item.label || `${item.kind} #${item.tokenId || ''}`,
    templateId: item.kind === 'gotchi' ? 'aavegotchi' : 'default',
    runes: item.meta || {},
  });
  aibot.open({
    prompt: promptText,
    contextLabel: item.label || item.kind,
    onImageGenerated: async (url) => {
      await loreApi.updateInventoryItem(item.id, { imageUrl: url });
      items.value = await loreApi.listInventory(worldId.value);
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
.actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.body {
  display: flex;
  gap: 0;
  min-height: 480px;
  border: 2px solid #47238d;
  border-radius: 4px;
  overflow: hidden;
  background: #0f0b1e;
}
.main {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}
.filters {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
}
.card {
  background: #1a142d;
  border: 2px solid #8b7db8;
  border-radius: 4px;
  padding: 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.cardHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.kind {
  font-size: 0.6rem;
  text-transform: uppercase;
  opacity: 0.55;
}
.remove {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  font-size: 1rem;
}
.thumb {
  background: rgba(139, 125, 184, 0.15);
  border-radius: 4px;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.thumb img {
  max-width: 100%;
  max-height: 72px;
  object-fit: contain;
}
.imageActions {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.linkField {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.62rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}
</style>
