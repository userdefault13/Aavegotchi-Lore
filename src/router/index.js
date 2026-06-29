import { createRouter, createWebHistory } from 'vue-router';
import SuiteHub from '@/views/SuiteHub.vue';
import LoreWorldList from '@/views/lore/LoreWorldList.vue';
import LoreCanonView from '@/views/lore/LoreCanonView.vue';
import LoreWorldWorkspace from '@/views/lore/LoreWorldWorkspace.vue';
import LoreTemplates from '@/views/lore/LoreTemplates.vue';
import LoreDiagramsView from '@/views/lore/LoreDiagramsView.vue';
import LoreInventoryView from '@/views/lore/LoreInventoryView.vue';
import LoreProposalsView from '@/views/lore/LoreProposalsView.vue';
import LoreForkSyncView from '@/views/lore/LoreForkSyncView.vue';
import LoreMapView from '@/views/lore/LoreMapView.vue';
import ChronicleList from '@/views/tome/ChronicleList.vue';
import TomeCanonView from '@/views/tome/TomeCanonView.vue';
import ChronicleWorkspace from '@/views/tome/ChronicleWorkspace.vue';
import TomeSyncView from '@/views/tome/TomeSyncView.vue';
import SessionPlay from '@/views/tome/SessionPlay.vue';
import ChronicleLink from '@/views/tome/ChronicleLink.vue';
import RobeBoardList from '@/views/robe/RobeBoardList.vue';
import RobeWorkspace from '@/views/robe/RobeWorkspace.vue';
import RobePreviewView from '@/views/robe/RobePreviewView.vue';

const routes = [
  { path: '/', name: 'hub', component: SuiteHub },
  { path: '/lore', name: 'lore-list', component: LoreWorldList },
  { path: '/lore/canon', name: 'lore-canon', component: LoreCanonView },
  { path: '/lore/:worldId', name: 'lore-world', component: LoreWorldWorkspace },
  { path: '/lore/:worldId/templates', name: 'lore-templates', component: LoreTemplates },
  { path: '/lore/:worldId/diagrams', name: 'lore-diagrams', component: LoreDiagramsView },
  { path: '/lore/:worldId/inventory', name: 'lore-inventory', component: LoreInventoryView },
  { path: '/lore/:worldId/proposals/:proposalId?', name: 'lore-proposals', component: LoreProposalsView },
  { path: '/lore/:worldId/sync', name: 'lore-sync', component: LoreForkSyncView },
  { path: '/lore/:worldId/maps/:mapId?', name: 'lore-map', component: LoreMapView },
  { path: '/tome', name: 'tome-list', component: ChronicleList },
  { path: '/tome/canon', name: 'tome-canon', component: TomeCanonView },
  { path: '/tome/:chronicleId', name: 'tome-chronicle', component: ChronicleWorkspace },
  { path: '/tome/:chronicleId/sync', name: 'tome-sync', component: TomeSyncView },
  { path: '/tome/:chronicleId/play', name: 'tome-play', component: SessionPlay },
  { path: '/tome/:chronicleId/link', name: 'tome-link', component: ChronicleLink },
  { path: '/robe', name: 'robe-list', component: RobeBoardList },
  { path: '/robe/:chronicleId', name: 'robe-board', component: RobeWorkspace },
  { path: '/robe/:chronicleId/preview', name: 'robe-preview', component: RobePreviewView },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
