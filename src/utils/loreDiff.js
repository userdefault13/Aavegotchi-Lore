/** Client helpers for lore proposal diffs. */

export function formatHunkPath(path) {
  if (!path) return '';
  if (path === '_page') return 'Page';
  if (path === 'title') return 'Title';
  if (path === 'templateId') return 'Template';
  if (path === 'frame') return 'Frame';
  if (path === 'tags') return 'Tags';
  if (path.startsWith('runes.')) return `Rune · ${path.slice(6)}`;
  if (path.startsWith('blocks.')) {
    const parts = path.split('.');
    if (parts.length === 2) return `Block · ${parts[1]}`;
    return `Block · ${parts[1]} · ${parts[2]}`;
  }
  return path;
}

export function formatHunkValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'string') {
    const stripped = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (stripped.length > 120) return `${stripped.slice(0, 117)}…`;
    return stripped || value.slice(0, 120);
  }
  if (typeof value === 'object') {
    try {
      const s = JSON.stringify(value);
      return s.length > 100 ? `${s.slice(0, 97)}…` : s;
    } catch {
      return '[object]';
    }
  }
  return String(value);
}

export function actionLabel(action) {
  return { add: 'Added', modify: 'Modified', delete: 'Removed' }[action] || action;
}

export function statusLabel(status) {
  return {
    open: 'Open',
    changes_requested: 'Changes requested',
    nominated: 'Nominated',
    voting: 'Voting',
    merged: 'Merged',
    closed: 'Closed',
    rejected: 'Rejected',
  }[status] || status;
}

export function statusClass(status) {
  return {
    open: 'text-green-300',
    changes_requested: 'text-yellow-300',
    nominated: 'text-cyan-300',
    voting: 'text-blue-300',
    rejected: 'text-red-300',
    closed: 'text-gray-400',
    merged: 'text-purple-300',
  }[status] || '';
}

export function governanceEventLabel(type) {
  return {
    created: 'Opened',
    nominated: 'Nominated for vote',
    unnominated: 'Removed from vote queue',
    snapshot_linked: 'Snapshot vote linked',
    voting: 'Voting started',
    merged: 'Merged to canon',
    changes_requested: 'Changes requested',
    rejected: 'Rejected',
    closed: 'Closed',
    reopened: 'Reopened',
    refreshed: 'Diff refreshed',
    comment: 'Comment',
  }[type] || type;
}

export function conflictKey(pageKey, path) {
  return `${pageKey}::${path || ''}`;
}
