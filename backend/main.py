from fastapi import FastAPI, HTTPException              # backend framework, interactions with frontend
from fastapi.middleware.cors import CORSMiddleware      # allow front/backend interactions across different ports
from pydantic import BaseModel                          # validate the shape of incoming drawing data
import numpy as np                                      # convert pixel lists to np arrays
import random                                           # for testing and capping cosine calculation
import uuid                                             # generate game ids
from pathlib import Path
from scoring import calculate_score                     # scoring functions for calculating player scores
from hf_inference import get_embedding

# Categories directory containing word prompts for the game
CATEGORIES_DIR = Path(__file__).resolve().parent.parent / "data" / "categories"

def load_prompts_by_category() -> dict[str, list[str]]:
    categories: dict[str, list[str]] = {}
    if CATEGORIES_DIR.exists():
        for category_file in CATEGORIES_DIR.glob("*.txt"):
            category_name = category_file.stem
            text = category_file.read_text(encoding="utf-8")
            words = [w.strip() for w in text.replace("\n", ",").split(",") if w.strip()]
            if words:
                categories[category_name] = words
    return categories

PROMPTS_BY_CATEGORY = load_prompts_by_category()

app = FastAPI()                                         # create backend

app.add_middleware(                                     # allow backend to connect to frontend on port 5173
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Drawing(BaseModel):
    player_name: str
    pixels: list[list[float]]
    width: int = 128
    height: int = 128


games: dict[str, dict] = {}                             # in-memory game store, keyed by game_id

class CreateGame(BaseModel):
    host_name: str

class JoinGame(BaseModel):
    player_name: str


@app.get("/")                                           # just to show backend is running
def home():
    return {"message": "Drawing game backend is running!"}


@app.post("/games")                                     # create a new game/lobby
async def create_game(body: CreateGame):
    game_id = str(uuid.uuid4())[:8]

    games[game_id] = {
        "game_id": game_id,
        "host": body.host_name,
        "status": "waiting",
        "round": 0, # changed to 0 since start_game increments round count by 1
        "max_rounds": 5,
        "category": None,
        "prompt": None,
        "max_similarity": None, # scoring cap
        "players": {
            body.host_name: {"score": None, "total_score": 0 ,"submitted": False} # updated to match schema.json
        }
    }

    return games[game_id]


@app.post("/games/{game_id}/join")                      # join a game
async def join_game(game_id: str, body: JoinGame):
    # TODO: @ Tammy
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")

    game = games[game_id]
    player_name = body.player_name # update player name from JoinGame obj

    if game["status"] != "waiting": # terminate if not waiting for players
        raise HTTPException(
            status_code=400, # 400 = bad request
            detail="Game concluded/in progress, join failed"
        )

    # Check if player in game
    if player_name in game["players"]: # terminate if player name already in player list
        raise HTTPException(
            status_code=400,
            detail="Player already joined"
        )
    # Set player score to 0 and submitted to false
    game["players"][player_name] = {
        "score": None,
        "total_score": 0,
        "submitted": False
    }
    
    
    
    # return the game joined 

    return game


@app.get("/games/{game_id}")                            # get current game state
async def get_game(game_id: str):
    # TODO: @ Tammy
    # return actual game state
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    return games[game_id]

@app.post("/games/{game_id}/start")                     # start the game/round
async def start_game(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found") 

    def pick_random_prompt() -> tuple[str, str]:
        # @Dylan: Pick random category from data/categories/*.txt, then pick random prompt from that category
        if not PROMPTS_BY_CATEGORY:
            raise HTTPException(status_code=500, detail="No prompt categories found")
        category = random.choice(list(PROMPTS_BY_CATEGORY.keys()))
        prompt = random.choice(PROMPTS_BY_CATEGORY[category])
        return category, prompt

    game = games[game_id]

    # TODO: @ Tammy
    # Check if max rounds reached
    if game["round"] >= game["max_rounds"]:
        raise HTTPException(
            status_code=400,
            detail="Max rounds reached"
        )
    # Set game round to +1
    game["max_similarity"] = random.uniform(0.95, 1.00) # randomly cap similarity for downstream normalization
    game["round"] = game["round"]+1 # double check this bit since game starts @ 1

    # Reset players submitted to False
    for player in game["players"]:
        game["players"][player]["submitted"] = False
    # Set category and prompt to random prompt
    category, prompt = pick_random_prompt()
    game["category"] = category
    game["prompt"] = prompt

    game["status"] = "in_progress" # is this line necessary???

    return game


@app.post("/games/{game_id}/predict")                    # send drawing pixels -> model -> calculate score
async def predict(game_id: str, drawings: list[Drawing]):        # take in raw pixel data from frontend as input
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")

    game = games[game_id]

    if game["status"] != "in_progress":
        raise HTTPException(status_code=400, detail="Game is not in progress")

    for drawing in drawings:
        if drawing.player_name not in game["players"]:
            raise HTTPException(status_code=404, detail=f"Player '{drawing.player_name}' not in game")

        image = np.array(drawing.pixels, dtype=np.float32)  # shape (height, width), values 0.0-1.0, ready for inference

        if image.shape != (drawing.height, drawing.width):
            raise HTTPException(status_code=422, detail=f"Expected pixel matrix of shape ({drawing.height}, {drawing.width}), got {image.shape}")

        image = image.reshape(1, drawing.height, drawing.width, 1)  # shape (1, height, width, 1), ready for inference

        embed = get_embeddings(game["category"], image)

        scores = calculate_score(embed, game["category"])  # list of (word, similarity) across the category's centroids
        scores_by_label = dict(scores)
        if game["prompt"] not in scores_by_label:
            raise HTTPException(status_code=500, detail=f"No centroid found for prompt '{game['prompt']}'")

        similarity = scores_by_label[game["prompt"]]
        normalized_score = min(similarity / game["max_similarity"], 1.0) # normalize score based on random max
        game["players"][drawing.player_name]["score"] = normalized_score  # update with normalized similarity score

    # send back prediction to frontend
    return {
        "message": f"Predictions made for game {game_id}"
    }


@app.post("/games/{game_id}/end-round")                 # end round and determine winner
async def end_round(game_id: str, max_rounds: int = 5):
    # is max_rounds parameter redundant?

    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")

    # TODO: @ Tammy
    # Check if max round reached
    game = games[game_id]

    rankscore = []
    for player in game["players"]:
        score = game["players"][player]["score"]
        if score is None:
            continue

        rankscore.append({ "player": player, "score": score})   # for ranking point assignment

        #game["players"][player]["totalscore"] = game["players"][player]["totalscore"]+game["players"][player]["score"]
        #if game["players"][player]["score"] > topscore:
        #    topscore = game["players"][player]["score"]
        #    winner = player
        game["players"][player]["score"] = None
        game["players"][player]["submitted"] = False
    
    rankscore.sort( key=lambda player: player["score"], reverse=True )  # sort from highest to lowest normalized similarity
    count = 3
    for playername in rankscore[:3]: # 1st place = 3pts, 2nd = 2pts, 3rd = 1pt
        player = playername["player"]
        game["players"][player]["total_score"] = game["players"][player]["total_score"] + count
        count = count-1

    for playername in rankscore:        # add 0.5 pts per similarity > 0.5
        player = playername["player"]
        score = playername["score"]
        if score > 0.5:
            game["players"][player]["total_score"] = game["players"][player]["total_score"] + 0.5
                    

    if game["round"] >= game["max_rounds"]:
        game["status"] = "finished" # end game if max rounds reached
    # Post New Score to Players

    return {"message": f"Round ended for game {game_id}", "scores": {
        player: game["players"][player]["total_score"]
        for player in game["players"]
    }, "winner": rankscore[0]["player"] if rankscore else None, # avoid error if no submission received
    "topscore": rankscore[0]["score"] if rankscore else None,
    }

# python -m uvicorn main:app to run backend
