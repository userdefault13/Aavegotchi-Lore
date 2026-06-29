/** Playback hold timing from caption / scene text */

const MS_PER_WORD = 150;
const MIN_HOLD_MS = 2000;
const MAX_HOLD_MS = 8000;

export function wordCount(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

export function estimateHoldMs(text) {
  const words = wordCount(text);
  if (words === 0) return MIN_HOLD_MS;
  return Math.min(MAX_HOLD_MS, Math.max(MIN_HOLD_MS, words * MS_PER_WORD));
}

export function resolveHoldMs(frame, captionText) {
  if (frame?.holdDurationMs != null && frame.holdDurationMs > 0) {
    return frame.holdDurationMs;
  }
  return estimateHoldMs(captionText);
}

export function formatHoldSeconds(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}
