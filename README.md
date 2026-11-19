# Leonida Platinum — GTA VI Trophy Guide & Tracker

![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/dhamskie-ai/gta6-trophy-guide-01/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/dhamskie-ai/gta6-trophy-guide-01/reward.svg)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online), built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Every trophy** with its official name, description and grade as PlayStation publishes them, plus a guide in our own words — what to do, where, how, and when it can be missed — with its **sources named beside each guide** (Exophase, PSNProfiles, PowerPyx, GTABase, EGamers.io, GamesFuze, GTA Spotter). Where a step is unconfirmed at launch (19 Nov 2026), the guide says so instead of inventing one.
- **Roadmap to the platinum** in 6 stages, built from the official descriptions: story first, then side characters, activities, crime, collectibles, and the 100% checklist last.
- **The one possibly missable trophy flagged everywhere**: Positive Mental Attitude — meditate at every spot, starting with Lucia's Chapter 1 balcony meditation before Chapter 1 ends.
- **Tracker**: tick trophies off, with per-trophy counters for counted goals (250 stunts, 42 shooting-range golds, 100 WAiNK spots…). Progress saves in localStorage, and can be **exported to a file and imported back**.
- **Filters** by kind (story, missable, collectibles, activities, online), by grade, and by text search; **spoiler-safe setting** hides hidden story trophies' names and descriptions until they are earned.
- **Fully offline**: static files under `app/`, no network requests at run time, no Rockstar logo or artwork — the look is our own Vice City sunset/neon design.

## How to run

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static file server. To build the submission output:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide app
- `app/data/trophies.json` — the 55 official trophies with guides, steps, sources, roadmap stages and counts
- `screenshots/` — real renders of the app
- `main.ts` — hand-in program (copies `app/` + `screenshots/` to `/output`, writes `dossier.json`)
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
