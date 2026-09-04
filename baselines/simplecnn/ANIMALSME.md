# Animals CNN

Sample Size: 3000
Input Image Dimensions: 128x128
Batch Size: 96
Epochs: 96

Current best performance achieved running on CUDA-enabled GPU

**Current Train/Test: 0.76/0.68**

Started from CNN architecture demonstrated here: https://poloclub.github.io/cnn-explainer/

---

[Convolution Layer
GroupNorm
ReLU Activation
Max Pooling] x 3

Adaptive Average Pooling

Flatten

Fully Connected Layer

Dropout

Fully Connected Layer

---

- Three layers of convolution + group norm.
- Switched from BatchNorm to GroupNorm because earlier class sizes created uneven representation across classes, creating unstable stats that eventually made the model collapse to 1/15 (random chance) for test mode.
- Adaptive Average Pooling was added early on while testing for different input sizes, may modify this segment to see if other improvements can be made for embeddings and centroid calculations.
- Embeddings for centroids pulled from first fully connected layer.
