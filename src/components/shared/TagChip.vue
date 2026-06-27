<template>
  <span :class="$style.chip" :style="{ background: color, borderColor: color }">{{ label }}</span>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  color: { type: String, default: '#651FFF' },
});
</script>

<style module>
.chip {
  display: inline-block;
  font-size: 0.65rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  border: 1px solid;
  color: #fff;
  font-weight: 600;
}
</style>
