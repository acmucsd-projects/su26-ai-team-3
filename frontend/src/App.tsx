import { useRef, useState, useEffect } from "react";  // added useEffect in order to run timer for intermittent image submission
import Header from "./components/Header";
import PlayersPanel from "./components/PlayersPanel";
import AIGuesserPanel from "./components/AIGuesserPanel";
import DrawingCanvas, { type DrawingCanvasHandle } from "./components/DrawingCanvas";
import Toolbar from "./components/Toolbar";
import {
  players,
  guesserRankings,
  currentBestGuess, // no more references to these because I wanted to see
  currentConfidence, // dynamic updates of confidence in frontend
  wordToDraw,
  currentRound,
  totalRounds,
  timeRemaining,
} from "./mockData";

function App() {
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [color, setColor] = useState("#1a1a1a");
  const [brushSize, setBrushSize] = useState(6);
  const [prediction, setPrediction] = useState("");     // store prediction category
  const [score, setScore] = useState<number | null>(null); // store prediction score

  const canvasRef = useRef<DrawingCanvasHandle>(null);

  const submitDrawing = async () => { // for sending drawing to backend
  const png = await canvasRef.current?.getPNG(); // retrieves png of canvas

  if (!png) return;

  const formData = new FormData(); // prepare data for sending to backend
  formData.append("file", png, "drawing.png");

  try {   // send picture to bakend
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      body: formData,
    });

    const result = await response.json(); // receive result from backend

    setPrediction(result.prediction); // update prediction 
    setScore(result.score); // update score
  } catch (error) {
    console.error("Error connecting to backend:", error);
  }
};
useEffect(() => { // ever 3 seconds, call submitDrawing to send current canvas to backend
  const interval = setInterval(() => {
    submitDrawing();
  }, 3000);
  return () => clearInterval(interval); // cleanup/stop timer
}, []);
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        round={currentRound}
        totalRounds={totalRounds}
        word={wordToDraw}
        timeRemaining={timeRemaining}
        maxTime={60}
      />

      <div className="flex flex-1 overflow-hidden">
        <PlayersPanel players={players} />

        <main className="flex flex-1 flex-col gap-4 px-8 py-5">
          <div className="min-h-0 flex-1">
            <DrawingCanvas ref={canvasRef} tool={tool} color={color} brushSize={brushSize} />
          </div>
          <Toolbar
            tool={tool}
            onToolChange={setTool}
            color={color}
            onColorChange={setColor}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            onClear={() => canvasRef.current?.clear()}
          />
        </main>

        <AIGuesserPanel // update confidence and bestGuess with results from backend
        confidence={score ?? 0}
        bestGuess={prediction || "Waiting..."}
        rankings={guesserRankings}
        />
      </div>
    </div>
  );
}

export default App;
{/* npm run dev */}