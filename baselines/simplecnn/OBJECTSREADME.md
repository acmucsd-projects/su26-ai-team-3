## Objects SupCon CNN Architecture

- **Input:** 128 x 128 grayscale image
- **Conv Block 1:** Conv2D (1 -> 16 channels, 3x3 kernel, padding=1) + ReLU + 2x2 MaxPool
- **Conv Block 2:** Conv2D (16 -> 32 channels, 3x3 kernel, padding=1) + ReLU + 2x2 MaxPool
- **Flatten:** 32 x 32 x 32 = 32,768 features
- **Embedding Layer:** Linear (32,768 -> 128) + ReLU
- **Embedding:** 128-dimensional feature vector
- **Classifier:** Linear (128 -> 15 classes)

### Training

The model is trained using:
- **Supervised Contrastive Loss** to improve separation between class embeddings
- **Cross-Entropy Loss** for classification

The learned 128-dimensional embeddings are also used for cosine-similarity scoring against class centroids.
