#!/usr/bin/env bash
# Sync gotchi-lore Vue frontend into AarcadeGh-t/src/gotchi-lore
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${AARCADE_ROOT:-$HOME/dev/AarcadeGh-t}"
GL="$DEST/src/gotchi-lore"

echo "Syncing gotchi-lore frontend → $GL"

rm -rf "$GL"
mkdir -p "$GL"

for dir in views components utils constants seed stores services composables integrations; do
  cp -R "$SRC/src/$dir" "$GL/$dir" 2>/dev/null || true
done
cp "$SRC/src/style.css" "$GL/style.css"

# Rewrite @/ imports → @/gotchi-lore/
find "$GL" -type f \( -name '*.vue' -o -name '*.js' \) -print0 | while IFS= read -r -d '' f; do
  sed -i '' \
    -e "s|from '@/|from '@/gotchi-lore/|g" \
    -e "s|import '@/|import '@/gotchi-lore/|g" \
    "$f"
done

# Route path prefixes for Concierge nested routes
find "$GL" -type f \( -name '*.vue' -o -name '*.js' \) -print0 | while IFS= read -r -d '' f; do
  sed -i '' \
    -e 's|to="/lore|to="/concierge/gotchi-lore/lore|g' \
    -e 's|to="/tome|to="/concierge/gotchi-lore/tome|g' \
    -e 's|to="/robe|to="/concierge/gotchi-lore/robe|g' \
    -e 's|`:to="\`/lore|`:to="\`/concierge/gotchi-lore/lore|g' \
    -e 's|`:to="\`/tome|`:to="\`/concierge/gotchi-lore/tome|g' \
    -e 's|`:to="\`/robe|`:to="\`/concierge/gotchi-lore/robe|g' \
    -e 's|`/lore/|`/concierge/gotchi-lore/lore/|g' \
    -e 's|`/tome/|`/concierge/gotchi-lore/tome/|g' \
    -e 's|`/robe/|`/concierge/gotchi-lore/robe/|g' \
    -e "s|router.push(\`/lore/|router.push(\`/concierge/gotchi-lore/lore/|g" \
    -e "s|router.push(\`/tome/|router.push(\`/concierge/gotchi-lore/tome/|g" \
    -e "s|router.replace(\`/lore/|router.replace(\`/concierge/gotchi-lore/lore/|g" \
    -e "s|router.push('/lore|router.push('/concierge/gotchi-lore/lore|g" \
    -e "s|router.push('/tome|router.push('/concierge/gotchi-lore/tome|g" \
    -e "s|router.push('/robe|router.push('/concierge/gotchi-lore/robe|g" \
    -e "s|router.replace('/lore|router.replace('/concierge/gotchi-lore/lore|g" \
    "$f"
done

# Suite hub home link
sed -i '' 's|to="/"|to="/concierge/gotchi-lore"|g' "$GL/views/SuiteHub.vue" 2>/dev/null || true

echo "Done. Wire routes in AarcadeGh-t/src/gotchi-lore/routes.js"
