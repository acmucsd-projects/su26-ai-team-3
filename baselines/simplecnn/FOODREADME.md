# FoodCNN Model Architecture

### Input: 128x128 image
### Output: Class prediction from list of food items

### Preprocessing:
- Use transforms package to convert image to 128x128, then to tensor.
### Model Features:
- 4 layers 
	- 2 2D convolutional layers
		- Layer 1: 1 input channel, 32 output channels
		- Layer 2: 32 input channels, 64 output channels
		- Both layers: kernel size 3, padding size 1
	- 2 fully connected/linear layers
		- Layer 1: Embedding layer (65,536 to 128)
		- Layer 2: Classification layer (128 to 15)

### Layer Order:
1. 1st Conv2D layer converts input (1 \* 128 \* 128) to 32 output channels (32 \* 128 \* 128) 
2. ReLU (32 \* 128 \* 128) 
3. Max pooling (2x2) to reduce feature map size (32 \* 64 \* 64) 
4. 2nd Conv2d layer (64 \* 64 \* 64) 
5. ReLU (64 \* 64 \* 64) 
6. Max pooling (2x2) to reduce feature map size (64 \* 32 \* 32) 
7. Flattening matrix (65536)
8. 1st linear embedding layer (128)
9. ReLU (128)
10. Linear classifier (15)

