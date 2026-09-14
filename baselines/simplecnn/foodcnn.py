import torch.nn as nn

# define CNN
class FoodCNN(nn.Module):

    def __init__(self):
        super().__init__()
      # 2d convolution layer to process image
        self.conv1 = nn.Conv2d(
            in_channels=1, # grayscale (not color)
            out_channels=32, # 32 features to be detected (arbitrary)
            kernel_size=3, # 3x3 region scanning (arbitrary)
            padding=1 # border to allow for processing of edge elements??? (arbitrary)
        )

        self.conv2 = nn.Conv2d(
            in_channels=32, # prev output 32 features
            out_channels=64,
            kernel_size=3,
            padding=1
        )
        # helps to reduce computational expenses while retaining essential features and no over-dependnig on location
        self.pool = nn.MaxPool2d(2) # reduce feature map size from 16x16 to 8x8 by taking max of 2x2 blocks in feature map, stride 2, kernel size 2 (arbitrary)

        # embedding layer - dim of 128
        self.embedding = nn.Linear(64 * 32 * 32, 128)

        # use extracted features to classify image
        self.fc = nn.Linear(128, 15)

    # forward pass
    def forward(self, x):

        x = self.pool(F.relu(self.conv1(x)))

        x = self.pool(F.relu(self.conv2(x)))

        # convert feature map to vector for fully connected layer processing
        x = torch.flatten(x, 1)

        embedding = F.relu(self.embedding(x))

        result = self.fc(embedding)

        return result, embedding