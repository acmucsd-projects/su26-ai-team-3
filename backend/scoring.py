import numpy as np
import pathlib

# @ Nghi

# Navigate and load correct centroid files
# Return correct centroids as np array
def load_centroids(category, centroid_dir):

    centroid_path = centroid_dir / f"{category}.npy"

    if not centroid_path.exists():
        raise FileNotFoundError(f"No centroid file found for category '{category}'")

    centroids = np.load(centroid_path)
    centroids = np.atleast_2d(centroids)

    return centroids


# Take cosine similarity between embedding and centroids
# Return the avg cosine similarity as the score
def calculate_score(embedding, category): 

    embedding = np.asarray(embedding, dtype=np.float32).reshape(-1)

    if embedding.size == 0:
        raise ValueError("Embedding is empty")

    centroids = load_centroids(category, centroid_dir)

    similarities = []
    for centroid in centroids:
        similarity = np.dot(embedding, centroid) / (np.linalg.norm(embedding) * np.linalg.norm(centroid) + 1e-8)
        similarities.append(similarity)

    return float(np.mean(similarities))