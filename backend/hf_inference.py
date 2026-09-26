import os
import requests

HF_ENDPOINT_URL = os.environ.get("HF_ENDPOINT_URL", "https://your-endpoint-url.endpoints.huggingface.cloud")
HF_API_TOKEN = os.environ.get("HF_API_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
    "Content-Type": "application/json",
}


def get_embedding(category: str, image) -> list[float]:
    """
    Calls the HF Inference Endpoint for a single drawing.

    category: broad category_set, e.g. "animals", "sports", "food", "objects"
    image: numpy array or nested list, shape (1, height, width, 1)

    Returns: embedding vector as a list of floats.
    """
    payload = {
        "category": category,
        "image": image.tolist() if hasattr(image, "tolist") else image,
    }

    response = requests.post(HF_ENDPOINT_URL, headers=HEADERS, json=payload, timeout=30)
    response.raise_for_status()

    result = response.json()
    if "error" in result:
        raise RuntimeError(f"HF Inference error: {result['error']}")

    return result["embedding"]