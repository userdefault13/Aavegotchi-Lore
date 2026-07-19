# Lighting the Grid — Power, Compute & Transmute Logistics

Lore + design for refining Alchemica into fuel for power plants and compute, so the Grid can run a Netherlink (internet) and **digitally ship Alchemica to the Citaadel** instead of walking caravans.

**Canon seed:** `/workspace/scripts/grid-power-canon-data.cjs`  
**Parent:** `gameplay/farming-alchemica/grid-power`  
**Related:** [alchemica-factory-brainstorm.md](./alchemica-factory-brainstorm.md)

---

## One-Line Premise

Refine Alchemica → power plants (up to nuclear-scale Corestacks) → data centers / miners / RPCs / indexers / servers → Netherlink uptime → transmute Alchemica to the Citaadel. **If the lights die, you walk it back.**

---

## Vocabulary

| Term | Meaning |
|------|---------|
| **The Grid** | Canon geography outside the Citaadel |
| **Lighting the Grid** | Project to bring powered internet (Netherlink) to that geography |
| **Netherlink** | Mesh internet: Antennas, Callspires, relays → Citaadel receivers |
| **Transmute** | Convert physical Alchemica into packet-form for digital shipping |
| **Walk Ledger** | Contingency: travel cost home if Netherlink is dark |
| **Sparkworks → Dynamo → Netherforge → Corestack** | Plant tiers 1–4 |

---

## Why It Fits Canon

- Alchemica already fuels Installations and Portal tithe
- Antennas already imply signal / logistics
- Grid vs Citaadel already encodes frontier logistics tension
- Lickquidators already hunt Spillover and Portal stores
- AGITHE’s origin is internet hunger — Netherlink can rhyme without retconning

New layer (expansion, not litepaper): **compute as logistics infrastructure**, not a separate sci-fi setting.

---

## Resource → Fuel Mapping

| Alchemica | Fuel grade | Job |
|-----------|------------|-----|
| FUD | FUD Slag | Baseload plants, blackout survival |
| FOMO | FOMO Plasma | Peak load, miners, fast Antenna boot |
| ALPHA | ALPHA Flux | RPC honesty, indexer schema, metering |
| KEK | KEK Vapor | Mesh handshake stability, operator morale |

---

## Dependency Chain (Gameplay Truth)

```
Power Plant online
    → Servers (Haunthosts)
        → RPC Nodes (Callspires)
            → Indexers (Lorelooms)
                → Miner quorum (Proof Halls)
                    → Transmute clearance
                        → Citaadel receiver accepts
                            → Portal tithe carved
                                → Credits arrive in Citaadel
```

Break any link → fall back to **caravan**.

---

## Plant Escalation

1. **Sparkworks** — parcel generator; no transmute alone  
2. **Foundry Dynamo** — multi-parcel bus; local RPC possible  
3. **Netherforge** — regional data center power; high raid scent  
4. **Corestack** — nuclear-scale Alchemica reactor; district Netherlink or catastrophe  

---

## Main Objective

Sustain **Netherlink transmute** from Grid Foundries to Citaadel receivers at a rate that keeps Portal tithe healthy — without relying on caravans — through Great Battle pressure.

Secondary objectives:
- Keep RPC honesty (ALPHA Flux)
- Keep indexer freshness (dispute prevention)
- Survive raids on glowing plants
- Maintain Walk Ledger readiness for blackouts

---

## Faction Tension

| Faction | Stance |
|---------|--------|
| **Linkers** | Netherlink or death; build Corestacks |
| **Walkers** | Trust boots; automation is hubris |
| **Tithe Wardens** | Either path is fine if Portal is paid |
| **Citaadel Isolationists** | Throttle receivers; fear Grid independence |
| **Lickquidators** | Eat the brightest plant |

---

## Campaign: Light the Haul

See canon page `.../campaign-arc`. Short form:

Caravan pain → first plant → failed transmute → RPC success → raid → indexer → miners → mega power → optional Corestack → blackout march → receiver politics → stable haul.

---

## Vertical Slice (Build Order)

1. Tutorial caravan (teach Walk Ledger)
2. Sparkworks + Antenna (power, still no ship)
3. Servers + RPC (first successful smol transmute)
4. Lickquidator raid on plant Spillover
5. Blackout + emergency caravan encore

---

## Open Questions

1. Are Corestacks DAO-banned, licensed, or freeboot-only?
2. Can Spirit-Bonded humans operate Callspires remotely from Ether Realm?
3. Does Baazaar settlement require indexer proofs, or only Citaadel receivers?
4. Is skimmed packet Alchemica (mesh piracy) recoverable, or permanently corrupted?

---

## Files

- Seed pages: `scripts/grid-power-canon-data.cjs`
- Factory loop context: `docs/alchemica-factory-brainstorm.md`
- Quick ref: Alchemica + Grid Power sections in `lore-quick-reference.md`
