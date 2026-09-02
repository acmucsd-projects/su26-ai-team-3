# SU 26 AI Team 3 

Skribl drawing game remake with google's QuickDraw dataset, similar to [Camera-Ready](https://www.mariowiki.com/Camera-Ready) from Mario Party. Title TBD 🤫🤫🤫

# Repo Structure
```text
su26-ai-team-3/
├── data/
│   ├── categories/              # One .txt file per category containing subcategories
│   │   └── <category>.txt
│   ├── base_drawings/           # Baseline drawings for each subcategory
│   │   └── <category>/
│   │       ├── <subitem>_good.png
│   │       └── <subitem>_bad.png
│   └── centroids/               # Precomputed centroid embeddings
│       ├── category_1.npz
│       ├── category_5.npz
│       └── category_10.npz
├── baselines/
│   ├── knn/                     # k-NN baseline implementation
│   └── simplecnn/               # Simple CNN baseline implementation
├── README.md
└── requirements.txt
```

### Data Naming Conventions

| File | Convention | Description |
|------|------------|-------------|
| Category list | `data/categories/<category>.txt` | Text file containing all subcategories for a category (one per line). |
| Reference drawings | `data/base_drawings/<category>/<subitem>_good.png`<br>`data/base_drawings/<category>/<subitem>_bad.png` | Example "good" and "bad" drawings for each subcategory. |

### Centroid Files

| File | Contents | Shape |
|------|----------|-------|
| `data/centroids/<category_1>.npz` | One centroid embedding per class (computed from 1 sample) | `(num_classes, embedding_dim)` |
| `data/centroids/<category_5>.npz` | One centroid embedding per class (computed from 5 samples) | `(num_classes, embedding_dim)` |
| `data/centroids/<category_10>.npz` | One centroid embedding per class (computed from 10 samples) | `(num_classes, embedding_dim)` |

Each `.npz` archive stores one array per category, where:

| Key | Value |
|-----|-------|
| `<category_name>` | NumPy array of centroid embeddings for that category |

## Requirements

Install dependencies with:
`
pip install -r requirements.txt
`
**Current stack:**
- `quickdraw` — Quick Draw dataset loader
- `scikit-learn` — tools
- `torch` — model training
- `numpy`, `pillow` — image/array handling


## Roadmap
- [x] settle on idea
- [x] baseline models (knn, simple cnn)
- [x] research CNN architectures 
- [x] simple drawing canvas
- [ ] train + validate embeddings 
- [ ] repeat and improve
- [ ] backend server 
- [ ] websocket layer 
- [x] frontend mockup
- MORE TBD