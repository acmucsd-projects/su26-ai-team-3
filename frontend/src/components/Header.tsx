interface HeaderProps {
  round: number;
  totalRounds: number;
  word: string;
  timeRemaining: number;
  maxTime: number;
}

export default function Header({ round, totalRounds, word, timeRemaining, maxTime }: HeaderProps) {
  const timePct = Math.max(0, Math.min(100, (timeRemaining / maxTime) * 100));

  return (
    <header className="flex items-center justify-between border-b-2 border-dashed border-border px-8 py-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-2xl font-bold text-ink">
          <span>✏️</span>
          <span>doodle.io</span>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-8 rounded-full ${
                i < round ? "bg-ink-soft" : "bg-paper-dark"
              }`}
            />
          ))}
        </div>
        <span className="text-ink-soft">
          {round}/{totalRounds}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-xs tracking-[0.2em] text-ink-soft">DRAW THIS WORD</span>
        <span className="text-3xl font-bold underline decoration-2 underline-offset-4">
          {word}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-2.5 w-40 overflow-hidden rounded-full bg-paper-dark">
          <div
            className="h-full rounded-full bg-accent-orange transition-all"
            style={{ width: `${timePct}%` }}
          />
        </div>
        <span className="text-2xl font-bold text-accent-orange">{timeRemaining}</span>
      </div>
    </header>
  );
}
