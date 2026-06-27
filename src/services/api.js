const apiBase = import.meta.env.VITE_API_BASE || '';
const TOKEN_KEY = 'gotchi-lore-token';

function headers() {
  const wallet = localStorage.getItem('gotchi-lore-wallet') || '';
  const token = localStorage.getItem(TOKEN_KEY) || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(wallet ? { 'X-Owner-Wallet': wallet } : {}),
  };
}

function getUrl(resource, path = '', params = {}) {
  const url = new URL(`${apiBase}/api/${resource}${path}`, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, v);
  });
  return url.toString();
}

async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, { ...options, headers: { ...headers(), ...options.headers } });
  } catch {
    throw new Error('Cannot reach API — run npm run dev:all (API on :3004, web on :5174)');
  }
  if (!res.ok) {
    const text = await res.text();
    let err = {};
    try {
      err = JSON.parse(text);
    } catch {
      /* proxy errors often return empty body */
    }
    if (res.status === 500 && !err.error) {
      throw new Error('API not running on port 3004 — restart with: npm run dev:all');
    }
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const loreApi = {
  listCanonWorlds: () => request(getUrl('lore-worlds', '/canon')),
  listBranches: (id) => request(getUrl('lore-worlds', `/${id}/branches`)),
  branchWorld: (id) => request(getUrl('lore-worlds', `/${id}/fork`), { method: 'POST' }),
  /** @deprecated use branchWorld */
  forkWorld: (id) => request(getUrl('lore-worlds', `/${id}/fork`), { method: 'POST' }),
  listWorldCommits: (id) => request(getUrl('lore-worlds', `/${id}/commits`)),
  getWorldSyncStatus: (id) => request(getUrl('lore-worlds', `/${id}/sync-status`)),
  previewPull: (id) => request(getUrl('lore-worlds', `/${id}/pull-preview`)),
  pullFromUpstream: (id, data = {}) =>
    request(getUrl('lore-worlds', `/${id}/pull`), { method: 'POST', body: JSON.stringify(data) }),
  createWorldCommit: (id, message, kind) =>
    request(getUrl('lore-worlds', `/${id}/commit`), {
      method: 'POST',
      body: JSON.stringify({ message, ...(kind ? { kind } : {}) }),
    }),

  previewProposal: (sourceWorldId) => request(getUrl('lore-proposals', '/preview', { sourceWorldId })),
  listProposals: (params = {}) => request(getUrl('lore-proposals', '', params)),
  getProposal: (id) => request(getUrl('lore-proposals', `/${id}`)),
  createProposal: (data) =>
    request(getUrl('lore-proposals'), { method: 'POST', body: JSON.stringify(data) }),
  updateProposal: (id, data) =>
    request(getUrl('lore-proposals', `/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
  refreshProposal: (id) =>
    request(getUrl('lore-proposals', `/${id}/refresh`), { method: 'POST' }),
  listProposalComments: (id) => request(getUrl('lore-proposals', `/${id}/comments`)),
  addProposalComment: (id, data) =>
    request(getUrl('lore-proposals', `/${id}/comments`), { method: 'POST', body: JSON.stringify(data) }),
  deleteProposalComment: (id, commentId) =>
    request(getUrl('lore-proposals', `/${id}/comments/${commentId}`), { method: 'DELETE' }),
  listProposalEvents: (id) => request(getUrl('lore-proposals', `/${id}/events`)),
  getProposalGovernance: (id) => request(getUrl('lore-proposals', `/${id}/governance`)),
  linkSnapshotProposal: (id, snapshotProposalId) =>
    request(getUrl('lore-proposals', `/${id}/snapshot`), {
      method: 'POST',
      body: JSON.stringify({ snapshotProposalId }),
    }),
  mergeProposal: (id, { force = false } = {}) =>
    request(getUrl('lore-proposals', `/${id}/merge`), {
      method: 'POST',
      body: JSON.stringify({ force }),
    }),

  listWorlds: () => request(getUrl('lore-worlds')),
  getWorld: (id) => request(getUrl('lore-worlds', `/${id}`)),
  createWorld: (data) => request(getUrl('lore-worlds'), { method: 'POST', body: JSON.stringify(data) }),
  updateWorld: (id, data) => request(getUrl('lore-worlds', `/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
  deleteWorld: (id) => request(getUrl('lore-worlds', `/${id}`), { method: 'DELETE' }),
  searchWorlds: (q) => request(getUrl('lore-worlds', '/search', { q })),

  listPages: (worldId, q) => request(getUrl('lore-pages', '', { worldId, q })),
  searchPages: (q) => request(getUrl('lore-pages', '/search', { q })),
  getPageBacklinks: (id) => request(getUrl('lore-pages', `/${id}/backlinks`)),
  getPage: (id) => request(getUrl('lore-pages', `/${id}`)),
  createPage: (data) => request(getUrl('lore-pages'), { method: 'POST', body: JSON.stringify(data) }),
  updatePage: (id, data) => request(getUrl('lore-pages', `/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
  applyPageMirrors: (id) => request(getUrl('lore-pages', `/${id}/apply-mirrors`), { method: 'POST' }),
  getPageMirrors: (id) => request(getUrl('lore-pages', `/${id}/mirrors`)),
  reorderPages: (worldId, updates) =>
    request(getUrl('lore-pages', '/reorder'), {
      method: 'PATCH',
      body: JSON.stringify({ worldId, updates }),
    }),
  deletePage: (id) => request(getUrl('lore-pages', `/${id}`), { method: 'DELETE' }),
  listPageRevisions: (pageId) => request(getUrl('lore-pages', `/${pageId}/revisions`)),
  restorePageRevision: (pageId, revisionId) =>
    request(getUrl('lore-pages', `/${pageId}/revisions/${revisionId}/restore`), { method: 'POST' }),
  refactorTemplate: (worldId, templateId, spec = {}) =>
    request(getUrl('lore-pages', '/refactor-template'), {
      method: 'POST',
      body: JSON.stringify({
        worldId,
        templateId,
        blockOrder: spec.blockOrder,
        layout: spec.layout,
        blocks: spec.blocks,
      }),
    }),

  listMaps: (worldId) => request(getUrl('realm-maps', '', { worldId })),
  createMap: (data) => request(getUrl('realm-maps'), { method: 'POST', body: JSON.stringify(data) }),
  updateMap: (id, data) => request(getUrl('realm-maps', `/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMap: (id) => request(getUrl('realm-maps', `/${id}`), { method: 'DELETE' }),

  listInventory: (worldId, params = {}) => request(getUrl('lore-inventory', '', { worldId, ...params })),
  createInventoryItem: (data) => request(getUrl('lore-inventory'), { method: 'POST', body: JSON.stringify(data) }),
  updateInventoryItem: (id, data) =>
    request(getUrl('lore-inventory', `/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
  deleteInventoryItem: (id) => request(getUrl('lore-inventory', `/${id}`), { method: 'DELETE' }),

  listDiagrams: (worldId) => request(getUrl('lore-diagrams', '', { worldId })),
  createDiagram: (data) => request(getUrl('lore-diagrams'), { method: 'POST', body: JSON.stringify(data) }),
  updateDiagram: (id, data) => request(getUrl('lore-diagrams', `/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
  deleteDiagram: (id) => request(getUrl('lore-diagrams', `/${id}`), { method: 'DELETE' }),

  exportWorldMarkdown: async (worldId, filename) => {
    const url = getUrl('lore-worlds', `/${worldId}/export/markdown`);
    const wallet = localStorage.getItem('gotchi-lore-wallet') || '';
    const res = await fetch(url, { headers: wallet ? { 'X-Owner-Wallet': wallet } : {} });
    if (!res.ok) throw new Error('Markdown export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'world-lore.zip';
    a.click();
    URL.revokeObjectURL(a.href);
  },
  exportWorldPdf: async (worldId, filename) => {
    const url = getUrl('lore-worlds', `/${worldId}/export/pdf`);
    const wallet = localStorage.getItem('gotchi-lore-wallet') || '';
    const res = await fetch(url, { headers: wallet ? { 'X-Owner-Wallet': wallet } : {} });
    if (!res.ok) throw new Error('PDF export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'world-lore.pdf';
    a.click();
    URL.revokeObjectURL(a.href);
  },

  uploadAsset: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const h = headers();
    delete h['Content-Type'];
    const res = await fetch(getUrl('suite-assets', '/upload'), {
      method: 'POST',
      headers: h,
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },
  listAssets: () => request(getUrl('suite-assets')),
  deleteAsset: (id) => request(getUrl('suite-assets', `/${id}`), { method: 'DELETE' }),

  importGotchi: (tokenId) => request(getUrl('gotchi-import', `/gotchi/${tokenId}`)),
  importParcel: (tokenId) => request(getUrl('gotchi-import', `/parcel/${tokenId}`)),
  exportTemplates: (worldId) => request(getUrl('gotchi-import', `/templates/export/${worldId}`)),
  importTemplates: (templates) =>
    request(getUrl('gotchi-import', '/templates/import'), { method: 'POST', body: JSON.stringify({ templates }) }),
};

export const tomeApi = {
  listCanonChronicles: () => request(getUrl('tome-chronicles', '/canon')),
  listBranches: (id) => request(getUrl('tome-chronicles', `/${id}/branches`)),
  branchChronicle: (id) => request(getUrl('tome-chronicles', `/${id}/fork`), { method: 'POST' }),
  listChronicleCommits: (id) => request(getUrl('tome-chronicles', `/${id}/commits`)),
  getChronicleSyncStatus: (id) => request(getUrl('tome-chronicles', `/${id}/sync-status`)),
  previewPull: (id) => request(getUrl('tome-chronicles', `/${id}/pull-preview`)),
  pullFromUpstream: (id, data = {}) =>
    request(getUrl('tome-chronicles', `/${id}/pull`), { method: 'POST', body: JSON.stringify(data) }),
  createChronicleCommit: (id, message, kind) =>
    request(getUrl('tome-chronicles', `/${id}/commit`), {
      method: 'POST',
      body: JSON.stringify({ message, ...(kind ? { kind } : {}) }),
    }),

  listChronicles: () => request(getUrl('tome-chronicles')),
  getChronicle: (id) => request(getUrl('tome-chronicles', `/${id}`)),
  createChronicle: (data) => request(getUrl('tome-chronicles'), { method: 'POST', body: JSON.stringify(data) }),
  updateChronicle: (id, data) => request(getUrl('tome-chronicles', `/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
  deleteChronicle: (id) => request(getUrl('tome-chronicles', `/${id}`), { method: 'DELETE' }),

  listNodes: (chronicleId) => request(getUrl('story-nodes', '', { chronicleId })),
  createNode: (data) => request(getUrl('story-nodes'), { method: 'POST', body: JSON.stringify(data) }),
  updateNode: (id, data) => request(getUrl('story-nodes', `/${id}`), { method: 'PATCH', body: JSON.stringify(data) }),
  deleteNode: (id) => request(getUrl('story-nodes', `/${id}`), { method: 'DELETE' }),

  listMaps: (chronicleId) => request(getUrl('realm-maps', '', { chronicleId })),
  exportPdf: (type, id) => getUrl('suite-assets', `/export/pdf/${type}/${id}`),
};

export const aibotApi = {
  health: () => request(getUrl('aibot', '/health')),
  generate: (query, wallet) =>
    request(getUrl('aibot', '/generate'), {
      method: 'POST',
      body: JSON.stringify({ query, wallet: wallet || localStorage.getItem('gotchi-lore-wallet') || '' }),
    }),
};
