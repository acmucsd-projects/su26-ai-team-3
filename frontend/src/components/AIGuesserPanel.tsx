import type { GuesserRanking } from "../types";

interface AIGuesserPanelProps {
  confidence: number;
  bestGuess: string;
  rankings: GuesserRanking[];
}

export default function AIGuesserPanel({ confidence, bestGuess, rankings }: AIGuesserPanelProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l-2 border-dashed border-border px-5 py-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <div className="flex flex-col leading-tight">
          <span className="text-xl font-bold">AI</span>
          <span className="text-xl font-bold">Guesser</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-ink-soft">confidence</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-dark">
          <div
            className="h-full rounded-full bg-accent-orange"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className="text-sm font-bold">{confidence}%</span>
      </div>

      <div className="mb-5 rounded-xl border-2 border-dashed border-border px-4 py-3 text-center">
        <div className="text-xs tracking-[0.15em] text-ink-soft">CURRENT BEST GUESS</div>
        <div className="mt-1 text-xl font-bold">{bestGuess}</div>
      </div>

      <ul className="flex flex-col gap-2.5">
        {rankings.map((r) => (
          <li key={r.rank} className="flex items-center gap-2">
            <span className="w-6 text-sm text-ink-soft">#{r.rank}</span>
            <span className="flex-1 text-ink">{r.label}</span>
            <span
              className={`text-sm font-bold ${
                r.confidence >= 80 ? "text-accent-green" : "text-ink-soft"
              }`}
            >
              {r.confidence}%
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-6 text-center text-xs italic text-ink-soft">
        AI analyses the canvas every few seconds
        <br />
        and updates its best guess.
      </p>
    </aside>
  );
}
