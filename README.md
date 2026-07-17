# SU 26 AI Team 3 

Skribl drawing game remake with google's QuickDraw dataset, similar to [Camera-Ready](https://www.mariowiki.com/Camera-Ready) from Mario Party. Title TBD 🤫🤫🤫

# Repo Structure

```
su26-ai-team-3/
    ├── baselines/          notebooks for baseline models
    │   ├── knn/
    │   └── simplecnn/
    ├── categories/         category.txt files with subcategories
    ├── README.md
    └── requirements.txt
```

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
- [ ] baseline models (knn, simple cnn)
- [ ] research CNN architectures 
- [ ] simple drawing canvas
- [ ] train + validate CNN embeddings 
- [ ] backend server 
- [ ] websocket layer 
- [ ] frontend mockup
- MORE TBD