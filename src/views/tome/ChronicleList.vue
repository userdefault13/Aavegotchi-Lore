<template>
  <div>
    <header :class="$style.head">
      <div>
        <h1 class="font-pixel text-xs">Tome Chronicles</h1>
        <p class="text-xs opacity-60 mt-1">Your campaign workspaces — branch from DAO canon to propose scene changes.</p>
      </div>
      <GotchiTooltip :tip="TOME_ACTIONS.newChronicle">
        <button type="button" class="btn-pixel" @click="showCreate = true">+ New Chronicle</button>
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
            <p>Branching lore canon also creates your paired campaign branch.</p>
          </div>
        </li>
        <li :class="{ [$style.stepDone]: myBranch && hasCommits }">
          <span :class="$style.stepNum">3</span>
          <div>
            <strong>Edit locally &amp; commit</strong>
            <p>Edit scenes on your campaign branch, then save a commit snapshot.</p>
          </div>
        </li>
        <li>
          <span :class="$style.stepNum">4</span>
          <div>
            <strong>Push for review</strong>
            <p>One PR includes both lore pages and campaign scenes.</p>
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
        <template v-else-if="myBranch">
          <router-link :to="`/tome/${myBranch.id}`" class="btn-pixel text-[8px]">Open campaign branch</router-link>
          <GotchiTooltip v-if="myBranch.linkedWorldBranchId" :tip="LORE_ACTIONS.pushReview">
            <router-link
              :to="`/lore/${myBranch.linkedWorldBranchId}/proposals?new=1`"
              class="btn-pixel text-[8px]"
            >
              Push for review
            </router-link>
          </GotchiTooltip>
        </template>
        <GotchiTooltip :tip="TOME_ACTIONS.browseCanon">
          <router-link to="/tome/canon" class="btn-pixel text-[8px] opacity-80">Browse canon</router-link>
        </GotchiTooltip>
      </div>
    </section>

    <section v-if="myBranch" :class="$style.section">
      <h2 class="font-pixel text-[9px]">Your campaign branch</h2>
      <article class="card-gotchi">
        <h3 class="font-pixel text-[9px] text-pink">{{ myBranch.title }}</h3>
        <p class="text-[10px] text-purple-300">Branch · {{ myBranch.slug }}</p>
        <div class="flex gap-2 mt-2 flex-wrap">
          <router-link :to="`/tome/${myBranch.id}`" class="btn-pixel text-[8px]">Edit scenes</router-link>
          <router-link :to="`/tome/${myBranch.id}/play`" class="btn-pixel text-[8px]">Play</router-link>
          <router-link
            v-if="myBranch.linkedWorldBranchId"
            :to="`/lore/${myBranch.linkedWorldBranchId}/proposals?new=1`"
            class="btn-pixel text-[8px]"
          >
            Push for review
          </router-link>
        </div>
      </article>
    </section>

    <section :class="$style.section">
      <h2 class="font-pixel text-[9px]">Your Chronicles</h2>
      <div v-if="loading" class="text-sm opacity-70">Loading…</div>
      <div v-else-if="personalChronicles.length" :class="$style.grid">
        <article v-for="c in personalChronicles" :key="c.id" class="card-gotchi">
          <h3 class="font-pixel text-[9px] text-pink">{{ c.title }}</h3>
          <p v-if="c.upstreamChronicleId" class="text-[10px] text-purple-300">Branch · {{ c.slug }}</p>
          <p v-else class="text-xs opacity-70">{{ c.description || 'Campaign chronicle' }}</p>
          <div class="flex gap-2 mt-2 flex-wrap">
            <router-link :to="`/tome/${c.id}`" class="btn-pixel text-[8px]">Edit</router-link>
            <router-link :to="`/tome/${c.id}/play`" class="btn-pixel text-[8px]">Play</router-link>
          </div>
        </article>
      </div>
      <p v-else-if="!myBranch" class="text-sm opacity-60">
        No chronicles yet — branch from <router-link to="/tome/canon" class="text-purple-300">DAO canon</router-link>
        (via lore branch) or create your own.
      </p>
    </section>

    <dialog v-if="showCreate" open :class="$style.dialog">
      <form @submit.prevent="create">
        <h3 class="font-pixel text-[9px] mb-2">New Chronicle</h3>
        <input v-model="form.title" class="input-gotchi mb-2" placeholder="Title" required />
        <textarea v-model="form.description" class="input-gotchi mb-3" placeholder="Description" rows="2" />
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
import { tomeApi } from '@/services/api';
import { useWalletStore } from '@/stores';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { LORE_ACTIONS, TOME_ACTIONS } from '@/utils/workspaceHints';

const router = useRouter();
const wallet = useWalletStore();
const chronicles = ref([]);
const canonChronicle = ref(null);
const loading = ref(true);
const branching = ref(false);
const hasCommits = ref(false);
const showCreate = ref(false);
const form = ref({ title: '', description: '' });

const signedIn = computed(() => !!(wallet.address && wallet.token));
const myBranch = computed(() => {
  const addr = wallet.address?.toLowerCase();
  if (!addr || !canonChronicle.value) return null;
  return chronicles.value.find(
    (c) => c.upstreamChronicleId === canonChronicle.value.id && c.ownerWallet?.toLowerCase() === addr,
  );
});
const personalChronicles = computed(() => {
  if (!myBranch.value) return chronicles.value;
  return chronicles.value.filter((c) => c.id !== myBranch.value.id);
});

onMounted(load);

async function load() {
  loading.value = true;
  try {
    [chronicles.value, [canonChronicle.value]] = await Promise.all([
      tomeApi.listChronicles(),
      tomeApi.listCanonChronicles().then((items) => items[0] || null),
    ]);
    if (myBranch.value) {
      try {
        const commits = await tomeApi.listChronicleCommits(myBranch.value.id);
        hasCommits.value = commits.some((c) => c.kind === 'checkpoint' || c.kind === 'pull');
      } catch {
        hasCommits.value = false;
      }
    }
  } finally {
    loading.value = false;
  }
}

async function signIn() {
  try {
    if (!wallet.address) await wallet.connect();
    if (!wallet.token && window.ethereum) await wallet.signIn();
  } catch (err) {
    alert(err.message || 'Sign in failed');
  }
}

async function create() {
  const c = await tomeApi.createChronicle(form.value);
  showCreate.value = false;
  router.push(`/tome/${c.id}`);
}
</script>

<style module>
.head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.flow {
  margin-bottom: 1.25rem;
  padding: 0.75rem;
  border: 1px solid rgba(139, 125, 184, 0.3);
  border-radius: 6px;
  background: rgba(15, 11, 30, 0.5);
}
.steps {
  list-style: none;
  margin: 0.5rem 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}
.steps li {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  opacity: 0.55;
}
.stepDone {
  opacity: 1;
}
.stepNum {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  border: 1px solid rgba(139, 125, 184, 0.5);
  border-radius: 50%;
}
.steps strong {
  font-size: 0.72rem;
}
.steps p {
  font-size: 0.65rem;
  opacity: 0.65;
  margin: 0.1rem 0 0;
}
.flowActions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.section {
  margin-bottom: 1.25rem;
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
  position: fixed;
  inset: 0;
  margin: auto;
  height: fit-content;
}
</style>
