<template>
  <div :class="$style.board">
    <h3 class="font-pixel text-[9px] mb-2">Toolboard</h3>
    <div :class="$style.widgets">
      <div :class="$style.widget">
        <p class="text-xs mb-1">Dice Roll</p>
        <div :class="$style.diceRow">
          <button v-for="d in dice" :key="d" type="button" class="btn-pixel text-[8px]" @click="toggleDie(d)">d{{ d }}</button>
        </div>
        <input v-model.number="modifier" type="number" class="input-gotchi mt-1" placeholder="Modifier" />
        <button type="button" class="btn-pixel text-[8px] mt-1 w-full" @click="roll">Roll {{ selectedDice.join('+') || '—' }}</button>
        <p v-if="lastRoll" class="text-sm mt-1 text-cyan">= {{ lastRoll }}</p>
      </div>
      <div :class="$style.widget">
        <p class="text-xs mb-1">Card Draw</p>
        <button type="button" class="btn-pixel text-[8px]" @click="drawCard">Draw Card</button>
        <p v-if="lastCard" class="text-sm mt-1">{{ lastCard }}</p>
      </div>
      <div :class="$style.widget">
        <p class="text-xs mb-1">Destiny Stone</p>
        <button type="button" class="btn-pixel text-[8px]" @click="destiny">Cast Stone</button>
        <p v-if="destinyResult" class="text-sm mt-1">{{ destinyResult }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const dice = [4, 6, 8, 10, 12, 20, 100];
const selectedDice = ref([20]);
const modifier = ref(0);
const lastRoll = ref(null);
const lastCard = ref('');
const destinyResult = ref('');

function toggleDie(d) {
  const i = selectedDice.value.indexOf(d);
  if (i >= 0) selectedDice.value.splice(i, 1);
  else selectedDice.value.push(d);
}

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function roll() {
  if (!selectedDice.value.length) return;
  const rolls = selectedDice.value.map(rollDie);
  lastRoll.value = rolls.reduce((a, b) => a + b, 0) + (modifier.value || 0);
}

const cards = ['Spirit Force Surge', 'Lickquidator Ambush', 'Alchemica Spillover', 'DAO Blessing', 'Portal Echo', 'Frenship'];

function drawCard() {
  lastCard.value = cards[Math.floor(Math.random() * cards.length)];
}

const destinies = ['The Prophecy stirs…', 'A portal flickers.', 'Yield calls.', 'The Grid trembles.', 'GHST guides you.'];

function destiny() {
  destinyResult.value = destinies[Math.floor(Math.random() * destinies.length)];
}
</script>

<style module>
.board {
  background: #0f0b1e;
  border: 2px solid #8b7db8;
  border-radius: 8px;
  padding: 0.75rem;
}
.widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}
.widget {
  background: #1a142d;
  border: 1px solid #8b7db8;
  border-radius: 6px;
  padding: 0.5rem;
}
.diceRow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
</style>
