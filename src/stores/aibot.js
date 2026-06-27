import { defineStore } from 'pinia';

export const useAibotStore = defineStore('aibot', {
  state: () => ({
    isOpen: false,
    suggestedPrompt: '',
    contextLabel: '',
    onImageGenerated: null,
  }),
  actions: {
    open({ prompt = '', contextLabel = '', onImageGenerated = null } = {}) {
      this.suggestedPrompt = prompt;
      this.contextLabel = contextLabel;
      this.onImageGenerated = onImageGenerated;
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
    clearContext() {
      this.suggestedPrompt = '';
      this.contextLabel = '';
      this.onImageGenerated = null;
    },
    notifyImage(url) {
      if (typeof this.onImageGenerated === 'function') {
        this.onImageGenerated(url);
      }
    },
  },
});
