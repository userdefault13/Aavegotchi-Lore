<template>
  <div :class="$style.player">
    <canvas ref="canvasEl" :class="$style.canvas" :width="width" :height="height" />
    <div :class="$style.controls">
      <button type="button" class="btn-pixel text-[8px]" :disabled="playing" @click="play">▶ Preview</button>
      <button type="button" class="btn-pixel text-[8px]" :disabled="exporting" @click="exportWebm">
        {{ exporting ? 'Exporting…' : 'Export WebM' }}
      </button>
      <button type="button" class="btn-pixel text-[8px]" :disabled="exportingMp4" @click="exportMp4">
        {{ exportingMp4 ? 'MP4…' : 'Export MP4' }}
      </button>
      <span v-if="status" class="text-xs opacity-70">{{ status }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ROBE_WIDTH, ROBE_HEIGHT, compositeFrameToCanvas } from '@/utils/robeCompositor';
import { resolveHoldMs } from '@/utils/robeTiming';
import { frameCaptionText } from '@/utils/robeCompositor';
import { exportStoryboardWebm, downloadBlob, convertWebmToMp4 } from '@/utils/robeExport';

const props = defineProps({
  frames: { type: Array, default: () => [] },
  board: { type: Object, required: true },
  scale: { type: Number, default: 0.5 },
});

const canvasEl = ref(null);
const playing = ref(false);
const exporting = ref(false);
const exportingMp4 = ref(false);
const status = ref('');

const width = Math.round(ROBE_WIDTH * props.scale);
const height = Math.round(ROBE_HEIGHT * props.scale);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function drawFrame(frame) {
  await compositeFrameToCanvas(canvasEl.value, frame, { scale: props.scale });
}

async function playTransition(fromFrame, toFrame, transition) {
  const trans = transition || props.board.defaultTransition || { type: 'fade', durationMs: 600 };
  const steps = Math.max(4, Math.round(trans.durationMs / 40));
  for (let s = 0; s <= steps; s++) {
    await drawFrame(s < steps / 2 ? fromFrame : toFrame);
    await sleep(trans.durationMs / steps);
  }
}

async function play() {
  if (!props.frames.length || playing.value) return;
  playing.value = true;
  status.value = 'Playing…';
  try {
    for (let i = 0; i < props.frames.length; i++) {
      const frame = props.frames[i];
      await drawFrame(frame);
      const hold = resolveHoldMs(frame, frameCaptionText(frame));
      await sleep(hold);
      if (i < props.frames.length - 1) {
        await playTransition(frame, props.frames[i + 1], frame.transition);
      }
    }
    status.value = 'Done';
  } finally {
    playing.value = false;
  }
}

async function exportWebm() {
  exporting.value = true;
  status.value = 'Recording WebM…';
  try {
    const blob = await exportStoryboardWebm(props.frames, props.board, {
      scale: props.scale,
      onProgress: (p) => {
        status.value = p.phase === 'hold' ? `Frame ${p.index + 1}/${p.total}` : 'Preparing…';
      },
    });
    downloadBlob(blob, `${props.board.slug || 'storyboard'}.webm`);
    status.value = 'WebM downloaded';
  } catch (err) {
    status.value = err.message;
  } finally {
    exporting.value = false;
  }
}

async function exportMp4() {
  exportingMp4.value = true;
  status.value = 'Recording…';
  try {
    const webm = await exportStoryboardWebm(props.frames, props.board, { scale: props.scale });
    status.value = 'Converting to MP4…';
    const mp4 = await convertWebmToMp4(webm, (msg) => {
      status.value = msg;
    });
    downloadBlob(mp4, `${props.board.slug || 'storyboard'}.mp4`);
    status.value = 'MP4 downloaded';
  } catch (err) {
    status.value = err.message || 'MP4 export failed — try WebM';
  } finally {
    exportingMp4.value = false;
  }
}

defineExpose({ play, exportWebm, exportMp4 });
</script>

<style module>
.player {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.canvas {
  max-width: 100%;
  border: 2px solid #47238d;
  border-radius: 4px;
  background: #0f0b1e;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}
</style>
