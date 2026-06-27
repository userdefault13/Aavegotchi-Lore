<template>
  <div v-if="world" :class="$style.page">
    <LoreWorkspaceRail :world-id="worldId" active="sync" :is-branch="true" />
    <div :class="$style.main">
      <header :class="$style.head">
        <div>
          <router-link :to="`/lore/${worldId}`" class="text-xs opacity-70">← Workspace</router-link>
          <h1 class="font-pixel text-xs mt-1">Pull from canon</h1>
          <p class="text-xs opacity-60 mt-1">
            Sync upstream lore into your branch. Resolve field conflicts before applying.
          </p>
        </div>
      </header>

      <p v-if="loading" class="text-sm opacity-60">Analyzing upstream changes…</p>

      <template v-else-if="preview">
        <div :class="$style.summary">
          <router-link :to="`/lore/${preview.upstreamWorldId}`" class="text-xs text-purple-300">
            ↑ {{ preview.upstreamTitle }}
          </router-link>
          <div :class="$style.stats">
            <span :class="[$style.stat, preview.commitsBehind > 0 && $style.statWarn]">
              {{ preview.commitsBehind }} commits behind
            </span>
            <span :class="$style.stat">{{ preview.stats?.hunksCount || 0 }} auto fields</span>
            <span :class="[$style.stat, preview.stats?.conflictCount > 0 && $style.statConflict]">
              {{ preview.stats?.conflictCount || 0 }} conflicts
            </span>
          </div>
        </div>

        <section v-if="preview.autoApply?.length" :class="$style.section">
          <h2 class="font-pixel text-[8px]">Auto-applied changes</h2>
          <p class="text-xs opacity-60 mb-2">
            These canon updates do not overlap your edits and will apply automatically.
          </p>
          <ProposalDiffViewer :patches="preview.autoApply" />
        </section>

        <section v-if="preview.conflicts?.length" :class="$style.section">
          <h2 class="font-pixel text-[8px]">Resolve conflicts</h2>
          <p class="text-xs opacity-60 mb-2">
            You and canon both changed the same fields since your branch base.
          </p>
          <PullConflictResolver v-model="resolutions" :conflicts="preview.conflicts" />
        </section>

        <p v-if="!preview.canPull" class="text-sm opacity-60">
          Your branch is up to date with canon — nothing to pull.
        </p>

        <div v-else :class="$style.actions">
          <input
            v-model="pullMessage"
            class="input-gotchi text-xs flex-1"
            placeholder="Pull message (optional)"
          />
          <button
            type="button"
            class="btn-pixel text-[8px]"
            :disabled="pulling || !allResolved"
            @click="executePull"
          >
            {{ pulling ? 'Pulling…' : 'Apply pull' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loreApi } from '@/services/api';
import { conflictKey } from '@/utils/loreDiff';
import LoreWorkspaceRail from '@/components/lore/LoreWorkspaceRail.vue';
import ProposalDiffViewer from '@/components/lore/ProposalDiffViewer.vue';
import PullConflictResolver from '@/components/lore/PullConflictResolver.vue';

const route = useRoute();
const router = useRouter();
const worldId = computed(() => route.params.worldId);

const world = ref(null);
const preview = ref(null);
const loading = ref(true);
const pulling = ref(false);
const pullMessage = ref('Pull from upstream canon');
const resolutions = ref({});

const allResolved = computed(() => {
  if (!preview.value?.conflicts?.length) return true;
  return preview.value.conflicts.every((c) => {
    const choice = resolutions.value[conflictKey(c.pageKey, c.path)];
    return choice === 'mine' || choice === 'theirs';
  });
});

onMounted(load);

async function load() {
  loading.value = true;
  try {
    world.value = await loreApi.getWorld(worldId.value);
    if (!world.value?.upstreamWorldId) {
      router.replace(`/lore/${worldId.value}`);
      return;
    }
    preview.value = await loreApi.previewPull(worldId.value);
  } catch (err) {
    alert(err.message || 'Could not preview pull');
  } finally {
    loading.value = false;
  }
}

async function executePull() {
  pulling.value = true;
  try {
    const resolutionList = (preview.value?.conflicts || []).map((c) => ({
      pageKey: c.pageKey,
      path: c.path,
      choice: resolutions.value[conflictKey(c.pageKey, c.path)] || 'mine',
    }));
    await loreApi.pullFromUpstream(worldId.value, {
      message: pullMessage.value,
      resolutions: resolutionList,
    });
    router.push(`/lore/${worldId.value}`);
  } catch (err) {
    alert(err.message || 'Pull failed');
  } finally {
    pulling.value = false;
  }
}
</script>

<style module>
.page {
  display: flex;
  min-height: 520px;
  border: 2px solid #47238d;
  border-radius: 4px;
  overflow: hidden;
  background: #0f0b1e;
}
.main {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
}
.head {
  margin-bottom: 0.75rem;
}
.summary {
  margin-bottom: 0.75rem;
  padding: 0.55rem;
  border: 1px solid rgba(139, 125, 184, 0.25);
  border-radius: 4px;
}
.stats {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-top: 0.45rem;
}
.stat {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.4rem;
  border: 1px solid rgba(139, 125, 184, 0.35);
  border-radius: 3px;
  opacity: 0.75;
}
.statWarn {
  border-color: #fbbf24;
  color: #fcd34d;
  opacity: 1;
}
.statConflict {
  border-color: #f87171;
  color: #fca5a5;
  opacity: 1;
}
.section {
  margin-bottom: 0.85rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.65rem;
  border-top: 1px dashed rgba(139, 125, 184, 0.25);
}
</style>
