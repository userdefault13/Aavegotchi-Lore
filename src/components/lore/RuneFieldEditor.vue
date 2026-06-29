<template>
  <div :class="$style.fields">
    <div v-if="topFields.length" :class="$style.top">
      <div v-for="field in topFields" :key="field.id" :class="$style.row">
        <label :class="$style.label">{{ field.label }}</label>
        <select v-if="field.type === 'select'" v-model="local[field.id]" class="input-gotchi" @change="emitUpdate">
          <option value="">—</option>
          <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <input
          v-else
          :type="field.type === 'number' ? 'number' : 'text'"
          v-model="local[field.id]"
          class="input-gotchi"
          @input="emitUpdate"
        />
      </div>
    </div>

    <div
      v-if="textareaFields.length"
      :class="$style.textareaPane"
      :style="{ height: `${textareaPaneHeight}px` }"
    >
      <div v-for="field in textareaFields" :key="field.id" :class="$style.row">
        <label :class="$style.label">{{ field.label }}</label>
        <textarea
          v-model="local[field.id]"
          class="input-gotchi"
          :class="$style.textarea"
          @input="emitUpdate"
        />
      </div>
      <VerticalResizeHandle
        v-if="topFields.length"
        :class="$style.paneHandle"
        @resize-delta="onTextareaResize"
      />
    </div>

    <template v-if="!textareaFields.length">
      <div v-for="field in fields" :key="field.id" :class="$style.row">
        <label :class="$style.label">{{ field.label }}</label>
        <select v-if="field.type === 'select'" v-model="local[field.id]" class="input-gotchi" @change="emitUpdate">
          <option value="">—</option>
          <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <input
          v-else
          :type="field.type === 'number' ? 'number' : 'text'"
          v-model="local[field.id]"
          class="input-gotchi"
          @input="emitUpdate"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import VerticalResizeHandle from '@/components/shared/VerticalResizeHandle.vue';

const props = defineProps({
  fields: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
  textareaPaneHeight: { type: Number, default: 160 },
});

const emit = defineEmits(['update:modelValue', 'update:textareaPaneHeight', 'resize-delta']);

const local = reactive({ ...props.modelValue });

const textareaFields = computed(() => props.fields.filter((f) => f.type === 'textarea'));
const topFields = computed(() => {
  if (!textareaFields.value.length) return [];
  const textareaIds = new Set(textareaFields.value.map((f) => f.id));
  return props.fields.filter((f) => !textareaIds.has(f.id));
});

watch(() => props.modelValue, (v) => Object.assign(local, v || {}), { deep: true });

function onTextareaResize(deltaY) {
  emit('resize-delta', deltaY);
}

function emitUpdate() {
  emit('update:modelValue', { ...local });
}
</script>

<style module>
.fields {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0.75rem;
  border: 1px solid rgba(139, 125, 184, 0.35);
  border-radius: 6px;
  background: rgba(18, 10, 34, 0.5);
  box-sizing: border-box;
}

.top {
  flex-shrink: 0;
  margin-bottom: 0.5rem;
}

.textareaPane {
  flex: 1 1 auto;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
  box-sizing: border-box;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 0;
  flex: 1 1 auto;
}

.label {
  font-size: 0.75rem;
  color: #c084fc;
  font-weight: 600;
  flex-shrink: 0;
}

.textarea {
  flex: 1 1 auto;
  min-height: 4rem;
  resize: none;
  overflow: auto;
}

.paneHandle {
  flex-shrink: 0;
  margin-top: 0.25rem;
}
</style>
