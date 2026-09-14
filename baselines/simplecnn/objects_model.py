import torch
import torch.nn as nn


class SupConObjectCNN(nn.Module):

    def __init__(self, num_classes=15, embedding_size=128):
        super().__init__()

        self.features = nn.Sequential(
            nn.Conv2d(1, 16, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(16, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Flatten()
        )

        self.embedding = nn.Sequential(
            nn.Linear(32 * 32 * 32, embedding_size),
            nn.ReLU()
        )

        self.classifier = nn.Linear(
            embedding_size,
            num_classes
        )

    def get_embedding(self, x):
        return self.embedding(
            self.features(x)
        )

    def forward(self, x):
        embedding = self.get_embedding(x)
        logits = self.classifier(embedding)

        return logits, embedding
