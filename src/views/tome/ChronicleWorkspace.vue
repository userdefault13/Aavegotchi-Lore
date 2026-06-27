<template>
  <div v-if="chronicle" :class="$style.wrap">
    <header :class="$style.head">
      <div>
        <router-link to="/tome" class="text-xs opacity-70">← Tome</router-link>
        <h1 class="font-pixel text-xs mt-1">{{ chronicle.title }}</h1>
        <p v-if="chronicle.upstreamChronicleId" :class="$style.branchBadge">
          Branch · {{ syncStatus?.commitsBehind ? `${syncStatus.commitsBehind} behind canon` : 'up to date' }}
          · {{ chronicle.slug }}
        </p>
        <p v-else-if="chronicle.visibility === 'canonical'" :class="$style.canonBadge">DAO canon</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <GotchiTooltip v-if="chronicle.upstreamChronicleId" :tip="TOME_ACTIONS.commit">
          <button
            type="button"
            class="btn-pixel text-[8px]"
            :disabled="committing"
            @click="checkpointCommit"
          >
            {{ committing ? '…' : 'Commit' }}
          </button>
        </GotchiTooltip>
        <GotchiTooltip v-if="chronicle.linkedWorldBranchId" :tip="TOME_ACTIONS.pushReview">
          <router-link
            :to="`/lore/${chronicle.linkedWorldBranchId}/proposals?new=1`"
            class="btn-pixel text-[8px]"
          >
            Push for review
          </router-link>
        </GotchiTooltip>
        <GotchiTooltip :tip="TOME_ACTIONS.linkLore">
          <router-link :to="`/tome/${chronicleId}/link`" class="btn-pixel text-[8px]">Link Lore</router-link>
        </GotchiTooltip>
        <GotchiTooltip :tip="TOME_ACTIONS.sessionPlay">
          <router-link :to="`/tome/${chronicleId}/play`" class="btn-pixel text-[8px]">Session Play</router-link>
        </GotchiTooltip>
        <GotchiTooltip :tip="TOME_ACTIONS.addArc">
          <button type="button" class="btn-pixel text-[8px]" @click="addNode('arc')">+ Arc</button>
        </GotchiTooltip>
      </div>
    </header>

    <div :class="$style.body">
      <TomeWorkspaceRail
        :chronicle-id="chronicleId"
        :lore-branch-id="chronicle.linkedWorldBranchId || ''"
        active="story"
        :is-branch="!!chronicle.upstreamChronicleId"
        :is-canon="chronicle.visibility === 'canonical'"
      />
      <StoryTree :nodes="nodes" @select="selectNode" />
      <div v-if="node" :class="$style.editor">
        <input v-model="node.title" class="input-gotchi" @change="saveNode" />
        <select v-model="node.status" class="input-gotchi mt-1 w-auto text-xs" @change="saveNode">
          <option value="pending">Pending</option>
          <option value="played">Played</option>
          <option value="skipped">Skipped</option>
        </select>
        <BlockEditor v-model="node.content" class="mt-2" @update:model-value="saveNode" />
        <ChoiceRolePanel
          :choices="node.choices"
          :roles="node.roles"
          class="mt-2"
          @update:choices="node.choices = $event; saveNode()"
          @update:roles="node.roles = $event; saveNode()"
        />
        <div class="mt-2 flex gap-2 flex-wrap">
          <button type="button" class="btn-pixel text-[8px]" @click="addChild('chapter')">+ Chapter</button>
          <button type="button" class="btn-pixel text-[8px]" @click="addChild('scene')">+ Scene</button>
          <button type="button" class="btn-pixel text-[8px]" @click="addBranch">+ Branch</button>
          <button type="button" class="btn-pixel text-[8px]" @click="addLoreRef">+ Lore Ref</button>
        </div>
        <div v-if="node.crossLinks?.length" class="text-xs mt-2">
          <p v-for="(link, i) in node.crossLinks" :key="i">
            <router-link
              v-if="link.pageId && linkedWorldId"
              :to="`/lore/${linkedWorldId}`"
              class="text-cyan"
            >
              📖 {{ link.title || link.pageId }}
            </router-link>
            <span v-else class="text-cyan">📖 {{ link.title || link.pageId || link.nodeId }}</span>
          </p>
        </div>
      </div>
      <Toolboard />

      <div v-if="chronicle.upstreamChronicleId" :class="$style.rightCol">
        <BranchSyncPanel
          :chronicle-id="chronicleId"
          :lore-branch-id="chronicle.linkedWorldBranchId || ''"
          :status="syncStatus"
          :commits="branchCommits"
          :loading="syncLoading"
          :committing="committing"
          @checkpoint="checkpointCommit"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { tomeApi, loreApi } from '@/services/api';
