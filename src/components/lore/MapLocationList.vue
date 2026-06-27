<template>
  <aside :class="$style.panel">
    <header :class="$style.head">
      <button type="button" :class="[$style.collapse, collapsed && $style.collapsed]" @click="collapsed = !collapsed">
        ‹
      </button>
      <h2 class="font-pixel text-[8px] truncate">{{ worldTitle }}</h2>
    </header>
    <div v-if="!collapsed" :class="$style.list">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        :class="[$style.row, { [$style.active]: item.id === selectedId, [$style.highlight]: item.highlight }]"
        @click="$emit('select', item)"
      >
        <span :class="$style.dot" :style="{ background: item.color }" />
        <span :class="$style.text">
          <span :class="$style.name">{{ item.label }}</span>
          <span v-if="item.subtitle" :class="$style.subtitle">{{ item.subtitle }}</span>
        </span>
        <span v-if="item.linked" :class="$style.linkBadge" title="Linked to lore page">📄</span>
      </button>
      <p v-if="!items.length" :class="$style.empty">No locations yet — add a pin on the map.</p>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  worldTitle: { type: String, default: 'Gotchiverse' },
  items: { type: Array, default: () => [] },
  selectedId: { type: String, default: '' },
});

defineEmits(['select']);

const collapsed = ref(false);
</script>

<style module>
.panel {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #120a22;
  border-right: 1px solid rgba(139, 125, 184, 0.35);
  min-height: 0;
}
.head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid rgba(139, 125, 184, 0.25);
}
.collapse {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
  transform: rotate(0deg);
}
.collapsed {
  transform: rotate(180deg);
}
.list {
  flex: 1;
  overflow-y: auto;
  padding: 0.35rem 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  text-align: left;
  padding: 0.35rem 0.65rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.78rem;
  cursor: pointer;
}
.row:hover {
  background: rgba(139, 87, 255, 0.12);
}
.active {
  background: rgba(139, 87, 255, 0.22);
  color: #fff;
}
.highlight {
  box-shadow: inset 2px 0 0 #67e8f9;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.subtitle {
  font-size: 0.65rem;
  opacity: 0.55;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.linkBadge {
  flex-shrink: 0;
  font-size: 0.75rem;
}
.empty {
  padding: 1rem 0.65rem;
  font-size: 0.75rem;
  opacity: 0.55;
  margin: 0;
}
</style>
