import type { Player } from "../types";

interface PlayersPanelProps {
  players: Player[];
}

export default function PlayersPanel({ players }: PlayersPanelProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r-2 border-dashed border-border px-5 py-5">
      <h2 className="mb-4 text-xl font-bold">Players ({players.length})</h2>
      <ul className="flex flex-col gap-2.5">
        {players.map((player) => (
          <li
            key={player.id}
            className={`flex items-center gap-3 rounded-xl border-2 border-dashed px-3 py-2.5 ${
              player.status === "drawing"
                ? "border-border bg-paper-dark"
                : player.status === "guessed"
                  ? "border-accent-green/40 bg-accent-green/10"
                  : "border-transparent"
            }`}
          >
            <span className="w-4 text-sm text-ink-soft">{player.rank}</span>
            <span className="text-xl">{player.avatar}</span>
            <div className="flex flex-1 flex-col leading-tight">
              <span className="font-bold">{player.name}</span>
              <span className="text-sm text-ink-soft">{player.points.toLocaleString()} pts</span>
            </div>
            {player.status === "drawing" && <span>✏️</span>}
            {player.status === "guessed" && (
              <span className="font-bold text-accent-green">✓</span>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
