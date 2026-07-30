import { useRef, useState } from "react";
import Header from "./components/Header";
import PlayersPanel from "./components/PlayersPanel";
import AIGuesserPanel from "./components/AIGuesserPanel";
import DrawingCanvas, { type DrawingCanvasHandle } from "./components/DrawingCanvas";
import Toolbar from "./components/Toolbar";
import {
  players,
  guesserRankings,
  currentBestGuess,
  currentConfidence,
  wordToDraw,
  currentRound,
  totalRounds,
  timeRemaining,
} from "./mockData";

function App() {
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [color, setColor] = useState("#1a1a1a");
  const [brushSize, setBrushSize] = useState(6);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

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

        <AIGuesserPanel
          confidence={currentConfidence}
          bestGuess={currentBestGuess}
          rankings={guesserRankings}
        />
      </div>
    </div>
  );
}

export default App;
