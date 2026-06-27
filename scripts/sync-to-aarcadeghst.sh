#!/usr/bin/env bash
# Sync gotchi-lore API routes into AarcadeGh-t (Phase 8)
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${AARCADE_ROOT:-$HOME/dev/AarcadeGh-t}"

echo "Syncing API routes to $DEST"
mkdir -p "$DEST/api/routes"
for f in lore-worlds lore-pages tome-chronicles story-nodes realm-maps suite-assets gotchi-import; do
  cp "$SRC/api/routes/${f}.js" "$DEST/api/routes/${f}.js"
done
cp "$SRC/api/services/loreEngine.cjs" "$DEST/api/services/loreEngine.cjs" 2>/dev/null || mkdir -p "$DEST/api/services" && cp "$SRC/api/services/loreEngine.cjs" "$DEST/api/services/"
echo "Done. Manual steps: mount routes in api/server.js, add vercel rewrites, add Vue hub route."
echo "See docs/aarcade-integration.md"
