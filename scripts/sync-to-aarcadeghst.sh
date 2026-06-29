#!/usr/bin/env bash
# Sync gotchi-lore backend into AarcadeGh-t (API routes, services, middleware)
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${AARCADE_ROOT:-$HOME/dev/AarcadeGh-t}"

echo "Syncing gotchi-lore backend → $DEST"

mkdir -p "$DEST/api/routes" "$DEST/api/services" "$DEST/api/middleware"

ROUTES=(
  lore-worlds lore-pages tome-chronicles story-nodes realm-maps
  suite-assets gotchi-import lore-inventory lore-diagrams
  lore-proposals auth robe-boards aibot
)

for f in "${ROUTES[@]}"; do
  sed 's|require('\''../lib/mongodb.cjs'\'')|require('\''../../lib/mongodb.cjs'\'')|g' \
    "$SRC/backend/routes/${f}.js" > "$DEST/api/routes/${f}.js"
  echo "  routes/${f}.js"
done

for svc in "$SRC/backend/services/"*.cjs; do
  base="$(basename "$svc")"
  sed 's|require('\''../lib/mongodb.cjs'\'')|require('\''../../lib/mongodb.cjs'\'')|g' \
    "$svc" > "$DEST/api/services/$base"
done
echo "  services/*.cjs"

cp "$SRC/backend/middleware/auth.js" "$DEST/api/middleware/auth.js"
cp "$SRC/backend/middleware/owner.js" "$DEST/api/middleware/owner.js"
echo "  middleware/auth.js, owner.js"

echo "Done. Run sync-frontend-to-aarcadeghst.sh for Vue sources."