import StoryTree from '@/components/tome/StoryTree.vue';
import BlockEditor from '@/components/lore/BlockEditor.vue';
import ChoiceRolePanel from '@/components/tome/ChoiceRolePanel.vue';
import Toolboard from '@/components/tome/Toolboard.vue';
import TomeWorkspaceRail from '@/components/tome/TomeWorkspaceRail.vue';
import BranchSyncPanel from '@/components/tome/BranchSyncPanel.vue';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { TOME_ACTIONS } from '@/utils/workspaceHints';

const route = useRoute();
const chronicleId = computed(() => route.params.chronicleId);
const chronicle = ref(null);
const nodes = ref([]);
const node = ref(null);
const syncStatus = ref(null);
const branchCommits = ref([]);
const syncLoading = ref(false);
const committing = ref(false);
const linkedWorldId = computed(() => {
  if (chronicle.value?.linkedWorldBranchId) return chronicle.value.linkedWorldBranchId;
  return chronicle.value?.linkedWorldId;
});

onMounted(load);
watch(chronicleId, load);

async function load() {
  chronicle.value = await tomeApi.getChronicle(chronicleId.value);
  nodes.value = await tomeApi.listNodes(chronicleId.value);
  if (nodes.value.length && !node.value) node.value = nodes.value[0];
  if (chronicle.value?.upstreamChronicleId) await loadSync();
}

async function loadSync() {
  syncLoading.value = true;
  try {
    [syncStatus.value, branchCommits.value] = await Promise.all([
      tomeApi.getChronicleSyncStatus(chronicleId.value),
      tomeApi.listChronicleCommits(chronicleId.value),
    ]);
  } catch {
    syncStatus.value = null;
    branchCommits.value = [];
  } finally {
    syncLoading.value = false;
  }
}

function selectNode(id) {
  node.value = nodes.value.find((n) => n.id === id);
}

async function saveNode() {
  if (!node.value) return;
  await tomeApi.updateNode(node.value.id, {
    title: node.value.title,
    content: node.value.content,
    status: node.value.status,
    choices: node.value.choices,
    roles: node.value.roles,
    crossLinks: node.value.crossLinks,
    frame: node.value.frame,
  });
}

async function checkpointCommit() {
  const message = prompt('Commit message?', 'Campaign edits');
  if (message === null) return;
  committing.value = true;
  try {
    await tomeApi.createChronicleCommit(chronicleId.value, message.trim() || 'Campaign edits');
    await loadSync();
  } catch (err) {
    alert(err.message || 'Commit failed');
  } finally {
    committing.value = false;
  }
}

async function addNode(type) {
  const title = prompt(`${type} title?`);
  if (!title) return;
  const created = await tomeApi.createNode({ chronicleId: chronicleId.value, type, title, parentId: null });
  nodes.value.push(created);
  node.value = created;
}

async function addChild(type) {
  if (!node.value) return;
  const title = prompt(`${type} title?`);
  if (!title) return;
  const created = await tomeApi.createNode({
    chronicleId: chronicleId.value,
    type,
    title,
    parentId: node.value.id,
  });
  nodes.value.push(created);
  node.value = created;
}

async function addBranch() {
  if (!node.value) return;
  const title = prompt('Branch scene title?');
  if (!title) return;
  const siblings = nodes.value.filter((n) => n.parentId === node.value.parentId);
  const created = await tomeApi.createNode({
    chronicleId: chronicleId.value,
    type: 'scene',
    title,
    parentId: node.value.parentId,
    branchIndex: siblings.length,
  });
  nodes.value.push(created);
  node.value = created;
}

async function addLoreRef() {
  if (!linkedWorldId.value || !node.value) return;
  const pages = await loreApi.listPages(linkedWorldId.value);
  if (!pages.length) return alert('No lore pages in linked world');
  const labels = pages.slice(0, 12).map((p, i) => `${i + 1}. ${p.title}`).join('\n');
  const pickNum = prompt(`Pick lore page (enter number):\n${labels}`);
  const idx = Number(pickNum) - 1;
  const pick = pages[idx];
  if (!pick) return;
  node.value.crossLinks = [...(node.value.crossLinks || []), { pageId: pick.id, title: pick.title }];
  await saveNode();
  await loreApi.updatePage(pick.id, {
    crossLinks: [
      ...(pick.crossLinks || []),
      { chronicleId: chronicleId.value, nodeId: node.value.id, title: node.value.title },
    ],
  });
}
</script>

<style module>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.head {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.branchBadge {
  font-size: 0.65rem;
  color: #c4b5fd;
  margin-top: 0.25rem;
}
.canonBadge {
  font-size: 0.65rem;
  color: #fcd34d;
  margin-top: 0.25rem;
}
.body {
  display: flex;
  gap: 0;
  min-height: 480px;
  border: 2px solid #47238d;
  border-radius: 4px;
  overflow: hidden;
  background: #0f0b1e;
}
.editor {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
  min-width: 0;
}
.rightCol {
  display: flex;
  flex-direction: column;
}
</style>
