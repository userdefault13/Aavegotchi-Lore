<template>
  <div>
    <header :class="$style.head">
      <div>
        <h1 class="font-pixel text-xs">Lore Worlds</h1>
        <p class="text-xs opacity-60 mt-1">Your workspaces — branch from DAO canon to propose lore changes.</p>
      </div>
      <GotchiTooltip :tip="LORE_ACTIONS.newWorld">
        <button type="button" class="btn-pixel" @click="showCreate = true">+ New World</button>
      </GotchiTooltip>
    </header>

    <section :class="$style.flow">
      <h2 class="font-pixel text-[9px]">Contributor flow</h2>
      <ol :class="$style.steps">
        <li :class="{ [$style.stepDone]: signedIn }">
          <span :class="$style.stepNum">1</span>
          <div>
            <strong>Sign in with MetaMask</strong>
            <p>Use the wallet button in the header.</p>
          </div>
        </li>
        <li :class="{ [$style.stepDone]: myBranch }">
          <span :class="$style.stepNum">2</span>
          <div>
            <strong>Branch from DAO canon</strong>
            <p>Get your own editable copy of official Gotchiverse lore.</p>
          </div>
        </li>
        <li :class="{ [$style.stepDone]: myBranch && hasCommits }">
          <span :class="$style.stepNum">3</span>
          <div>
            <strong>Edit locally &amp; commit</strong>
            <p>Change pages on your branch, then save a commit snapshot.</p>
          </div>
        </li>
        <li>
          <span :class="$style.stepNum">4</span>
          <div>
            <strong>Push for review</strong>
            <p>Open a pull request so the DAO can review and merge.</p>
          </div>
        </li>
      </ol>
      <div :class="$style.flowActions">
        <GotchiTooltip v-if="!signedIn" :tip="LORE_ACTIONS.signIn">
          <button
            type="button"
            class="btn-pixel text-[8px]"
            :disabled="branching"
            @click="signIn"
          >
            Sign in with MetaMask
          </button>
        </GotchiTooltip>
        <GotchiTooltip v-else-if="!myBranch" :tip="LORE_ACTIONS.branchFromCanon">
          <button
            type="button"
            class="btn-pixel text-[8px]"
            :disabled="branching || !canonWorld"
            @click="branchFromCanon"
          >
            {{ branching ? 'Creating branch…' : 'Branch from DAO canon' }}
          </button>
        </GotchiTooltip>
        <template v-else>
          <router-link :to="`/lore/${myBranch.id}`" class="btn-pixel text-[8px]">Open your branch</router-link>
          <GotchiTooltip :tip="LORE_ACTIONS.pushReview">
            <router-link :to="`/lore/${myBranch.id}/proposals?new=1`" class="btn-pixel text-[8px]">
              Push for review
            </router-link>
          </GotchiTooltip>
        </template>
        <GotchiTooltip :tip="LORE_ACTIONS.browseCanon">
          <router-link to="/lore/canon" class="btn-pixel text-[8px] opacity-80">Browse canon</router-link>
        </GotchiTooltip>
      </div>
    </section>

    <section v-if="myBranch" :class="$style.section">
      <h2 class="font-pixel text-[9px]">Your DAO branch</h2>
      <article class="card-gotchi">
        <h3 class="font-pixel text-[9px] text-pink">{{ myBranch.title }}</h3>
        <p class="text-[10px] text-purple-300">Branch · {{ myBranch.slug }}</p>
        <div class="flex gap-2 mt-2 flex-wrap">
          <router-link :to="`/lore/${myBranch.id}`" class="btn-pixel text-[8px]">Edit lore</router-link>
          <router-link :to="`/lore/${myBranch.id}/proposals?new=1`" class="btn-pixel text-[8px]">Push for review</router-link>
        </div>
      </article>
    </section>

    <section :class="$style.section">
      <h2 class="font-pixel text-[9px]">Your Worlds</h2>
      <div v-if="loading" class="text-sm opacity-70">Loading…</div>
      <div v-else-if="personalWorlds.length" :class="$style.grid">
        <article v-for="w in personalWorlds" :key="w.id" class="card-gotchi">
          <h3 class="font-pixel text-[9px] text-pink">{{ w.title }}</h3>
          <p v-if="w.upstreamWorldId" class="text-[10px] text-purple-300">Branch · {{ w.slug }}</p>
          <p v-else class="text-sm opacity-70 mt-1">{{ w.description || 'No description' }}</p>
          <router-link :to="`/lore/${w.id}`" class="btn-pixel text-[8px] mt-2 inline-block">Open</router-link>
        </article>
      </div>
      <p v-else-if="!myBranch" class="text-sm opacity-60">
        No personal worlds yet — branch from <router-link to="/lore/canon" class="text-purple-300">DAO canon</router-link>
        or create your own sandbox.
      </p>
      <p v-else class="text-sm opacity-60">Only your DAO branch is listed above. Create a sandbox world for experiments.</p>
    </section>

    <dialog v-if="showCreate" open :class="$style.dialog">
      <form @submit.prevent="create">
        <h3 class="font-pixel text-[9px] mb-2">New Lore World</h3>
        <input v-model="form.title" class="input-gotchi mb-2" placeholder="Title" required />
        <textarea v-model="form.description" class="input-gotchi mb-2" placeholder="Description" rows="2" />
        <label class="text-xs block mb-2">Starter template</label>
        <select v-model="form.seedId" class="input-gotchi mb-3">
          <option value="">Blank</option>
          <option v-for="s in STARTER_WORLDS" :key="s.id" :value="s.id">{{ s.title }}</option>
        </select>
        <div class="flex gap-2">
          <button type="submit" class="btn-pixel">Create</button>
          <button type="button" class="btn-pixel" @click="showCreate = false">Cancel</button>
        </div>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { loreApi } from '@/services/api';
