<template>
  <aside v-if="tabs.length" :class="$style.sidebar">
    <p v-if="mirrorToast" :class="$style.toast">{{ mirrorToast }}</p>

    <nav :class="$style.tabs" role="tablist" aria-label="Page utilities">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :class="[$style.tab, activeTab === tab.id && $style.tabActive]"
        :aria-selected="activeTab === tab.id"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div :class="$style.pane">
      <section v-show="activeTab === 'campaigns'" :class="$style.embedded">
        <h3 class="font-pixel text-[8px] mb-1">Linked campaigns</h3>
        <ul :class="$style.campaignList">
          <li v-for="c in linkedChronicles" :key="c.id">
            <router-link :to="`/tome/${c.id}`" class="text-cyan text-xs">{{ c.title }}</router-link>
            <div class="flex gap-1 mt-1">
              <router-link :to="`/tome/${c.id}`" class="btn-pixel text-[7px]">Edit</router-link>
              <router-link :to="`/tome/${c.id}/play`" class="btn-pixel text-[7px]">Play</router-link>
            </div>
          </li>
        </ul>
      </section>

      <CanonCommitPanel
        v-show="activeTab === 'canon'"
        embedded
        :world-id="worldId"
        :commits="canonCommits"
        :can-write="canWrite"
        :can-review="canWrite"
        :committing="committing"
        @record-edit="$emit('record-edit')"
      />
      <ForkSyncPanel
        v-show="activeTab === 'sync'"
        embedded
        :world-id="worldId"
        :status="syncStatus"
        :commits="forkCommits"
        :loading="syncLoading"
        :committing="committing"
        @checkpoint="$emit('checkpoint')"
      />
      <PageLinksPanel
        v-show="activeTab === 'links'"
        embedded
        :page-id="pageId"
        :cross-links="crossLinks"
        :pages="pages"
        :backlinks="backlinks"
        :map-pins="mapPins"
        :diagram-nodes="diagramNodes"
        @update:cross-links="$emit('update:cross-links', $event)"
        @navigate="$emit('navigate', $event)"
        @navigate-map="$emit('navigate-map', $event)"
        @navigate-diagram="$emit('navigate-diagram', $event)"
      />
      <PageAutomationPanel
        v-show="activeTab === 'automation'"
        embedded
        :page-id="pageId"
        :mirror-links="mirrorLinks"
        :pages="pages"
        :rune-fields="runeFields"
        :blocks="blocks"
        @update:mirror-links="$emit('update:mirror-links', $event)"
        @navigate="$emit('navigate', $event)"
        @apply-now="$emit('apply-now')"
      />
      <PageHistoryPanel
        v-show="activeTab === 'history'"
        embedded
        :revisions="revisions"
        :loading="revisionsLoading"
        :restoring="restoringRevisionId"
        @restore="$emit('restore', $event)"
      />
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import CanonCommitPanel from '@/components/lore/CanonCommitPanel.vue';
import ForkSyncPanel from '@/components/lore/ForkSyncPanel.vue';
import PageLinksPanel from '@/components/lore/PageLinksPanel.vue';
import PageAutomationPanel from '@/components/lore/PageAutomationPanel.vue';
import PageHistoryPanel from '@/components/lore/PageHistoryPanel.vue';

const props = defineProps({
  worldId: { type: String, default: '' },
  pageId: { type: String, default: '' },
  page: { type: Object, default: null },
  pages: { type: Array, default: () => [] },
  crossLinks: { type: Array, default: () => [] },
  mirrorLinks: { type: Array, default: () => [] },
  backlinks: { type: Array, default: () => [] },
  mapPins: { type: Array, default: () => [] },
  diagramNodes: { type: Array, default: () => [] },
  runeFields: { type: Array, default: () => [] },
  blocks: { type: Array, default: () => [] },
  revisions: { type: Array, default: () => [] },
  revisionsLoading: { type: Boolean, default: false },
  restoringRevisionId: { type: String, default: '' },
  syncStatus: { type: Object, default: null },
  forkCommits: { type: Array, default: () => [] },
  syncLoading: { type: Boolean, default: false },
  canonCommits: { type: Array, default: () => [] },
  linkedChronicles: { type: Array, default: () => [] },
  mirrorToast: { type: String, default: '' },
  isCanon: { type: Boolean, default: false },
  isBranch: { type: Boolean, default: false },
  canWrite: { type: Boolean, default: false },
  committing: { type: Boolean, default: false },
});

defineEmits([
  'checkpoint',
  'record-edit',
  'update:cross-links',
  'update:mirror-links',
  'navigate',
  'navigate-map',
  'navigate-diagram',
  'apply-now',
  'restore',
]);

const activeTab = ref('links');

const tabs = computed(() => {
  const list = [];
  if (props.linkedChronicles.length) {
    list.push({ id: 'campaigns', label: 'Campaigns' });
  }
  if (props.isCanon) {
    list.push({ id: 'canon', label: 'Canon' });
  }
  if (props.isBranch) {
    list.push({ id: 'sync', label: 'Sync' });
  }
  if (props.page) {
    list.push(
      { id: 'links', label: 'Links' },
      { id: 'automation', label: 'Auto' },
      { id: 'history', label: 'History' },
    );
  }
  return list;
});

watch(
  tabs,
  (next) => {
    if (!next.length) return;
    if (!next.some((t) => t.id === activeTab.value)) {
      activeTab.value = next[0].id;
    }
  },
  { immediate: true },
);
</script>

<style module>
.sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgba(26, 10, 46, 0.92);
  border-left: 2px solid #47238d;
}
.toast {
  margin: 0;
  padding: 0.45rem 0.65rem;
  font-size: 0.7rem;
  line-height: 1.35;
  color: #c4b5fd;
  background: rgba(76, 29, 149, 0.35);
  border-bottom: 1px solid rgba(139, 125, 184, 0.25);
}
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem;
  padding: 0.45rem 0.5rem;
  border-bottom: 1px solid rgba(139, 87, 255, 0.25);
  flex-shrink: 0;
}
.tab {
  flex: 1 1 auto;
  min-width: 3.25rem;
  padding: 0.35rem 0.3rem;
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.tab:hover {
  color: #fff;
  background: rgba(139, 87, 255, 0.12);
}
.tabActive {
  color: #c4b5fd;
  border-color: rgba(167, 139, 250, 0.45);
  background: rgba(139, 87, 255, 0.2);
}
.pane {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.65rem 0.55rem 0.85rem;
}
.embedded {
  padding: 0.15rem 0.2rem;
}
.campaignList {
  list-style: none;
  margin: 0;
  padding: 0;
}
.campaignList li {
  margin-bottom: 0.5rem;
}
</style>
