import type { BackendGame } from "../api";
import { mapPlayersToArray } from "../adapters";
import PlayersPanel from "./PlayersPanel";

interface LobbyScreenProps {
  game: BackendGame;
  playerName: string;
  isHost: boolean;
  onStart: () => void;
  isStarting: boolean;
}

export default function LobbyScreen({ game, isHost, onStart, isStarting }: LobbyScreenProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 px-8">
      <div className="flex items-center gap-2 text-3xl font-bold text-ink">
        <span>✏️</span>
        <span>crAIyons</span>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-border bg-panel px-8 py-4">
        <span className="text-xs tracking-[0.2em] text-ink-soft">GAME CODE</span>
        <span className="text-3xl font-bold tracking-widest">{game.game_id}</span>
      </div>

      <div className="w-72">
        <PlayersPanel players={mapPlayersToArray(game)} />
      </div>

      {isHost ? (
        <button
          onClick={onStart}
          disabled={isStarting}
          className="rounded-lg border-2 border-dashed border-accent-orange px-6 py-2.5 text-lg font-bold text-accent-orange disabled:opacity-40"
        >
          {isStarting ? "Starting..." : "Start Game"}
        </button>
      ) : (
        <span className="text-ink-soft">Waiting for host to start…</span>
      )}
    </div>
  );
}
