import { useMemo } from "react";
import type { BackendGame } from "../api";
import { mapPlayersToArray } from "../adapters";
import type { Player } from "../types";

const CONFETTI_COLORS = ["#e8823c", "#3f8f5f", "#f2c14e", "#d95f5f", "#5b8dd9", "#cdbb9c"];
const CONFETTI_COUNT = 90;

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  duration: number;
  delay: number;
  size: number;
  round: boolean;
}

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    duration: 3 + Math.random() * 3,
    // Negative delay so the sky is already full of confetti on first paint
    delay: -Math.random() * 6,
    size: 6 + Math.random() * 8,
    round: Math.random() < 0.3,
  }));
}

const PODIUM = [
  { place: 1, height: "h-28", medal: "🥇", delay: "0ms" },
  { place: 2, height: "h-20", medal: "🥈", delay: "150ms" },
  { place: 3, height: "h-14", medal: "🥉", delay: "300ms" },
] as const;

interface ResultsScreenProps {
  game: BackendGame;
  playerName: string;
  onLeave: () => void;
}

export default function ResultsScreen({ game, playerName, onLeave }: ResultsScreenProps) {
  const players = mapPlayersToArray(game);
  const winner = players[0];
  const confetti = useMemo(() => makeConfetti(), []);

  // Display order 2nd - 1st - 3rd so the winner stands in the middle
  const podium = [PODIUM[1], PODIUM[0], PODIUM[2]]
    .map((slot) => ({ ...slot, player: players[slot.place - 1] as Player | undefined }))
    .filter((slot) => slot.player);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center gap-6 overflow-hidden px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={{
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.round ? piece.size : piece.size * 1.6,
              backgroundColor: piece.color,
              borderRadius: piece.round ? "50%" : 2,
              animationDuration: `${piece.duration}s`,
              animationDelay: `${piece.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="pop-in flex items-center gap-2 text-4xl font-bold text-ink">
        <span>🏁</span>
        <span>Game Over</span>
      </div>

      {winner && (
        <div className="pop-in flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-accent-green bg-accent-green/10 px-10 py-4">
          <span className="text-xs tracking-[0.2em] text-ink-soft">
            {winner.name === playerName ? "YOU WIN!" : "WINNER"}
          </span>
          <span className="text-3xl font-bold text-accent-green">
            🏆 {winner.name} — {winner.points.toLocaleString()} pts
          </span>
        </div>
      )}

      <div className="flex items-end gap-4">
        {podium.map((slot) => (
          <div
            key={slot.place}
            className="rise flex w-32 flex-col items-center gap-2"
            style={{ animationDelay: slot.delay }}
          >
            <span className="text-3xl">{slot.medal}</span>
            <span className="max-w-full truncate text-lg font-bold">{slot.player!.name}</span>
            <span className="text-sm text-ink-soft">{slot.player!.points.toLocaleString()} pts</span>
            <div
              className={`flex w-full items-start justify-center rounded-t-xl border-2 border-b-0 border-dashed pt-2 text-2xl font-bold ${slot.height} ${
                slot.place === 1
                  ? "border-accent-orange bg-accent-orange/15 text-accent-orange"
                  : "border-border bg-panel text-ink-soft"
              }`}
            >
              {slot.place}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onLeave}
        className="rise rounded-lg border-2 border-dashed border-accent-orange px-6 py-2.5 text-lg font-bold text-accent-orange"
        style={{ animationDelay: "600ms" }}
      >
        Back to home
      </button>
    </div>
  );
}
