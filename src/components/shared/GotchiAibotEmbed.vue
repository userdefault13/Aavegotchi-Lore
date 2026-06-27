<template>
  <Teleport to="body">
    <button
      v-if="!aibot.isOpen"
      type="button"
      :class="$style.fab"
      aria-label="Gotchi Art Assistant"
      title="Aarcade AI — pixel art & lore help"
      @click="aibot.isOpen = true"
    >
      <span :class="$style.fabEmoji">✨</span>
    </button>

    <Transition name="aibot-panel">
      <div v-if="aibot.isOpen" :class="$style.panel">
        <header :class="$style.header">
          <div>
            <h3 :class="$style.title">Gotchi Art Bot</h3>
            <p :class="$style.sub">Aarcade Assistant · try <code>pixel:</code> prompts</p>
          </div>
          <button type="button" :class="$style.close" aria-label="Close" @click="close">×</button>
        </header>

        <div v-if="aibot.contextLabel || aibot.suggestedPrompt" :class="$style.promptBar">
          <p v-if="aibot.contextLabel" :class="$style.context">
            Art for: <strong>{{ aibot.contextLabel }}</strong>
          </p>
          <div v-if="aibot.suggestedPrompt" :class="$style.promptRow">
            <textarea :class="$style.promptInput" readonly :value="aibot.suggestedPrompt" rows="3" />
            <div :class="$style.promptActions">
              <button type="button" class="btn-pixel text-[8px]" @click="copyPrompt">Copy prompt</button>
              <button
                type="button"
                class="btn-pixel text-[8px]"
                :disabled="generating"
                @click="generateViaApi"
              >
                {{ generating ? 'Generating…' : 'Generate & save' }}
              </button>
            </div>
          </div>
          <p v-if="genError" :class="$style.error">{{ genError }}</p>
          <p v-if="genHint" :class="$style.hint">{{ genHint }}</p>
        </div>

        <iframe
          ref="iframeRef"
          :src="iframeSrc"
          title="Aarcade Assistant"
          :class="$style.iframe"
          @load="syncIframe"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useAibotStore } from '@/stores/aibot';
import { useUiStore, useWalletStore } from '@/stores';
import { aibotApi } from '@/services/api';

const aibot = useAibotStore();
const ui = useUiStore();
const wallet = useWalletStore();
const iframeRef = ref(null);
const generating = ref(false);
const genError = ref('');
const genHint = ref('');

const baseUrl = (import.meta.env.VITE_AIBOT_URL || 'https://aarcade-aibot.pages.dev').replace(/\/$/, '');

const iframeSrc = computed(() => {
  const url = new URL(baseUrl);
  url.searchParams.set('embed', '1');
  url.searchParams.set('theme', ui.theme === 'light' ? 'light' : 'dark');
  if (wallet.address) url.searchParams.set('wallet', wallet.address);
  return url.toString();
});

watch([() => wallet.address, () => ui.theme], () => syncIframe());

function syncIframe() {
  const win = iframeRef.value?.contentWindow;
  if (!win) return;
  try {
    win.postMessage({ type: 'aarcade-aibot-theme', theme: ui.theme === 'light' ? 'light' : 'dark' }, '*');
    win.postMessage({ type: 'aarcade-aibot-wallet', wallet: wallet.address || '' }, '*');
  } catch {
    /* cross-origin until load */
  }
}

function close() {
  aibot.close();
  genError.value = '';
  genHint.value = '';
}

async function copyPrompt() {
  if (!aibot.suggestedPrompt) return;
  await navigator.clipboard.writeText(aibot.suggestedPrompt);
  genHint.value = 'Prompt copied — paste into the bot below.';
}

async function generateViaApi() {
  if (!aibot.suggestedPrompt) return;
  generating.value = true;
  genError.value = '';
  genHint.value = '';
  try {
    const result = await aibotApi.generate(aibot.suggestedPrompt, wallet.address);
    if (result.imageUrl) {
      genHint.value = 'Saved to uploads — applying to your lore…';
      aibot.notifyImage(result.imageUrl);
      return;
    }
    if (result.reply) {
      genHint.value = result.reply.slice(0, 280);
      if (!result.imageUrl) {
        genHint.value += ' — use the chat below or connect founder wallet for pixel: art.';
      }
    }
  } catch (e) {
    genError.value = e.message || 'Generation failed';
  } finally {
    generating.value = false;
  }
}
</script>

<style module>
.fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 60;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  border: 2px solid #8b57ff;
  background: linear-gradient(145deg, #6d18f8, #47238d);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(109, 24, 248, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}
.fab:hover {
  transform: scale(1.08);
}
.fabEmoji {
  font-size: 1.35rem;
}
.panel {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 60;
  width: 26rem;
  max-width: calc(100vw - 2rem);
  height: min(640px, calc(100vh - 3rem));
  background: #1a0a2e;
  border: 3px solid #8b57ff;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  background: #6d18f8;
  flex-shrink: 0;
}
.title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  margin: 0;
  color: #fff;
}
.sub {
  margin: 0.25rem 0 0;
  font-size: 0.65rem;
  opacity: 0.85;
}
.sub code {
  background: rgba(0, 0, 0, 0.2);
  padding: 0 0.2rem;
  border-radius: 2px;
}
.close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.85;
}
.promptBar {
  padding: 0.5rem 0.65rem;
  background: #120a22;
  border-bottom: 1px solid rgba(139, 125, 184, 0.3);
  flex-shrink: 0;
}
.context {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  opacity: 0.9;
}
.promptRow {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.promptInput {
  width: 100%;
  box-sizing: border-box;
  font-size: 0.68rem;
  line-height: 1.35;
  background: #0f0b1e;
  border: 1px solid #8b7db8;
  border-radius: 4px;
  color: #e9d5ff;
  padding: 0.35rem;
  resize: vertical;
}
.promptActions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.error {
  margin: 0.35rem 0 0;
  font-size: 0.68rem;
  color: #f472b6;
}
.hint {
  margin: 0.35rem 0 0;
  font-size: 0.65rem;
  opacity: 0.75;
  line-height: 1.35;
}
.iframe {
  flex: 1;
  width: 100%;
  border: none;
  min-height: 0;
  background: #faf8ff;
}
</style>

<style scoped>
.aibot-panel-enter-active,
.aibot-panel-leave-active {
  transition: all 0.25s ease;
}
.aibot-panel-enter-from,
.aibot-panel-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
</style>
