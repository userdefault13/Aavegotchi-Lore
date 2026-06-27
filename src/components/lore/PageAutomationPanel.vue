<template>
  <aside :class="$style.panel">
    <h3 class="font-pixel text-[8px] mb-1">Automation</h3>
    <p :class="$style.hint">Mirror fields to other pages when this page saves.</p>

    <section :class="$style.section">
      <p :class="$style.label">Outgoing mirrors</p>
      <ul v-if="outgoing.length" :class="$style.list">
        <li v-for="(link, i) in outgoing" :key="i">
          <span class="text-xs">{{ describeLink(link) }}</span>
          <button type="button" :class="$style.remove" @click="removeLink(i)">×</button>
        </li>
      </ul>
      <p v-else class="text-xs opacity-50">None yet.</p>
    </section>

    <section v-if="incoming.length" :class="$style.section">
      <p :class="$style.label">Incoming mirrors</p>
      <ul :class="$style.list">
        <li v-for="item in incoming" :key="item.sourcePageId">
          <button type="button" :class="$style.linkBtn" @click="$emit('navigate', item.sourcePageId)">
            ← {{ item.sourceTitle }}
          </button>
          <span class="text-[10px] opacity-60">{{ describeSpec(item.spec) }}</span>
        </li>
      </ul>
    </section>

    <section :class="$style.section">
      <p :class="$style.label">Add mirror</p>
      <label :class="$style.field">
        <span>Target page</span>
        <select v-model="form.targetPageId" class="input-gotchi text-xs">
          <option value="">Choose page…</option>
          <option v-for="p in targetPages" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
      </label>
      <label :class="$style.check">
        <input v-model="form.syncTitle" type="checkbox" />
        <span>Sync page title</span>
      </label>
      <div v-if="runeFields.length" :class="$style.checkGroup">
        <p class="text-[10px] opacity-60 mb-1">Sync runes</p>
        <label v-for="f in runeFields" :key="f.id" :class="$style.check">
          <input v-model="form.runes" type="checkbox" :value="f.id" />
          <span>{{ f.label }}</span>
        </label>
      </div>
      <div v-if="blockOptions.length" :class="$style.field">
        <span>Sync block → target block</span>
        <div :class="$style.blockRow">
          <select v-model="form.sourceBlockLabel" class="input-gotchi text-xs flex-1">
            <option value="">Source block…</option>
            <option v-for="b in blockOptions" :key="b.id" :value="b.label">{{ b.label }}</option>
          </select>
          <select v-model="form.targetBlockLabel" class="input-gotchi text-xs flex-1">
            <option value="">Target label…</option>
            <option v-for="b in targetBlockOptions" :key="'t-' + b.id" :value="b.label">{{ b.label }}</option>
          </select>
        </div>
      </div>
      <button type="button" class="btn-pixel text-[8px] w-full mt-2" :disabled="!canAdd" @click="addLink">
        Add mirror
      </button>
    </section>

    <section :class="$style.section">
      <button type="button" class="btn-pixel text-[8px] w-full" @click="$emit('apply-now')">
        Apply mirrors now
      </button>
    </section>
  </aside>
</template>

<script setup>
import { computed, reactive } from 'vue';
import {
  blockLabelOptions,
  buildMirrorLink,
  findIncomingMirrors,
  mirrorLinkLabel,
  normalizeMirrorLink,
} from '@/utils/mirrorLinks';

const props = defineProps({
  pageId: { type: String, required: true },
  mirrorLinks: { type: Array, default: () => [] },
  pages: { type: Array, default: () => [] },
  runeFields: { type: Array, default: () => [] },
  blocks: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:mirrorLinks', 'navigate', 'apply-now']);

const form = reactive({
  targetPageId: '',
  syncTitle: false,
  runes: [],
  sourceBlockLabel: '',
  targetBlockLabel: '',
});

const outgoing = computed(() => props.mirrorLinks || []);
const incoming = computed(() => findIncomingMirrors(props.pages, props.pageId));
const targetPages = computed(() => props.pages.filter((p) => p.id !== props.pageId));
const blockOptions = computed(() => blockLabelOptions(props.blocks));
const targetBlockOptions = computed(() => {
  const target = props.pages.find((p) => p.id === form.targetPageId);
  return blockLabelOptions(target?.blocks);
});

const canAdd = computed(() => {
  if (!form.targetPageId) return false;
  if (form.syncTitle) return true;
  if (form.runes.length) return true;
  if (form.sourceBlockLabel && form.targetBlockLabel) return true;
  return false;
});

function describeLink(link) {
  return mirrorLinkLabel(link, props.pages);
}

function describeSpec(spec) {
  const parts = [];
  if (spec.title) parts.push('title');
  if (spec.runes.length) parts.push(`${spec.runes.length} rune(s)`);
  if (spec.blocks.length) parts.push(`${spec.blocks.length} block(s)`);
  return parts.join(', ') || 'fields';
}

function addLink() {
  const blocks =
    form.sourceBlockLabel && form.targetBlockLabel
      ? [{ sourceLabel: form.sourceBlockLabel, targetLabel: form.targetBlockLabel }]
      : [];

  const existing = outgoing.value.find((l) => l.targetPageId === form.targetPageId);
  if (existing) {
    const spec = normalizeMirrorLink(existing);
    const merged = buildMirrorLink({
      targetPageId: form.targetPageId,
      title: spec.title || form.syncTitle,
      runes: [...new Set([...spec.runes, ...form.runes])],
      blocks: [...spec.blocks, ...blocks],
    });
    const next = outgoing.value.map((l) => (l.targetPageId === form.targetPageId ? merged : l));
    emit('update:mirrorLinks', next);
  } else {
    const link = buildMirrorLink({
      targetPageId: form.targetPageId,
      title: form.syncTitle,
      runes: [...form.runes],
      blocks,
    });
    emit('update:mirrorLinks', [...outgoing.value, link]);
  }

  form.targetPageId = '';
  form.syncTitle = false;
  form.runes = [];
  form.sourceBlockLabel = '';
  form.targetBlockLabel = '';
}

function removeLink(index) {
  const next = [...outgoing.value];
  next.splice(index, 1);
  emit('update:mirrorLinks', next);
}
</script>

<style module>
.panel {
  width: 180px;
  flex-shrink: 0;
  border-left: 2px solid #8b7db8;
  padding-left: 0.75rem;
  padding-top: 0.75rem;
}
.hint {
  font-size: 10px;
  opacity: 0.55;
  margin: 0 0 0.65rem;
  line-height: 1.35;
}
.section {
  margin-bottom: 0.85rem;
}
.label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.45;
  margin: 0 0 0.35rem;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.list li {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-bottom: 0.45rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(139, 125, 184, 0.15);
}
.remove {
  align-self: flex-end;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
}
.linkBtn {
  background: none;
  border: none;
  color: #c4b5fd;
  font-size: 0.75rem;
  cursor: pointer;
  text-align: left;
  padding: 0;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.45rem;
  font-size: 0.7rem;
  opacity: 0.85;
}
.checkGroup {
  margin-bottom: 0.45rem;
}
.check {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  margin-bottom: 0.25rem;
}
.blockRow {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
