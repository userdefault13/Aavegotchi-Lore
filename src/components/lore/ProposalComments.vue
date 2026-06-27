<template>
  <section :class="$style.comments">
    <h3 class="font-pixel text-[8px] mb-1">{{ title }}</h3>

    <ul v-if="thread.length" :class="$style.list">
      <li v-for="c in thread" :key="c.id">
        <div :class="$style.meta">
          <span class="text-[10px] opacity-50">{{ shortWallet(c.authorWallet) }}</span>
          <span class="text-[10px] opacity-40">{{ formatDate(c.createdAt) }}</span>
          <button
            v-if="canDelete(c)"
            type="button"
            class="text-[10px] opacity-40 hover:opacity-80"
            @click="$emit('delete', c.id)"
          >
            ×
          </button>
        </div>
        <p class="text-xs opacity-85">{{ c.body }}</p>
      </li>
    </ul>
    <p v-else class="text-xs opacity-45 mb-1">No comments yet.</p>

    <form v-if="canComment" :class="$style.form" @submit.prevent="submit">
      <textarea
        v-model="draft"
        class="input-gotchi text-xs"
        rows="2"
        :placeholder="placeholder"
        required
      />
      <button type="submit" class="btn-pixel text-[8px]" :disabled="submitting || !draft.trim()">
        {{ submitting ? '…' : 'Comment' }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  comments: { type: Array, default: () => [] },
  pageKey: { type: String, default: null },
  nodeKey: { type: String, default: null },
  hunkPath: { type: String, default: null },
  title: { type: String, default: 'Discussion' },
  placeholder: { type: String, default: 'Leave a review note…' },
  canComment: { type: Boolean, default: true },
  walletAddress: { type: String, default: '' },
  isMaintainer: { type: Boolean, default: false },
  isAuthor: { type: Boolean, default: false },
});

const emit = defineEmits(['add', 'delete']);

const draft = ref('');
const submitting = ref(false);

const thread = computed(() => {
  const scope = props.hunkPath ? 'hunk' : 'general';
  return props.comments.filter((c) => {
    if (scope === 'general') return c.scope === 'general';
    if (props.nodeKey) {
      return c.scope === 'hunk' && c.nodeKey === props.nodeKey && c.hunkPath === props.hunkPath;
    }
    return c.scope === 'hunk' && c.pageKey === props.pageKey && c.hunkPath === props.hunkPath;
  });
});

function canDelete(comment) {
  const addr = (props.walletAddress || '').toLowerCase();
  if (!addr) return false;
  return comment.authorWallet === addr || props.isMaintainer || props.isAuthor;
}

function submit() {
  if (!draft.value.trim()) return;
  emit('add', {
    body: draft.value.trim(),
    scope: props.hunkPath ? 'hunk' : 'general',
    pageKey: props.pageKey,
    nodeKey: props.nodeKey,
    hunkPath: props.hunkPath,
  });
  draft.value = '';
}

function shortWallet(w) {
  if (!w || w.length < 10) return w || 'anon';
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
</script>

<style module>
.comments {
  margin-top: 0.5rem;
  padding: 0.45rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.15);
}
.list {
  list-style: none;
  margin: 0 0 0.45rem;
  padding: 0;
}
.list li {
  margin-bottom: 0.45rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px dashed rgba(139, 125, 184, 0.15);
}
.meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.15rem;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
</style>
