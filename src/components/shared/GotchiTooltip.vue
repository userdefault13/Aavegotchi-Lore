<template>
  <span
    :class="[$style.wrap, block && $style.block]"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onEnter"
    @focusout="onLeave"
  >
    <slot />
    <span
      v-if="visible && hasContent"
      :class="[$style.tip, $style[position]]"
      role="tooltip"
    >
      <strong v-if="displayLabel" :class="$style.title">{{ displayLabel }}</strong>
      <span v-if="hint" :class="$style.hint">{{ hint }}</span>
    </span>
  </span>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  /** Shorthand: { label, hint } from workspaceHints */
  tip: { type: Object, default: null },
  position: {
    type: String,
    default: 'top',
    validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v),
  },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const visible = ref(false);

const displayLabel = computed(() => props.tip?.label || props.label);
const hint = computed(() => props.tip?.hint || props.hint);
const hasContent = computed(() => !!(displayLabel.value || hint.value));

function onEnter() {
  if (!props.disabled && hasContent.value) visible.value = true;
}

function onLeave() {
  visible.value = false;
}
</script>

<style module>
.wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}
.block {
  display: flex;
  width: 100%;
}
.block > :deep(a),
.block > :deep(button) {
  width: 100%;
}
.tip {
  position: absolute;
  z-index: 60;
  min-width: 9rem;
  max-width: 14rem;
  padding: 0.45rem 0.55rem;
  border: 2px solid #a78bfa;
  border-radius: 4px;
  background: linear-gradient(160deg, #1a142d 0%, #0f0b1e 100%);
  box-shadow: 3px 3px 0 rgba(101, 31, 255, 0.35), 0 8px 24px rgba(0, 0, 0, 0.45);
  pointer-events: none;
  animation: tipIn 0.12s ease-out;
}
@keyframes tipIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.title {
  display: block;
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  line-height: 1.5;
  letter-spacing: 0.04em;
  color: #c4b5fd;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}
.hint {
  display: block;
  font-size: 0.68rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.82);
}
.top {
  bottom: calc(100% + 0.45rem);
  left: 50%;
  transform: translateX(-50%);
}
.bottom {
  top: calc(100% + 0.45rem);
  left: 50%;
  transform: translateX(-50%);
}
.left {
  right: calc(100% + 0.45rem);
  top: 50%;
  transform: translateY(-50%);
}
.right {
  left: calc(100% + 0.45rem);
  top: 50%;
  transform: translateY(-50%);
}
</style>
