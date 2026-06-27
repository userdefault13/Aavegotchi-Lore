<template>
  <div :class="$style.fields">
    <div v-for="field in fields" :key="field.id" :class="$style.row">
      <label :class="$style.label">{{ field.label }}</label>
      <select v-if="field.type === 'select'" v-model="local[field.id]" class="input-gotchi" @change="emitUpdate">
        <option value="">—</option>
        <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
      </select>
      <textarea v-else-if="field.type === 'textarea'" v-model="local[field.id]" class="input-gotchi" rows="2" @input="emitUpdate" />
      <input v-else :type="field.type === 'number' ? 'number' : 'text'" v-model="local[field.id]" class="input-gotchi" @input="emitUpdate" />
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  fields: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);

const local = reactive({ ...props.modelValue });

watch(() => props.modelValue, (v) => Object.assign(local, v || {}), { deep: true });

function emitUpdate() {
  emit('update:modelValue', { ...local });
}
</script>

<style module>
.fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid rgba(139, 125, 184, 0.35);
  border-radius: 6px;
  background: rgba(18, 10, 34, 0.5);
}
.row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.label {
  font-size: 0.75rem;
  color: #c084fc;
  font-weight: 600;
}
</style>