import { useWalletStore } from '@/stores';
import { STARTER_WORLDS } from '@/seed/gotchiTemplates';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { LORE_ACTIONS } from '@/utils/workspaceHints';

const router = useRouter();
const wallet = useWalletStore();
const worlds = ref([]);
const canonWorld = ref(null);
const loading = ref(true);
const branching = ref(false);
const hasCommits = ref(false);
const showCreate = ref(false);
const form = ref({ title: '', description: '', seedId: '' });

const signedIn = computed(() => !!(wallet.address && wallet.token));
const myBranch = computed(() => {
  const addr = wallet.address?.toLowerCase();
  if (!addr || !canonWorld.value) return null;
  return worlds.value.find(
    (w) => w.upstreamWorldId === canonWorld.value.id && w.ownerWallet?.toLowerCase() === addr,
  );
});
const personalWorlds = computed(() => {
  if (!myBranch.value) return worlds.value;
  return worlds.value.filter((w) => w.id !== myBranch.value.id);
});

onMounted(load);

async function load() {
  loading.value = true;
  try {
    const [worldList, canonList] = await Promise.all([loreApi.listWorlds(), loreApi.listCanonWorlds()]);
    worlds.value = worldList;
    canonWorld.value = canonList[0] || null;
    const branch = myBranch.value;
    if (branch?.id) {
      try {
        const commits = await loreApi.listWorldCommits(branch.id);
        hasCommits.value = commits.length > 1;
      } catch {
        hasCommits.value = false;
      }
    } else {
      hasCommits.value = false;
    }
  } finally {
    loading.value = false;
  }
}

async function signIn() {
  try {
    await wallet.connect();
    await load();
  } catch (err) {
    alert(err.message || 'Could not sign in');
  }
}

async function branchFromCanon() {
  if (!canonWorld.value) return;
  try {
    if (!wallet.address) await wallet.connect();
    if (!wallet.token && window.ethereum) await wallet.signIn();
  } catch (err) {
    alert(err.message || 'Sign in with MetaMask first');
    return;
  }
  if (myBranch.value) {
    router.push(`/lore/${myBranch.value.id}`);
    return;
  }
  branching.value = true;
  try {
    const branch = await loreApi.branchWorld(canonWorld.value.id);
    await load();
    router.push(`/lore/${branch.id}`);
  } catch (err) {
    alert(err.message || 'Could not create branch');
  } finally {
    branching.value = false;
  }
}

async function create() {
  if (!wallet.address) {
    try {
      await wallet.connect();
    } catch (err) {
      alert(err.message || 'Connect wallet to create a world');
      return;
    }
  }
  try {
    const seed = STARTER_WORLDS.find((s) => s.id === form.value.seedId);
    const world = await loreApi.createWorld({
      title: form.value.title,
      description: form.value.description,
      seedId: form.value.seedId || null,
    });
    if (seed?.pages?.length) {
      for (const p of seed.pages) {
        await loreApi.createPage({
          worldId: world.id,
          title: p.title,
          templateId: p.templateId,
          runes: p.runes || {},
        });
      }
    }
    showCreate.value = false;
    router.push(`/lore/${world.id}`);
  } catch (err) {
    alert(err.message || 'Failed to create world. Is the API running on port 3004 with MongoDB connected?');
  }
}
</script>

<style module>
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.flow {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 2px solid #651fff;
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(101, 31, 255, 0.12), rgba(26, 20, 45, 0.9));
}
.steps {
  list-style: none;
  margin: 0.75rem 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}
.steps li {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  font-size: 0.72rem;
  opacity: 0.65;
}
.stepDone {
  opacity: 1;
}
.stepDone .stepNum {
  border-color: #34d399;
  color: #6ee7b7;
}
.stepNum {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(139, 125, 184, 0.45);
  border-radius: 999px;
  font-size: 0.55rem;
}
.steps strong {
  display: block;
  font-size: 0.68rem;
  margin-bottom: 0.1rem;
}
.steps p {
  margin: 0;
  opacity: 0.75;
  line-height: 1.35;
}
.flowActions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.section {
  margin-bottom: 1.5rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.dialog {
  border: 2px solid #8b7db8;
  border-radius: 8px;
  padding: 1rem;
  background: #1a142d;
  color: #fff;
  max-width: 400px;
  margin: auto;
  position: fixed;
  inset: 0;
  height: fit-content;
}
</style>
