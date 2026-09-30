import type { GuesserRanking } from "../types";

interface AIGuesserPanelProps {
  prompt: string;
  score: number | null;
  confidence: number;
  rankings: GuesserRanking[];
}

export default function AIGuesserPanel({ prompt, score, confidence, rankings }: AIGuesserPanelProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l-2 border-dashed border-border px-5 py-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <div className="flex flex-col leading-tight">
          <span className="text-xl font-bold">AI</span>
          <span className="text-xl font-bold">Guesser</span>
        </div>
      </div>

      {prompt && (
        <div className="mb-4 flex items-center justify-between rounded-xl border-2 border-dashed border-accent-green bg-accent-green/10 px-4 py-2">
          <div className="flex flex-col leading-tight">
            <span className="text-xs tracking-[0.15em] text-ink-soft">PROMPT</span>
            <span className="font-bold text-accent-green">{prompt}</span>
          </div>
          <div className="flex flex-col items-end leading-tight">
            <span className="text-xs tracking-[0.15em] text-ink-soft">YOUR SCORE</span>
            <span className="text-xl font-bold text-accent-green">
              {score === null ? "—" : `${score}%`}
            </span>
          </div>
        </div>
      )}

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

      <ul className="flex flex-col gap-2.5">
        {rankings.map((r) => {
          const isCorrect = r.label === prompt;
          return (
            <li
              key={r.rank}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 ${
                isCorrect
                  ? "-mx-2 border-2 border-dashed border-accent-green bg-accent-green/10 font-bold text-accent-green"
                  : ""
              }`}
            >
              <span className={`w-6 text-sm ${isCorrect ? "text-accent-green" : "text-ink-soft"}`}>
                #{r.rank}
              </span>
              <span className={`flex-1 ${isCorrect ? "text-accent-green" : "text-ink"}`}>
                {r.label}
                {isCorrect && <span className="ml-1">✓</span>}
              </span>
              <span
                className={`text-sm font-bold ${
                  isCorrect || r.confidence >= 80 ? "text-accent-green" : "text-ink-soft"
                }`}
              >
                {r.confidence}%
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-auto pt-6 text-center text-xs italic text-ink-soft">
        The AI scores your drawing
        <br />
        when the timer runs out.
      </p>
    </aside>
  );
}
