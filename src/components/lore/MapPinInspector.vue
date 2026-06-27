<template>
  <div :class="$style.inspector">
    <header :class="$style.head">
      <span :class="$style.badge" :style="{ background: typeColor }">{{ pin.type }}</span>
      <span class="font-pixel text-[8px]">Pin</span>
    </header>

    <img v-if="pin.imageUrl" :src="pin.imageUrl" alt="" :class="$style.thumb" />

    <label :class="$style.field">
      <span>Label</span>
      <input
        :value="pin.label || ''"
        class="input-gotchi text-xs"
        placeholder="Location name"
        @change="$emit('update-label', $event.target.value)"
      />
    </label>

    <label :class="$style.field">
      <span>Type</span>
      <select :value="pin.type" class="input-gotchi text-xs" @change="$emit('update-type', $event.target.value)">
        <option v-for="t in PIN_TYPES" :key="t" :value="t">{{ t }}</option>
      </select>
    </label>

    <section :class="$style.section">
      <p :class="$style.sectionTitle">Linked lore page</p>
      <select
        :value="pin.pageId || ''"
        class="input-gotchi text-xs w-full"
        @change="onPageSelect($event.target.value)"
      >
        <option value="">— Not linked —</option>
        <option v-for="p in pages" :key="p.id" :value="p.id">{{ p.title }}</option>
      </select>

      <div v-if="linkedPage" :class="$style.linkedRow">
        <router-link :to="`/lore/${worldId}?page=${linkedPage.id}`" class="btn-pixel text-[8px]">
          Open page
        </router-link>
        <button type="button" class="btn-pixel text-[8px]" @click="$emit('unlink-page')">
          Unlink
        </button>
      </div>

      <div v-else :class="$style.createRow">
        <select v-model="newTemplateId" class="input-gotchi text-xs flex-1">
          <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.icon }} {{ t.name }}</option>
        </select>
        <button type="button" class="btn-pixel text-[8px]" @click="createPage">
          Create & link
        </button>
      </div>
    </section>

    <section :class="$style.section">
      <p :class="$style.sectionTitle">Paths</p>
      <p v-if="connectMode" :class="$style.hint">Click another pin on the map to connect.</p>
      <ul v-if="connections.length" :class="$style.pathList">
        <li v-for="conn in connections" :key="conn.pathId">
          <span :class="$style.pathLabel">↔ {{ conn.label }}</span>
          <button type="button" :class="$style.pathRemove" @click="$emit('remove-path', conn.pathId)">×</button>
        </li>
      </ul>
      <p v-else-if="!connectMode" :class="$style.emptyPaths">No paths yet.</p>
      <div :class="$style.linkedRow">
        <select v-model="connectTargetId" class="input-gotchi text-xs flex-1">
          <option value="">Connect to…</option>
          <option v-for="p in connectTargets" :key="p.id" :value="p.id">{{ p.label || p.type }}</option>
        </select>
        <button type="button" class="btn-pixel text-[8px]" :disabled="!connectTargetId" @click="connectToTarget">
          Add
        </button>
      </div>
      <button type="button" class="btn-pixel text-[8px] w-full mt-1" @click="$emit('toggle-connect')">
        {{ connectMode ? 'Cancel connect' : 'Connect on map' }}
      </button>
    </section>

    <button type="button" class="btn-pixel text-[8px] w-full mt-2" @click="$emit('delete-pin')">
      Remove pin
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { PIN_TYPES, PIN_TYPE_TEMPLATES } from '@/utils/mapPins';
import { otherPinId, pathsForPin } from '@/utils/mapPinPaths';

const props = defineProps({
  pin: { type: Object, required: true },
  pins: { type: Array, default: () => [] },
  paths: { type: Array, default: () => [] },
  pages: { type: Array, default: () => [] },
  templates: { type: Array, default: () => [] },
  worldId: { type: String, required: true },
  connectMode: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update-label',
  'update-type',
  'link-page',
  'unlink-page',
  'create-page',
  'add-path',
  'remove-path',
  'toggle-connect',
  'delete-pin',
]);

const newTemplateId = ref(PIN_TYPE_TEMPLATES.page);
const connectTargetId = ref('');

const pinById = computed(() => new Map(props.pins.map((p) => [p.id, p])));

const connections = computed(() =>
  pathsForPin(props.paths, props.pin.id).map((path) => {
    const otherId = otherPinId(path, props.pin.id);
    const other = pinById.value.get(otherId);
    return {
      pathId: path.id,
      label: other?.label || other?.type || 'Pin',
    };
  }),
);

const connectTargets = computed(() =>
  props.pins.filter((p) => p.id !== props.pin.id && !connections.value.some((c) => {
    const path = props.paths.find((x) => x.id === c.pathId);
    return path && otherPinId(path, props.pin.id) === p.id;
  })),
);

watch(() => props.pin.id, () => {
  connectTargetId.value = '';
});

function connectToTarget() {
  if (!connectTargetId.value) return;
  emit('add-path', connectTargetId.value);
  connectTargetId.value = '';
}

const linkedPage = computed(() =>
  props.pages.find((p) => p.id === props.pin.pageId) || null,
);

const typeColor = computed(() => {
  const colors = {
    page: '#4ade80',
    direction: '#38bdf8',
    terrain: '#9ca3af',
    landmark: '#c084fc',
  };
  return colors[props.pin.type] || colors.page;
});

watch(
  () => props.pin.type,
  (t) => {
    if (PIN_TYPE_TEMPLATES[t]) newTemplateId.value = PIN_TYPE_TEMPLATES[t];
  },
  { immediate: true },
);

function onPageSelect(pageId) {
  if (!pageId) emit('unlink-page');
  else emit('link-page', pageId);
}

function createPage() {
  emit('create-page', {
    templateId: newTemplateId.value,
    title: props.pin.label || 'New location',
  });
}
</script>

<style module>
.inspector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.badge {
  font-size: 0.6rem;
  text-transform: uppercase;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  color: #0f0b1e;
  font-weight: 700;
}
.thumb {
  width: 100%;
  max-height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(139, 125, 184, 0.35);
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.68rem;
  opacity: 0.85;
}
.section {
  padding-top: 0.35rem;
  border-top: 1px solid rgba(139, 125, 184, 0.25);
}
.sectionTitle {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
  margin: 0 0 0.35rem;
}
.linkedRow,
.createRow {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
  align-items: center;
}
.pathList {
  list-style: none;
  margin: 0 0 0.35rem;
  padding: 0;
}
.pathList li {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.2rem;
  font-size: 0.72rem;
}
.pathLabel {
  flex: 1;
  opacity: 0.85;
}
.pathRemove {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
.hint {
  font-size: 0.65rem;
  color: #67e8f9;
  margin: 0 0 0.35rem;
}
.emptyPaths {
  font-size: 0.65rem;
  opacity: 0.45;
  margin: 0 0 0.35rem;
}
</style>
