<template>
  <nav :class="$style.rail" aria-label="Robe workspace">
    <GotchiTooltip v-for="item in items" :key="item.id" :tip="item.tip" position="right" block>
      <router-link :to="item.to" :class="[$style.item, { [$style.active]: item.active }]">
        <span :class="$style.icon">{{ item.icon }}</span>
        <span :class="$style.label">{{ item.label }}</span>
      </router-link>
    </GotchiTooltip>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { ROBE_RAIL } from '@/utils/workspaceHints';

const props = defineProps({
  chronicleId: { type: String, required: true },
  active: { type: String, default: 'storyboard' },
});

const items = computed(() => [
  {
    id: 'storyboard',
    label: 'Board',
    icon: '🎬',
    to: `/robe/${props.chronicleId}`,
    active: props.active === 'storyboard',
    tip: ROBE_RAIL.storyboard,
  },
  {
    id: 'preview',
    label: 'Play',
    icon: '▶',
    to: `/robe/${props.chronicleId}/preview`,
    active: props.active === 'preview',
    tip: ROBE_RAIL.preview,
  },
  {
    id: 'tome',
    label: 'Tome',
    icon: '📖',
    to: `/tome/${props.chronicleId}`,
    active: false,
    tip: ROBE_RAIL.tome,
  },
]);
</script>

<style module>
.rail {
  width: 56px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem;
  padding: 0.5rem 0.25rem;
  background: #120a22;
  border-right: 1px solid rgba(139, 125, 184, 0.35);
}
.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  padding: 0.4rem 0.15rem;
  border-radius: 6px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.55);
}
.item:hover {
  background: rgba(139, 87, 255, 0.15);
  color: #fff;
}
.active {
  background: rgba(236, 72, 153, 0.25);
  color: #fbcfe8;
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  font-size: 1rem;
}
.label {
  width: 100%;
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
  text-align: center;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
</style>
