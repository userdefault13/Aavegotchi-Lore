/** Client-side storyboard export — WebM + optional MP4 via ffmpeg.wasm */

import { ROBE_WIDTH, ROBE_HEIGHT, compositeFrameToCanvas, frameCaptionText } from './robeCompositor';
import { resolveHoldMs } from './robeTiming';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function drawTransition(ctx, fromBmp, toBmp, progress, type, w, h) {
  ctx.clearRect(0, 0, w, h);
  if (type === 'cut' || progress >= 1) {
    ctx.drawImage(toBmp, 0, 0, w, h);
    return;
  }
  if (type === 'slide') {
    const offset = w * progress;
    ctx.drawImage(fromBmp, -offset, 0, w, h);
    ctx.drawImage(toBmp, w - offset, 0, w, h);
    return;
  }
  ctx.globalAlpha = 1 - progress;
  ctx.drawImage(fromBmp, 0, 0, w, h);
  ctx.globalAlpha = progress;
  ctx.drawImage(toBmp, 0, 0, w, h);
  ctx.globalAlpha = 1;
}

async function frameBitmap(frame, scale) {
  const canvas = document.createElement('canvas');
  await compositeFrameToCanvas(canvas, frame, { scale });
  return createImageBitmap(canvas);
}

export async function exportStoryboardWebm(frames, board, { scale = 0.5, onProgress } = {}) {
  const w = Math.round(ROBE_WIDTH * scale);
  const h = Math.round(ROBE_HEIGHT * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(30);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const done = new Promise((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
  });
  recorder.start(100);

  const bitmaps = [];
  for (let i = 0; i < frames.length; i++) {
    bitmaps.push(await frameBitmap(frames[i], scale));
    onProgress?.({ phase: 'prepare', index: i, total: frames.length });
  }

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const hold = resolveHoldMs(frame, frameCaptionText(frame));
    const transition = frame.transition || board.defaultTransition || { type: 'fade', durationMs: 600 };
    const transMs = transition.durationMs ?? 600;

    ctx.drawImage(bitmaps[i], 0, 0, w, h);
    await sleep(hold);
    onProgress?.({ phase: 'hold', index: i, total: frames.length });

    if (i < frames.length - 1) {
      const steps = Math.max(6, Math.round(transMs / 33));
      for (let s = 1; s <= steps; s++) {
        drawTransition(ctx, bitmaps[i], bitmaps[i + 1], s / steps, transition.type, w, h);
        await sleep(transMs / steps);
      }
    }
  }

  recorder.stop();
  return done;
}

export function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function convertWebmToMp4(webmBlob, onProgress) {
  onProgress?.('Loading ffmpeg…');
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { fetchFile, toBlobURL } = await import('@ffmpeg/util');
  const ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  onProgress?.('Converting to MP4…');
  const data = await fetchFile(webmBlob);
  await ffmpeg.writeFile('input.webm', data);
  await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'output.mp4']);
  const out = await ffmpeg.readFile('output.mp4');
  return new Blob([out.buffer], { type: 'video/mp4' });
}
