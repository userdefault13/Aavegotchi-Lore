/** Tooltip copy for Lore + Tome workspaces */

export const LORE_RAIL = {
  lore: { label: 'Lore', hint: 'Edit pages, runes, and layout blocks.' },
  proposals: { label: 'PRs', hint: 'Open or review pull requests — Lore and Tome changes together.' },
  sync: { label: 'Sync', hint: 'Pull upstream canon into your branch and resolve conflicts.' },
  templates: { label: 'Templates', hint: 'Browse and apply page templates for this world.' },
  diagrams: { label: 'Diagrams', hint: 'Relationship maps linked to lore pages.' },
  maps: { label: 'Maps', hint: 'Realm maps with pins tied to pages.' },
  inventory: { label: 'Inventory', hint: 'Items, wearables, and links for this world.' },
};

export const TOME_RAIL = {
  story: { label: 'Story', hint: 'Edit arcs, chapters, and scene nodes.' },
  play: { label: 'Play', hint: 'Run Session Play — local state stays off the PR diff.' },
  link: { label: 'Link', hint: 'Connect scenes to lore pages in the paired world.' },
  proposals: { label: 'PRs', hint: 'Same combined PR as your lore branch.' },
  sync: { label: 'Sync', hint: 'Pull campaign canon updates into your branch.' },
};

export const LORE_ACTIONS = {
  commit: { label: 'Commit', hint: 'Snapshot your page edits on this branch.' },
  pushReview: { label: 'Push for review', hint: 'Open a DAO pull request with Lore + Tome diffs.' },
  recordEdit: { label: 'Record edit', hint: 'Save a canon checkpoint after a maintainer edit.' },
  checkpoint: { label: 'Checkpoint', hint: 'Save a snapshot of this sandbox world.' },
  branch: { label: 'Branch', hint: 'Create your editable copy — also opens a paired campaign branch.' },
  yourBranch: { label: 'Your branch', hint: 'Open your existing editable copy of this canon.' },
  exportMd: { label: 'Export MD', hint: 'Download this world as markdown.' },
  exportPdf: { label: 'Export PDF', hint: 'Generate a PDF export of this world.' },
  maps: { label: 'Maps', hint: 'Open the map workspace for this world.' },
  aiArt: { label: 'AI art', hint: 'Generate pixel art for the selected page block.' },
  importGotchi: { label: 'Import Gotchi', hint: 'Import Gotchi templates into this world.' },
  newWorld: { label: 'New World', hint: 'Create a personal sandbox world.' },
  browseCanon: { label: 'Browse canon', hint: 'Official Gotchiverse lore maintained by the DAO.' },
  branchFromCanon: { label: 'Branch from DAO canon', hint: 'Fork lore canon and your linked campaign branch.' },
  signIn: { label: 'Sign in', hint: 'Connect MetaMask to branch, commit, and propose changes.' },
  createBranch: { label: 'Create branch', hint: 'Your editable copy of official lore — opens a paired campaign branch.' },
  reviewPrs: { label: 'Review PRs', hint: 'Maintainer inbox for incoming contributor proposals.' },
  browse: { label: 'Browse', hint: 'Read-only view of official canon content.' },
};

export const TOME_ACTIONS = {
  commit: { label: 'Commit', hint: 'Snapshot governed scene fields on your branch.' },
  pushReview: { label: 'Push for review', hint: 'Opens the combined Lore + Tome pull request.' },
  linkLore: { label: 'Link Lore', hint: 'Cross-link scenes to pages in the paired world.' },
  sessionPlay: { label: 'Session Play', hint: 'Play through scenes — status and memos stay local.' },
  addArc: { label: 'Add arc', hint: 'Top-level story arc for this chronicle.' },
  browseCanon: { label: 'Browse canon', hint: 'Official campaign scenes from the litepaper.' },
  createBranch: { label: 'Create branch', hint: 'Your editable copy of this campaign chronicle.' },
  newChronicle: { label: 'New chronicle', hint: 'Personal sandbox campaign — not linked to DAO canon.' },
};

export const SYNC_PANEL = {
  pull: { label: 'Pull from canon', hint: 'Merge upstream changes since your branch base.' },
  commit: { label: 'Commit changes', hint: 'Save a checkpoint before opening a PR.' },
  pushReview: { label: 'Push for review', hint: 'Submit Lore + Tome changes for DAO review.' },
  viewPrs: { label: 'View PRs', hint: 'See open and merged pull requests.' },
  behind: { label: 'Behind', hint: 'Commits on canon since you branched or last pulled.' },
  ahead: { label: 'Ahead', hint: 'Your commits not yet merged to canon.' },
};

export const LAYOUT = {
  lore: { label: 'Lore', hint: 'Wiki-style worlds, pages, maps, and DAO governance.' },
  tome: { label: 'Tome', hint: 'Campaign chronicles, scenes, and Session Play.' },
  robe: { label: 'Robe', hint: 'Storyboard scenes into 720p video with pixel art.' },
  search: { label: 'Search', hint: 'Jump to pages, worlds, and chronicles.' },
  theme: { label: 'Theme', hint: 'Toggle light or dark mode.' },
  wallet: { label: 'Wallet', hint: 'Sign in with MetaMask to edit and propose changes.' },
};

export const ROBE_RAIL = {
  storyboard: { label: 'Board', hint: 'Compose storyboard frames for each scene.' },
  preview: { label: 'Preview', hint: 'Play transitions and export video.' },
  sync: { label: 'Sync', hint: 'Re-sync frames from Tome scenes.' },
  tome: { label: 'Tome', hint: 'Return to campaign editor.' },
};

export const ROBE_ACTIONS = {
  sync: { label: 'Sync scenes', hint: 'Re-sync storyboard frames from Tome scene nodes.' },
  generateFrame: { label: 'Pixel Lab', hint: 'Generate pixel art for this frame from scene + lore context.' },
  generateMissing: { label: 'Fill gaps', hint: 'Batch-generate images for frames without artwork.' },
  flatten: { label: 'Flatten', hint: 'Bake layers to a preview image.' },
  exportWebm: { label: 'Export WebM', hint: 'Download preview recording.' },
  exportMp4: { label: 'Export MP4', hint: 'Convert recording to MP4 (loads ffmpeg in browser).' },
};

export const PAGE_TREE = {
  addChild: { label: 'Add child', hint: 'Create a sub-page under the selected page.' },
};
