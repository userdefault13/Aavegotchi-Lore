<template>
  <div :class="$style.tabs">
    <div :class="$style.bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="[$style.tab, { [$style.active]: tab.id === modelValue }]"
        @click="$emit('update:modelValue', tab.id)"
      >
        {{ tab.label }}
        <span v-if="tab.closable" :class="$style.close" @click.stop="$emit('close', tab.id)">×</span>
      </button>
      <slot name="actions" />
    </div>
    <div :class="$style.content">
      <slot :active="modelValue" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: String, default: '' },
});
defineEmits(['update:modelValue', 'close']);
</script>

<style module>
.tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}
.bar {
  display: flex;
  gap: 0.25rem;
  border-bottom: 2px solid #8b7db8;
  padding-bottom: 0.25rem;
  flex-wrap: wrap;
}
.tab {
  background: #1a142d;
  border: 1px solid #8b7db8;
  color: #fff;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
}
.active {
  background: #651fff;
  border-color: #a78bfa;
}
.close {
  margin-left: 0.35rem;
  opacity: 0.7;
}
.content {
  flex: 1;
  padding-top: 0.75rem;
  overflow: auto;
}
</style>
