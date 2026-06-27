<template>
  <div :class="$style.wrap">
    <textarea v-model="code" class="input-gotchi" rows="4" placeholder="Mermaid diagram code" />
    <button type="button" class="btn-pixel text-[8px] mt-1" @click="render">Render</button>
    <div ref="outRef" :class="$style.out" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import mermaid from 'mermaid';

const props = defineProps({
  modelValue: { type: String, default: 'graph TD\n  A[Citaadel] --> B[Great Portal]\n  B --> C[Grid]' },
});

const code = ref(props.modelValue);
const outRef = ref(null);

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

async function render() {
  if (!outRef.value) return;
  const id = `mmd-${Date.now()}`;
  const { svg } = await mermaid.render(id, code.value);
  outRef.value.innerHTML = svg;
}

onMounted(render);
</script>

<style module>
.wrap {
  margin-top: 0.5rem;
}
.out {
  margin-top: 0.5rem;
  overflow: auto;
  background: #0f0b1e;
  border-radius: 6px;
  padding: 0.5rem;
}
</style>
