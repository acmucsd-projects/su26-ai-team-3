<div align="center">


# SU26 AI Team 3 — crAIyons

**A [Skribbl](https://skribbl.io)-style drawing game where the AI is the judge** — inspired by [Camera-Ready](https://www.mariowiki.com/Camera-Ready) from Mario Party, powered by Google's [Quick, Draw!](https://quickdraw.withgoogle.com/data) dataset.

[Overview](#overview) • [Getting started](#getting-started) • [How it works](#how-it-works) • [Repo structure](#repo-structure) • [Data conventions](#data-conventions) • [Roadmap](#roadmap)

</div>

## Overview

Each round, players get a prompt and race to draw it before the timer runs out. When time's up, our models score every drawing against the prompt to see who got closest. The project has three moving parts:


| Part | Stack | What it does |
|------|-------|--------------|
| `frontend/` | React 19, TypeScript, Vite, Tailwind CSS 4 | Drawing canvas, toolbar, players panel, and live AI guess panel |
| `backend/` | FastAPI, uvicorn, NumPy | In-memory game/lobby state (create, join, start, end round) plus pixel → embedding → score prediction |
| `baselines/` + `data/` | PyTorch, scikit-learn, quickdraw, Gradio | k-NN and CNN baseline notebooks per category, plus precomputed centroid embeddings |

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
python -m uvicorn main:app --port 8000
```

### Model / notebook work

The ML dependencies (PyTorch, scikit-learn, quickdraw, …) live in the root requirements file:

```bash
pip install -r requirements.txt
```

Then open any notebook under `baselines/knn/` or `baselines/simplecnn/`. Several of the CNN notebooks include a [Gradio](https://gradio.app) demo cell for interactive testing.

## How it works

Games are tracked in an in-memory dict on the backend, keyed by a short `game_id`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/` | Health check |
| `POST` | `/games` | Create a new game/lobby, returns `game_id` |
| `POST` | `/games/{game_id}/join` | Join a game as a named player |
| `GET` | `/games/{game_id}` | Get current game state (round, prompt, players, scores) |
| `POST` | `/games/{game_id}/start` | Start the round (picks a prompt, resets scores) |
| `POST` | `/games/{game_id}/predict` | Submit drawings → embeddings → scores against the prompt |
| `POST` | `/games/{game_id}/end-round` | End the round and advance / determine the winner |

1. **Draw** — `DrawingCanvas` captures pointer strokes on an HTML canvas.
2. **Extract** — the canvas is downsampled to a **128×128 grayscale matrix** (`0.0` = background, `1.0` = full stroke) via `getPixelValues({ normalize: true })`.
3. **Timer hits 0** — the frontend POSTs each player's `{ player_name, pixels, width, height }` to `POST /games/{game_id}/predict`, then calls `POST /games/{game_id}/end-round`.
4. **Inference** — the backend validates the pixel shape, runs it through an embedding model, and scores it against the game's `prompt` via cosine similarity to precomputed centroids (`backend/scoring.py`).
5. **Guess** — updated scores flow back through `GET /games/{game_id}` to the players/guesser panels.


## Repo structure

```text
su26-ai-team-3/
├── frontend/                     # React drawing game UI (Vite + Tailwind)
│   └── src/
│       ├── App.tsx               # Game loop: canvas -> pixels -> /games/{id}/predict -> /games/{id}/end-round
│       └── components/           # DrawingCanvas, Toolbar, AIGuesserPanel, ...
├── backend/                      # FastAPI game server
│   ├── main.py                   # /games lifecycle endpoints (create, join, start, predict, end-round)
│   ├── scoring.py                # Embedding <-> centroid cosine similarity scoring
│   ├── data/schema.json          # Shape of the game state object
│   └── requirements.txt          # Backend-only deps (fastapi, uvicorn, numpy, ...)
├── baselines/
│   ├── knn/                      # k-NN baseline notebooks (one per category)
│   └── simplecnn/                # Simple CNN baseline notebooks + Gradio demos
├── data/
│   ├── categories/               # One .txt file per category listing its subcategories
│   ├── base_drawings/            # Reference "good"/"bad" drawings per subcategory
│   └── centroids/                # Precomputed centroid embeddings (.npz)
└── requirements.txt              # ML stack (torch, scikit-learn, quickdraw, ...)
```

## Data conventions

Categories: **animals**, **food**, **objects**, **sports**.

| File | Convention | Description |
|------|------------|-------------|
| Category list | `data/categories/<category>.txt` | All subcategories for a category, one per line |
| Reference drawings | `data/base_drawings/<category>/<subitem>_good.png`<br>`data/base_drawings/<category>/<subitem>_bad.png` | Example "good" and "bad" drawings for each subcategory |
| Centroids | `data/centroids/<category>_<n>.npz` | One centroid embedding per class, computed from `n` ∈ {1, 5, 10} samples |

Each centroid `.npz` archive stores one NumPy array per category, keyed by category name, with shape `(num_classes, embedding_dim)`.

## Roadmap

- [x] Settle on idea
- [x] Baseline models (k-NN, simple CNN)
- [x] Research CNN architectures
- [x] Drawing canvas with pixel extraction
- [x] Frontend mockup
- [x] Backend server (rough framework)
- [x] Frontend ↔ backend integration (raw pixel pipeline)
- [x] Game/lobby lifecycle endpoints scaffolded (`/games`, `/join`, `/start`, `/predict`, `/end-round`)
- [x] Train + validate embeddings
- [ ] Wire real model inference into `/games/{id}/predict`
- [ ] Implement scoring (cosine similarity against centroids) in `scoring.py`
- [ ] Frontend round timer + `endRound` call sequence
- [ ] Repeat and improve
- [ ] MORE TBD
