<template>
  <aside :class="[$style.panel, embedded && $style.embedded]">
    <h3 class="font-pixel text-[8px] mb-2">Links</h3>

    <section :class="$style.section">
      <p :class="$style.label">Cross-links</p>
      <ul v-if="crossLinks.length" :class="$style.list">
        <li v-for="(link, i) in crossLinks" :key="i">
          <button
            v-if="link.pageId"
            type="button"
            :class="$style.linkBtn"
            @click="$emit('navigate', link.pageId)"
          >
            {{ linkLabel(link) }}
          </button>
          <router-link
            v-else-if="link.chronicleId"
            :to="`/tome/${link.chronicleId}`"
            :class="$style.linkBtn"
          >
            📜 {{ link.title || 'Campaign scene' }}
          </router-link>
          <button type="button" :class="$style.remove" @click="removeCrossLink(i)">×</button>
        </li>
      </ul>
      <div :class="$style.addRow">
        <select v-model="newLinkId" class="input-gotchi text-xs flex-1">
          <option value="">Link to page…</option>
          <option v-for="p in linkTargets" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
        <button type="button" class="btn-pixel text-[8px]" :disabled="!newLinkId" @click="addCrossLink">Add</button>
      </div>
    </section>

    <section v-if="backlinks.length" :class="$style.section">
      <p :class="$style.label">Backlinks</p>
      <ul :class="$style.list">
        <li v-for="p in backlinks" :key="p.id">
          <button type="button" :class="$style.linkBtn" @click="$emit('navigate', p.id)">{{ p.title }}</button>
        </li>
      </ul>
    </section>

    <section v-if="mapPins.length" :class="$style.section">
      <p :class="$style.label">On maps</p>
      <ul :class="$style.list">
        <li v-for="pin in mapPins" :key="pin.id">
          <button type="button" :class="$style.linkBtn" @click="$emit('navigate-map', pin)">
            📍 {{ pin.mapTitle }} — {{ pin.label || 'pin' }}
          </button>
        </li>
      </ul>
    </section>

    <section v-if="diagramNodes.length" :class="$style.section">
      <p :class="$style.label">On diagrams</p>
      <ul :class="$style.list">
        <li v-for="node in diagramNodes" :key="node.nodeId">
          <button type="button" :class="$style.linkBtn" @click="$emit('navigate-diagram', node)">
            ⑂ {{ node.diagramTitle }} — {{ node.label || 'node' }}
          </button>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  pageId: { type: String, default: '' },
  crossLinks: { type: Array, default: () => [] },
  pages: { type: Array, default: () => [] },
  backlinks: { type: Array, default: () => [] },
  mapPins: { type: Array, default: () => [] },
  diagramNodes: { type: Array, default: () => [] },
  embedded: { type: Boolean, default: false },
});

const emit = defineEmits(['update:crossLinks', 'navigate', 'navigate-map', 'navigate-diagram']);

const newLinkId = ref('');

const linkTargets = computed(() =>
  props.pages.filter((p) => p.id !== props.pageId && !props.crossLinks.some((l) => l.pageId === p.id)),
);

function linkLabel(link) {
  if (link.chronicleId) return link.title || 'Campaign scene';
  const p = props.pages.find((x) => x.id === link.pageId);
  return link.label || p?.title || link.pageId;
}

function addCrossLink() {
  if (!newLinkId.value) return;
  const target = props.pages.find((p) => p.id === newLinkId.value);
  emit('update:crossLinks', [
    ...props.crossLinks,
    { pageId: newLinkId.value, label: target?.title || '' },
  ]);
  newLinkId.value = '';
}

function removeCrossLink(index) {
  const next = [...props.crossLinks];
  next.splice(index, 1);
  emit('update:crossLinks', next);
}

watch(() => props.pageId, () => { newLinkId.value = ''; });
</script>

<style module>
.panel {
  width: 180px;
  flex-shrink: 0;
  border-left: 2px solid #8b7db8;
  padding-left: 0.75rem;
}
.embedded {
  width: 100%;
  border-left: none;
  padding-left: 0;
}
.section {
  margin-bottom: 1rem;
}
.label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
  margin: 0 0 0.35rem;
}
.list {
  list-style: none;
  margin: 0 0 0.5rem;
  padding: 0;
}
.list li {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.2rem;
}
.linkBtn {
  flex: 1;
  text-align: left;
  background: none;
  border: none;
  color: #67e8f9;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0.2rem 0;
}
.linkBtn:hover {
  text-decoration: underline;
}
.remove {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
}
.addRow {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}
</style>
