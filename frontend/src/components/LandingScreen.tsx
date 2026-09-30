import { useState } from "react";

interface LandingScreenProps {
  onCreate: (hostName: string) => void;
  onJoin: (gameId: string, playerName: string) => void;
  error: string | null;
  isSubmitting: boolean;
}

export default function LandingScreen({ onCreate, onJoin, error, isSubmitting }: LandingScreenProps) {
  const [hostName, setHostName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 px-8">
      <div className="flex items-center gap-2 text-4xl font-bold text-ink">
        <span>✏️</span>
        <span>crAIyons</span>
      </div>

      {error && (
        <div className="max-w-md rounded-xl border-2 border-dashed border-red-300 bg-red-50 px-4 py-2 text-center text-red-500">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-center gap-6">
        <form
          className="flex w-72 flex-col gap-3 rounded-2xl border-2 border-dashed border-border bg-panel px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (hostName.trim()) onCreate(hostName.trim());
          }}
        >
          <h2 className="text-xl font-bold">Create a game</h2>
          <input
            className="rounded-lg border-2 border-border bg-paper px-3 py-2 text-ink outline-none"
            placeholder="Your name"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSubmitting || !hostName.trim()}
            className="rounded-lg border-2 border-dashed border-accent-orange px-4 py-2 font-bold text-accent-orange disabled:opacity-40"
          >
            Create Game
          </button>
        </form>

        <form
          className="flex w-72 flex-col gap-3 rounded-2xl border-2 border-dashed border-border bg-panel px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (joinCode.trim() && joinName.trim()) onJoin(joinCode.trim(), joinName.trim());
          }}
        >
          <h2 className="text-xl font-bold">Join a game</h2>
          <input
            className="rounded-lg border-2 border-border bg-paper px-3 py-2 text-ink outline-none"
            placeholder="Game code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <input
            className="rounded-lg border-2 border-border bg-paper px-3 py-2 text-ink outline-none"
            placeholder="Your name"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSubmitting || !joinCode.trim() || !joinName.trim()}
            className="rounded-lg border-2 border-dashed border-accent-green px-4 py-2 font-bold text-accent-green disabled:opacity-40"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}
