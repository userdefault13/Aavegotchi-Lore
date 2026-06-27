<template>
  <div :class="$style.page">
    <header :class="$style.head">
      <div>
        <router-link to="/lore" class="text-xs opacity-70">← Your worlds</router-link>
        <h1 class="font-pixel text-xs mt-1">Canon Lore</h1>
        <p class="text-xs opacity-60 mt-1">
          Official Gotchiverse lore. Sign in, open your branch, edit, commit, and push for DAO review.
        </p>
      </div>
    </header>

    <div v-if="loading" class="text-sm opacity-70">Loading canon…</div>
    <div v-else-if="canonWorlds.length" :class="$style.grid">
      <article v-for="w in canonWorlds" :key="w.id" :class="$style.card">
        <span :class="$style.badge">Canon</span>
        <h2 class="font-pixel text-[9px] text-pink pr-12">{{ w.title }}</h2>
        <p class="text-sm opacity-70 mt-1">{{ w.description || 'Official Gotchiverse lore' }}</p>
        <dl :class="$style.meta">
          <div><dt>Slug</dt><dd>{{ w.slug }}</dd></div>
          <div><dt>Pages</dt><dd>{{ w.pageCount ?? '—' }}</dd></div>
          <div><dt>Branches</dt><dd>{{ branchesFor(w.id).length }}</dd></div>
          <div v-if="w.updatedAt"><dt>Updated</dt><dd>{{ formatDate(w.updatedAt) }}</dd></div>
        </dl>
        <div :class="$style.actions">
          <GotchiTooltip :tip="LORE_ACTIONS.reviewPrs">
            <router-link :to="`/lore/${w.id}/proposals`" class="btn-pixel text-[8px]">Review PRs</router-link>
          </GotchiTooltip>
          <GotchiTooltip :tip="LORE_ACTIONS.browse">
            <router-link :to="`/lore/${w.id}`" class="btn-pixel text-[8px]">Browse</router-link>
          </GotchiTooltip>
          <GotchiTooltip :tip="myBranch(w) ? LORE_ACTIONS.yourBranch : LORE_ACTIONS.createBranch">
            <button type="button" class="btn-pixel text-[8px]" :disabled="branching === w.id" @click="openBranch(w)">
              {{ branching === w.id ? 'Opening…' : myBranch(w) ? 'Your branch' : 'Create branch' }}
            </button>
          </GotchiTooltip>
        </div>
        <p v-if="myBranch(w)" :class="$style.branchNote">
          Your branch: <router-link :to="branchLink(w)">{{ myBranch(w).title || myBranch(w).slug }}</router-link>
        </p>
        <section v-if="branchesFor(w.id).length" :class="$style.branchList">
          <p :class="$style.branchListTitle">Member branches</p>
          <ul>
            <li v-for="b in branchesFor(w.id)" :key="b.id">
              <router-link :to="`/lore/${b.id}`">{{ branchLabel(b) }}</router-link>
              <span class="opacity-50">{{ b.pageCount ?? 0 }} pages</span>
            </li>
          </ul>
        </section>
      </article>
    </div>
    <p v-else-if="loadError" class="text-sm text-red-300">
      {{ loadError }} — try restarting the API: <code class="text-purple-300">npm run dev:all</code>
    </p>
    <p v-else class="text-sm opacity-60">
      No canon worlds yet. Run <code class="text-purple-300">npm run seed:canon</code> to create one.
    </p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { loreApi } from '@/services/api';
import { useWalletStore } from '@/stores';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { LORE_ACTIONS } from '@/utils/workspaceHints';

const router = useRouter();
const wallet = useWalletStore();
const canonWorlds = ref([]);
const branchesByCanon = ref({});
const loading = ref(true);
const loadError = ref('');
const branching = ref('');

onMounted(load);

async function load() {
  loading.value = true;
  loadError.value = '';
  try {
    canonWorlds.value = await loreApi.listCanonWorlds();
    const branchLists = await Promise.all(
      canonWorlds.value.map(async (w) => {
        try {
          return [w.id, await loreApi.listBranches(w.id)];
        } catch {
          return [w.id, []];
        }
      }),
    );
    branchesByCanon.value = Object.fromEntries(branchLists);
  } catch (err) {
    loadError.value = err.message || 'Failed to load canon';
    canonWorlds.value = [];
    branchesByCanon.value = {};
  } finally {
    loading.value = false;
  }
}

function branchesFor(canonId) {
  return branchesByCanon.value[canonId] || [];
}

function myBranch(canon) {
  const walletAddr = wallet.address?.toLowerCase();
  if (!walletAddr) return null;
  return branchesFor(canon.id).find((b) => b.ownerWallet?.toLowerCase() === walletAddr) || null;
}

function branchLink(canon) {
  const branch = myBranch(canon);
  return branch ? `/lore/${branch.id}` : '#';
}

function branchLabel(branch) {
  const w = branch.ownerWallet || '';
  if (w.length >= 10) return `${w.slice(0, 6)}…${w.slice(-4)}`;
  return branch.title || branch.slug;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

async function ensureAuth() {
  if (!wallet.address) await wallet.connect();
  if (!wallet.token && window.ethereum) await wallet.signIn();
}

async function openBranch(w) {
  try {
    await ensureAuth();
  } catch (err) {
    alert(err.message || 'Connect and sign in to open your branch');
    return;
  }
  const existing = myBranch(w);
  if (existing) {
    router.push(`/lore/${existing.id}`);
    return;
  }
  branching.value = w.id;
  try {
    const branch = await loreApi.branchWorld(w.id);
    await load();
    router.push(`/lore/${branch.id}`);
  } catch (err) {
    alert(err.message || 'Could not create branch');
  } finally {
    branching.value = '';
  }
}
</script>

<style module>
.page {
  max-width: 960px;
}
.head {
  margin-bottom: 1.25rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.card {
  position: relative;
  background: linear-gradient(145deg, rgba(101, 31, 255, 0.14), rgba(26, 20, 45, 1));
  border: 2px solid #651fff;
  border-radius: 6px;
  padding: 0.85rem;
}
.badge {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c4b5fd;
}
.meta {
  display: grid;
  gap: 0.25rem;
  margin: 0.65rem 0;
  font-size: 0.68rem;
  opacity: 0.7;
}
.meta div {
  display: flex;
  gap: 0.35rem;
}
.meta dt {
  opacity: 0.55;
  min-width: 3.5rem;
}
.actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.branchNote {
  margin: 0.55rem 0 0;
  font-size: 0.65rem;
  opacity: 0.65;
}
.branchNote a {
  color: #c4b5fd;
}
.branchList {
  margin-top: 0.65rem;
  padding-top: 0.55rem;
  border-top: 1px dashed rgba(139, 125, 184, 0.25);
}
.branchListTitle {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.45;
  margin: 0 0 0.35rem;
}
.branchList ul {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 120px;
  overflow-y: auto;
}
.branchList li {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.68rem;
  margin-bottom: 0.25rem;
}
.branchList a {
  color: #c4b5fd;
  text-decoration: none;
}
.branchList a:hover {
  text-decoration: underline;
}
</style>
