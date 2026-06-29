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
    {
      id: 'robe',
      label: 'Robe',
      icon: '🎬',
      to: `/robe/${props.chronicleId}`,
      active: false,
      tip: { label: 'Robe', hint: 'Storyboard scenes into 720p video.' },
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
</style>
