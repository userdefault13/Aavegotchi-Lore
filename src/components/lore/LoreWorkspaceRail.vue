<template>
  <nav :class="$style.rail" aria-label="Lore workspace">
    <GotchiTooltip
      v-for="item in items"
      :key="item.id"
      :tip="item.tip"
      position="right"
      block
    >
      <router-link
        :to="item.to"
        :class="[$style.item, { [$style.active]: item.active }]"
      >
        <span :class="$style.icon">{{ item.icon }}</span>
        <span :class="$style.label">{{ item.label }}</span>
      </router-link>
    </GotchiTooltip>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { LORE_RAIL } from '@/utils/workspaceHints';

const props = defineProps({
  worldId: { type: String, required: true },
  active: { type: String, default: 'maps' },
  isBranch: { type: Boolean, default: false },
  /** @deprecated use isBranch */
  isFork: { type: Boolean, default: false },
  isCanon: { type: Boolean, default: false },
});

const items = computed(() => {
  const base = [
    {
      id: 'lore',
      label: 'Lore',
      icon: '📖',
      to: `/lore/${props.worldId}`,
      active: props.active === 'lore',
      tip: LORE_RAIL.lore,
    },
  ];
  if (props.isBranch || props.isFork || props.isCanon) {
    base.push({
      id: 'proposals',
      label: 'PRs',
      icon: '⇄',
      to: `/lore/${props.worldId}/proposals`,
      active: props.active === 'proposals',
      tip: LORE_RAIL.proposals,
    });
  }
  if (props.isBranch || props.isFork) {
    base.push({
      id: 'sync',
      label: 'Sync',
      icon: '↓',
      to: `/lore/${props.worldId}/sync`,
      active: props.active === 'sync',
      tip: LORE_RAIL.sync,
    });
  }
  base.push(
    {
      id: 'templates',
      label: 'Templates',
      icon: '▦',
      to: `/lore/${props.worldId}/templates`,
      active: props.active === 'templates',
      tip: LORE_RAIL.templates,
    },
    {
      id: 'diagrams',
      label: 'Diagrams',
      icon: '⑂',
      to: `/lore/${props.worldId}/diagrams`,
      active: props.active === 'diagrams',
      tip: LORE_RAIL.diagrams,
    },
    {
      id: 'maps',
      label: 'Maps',
      icon: '🗺️',
      to: `/lore/${props.worldId}/maps`,
      active: props.active === 'maps',
      tip: LORE_RAIL.maps,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: '🎒',
      to: `/lore/${props.worldId}/inventory`,
      active: props.active === 'inventory',
      tip: LORE_RAIL.inventory,
    },
  );
  return base;
});
</script>

<style module>
.rail {
  width: 52px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.35rem;
  background: #120a22;
  border-right: 1px solid rgba(139, 125, 184, 0.35);
}
.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.45rem 0.25rem;
  border-radius: 6px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.55);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.item:hover {
  background: rgba(139, 87, 255, 0.15);
  color: #fff;
}
.active {
  background: rgba(139, 87, 255, 0.28);
  color: #c4b5fd;
}
.icon {
  font-size: 1.1rem;
  line-height: 1;
}
.label {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  text-align: center;
  line-height: 1.3;
}
</style>
