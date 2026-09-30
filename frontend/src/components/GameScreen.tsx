import { useRef, useState, useEffect } from "react";
import Header from "./Header";
import PlayersPanel from "./PlayersPanel";
import AIGuesserPanel from "./AIGuesserPanel";
import DrawingCanvas, { type DrawingCanvasHandle } from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import { predict, endRound, type BackendGame } from "../api";
import { mapPlayersToArray, mapRankings } from "../adapters";
import type { GuesserRanking } from "../types";

const MAX_TIME = 20;
// How long the host waits for slower clients' predictions before ending the round anyway.
const GRACE_MS = 10_000;
// How long everyone gets to look at the AI's guesses before the round ends.
const REVEAL_MS = 2_000;

interface GameScreenProps {
  gameId: string;
  playerName: string;
  isHost: boolean;
  game: BackendGame;
}

export default function GameScreen({ gameId, playerName, isHost, game }: GameScreenProps) {
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [color, setColor] = useState("#1a1a1a");
  const [brushSize, setBrushSize] = useState(6);
  const [timeRemaining, setTimeRemaining] = useState(MAX_TIME);
  const [confidence, setConfidence] = useState(0);
  const [rankings, setRankings] = useState<GuesserRanking[]>([]);
  const [roundScore, setRoundScore] = useState<number | null>(null);
  const [predictDone, setPredictDone] = useState(false);
  const [timerZeroAt, setTimerZeroAt] = useState<number | null>(null);

  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const hasEndedRef = useRef(false);
  const endRoundFiredRef = useRef(false);
  const allSubmittedAtRef = useRef<number | null>(null);
  const lastRoundRef = useRef(game.round);

  // Countdown tick - decrement timeRemaining once per second
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // New round detected via polling -> reset local round state
  useEffect(() => {
    if (game.round !== lastRoundRef.current) {
      lastRoundRef.current = game.round;
      setTimeRemaining(MAX_TIME);
      hasEndedRef.current = false;
      endRoundFiredRef.current = false;
      allSubmittedAtRef.current = null;
      setPredictDone(false);
      setTimerZeroAt(null);
      canvasRef.current?.clear();
      setConfidence(0);
      setRankings([]);
      setRoundScore(null);
    }
  }, [game.round]);

  // Round timer hit 0 -> every client submits its own drawing once, tagged with the
  // round it was drawn for so the backend can reject it if the game has moved on.
  useEffect(() => {
    if (timeRemaining !== 0 || hasEndedRef.current) return;
    hasEndedRef.current = true;
    const roundAtSubmit = game.round;
    setTimerZeroAt(Date.now());

    void (async () => {
      try {
        const pixels = canvasRef.current?.getPixelValues({ normalize: true });
        if (pixels && Array.isArray(pixels[0])) {
          const result = await predict(gameId, [
            {
              player_name: playerName,
              pixels: pixels as number[][],
              width: 128,
              height: 128,
              round: roundAtSubmit,
            },
          ]);
          const mine = result.results.find((r) => r.player_name === playerName);
          if (mine && lastRoundRef.current === roundAtSubmit) {
            setConfidence(Math.round(mine.confidence * 100));
            setRankings(mapRankings(mine.rankings).slice(0, 10));
            setRoundScore(Math.round(mine.score * 100));
          }
        }
      } catch (error) {
        console.error("Error during final predict:", error);
      } finally {
        setPredictDone(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  // Host only: end the round once everyone has submitted, or once the grace window
  // expires. Re-runs on every poll (fresh `game`), but the absolute deadline and the
  // ref guard make that harmless.
  useEffect(() => {
    if (!isHost || !predictDone || timerZeroAt === null) return;
    if (endRoundFiredRef.current || game.status !== "in_progress") return;

    const fire = () => {
      if (endRoundFiredRef.current) return;
      endRoundFiredRef.current = true;
      endRound(gameId).catch((error) => console.error("Error during end-round:", error));
    };

    // Once everyone is in, linger so players can see the AI's verdict before moving on.
    // Deadlines are absolute so re-arming on each poll doesn't push them back.
    const allSubmitted = Object.values(game.players).every((p) => p.submitted);
    if (allSubmitted && allSubmittedAtRef.current === null) {
      allSubmittedAtRef.current = Date.now();
    }
    const deadline =
      allSubmittedAtRef.current !== null
        ? allSubmittedAtRef.current + REVEAL_MS
        : timerZeroAt + GRACE_MS;

    const timeout = setTimeout(fire, Math.max(0, deadline - Date.now()));
    return () => clearTimeout(timeout);
  }, [isHost, predictDone, timerZeroAt, game.players, game.status, gameId]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        round={game.round}
        totalRounds={game.max_rounds}
        word={game.prompt ?? ""}
        timeRemaining={timeRemaining}
        maxTime={MAX_TIME}
      />

      <div className="flex flex-1 overflow-hidden">
        <PlayersPanel players={mapPlayersToArray(game)} />

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
          prompt={game.prompt ?? ""}
          score={roundScore}
          confidence={confidence}
          rankings={rankings}
        />
      </div>
    </div>
  );
}
