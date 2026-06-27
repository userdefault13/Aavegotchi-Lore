<template>
  <nav :class="$style.rail" aria-label="Tome workspace">
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
import { TOME_RAIL } from '@/utils/workspaceHints';

const props = defineProps({
  chronicleId: { type: String, required: true },
  loreBranchId: { type: String, default: '' },
  active: { type: String, default: 'story' },
  isBranch: { type: Boolean, default: false },
  isCanon: { type: Boolean, default: false },
});

const items = computed(() => {
  const base = [
    {
      id: 'story',
      label: 'Story',
      icon: '📜',
      to: `/tome/${props.chronicleId}`,
      active: props.active === 'story',
      tip: TOME_RAIL.story,
    },
    {
      id: 'play',
      label: 'Play',
      icon: '▶',
      to: `/tome/${props.chronicleId}/play`,
      active: props.active === 'play',
      tip: TOME_RAIL.play,
    },
    {
      id: 'link',
      label: 'Link',
      icon: '🔗',
      to: `/tome/${props.chronicleId}/link`,
      active: props.active === 'link',
      tip: TOME_RAIL.link,
    },
  ];
  if ((props.isBranch || props.isCanon) && props.loreBranchId) {
    base.push({
      id: 'proposals',
      label: 'PRs',
      icon: '⇄',
      to: `/lore/${props.loreBranchId}/proposals`,
      active: props.active === 'proposals',
      tip: TOME_RAIL.proposals,
    });
  }
  if (props.isBranch) {
    base.push({
      id: 'sync',
      label: 'Sync',
      icon: '↓',
      to: `/tome/${props.chronicleId}/sync`,
      active: props.active === 'sync',
      tip: TOME_RAIL.sync,
    });
  }
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
