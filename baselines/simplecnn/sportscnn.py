import torch
import torch.nn as nn
import torch.nn.functional as F

class SportsCNN(nn.Module):
    
    def __init__(self, num_classes: int = 15, img_size: int = 128, embedding_dim: int = 128):
        super().__init__()
        self.num_classes = num_classes
        self.img_size = img_size
        self.embedding_dim = embedding_dim

        # Layer 1: conv -> relu -> pool (1 channel -> 16 channels, spatial size halved)
        self.conv1 = nn.Conv2d(in_channels=1, out_channels=16, kernel_size=3, padding=1)
        # Layer 2: conv -> relu -> pool (16 channels -> 32 channels, spatial size halved again)
        self.conv2 = nn.Conv2d(in_channels=16, out_channels=32, kernel_size=3, padding=1)

        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

        # After 2 pooling layers with stride 2, spatial dimensions are img_size / 4
        final_size = img_size // 4
        flat_size = 32 * final_size * final_size

        self.embed = nn.Linear(flat_size, embedding_dim)
        self.fc = nn.Linear(embedding_dim, num_classes)

    def forward(self, x: torch.Tensor, return_embedding: bool = False):
        x = self.pool(F.relu(self.conv1(x)))   # (B, 16, size/2, size/2)
        x = self.pool(F.relu(self.conv2(x)))   # (B, 32, size/4, size/4)
        x = x.flatten(1)                        # flatten everything except batch dim
        emb = F.relu(self.embed(x))             # (B, embedding_dim)
        logits = self.fc(emb)                   # (B, num_classes)
        if return_embedding:
            return logits, emb
        return logits
