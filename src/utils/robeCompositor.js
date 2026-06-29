/** Robe storyboard canvas compositor — 1280×720 */

export const ROBE_WIDTH = 1280;
export const ROBE_HEIGHT = 720;

export const ROBE_PRESETS = {
  dialogue: {
    id: 'dialogue',
    label: 'Dialogue box',
    layers: [
      { id: 'bg', kind: 'image', assetUrl: '', x: 0, y: 0, w: 1280, h: 720, z: 0, opacity: 1, locked: false },
      {
        id: 'dialogue-box',
        kind: 'text',
        text: 'Dialogue…',
        x: 80,
        y: 520,
        w: 1120,
        h: 140,
        z: 10,
        opacity: 1,
        locked: false,
      },
    ],
  },
  splitPanel: {
    id: 'splitPanel',
    label: 'Split panel',
    layers: [
      { id: 'left', kind: 'image', assetUrl: '', x: 0, y: 0, w: 640, h: 720, z: 0, opacity: 1, locked: false },
      { id: 'right', kind: 'image', assetUrl: '', x: 640, y: 0, w: 640, h: 720, z: 0, opacity: 1, locked: false },
    ],
  },
  mapInset: {
    id: 'mapInset',
    label: 'Map inset',
    layers: [
      { id: 'bg', kind: 'image', assetUrl: '', x: 0, y: 0, w: 1280, h: 720, z: 0, opacity: 1, locked: false },
      { id: 'map', kind: 'image', assetUrl: '', x: 960, y: 480, w: 280, h: 200, z: 5, opacity: 1, locked: false },
    ],
  },
};

export function newLayerId(prefix = 'layer') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function applyPreset(presetId) {
  const preset = ROBE_PRESETS[presetId];
  if (!preset) return [];
  return preset.layers.map((l) => ({ ...l, id: newLayerId(l.id) }));
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawTextLayer(ctx, layer) {
  ctx.save();
  ctx.globalAlpha = layer.opacity ?? 1;
  ctx.fillStyle = 'rgba(15, 11, 30, 0.75)';
  ctx.strokeStyle = '#a78bfa';
  ctx.lineWidth = 3;
  ctx.fillRect(layer.x, layer.y, layer.w, layer.h);
  ctx.strokeRect(layer.x, layer.y, layer.w, layer.h);
  ctx.fillStyle = '#fff';
  ctx.font = '24px Inter, sans-serif';
  const text = layer.text || '';
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, layer.x + 16, layer.y + 36 + i * 28);
  });
  ctx.restore();
}

export async function compositeFrameToCanvas(canvas, frame, { scale = 1 } = {}) {
  const w = ROBE_WIDTH * scale;
  const h = ROBE_HEIGHT * scale;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f0b1e';
  ctx.fillRect(0, 0, w, h);

  const layers = [...(frame.layers || [])].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  for (const layer of layers) {
    if (layer.kind === 'image' && layer.assetUrl) {
      try {
        const img = await loadImage(layer.assetUrl);
        ctx.save();
        ctx.globalAlpha = layer.opacity ?? 1;
        ctx.drawImage(img, layer.x * scale, layer.y * scale, layer.w * scale, layer.h * scale);
        ctx.restore();
      } catch {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#47238d';
        ctx.fillRect(layer.x * scale, layer.y * scale, layer.w * scale, layer.h * scale);
        ctx.restore();
      }
    } else if (layer.kind === 'text') {
      const scaled = scale === 1 ? layer : { ...layer, x: layer.x * scale, y: layer.y * scale, w: layer.w * scale, h: layer.h * scale };
      drawTextLayer(ctx, scaled);
    }
  }
}

export async function flattenFrame(frame, uploadFn) {
  const canvas = document.createElement('canvas');
  await compositeFrameToCanvas(canvas, frame);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob || !uploadFn) return null;
  const file = new File([blob], `robe-frame-${frame.id || Date.now()}.png`, { type: 'image/png' });
  const asset = await uploadFn(file);
  return asset?.url || asset?.path || null;
}

export function frameCaptionText(frame) {
  const textLayers = (frame.layers || []).filter((l) => l.kind === 'text' && l.text);
  return textLayers.map((l) => l.text).join(' ') || frame.sceneTitle || '';
}

export function frameHasBackgroundImage(frame) {
  return (frame?.layers || []).some((l) => l.kind === 'image' && l.assetUrl);
}

export function frameThumbnailUrl(frame) {
  if (frame?.composedUrl) return frame.composedUrl;
  const bg = (frame?.layers || []).find((l) => l.kind === 'image' && l.assetUrl);
  return bg?.assetUrl || '';
}

/** Apply generated art as the frame background (preset slot or new z=0 layer). */
export function layersWithGeneratedBackground(existingLayers, imageUrl) {
  const layers = [...(existingLayers || [])];
  const emptyImage = layers.find((l) => l.kind === 'image' && !l.assetUrl);
  if (emptyImage) {
    emptyImage.assetUrl = imageUrl;
    return layers;
  }
  const bgAtZero = layers.find((l) => l.kind === 'image' && (l.z ?? 0) === 0);
  if (bgAtZero) {
    bgAtZero.assetUrl = imageUrl;
    return layers;
  }
  layers.unshift({
    id: newLayerId('bg'),
    kind: 'image',
    assetUrl: imageUrl,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    z: 0,
    opacity: 1,
  });
  return layers;
}
