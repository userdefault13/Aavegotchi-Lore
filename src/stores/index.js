import { defineStore } from 'pinia';
import { signInWithWallet, clearAuthToken, getAuthToken } from '@/services/auth';

export { useAibotStore } from './aibot';

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    address: localStorage.getItem('gotchi-lore-wallet') || '',
    token: getAuthToken(),
    signingIn: false,
  }),
  actions: {
    setAddress(addr) {
      this.address = (addr || '').toLowerCase();
      if (this.address) localStorage.setItem('gotchi-lore-wallet', this.address);
      else localStorage.removeItem('gotchi-lore-wallet');
    },
    async connect() {
      if (!window.ethereum) {
        const demo = prompt('Enter wallet address (demo mode):', this.address || '0x0000000000000000000000000000000000000001');
        if (demo) {
          this.setAddress(demo);
          clearAuthToken();
          this.token = '';
        }
        return;
      }
      const [addr] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.setAddress(addr);
      await this.signIn();
    },
    async signIn() {
      if (!this.address || !window.ethereum) return;
      this.signingIn = true;
      try {
        const signMessage = (msg) =>
          window.ethereum.request({
            method: 'personal_sign',
            params: [msg, this.address],
          });
        this.token = await signInWithWallet(this.address, signMessage);
      } catch (err) {
        clearAuthToken();
        this.token = '';
        throw err;
      } finally {
        this.signingIn = false;
      }
    },
    disconnect() {
      this.setAddress('');
      clearAuthToken();
      this.token = '';
    },
  },
});

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: localStorage.getItem('gotchi-lore-theme') || 'dark',
    openTabs: [],
    activeTabId: null,
    searchOpen: false,
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('gotchi-lore-theme', this.theme);
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    initTheme() {
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    openTab(tab) {
      if (!this.openTabs.find((t) => t.id === tab.id)) this.openTabs.push(tab);
      this.activeTabId = tab.id;
    },
    closeTab(id) {
      this.openTabs = this.openTabs.filter((t) => t.id !== id);
      if (this.activeTabId === id) this.activeTabId = this.openTabs[0]?.id || null;
    },
  },
});
