<div align="center">

# crAIyons

**A [Skribbl](https://skribbl.io)-style drawing game where the AI is the judge** — inspired by [Camera-Ready](https://www.mariowiki.com/Camera-Ready) from Mario Party, powered by Google's [Quick, Draw!](https://quickdraw.withgoogle.com/data) dataset.

ACM AI Projects · SU26 · Team 3
Mentors: Alex, Nicole · Team: Jeremy, Dylan, Nghi, Tammy

[**See the Slides Here →**](https://docs.google.com/presentation/d/1e-VEat0UkQ3yIxvDyGSS0pM9z70fksDhwjlSawabkgY/edit?usp=sharing)

[Overview](#overview) • [Getting started](#getting-started) • [How it works](#how-it-works) • [Models](#models) • [Repo structure](#repo-structure) • [Data conventions](#data-conventions) • [Roadmap](#roadmap)

</div>

## Overview

CrAIyons is a multiplayer drawing party game where an AI is the judge. Everyone gets the same prompt and the same timer, and the player whose sketch comes closest to the real thing wins the round.

Quick, Draw!'s own model only tells you it *misclassified* your key as a crocodile — it doesn't tell you two players' keys are 81% vs 68% similar to a "real" key. That's the core problem crAIyons solves: turning a **classification** dataset into a **similarity** scoring engine, so any two drawings of the same prompt can be ranked against each other.

The project has three moving parts:

| Part                       | Stack                                      | What it does                                                                                                                     |
| -------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/`              | React 19, TypeScript, Vite, Tailwind CSS 4 | Landing, lobby, drawing canvas + toolbar, live AI-guesser panel, round/final results                                             |
| `backend/`               | FastAPI, uvicorn, NumPy                    | In-memory game/lobby state (create, join, start, end round) plus pixel → embedding → score prediction                          |
| `baselines/` + `data/` | PyTorch, scikit-learn, quickdraw, Gradio   | k-NN and CNN baseline notebooks per category, plus precomputed centroid embeddings served from a Hugging Face inference endpoint |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Python](https://www.python.org/downloads/) 3.11+

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.template .env   # fill in HF_ENDPOINT_URL and HF_API_TOKEN
python -m uvicorn main:app --port 8000
```

`backend/.env` (git-ignored) holds the two vars `hf_inference.py` needs to call the embedding model:

| Var                 | Purpose                                                                          |
| ------------------- | -------------------------------------------------------------------------------- |
| `HF_ENDPOINT_URL` | Hugging Face Inference Endpoint URL that returns a 128-d embedding for a drawing |
| `HF_API_TOKEN`    | Bearer token for that endpoint                                                   |

### Playing over LAN / a tunnel

`frontend/vite.config.ts` sets `allowedHosts: true` so the dev server accepts requests through a changing tunnel hostname (e.g. [Cloudflare quick tunnels](https://developers.cloudflare.com/pages/how-to/preview-with-cloudflare-tunnel/)). By default the frontend calls the backend at `http://<page-hostname>:8000` (`frontend/src/api.ts`), which works for same-host/LAN setups out of the box. If frontend and backend are exposed on two different hostnames (e.g. two separate tunnels), point the frontend at the backend explicitly:

```bash
# frontend/.env.local
VITE_API_BASE=https://<your-backend-tunnel-host>
```

### Model / notebook work

The ML dependencies (PyTorch, scikit-learn, quickdraw, …) live in the root requirements file:

```bash
pip install -r requirements.txt
```

Then open any notebook under `baselines/knn/` or `baselines/simplecnn/`. Several of the CNN notebooks include a [Gradio](https://gradio.app) demo cell for interactive testing.

## How it works

Games are tracked in an in-memory dict on the backend, keyed by a short `game_id`:

| Method   | Endpoint                       | Purpose                                                                |
| -------- | ------------------------------ | ---------------------------------------------------------------------- |
| `GET`  | `/`                          | Health check                                                           |
| `POST` | `/games`                     | Create a new game/lobby, returns`game_id`                            |
| `POST` | `/games/{game_id}/join`      | Join a game as a named player                                          |
| `GET`  | `/games/{game_id}`           | Get current game state (round, prompt, players, scores)                |
| `POST` | `/games/{game_id}/start`     | Start the round (picks a random category + prompt, resets submissions) |
| `POST` | `/games/{game_id}/predict`   | Submit drawings → embeddings → scores against the prompt             |
| `POST` | `/games/{game_id}/end-round` | Rank submissions, award points, end the game after`max_rounds`       |

1. **Draw** — `DrawingCanvas` captures pointer strokes on an HTML canvas.
2. **Extract** — the canvas is downsampled to a **128×128 grayscale matrix** (`0.0` = background, `1.0` = full stroke).
3. **Timer hits 0** — the frontend POSTs each player's `{ player_name, pixels, width, height }` to `POST /games/{game_id}/predict`, then calls `POST /games/{game_id}/end-round`.
4. **Inference** — the backend reshapes the pixels to `(1, h, w, 1)` and calls the Hugging Face inference endpoint (`backend/hf_inference.py`) to get a 128-dimensional embedding.
5. **Score** — `backend/scoring.py` loads that category's precomputed centroids and returns the cosine similarity between the drawing's embedding and every class centroid; the prompt's own similarity is normalized against a per-round random cap for scoring.
6. **Rank** — `end-round` sorts players by similarity, hands out placement points (3/2/1 for top 3) plus a 0.5 bonus for any similarity over 50%, and flows the result back through `GET /games/{game_id}` to the players/results panels.

## Models

Four categories (**animals**, **food**, **objects**, **sports**), 15 classes each, trained on Quick, Draw! sketches (28×28 vector sketches upsampled/rendered to 128×128 grayscale, each drawn in under 20 seconds).

Each category has its own small CNN classifier; the second-to-last (embedding) layer's 128-d output is what gets stored as a centroid and compared via cosine similarity at inference time — the same pipeline as `backend/scoring.py`, just precomputed offline in `baselines/simplecnn/`.

| Category | Architecture                                                                                                                                                            | Notes                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Sports   | Conv(16) → ReLU → MaxPool → Conv(32) → ReLU → MaxPool → Flatten (32,768) → Linear embed (128) → Linear classifier (15)                                          |                                                                                                          |
| Animals  | Conv(32) → GroupNorm → ReLU → MaxPool → Conv(64) → GroupNorm → ReLU → MaxPool → Conv(128) → GroupNorm → ReLU → MaxPool → AdaptiveAvgPool → embed → logits | Switched BatchNorm → GroupNorm after uneven class sizes made the model collapse to 1/15 (random chance) |
| Objects  | Conv(16) → ReLU → MaxPool → Conv(32) → ReLU → MaxPool → Flatten (32,768) → Linear embed (128) + ReLU → Linear classifier (15)                                   | Trained with Supervised Contrastive Loss + Cross-Entropy for tighter embedding separation                |
| Food     | Conv(32) → ReLU → MaxPool → Conv(64) → ReLU → MaxPool → Flatten (65,536) → Linear embed (128) → Linear classifier (15)                                          |                                                                                                          |

Baseline k-NN notebooks (`baselines/knn/`) exist per category for comparison. Best CNN so far: **animals, train/test ≈ 0.76 / 0.68**.

## App architecture

```
HTML5 canvas ──HTTPS POST (pixels)──▶ FastAPI ──numpy array──▶ Hugging Face inference endpoint
     ▲                                  │  ▲                         │
     │                                  │  │                         ▼
     └──────── WebSocket/poll ──────────┘  └── cosine similarity ◀── embedding
                (game state)                   vs. precomputed centroids
```

FastAPI owns game state and central control; the drawing itself never touches a model directly — it's shipped to the backend, which calls out to the Hugging Face endpoint for an embedding, then scores that embedding against precomputed centroids before returning ranked results.

## Repo structure

```text
su26-ai-team-3/
├── frontend/                     # React drawing game UI (Vite + Tailwind)
│   └── src/
│       ├── App.tsx               # Screen routing: landing -> lobby -> game (rounds) -> results
│       ├── api.ts                # Typed fetch wrappers for the backend's /games routes
│       ├── adapters.ts           # Backend game state -> frontend view-model mapping
│       └── components/           # LandingScreen, LobbyScreen, GameScreen, DrawingCanvas,
│                                  # Toolbar, AIGuesserPanel, PlayersPanel, RoundResultsScreen, ResultsScreen
├── backend/                      # FastAPI game server
│   ├── main.py                   # /games lifecycle endpoints (create, join, start, predict, end-round)
│   ├── hf_inference.py           # Calls the Hugging Face inference endpoint for embeddings
│   ├── scoring.py                # Embedding <-> centroid cosine similarity scoring
│   ├── data/schema.json          # Shape of the game state object
│   ├── .env.template              # HF_ENDPOINT_URL / HF_API_TOKEN template (copy to .env)
│   └── requirements.txt          # Backend-only deps (fastapi, uvicorn, numpy, requests, python-dotenv, ...)
├── baselines/
│   ├── knn/                      # k-NN baseline notebooks (one per category)
│   └── simplecnn/                # Per-category CNN training notebooks + Gradio demos + architecture notes
├── data/
│   ├── categories/               # One .txt file per category listing its 15 subcategories
│   ├── base_drawings/            # Reference "good"/"bad" drawings per subcategory
│   └── centroids/                # Precomputed centroid embeddings (.npz), 1/5/10-sample variants
└── requirements.txt               # ML stack (torch, scikit-learn, quickdraw, ...)
```

## Data conventions

Categories: **animals**, **food**, **objects**, **sports** — 15 classes each.

| File               | Convention                                                                                          | Description                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Category list      | `data/categories/<category>.txt`                                                                  | All 15 subcategories for a category, comma-separated                       |
| Reference drawings | `data/base_drawings/<category>/<subitem>_good.pngdata/base_drawings/<category>/<subitem>_bad.png` | Example "good" and "bad" drawings for each subcategory                     |
| Centroids          | `data/centroids/<category>_<n>.npz`                                                               | One centroid embedding per class, computed from`n` ∈ {1, 5, 10} samples |

`backend/scoring.py` normalizes across a few different `.npz` layouts (different notebooks saved centroids slightly differently), so a category's centroid file can use any of: `{"centroid"/"centroids": (N, dim), "categories": (N,)}`, `{"centroids": (N*k, dim)}` grouped by word order with no explicit labels, or one array per word keyed by the word itself.

## Roadmap

- [X] Settle on idea
- [X] Baseline models (k-NN, simple CNN per category)
- [X] Drawing canvas with pixel extraction
- [X] Full frontend flow (landing, lobby, rounds, results)
- [X] Backend game/lobby lifecycle (`/games`, `/join`, `/start`, `/predict`, `/end-round`)
- [X] Train + validate per-category embeddings and centroids
- [X] Wire real model inference into `/games/{id}/predict` via a Hugging Face inference endpoint
- [X] Cosine-similarity scoring against centroids (`scoring.py`)
- [X] LAN / tunnel support for local multiplayer demos
- [ ] Persistent (non-anonymous) tunnel / real deployment
- [ ] Live multi-round scoreboard polish
- [ ] Repeat and improve model accuracy across categories
- [ ] MORE TBD
