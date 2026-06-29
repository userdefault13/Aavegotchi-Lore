<template>
  <div :class="$style.shell">
    <header :class="$style.header">
      <router-link to="/" :class="$style.logo">
        <span :class="$style.ghost">👻</span>
        <span class="font-pixel text-[10px] text-purple-bright">gotchi-lore</span>
      </router-link>
      <nav :class="$style.nav">
        <GotchiTooltip :tip="LAYOUT.lore" position="bottom">
          <router-link to="/lore" class="btn-pixel">Lore</router-link>
        </GotchiTooltip>
        <GotchiTooltip :tip="LAYOUT.tome" position="bottom">
          <router-link to="/tome" class="btn-pixel">Tome</router-link>
        </GotchiTooltip>
        <GotchiTooltip :tip="LAYOUT.robe" position="bottom">
          <router-link to="/robe" class="btn-pixel">Robe</router-link>
        </GotchiTooltip>
      </nav>
      <div :class="$style.actions">
        <GotchiTooltip :tip="LAYOUT.theme" position="bottom">
          <button type="button" class="btn-pixel" @click="ui.toggleTheme()">{{ ui.theme === 'dark' ? '☀️' : '🌙' }}</button>
        </GotchiTooltip>
        <GotchiTooltip :tip="LAYOUT.search" position="bottom">
          <button type="button" class="btn-pixel" @click="ui.searchOpen = !ui.searchOpen">🔍</button>
        </GotchiTooltip>
        <GotchiTooltip :tip="LAYOUT.wallet" position="bottom">
          <button type="button" class="btn-pixel" :disabled="wallet.signingIn" @click="onWalletClick">
            {{ walletLabel }}
          </button>
        </GotchiTooltip>
      </div>
    </header>
    <SearchPalette v-if="ui.searchOpen" @close="ui.searchOpen = false" />
    <main :class="$style.main">
      <slot />
    </main>
    <footer :class="$style.footer">
      <span class="text-xs opacity-70">Gotchiverse Lore + Tome + Robe · Aavegotchi ecosystem</span>
    </footer>
    <GotchiAibotEmbed />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUiStore, useWalletStore } from '@/stores';
import SearchPalette from '@/components/shared/SearchPalette.vue';
import GotchiAibotEmbed from '@/components/shared/GotchiAibotEmbed.vue';
import GotchiTooltip from '@/components/shared/GotchiTooltip.vue';
import { LAYOUT } from '@/utils/workspaceHints';

const ui = useUiStore();
const wallet = useWalletStore();

const walletLabel = computed(() => {
  if (wallet.signingIn) return 'Signing in…';
  if (wallet.address && wallet.token) {
    return `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}`;
  }
  if (wallet.address) return 'Finish sign-in';
  return window.ethereum ? 'Sign in with MetaMask' : 'Connect wallet';
});

async function onWalletClick() {
  try {
    if (!wallet.address) await wallet.connect();
    else if (!wallet.token) await wallet.signIn();
  } catch (err) {
    alert(err.message || 'Sign-in failed');
  }
}
</script>

<style module>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 2px solid #8b7db8;
  background: #0f0b1e;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}
.ghost {
  font-size: 1.5rem;
}
.nav {
  display: flex;
  gap: 0.5rem;
}
.actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.main {
  flex: 1;
  padding: 1rem 1.25rem 2rem;
}
.footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #8b7db8;
  text-align: center;
}
</style>
