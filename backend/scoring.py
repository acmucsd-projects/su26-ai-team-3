import numpy as np
from pathlib import Path

# @ Nghi

# Navigate and load correct centroid files
CENTROID_DIR = (Path(__file__).resolve().parent.parent / "data" / "centroids")

# Return correct centroids as np array
def load_centroids(category):

    centroid_path = CENTROID_DIR / f"{category}_1.npz"

    if not centroid_path.exists():
        raise FileNotFoundError(
            f"No centroid file found for category '{category}'"
        )

    with np.load(centroid_path) as data:
        labels = [str(label) for label in data["categories"]]
        centroids = np.asarray(data["centroid"], dtype=np.float32)

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