import numpy as np
from pathlib import Path

# @ Nghi

# Navigate and load correct centroid files
CENTROID_DIR = (Path(__file__).resolve().parent.parent / "data" / "centroids")
CATEGORIES_DIR = (Path(__file__).resolve().parent.parent / "data" / "categories")


def _category_words(category: str) -> list[str]:
    words_path = CATEGORIES_DIR / f"{category}.txt"
    text = words_path.read_text(encoding="utf-8")
    return [w.strip() for w in text.replace("\n", ",").split(",") if w.strip()]


# Return correct centroids as np array
# Each category's npz was generated with a different layout, so normalize all
# of them here rather than assuming one schema:
#   - {"centroid": (N, dim), "categories": (N,)}
#   - {"centroids": (N, dim) | (N, k, dim), "categories": (N,)}
#   - {"centroids": (N*k, dim)} with no explicit labels (grouped by word order)
#   - one array per word, keyed by the word itself: {word: (k, dim), ...}
def load_centroids(category):

    centroid_path = CENTROID_DIR / f"{category}_1.npz"

    if not centroid_path.exists():
        raise FileNotFoundError(
            f"No centroid file found for category '{category}'"
        )

    with np.load(centroid_path) as data:
        keys = data.files

        if "categories" in keys:
            labels = [str(label) for label in data["categories"]]
            raw = np.asarray(data["centroid" if "centroid" in keys else "centroids"], dtype=np.float32)
            centroids = raw.mean(axis=1) if raw.ndim == 3 else raw

        elif "centroids" in keys:
            labels = _category_words(category)
            raw = np.asarray(data["centroids"], dtype=np.float32)
            centroids = raw.reshape(len(labels), -1, raw.shape[-1]).mean(axis=1)

        else:
            labels = list(keys)
            centroids = np.array([
                np.asarray(data[label], dtype=np.float32).reshape(-1, data[label].shape[-1]).mean(axis=0)
                for label in labels
            ])

    return labels, centroids


# Take cosine similarity between embedding and centroids
# Return all 15 similarity scores as tuples
def calculate_score(embedding, category): 

    embedding = np.asarray(
        embedding,
        dtype=np.float32
    ).reshape(-1)

    if embedding.size == 0:
        raise ValueError("Embedding is empty")

    labels, centroids = load_centroids(category)

    scores = []

    for label, centroid in zip(labels, centroids):

        similarity = np.dot(
            embedding,
            centroid
        ) / (
            np.linalg.norm(embedding)
            * np.linalg.norm(centroid)
            + 1e-8
        )

        scores.append(
            (label, float(similarity))
        )

    return scores