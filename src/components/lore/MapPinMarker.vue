<template>
  <g
    :class="[$style.pin, selected && $style.selected]"
    :transform="`translate(${x} ${y}) scale(${scale})`"
    @click.stop="$emit('click')"
  >
    <!-- Larger hit target without changing visual size -->
    <circle cx="0" cy="-8" r="12" fill="transparent" pointer-events="all" />
    <path
      :d="PIN_BODY"
      :fill="color"
      :stroke="selected ? '#fff' : 'rgba(15, 11, 30, 0.55)'"
      :stroke-width="selected ? 1.2 : 0.75"
      stroke-linejoin="round"
    />
    <circle cx="0" cy="-13.5" r="2.2" fill="rgba(255, 255, 255, 0.92)" pointer-events="none" />
  </g>
</template>

<script setup>
/** Compact map pin — tip anchored at (0, 0), ~18 units tall before scale. */
const PIN_BODY = [
  'M 0,0',
  'L -2.4,-6.8',
  'C -2.4,-10.2 -5.2,-13.2 -5.2,-14.2',
  'A 5.2,5.2 0 1,1 5.2,-14.2',
  'C 5.2,-13.2 2.4,-10.2 2.4,-6.8',
  'Z',
].join(' ');

defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  color: { type: String, default: '#4ade80' },
  selected: { type: Boolean, default: false },
  /** Scales pin to map coordinate space (621-wide Gotchiverse = 1). */
  scale: { type: Number, default: 1 },
});

defineEmits(['click']);
</script>

<style module>
.pin {
  cursor: pointer;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
}
.selected {
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.7));
}
</style>
