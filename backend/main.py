from fastapi import FastAPI, UploadFile, File           # backend framework, interactions with frontend
from fastapi.middleware.cors import CORSMiddleware      # allow front/backend interactions across different ports
from PIL import Image                                   # image processing
import io                                               # convert image to PIL-processable format
import random                                           # just for testing

app = FastAPI()                                         # create backend

app.add_middleware(                                     # allow backend to connect to frontend on port 5173
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")                                           # just to show backend is running
def home():
    return {"message": "Drawing game backend is running!"}


@app.post("/predict")                                   # prediction component
async def predict(file: UploadFile = File(...)):        # take in image from frontend as input
    image_data = await file.read()                      # read image

    image = Image.open(io.BytesIO(image_data))          # convert to bytes for PIL processing

    image = image.convert("L")                          # grayscale conversion

    score = random.randint(0, 100)                      # Temporary test values
          
    # send back prediction to frontend
    return {
        "prediction": "cat",
        "score": score,
        "message": "Drawing received successfully"
    }

# python -m uvicorn main:app to run backend