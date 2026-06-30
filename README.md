# gotchi-lore

Gotchiverse-themed web clone of **Amsel Lore + Tome** — worldbuilding codex and campaign chronicle suite for the Aavegotchi ecosystem.

## Stack

- Vue 3 + Vite + Pinia + Tailwind
- Express API + MongoDB
- TipTap, Vue Flow, Mermaid
- Deploy: Vercel (SPA + API rewrites)

## Dev

```bash
cp env.example .env
# Set MONGODB_URI

npm install
cd api && npm install && cd ..

npm run dev:all
```

- Frontend: http://localhost:5174
- API: http://localhost:3004

## Routes

| Path | App |
|------|-----|
| `/` | Suite hub |
| `/lore` | Lore worlds |
| `/tome` | Chronicles |

## Lore Documentation

Comprehensive Aavegotchi worldbuilding documentation available in [docs/LORE-README.md](docs/LORE-README.md):

- **Quick Reference** - Cheat sheet for all lore elements
- **Online Sources** - Catalog of canonical lore from official sources
- **Brainstorm** - Creative expansion ideas and storytelling prompts

## AarcadeGh-t merge

See [docs/aarcade-integration.md](docs/aarcade-integration.md) and run `./scripts/sync-to-aarcadeghst.sh`.
