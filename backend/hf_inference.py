import os
import requests

HF_ENDPOINT_URL = os.environ.get("HF_ENDPOINT_URL", "https://6ab5b07d9ec415b652acb655.endpoints.huggingface.cloud")
HF_API_TOKEN = os.environ.get("HF_API_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
    "Content-Type": "application/json",
}


def get_embeddings(category_set: str, drawings: list[list[list[float]]]) -> list[list[float]]:
    """
    category_set: e.g. "animals", "sports", "food", "objects"
    drawings: list of 2D pixel arrays (each list[list[float]], 0-1 normalized, 128x128)

    Returns: list of embedding vectors (list[list[float]]), one per drawing, same order as input.
    """
    payload = {
        "category_set": category_set,
        "drawings": drawings,
    }

    response = requests.post(HF_ENDPOINT_URL, headers=HEADERS, json=payload, timeout=30)
    response.raise_for_status()

    result = response.json()
    if "error" in result:
        raise RuntimeError(f"HF Inference error: {result['error']}")

    return result["embeddings"]