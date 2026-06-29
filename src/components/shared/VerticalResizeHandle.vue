<template>
  <div
    :class="$style.handle"
    role="separator"
    aria-orientation="horizontal"
    aria-label="Drag to resize"
    title="Drag to resize"
    @pointerdown="onPointerDown"
  >
    <span :class="$style.grip" />
  </div>
</template>

<script setup>
const emit = defineEmits(['resize-delta']);

function onPointerDown(event) {
  event.preventDefault();
  event.stopPropagation();
  const handle = event.currentTarget;
  handle.setPointerCapture(event.pointerId);
  let lastY = event.clientY;

  function onMove(ev) {
    if (!handle.hasPointerCapture(ev.pointerId)) return;
    const delta = ev.clientY - lastY;
    lastY = ev.clientY;
    if (delta !== 0) emit('resize-delta', delta);
  }

  function onUp(ev) {
    handle.releasePointerCapture(ev.pointerId);
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onUp);
    handle.removeEventListener('pointercancel', onUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  document.body.style.cursor = 'row-resize';
  document.body.style.userSelect = 'none';
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp);
  handle.addEventListener('pointercancel', onUp);
}
</script>

<style module>
.handle {
  flex-shrink: 0;
  height: 10px;
  margin: 2px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: row-resize;
  border-radius: 4px;
  background: rgba(71, 35, 141, 0.35);
  touch-action: none;
}

.handle:hover,
.handle:active {
  background: rgba(192, 132, 252, 0.55);
}

.grip {
  width: 48px;
  height: 3px;
  border-radius: 2px;
  background: rgba(196, 181, 253, 0.7);
  pointer-events: none;
}
</style>
