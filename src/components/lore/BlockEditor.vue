<template>
  <div :class="$style.editor">
    <div v-if="editor" :class="$style.toolbar">
      <button type="button" :class="$style.btn" @click="editor.chain().focus().toggleBold().run()"><b>B</b></button>
      <button type="button" :class="$style.btn" @click="editor.chain().focus().toggleItalic().run()"><i>I</i></button>
      <button type="button" :class="$style.btn" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button type="button" :class="$style.btn" @click="editor.chain().focus().toggleBulletList().run()">•</button>
      <button type="button" :class="$style.btn" @click="editor.chain().focus().toggleBlockquote().run()">"</button>
      <button type="button" :class="$style.btn" title="Insert image" @click="pickImage">🖼</button>
      <input ref="fileInput" type="file" accept="image/*" hidden @change="onImageUpload" />
    </div>
    <div :class="[$style.body, frameClass]">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { loreApi } from '@/services/api';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Write lore…' },
  frame: { type: String, default: null },
});

const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);

const frameClass = computed(() => {
  if (!props.frame) return '';
  return `frame-${props.frame}`;
});

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: props.placeholder }),
    Image.configure({ inline: false, allowBase64: false }),
  ],
  onUpdate: ({ editor: e }) => emit('update:modelValue', e.getHTML()),
});

watch(() => props.modelValue, (v) => {
  if (editor.value && v !== editor.value.getHTML()) {
    editor.value.commands.setContent(v || '', false);
  }
});

function pickImage() {
  fileInput.value?.click();
}

async function onImageUpload(e) {
  const file = e.target.files?.[0];
  if (!file || !editor.value) return;
  try {
    const { url } = await loreApi.uploadAsset(file);
    editor.value.chain().focus().setImage({ src: url, alt: file.name }).run();
  } catch (err) {
    alert(err.message || 'Image upload failed');
  } finally {
    e.target.value = '';
  }
}
</script>

<style module>
.editor {
  border: 1px solid #8b7db8;
  border-radius: 6px;
  overflow: hidden;
}
.toolbar {
  display: flex;
  gap: 0.25rem;
  padding: 0.35rem;
  background: #0f0b1e;
  border-bottom: 1px solid #8b7db8;
}
.btn {
  background: #2d1b3d;
  border: 1px solid #8b7db8;
  color: #fff;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
}
.body {
  padding: 0.75rem;
  min-height: 120px;
  background: #1a142d;
}
.body :global(.tiptap) {
  outline: none;
  min-height: 100px;
}
.body :global(.tiptap p.is-editor-empty:first-child::before) {
  color: #8b7db8;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.body :global(.tiptap img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.35rem 0;
}
</style>

<style>
.frame-purple { border-left: 4px solid #651fff; }
.frame-pink { border-left: 4px solid #ff6b9d; }
.frame-cyan { border-left: 4px solid #06b6d4; }
.frame-gold { border-left: 4px solid #fcd34d; }
</style>
