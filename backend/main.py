from fastapi import FastAPI, HTTPException              # backend framework, interactions with frontend
from fastapi.middleware.cors import CORSMiddleware      # allow front/backend interactions across different ports
from pydantic import BaseModel                          # validate the shape of incoming drawing data
import numpy as np                                      # convert pixel lists to np arrays 
import random                                           # just for testing

app = FastAPI()                                         # create backend

app.add_middleware(                                     # allow backend to connect to frontend on port 5173
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Drawing(BaseModel):                               
    pixels: list[list[float]]                           
    width: int = 128
    height: int = 128

@app.get("/")                                           # just to show backend is running
def home():
    return {"message": "Drawing game backend is running!"}


@app.post("/predict")                                   # prediction component
async def predict(drawing: Drawing):                    # take in raw pixel data from frontend as input
    image = np.array(drawing.pixels, dtype=np.float32)  # shape (height, width), values 0.0-1.0, ready for inference

    if image.shape != (drawing.height, drawing.width):  
        raise HTTPException(status_code=422, detail=f"Expected pixel matrix of shape ({drawing.height}, {drawing.width}), got {image.shape}")

    image = image.reshape(1, drawing.height, drawing.width, 1)  # shape (1, height, width, 1), ready for inference

    score = random.randint(0, 100)                      # Temporary test values
          
    # send back prediction to frontend
    return {
        "prediction": "cat",
        "score": score,
        "message": "Drawing received successfully"
    }

# python -m uvicorn main:app to run backend
