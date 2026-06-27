<template>
  <div :class="$style.wrap">
    <textarea
      :value="modelValue"
      class="input-gotchi text-xs"
      rows="5"
      placeholder="Mermaid diagram code"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <button type="button" class="btn-pixel text-[8px] mt-1" @click="render">Render</button>
    <div ref="outRef" :class="$style.out" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import mermaid from 'mermaid';

const props = defineProps({
  modelValue: { type: String, default: '' },
});

defineEmits(['update:modelValue']);

const outRef = ref(null);

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

async function render() {
  if (!outRef.value || !props.modelValue?.trim()) return;
  try {
    const id = `mmd-${Date.now()}`;
    const { svg } = await mermaid.render(id, props.modelValue);
    outRef.value.innerHTML = svg;
  } catch (e) {
    outRef.value.innerHTML = `<p style="color:#f472b6;font-size:12px">${e.message || 'Invalid Mermaid'}</p>`;
  }
}

watch(() => props.modelValue, () => render(), { flush: 'post' });
onMounted(render);
</script>

<style module>
.wrap {
  padding: 0.75rem;
}
.out {
  margin-top: 0.5rem;
  overflow: auto;
  background: #0f0b1e;
  border-radius: 6px;
  padding: 0.5rem;
  min-height: 80px;
}
</style>
