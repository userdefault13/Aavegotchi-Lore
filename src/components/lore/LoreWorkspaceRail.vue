<template>
  <nav :class="[$style.rail, variant === 'sidebar' && $style.sidebar]" aria-label="Lore workspace">
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
  isFork: { type: Boolean, default: false },
  isCanon: { type: Boolean, default: false },
  /** `rail` = narrow icon strip; `sidebar` = Baazaar-style nav list */
  variant: { type: String, default: 'rail' },
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
      id: 'inventory',
      label: 'Inventory',
      icon: '🎒',
      to: `/lore/${props.worldId}/inventory`,
      active: props.active === 'inventory',
      tip: LORE_RAIL.inventory,
    },
    {
      id: 'maps',
      label: 'Maps',
      icon: '🗺️',
      to: `/lore/${props.worldId}/maps`,
      active: props.active === 'maps',
      tip: LORE_RAIL.maps,
    },
  );
  return base;
});
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
  box-sizing: border-box;
}
.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  min-width: 0;
  padding: 0.4rem 0.15rem;
  border-radius: 6px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.55);
  box-sizing: border-box;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  font-size: 1rem;
  line-height: 1;
}
.label {
  width: 100%;
  max-width: 100%;
  font-family: 'Press Start 2P', monospace;
  font-size: 5px;
  text-align: center;
  line-height: 1.35;
  letter-spacing: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.sidebar {
  width: 100%;
  flex-shrink: 0;
  padding: 0.5rem 0.65rem 0.65rem;
  border-right: none;
  border-bottom: 1px solid rgba(139, 87, 255, 0.25);
  gap: 0.15rem;
}
.sidebar .item {
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.55rem;
  border-radius: 4px;
}
.sidebar .icon {
  width: 1.35rem;
  height: 1.35rem;
  font-size: 0.95rem;
}
.sidebar .label {
  flex: 1;
  font-family: 'Pixelar', monospace;
  font-size: 0.72rem;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
