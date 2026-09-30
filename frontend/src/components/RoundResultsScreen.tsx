import { useEffect, useRef, useState } from "react";
import type { BackendGame } from "../api";

const RESULTS_SECONDS = 5;

interface RoundResultsScreenProps {
  game: BackendGame;
  isHost: boolean;
  onStartNext: () => void;
}

export default function RoundResultsScreen({ game, isHost, onStartNext }: RoundResultsScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(RESULTS_SECONDS);
  const startedRef = useRef(false);
  // App re-creates onStartNext on every poll; keep the latest without re-arming the timer.
  const onStartNextRef = useRef(onStartNext);

  useEffect(() => {
    onStartNextRef.current = onStartNext;
  }, [onStartNext]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isHost) return;
    const timeout = setTimeout(() => {
      if (startedRef.current) return;
      startedRef.current = true;
      onStartNextRef.current();
    }, RESULTS_SECONDS * 1000);
    return () => clearTimeout(timeout);
  }, [isHost]);

  const lastRound = game.last_round;
  const roundScores = lastRound
    ? Object.entries(lastRound.scores).sort(([, a], [, b]) => (b ?? -1) - (a ?? -1))
    : [];

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 px-8">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs tracking-[0.2em] text-ink-soft">
          ROUND {lastRound?.round ?? game.round} OF {game.max_rounds}
        </span>
        <span className="text-3xl font-bold underline decoration-2 underline-offset-4">
          {lastRound?.prompt ?? ""}
        </span>
      </div>

      {lastRound?.winner && (
        <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-accent-green bg-accent-green/10 px-8 py-4">
          <span className="text-xs tracking-[0.2em] text-ink-soft">ROUND WINNER</span>
          <span className="text-2xl font-bold text-accent-green">🏆 {lastRound.winner}</span>
        </div>
      )}

      <ul className="flex w-72 flex-col gap-2 rounded-2xl border-2 border-dashed border-border bg-panel px-5 py-4">
        {roundScores.map(([name, score]) => (
          <li
            key={name}
            className={`flex items-center justify-between ${
              name === lastRound?.winner ? "font-bold text-accent-green" : ""
            }`}
          >
            <span>{name}</span>
            <span>{score === null ? "—" : `${Math.round(score * 100)}%`}</span>
          </li>
        ))}
      </ul>

      <span className="text-ink-soft">Next round in {secondsLeft}s…</span>
    </div>
  );
}
