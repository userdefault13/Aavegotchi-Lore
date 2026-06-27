<template>
  <div :class="$style.panel">
    <h4 class="text-xs text-purple mb-1">Player Choices</h4>
    <div v-for="(c, i) in localChoices" :key="i" :class="$style.row">
      <input v-model="c.label" class="input-gotchi" placeholder="Choice" @input="emitUpdate" />
      <select v-model="c.outcome" class="input-gotchi" @change="emitUpdate">
        <option value="played">Played</option>
        <option value="skipped">Skipped</option>
        <option value="pending">Pending</option>
      </select>
    </div>
    <button type="button" class="btn-pixel text-[8px] mt-1" @click="addChoice">+ Choice</button>

    <h4 class="text-xs text-purple mb-1 mt-3">Roles</h4>
    <div v-for="(r, i) in localRoles" :key="i" :class="$style.row">
      <input v-model="r.player" class="input-gotchi" placeholder="Player" @input="emitUpdate" />
      <input v-model="r.action" class="input-gotchi" placeholder="Action" @input="emitUpdate" />
    </div>
    <button type="button" class="btn-pixel text-[8px] mt-1" @click="addRole">+ Role</button>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  choices: { type: Array, default: () => [] },
  roles: { type: Array, default: () => [] },
});

const emitEvt = defineEmits(['update:choices', 'update:roles']);
const localChoices = reactive([...(props.choices || [])]);
const localRoles = reactive([...(props.roles || [])]);

watch(() => props.choices, (v) => { localChoices.splice(0, localChoices.length, ...(v || [])); }, { deep: true });
watch(() => props.roles, (v) => { localRoles.splice(0, localRoles.length, ...(v || [])); }, { deep: true });

function emitUpdate() {
  emitEvt('update:choices', [...localChoices]);
  emitEvt('update:roles', [...localRoles]);
}

function addChoice() {
  localChoices.push({ label: '', outcome: 'pending' });
  emitUpdate();
}
function addRole() {
  localRoles.push({ player: '', action: '' });
  emitUpdate();
}
</script>

<style module>
.panel {
  background: #0f0b1e;
  border: 1px solid #8b7db8;
  border-radius: 6px;
  padding: 0.75rem;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
}
</style>
