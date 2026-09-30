import type { Player, GuesserRanking } from "./types";
import type { BackendGame, RankingEntry } from "./api";

export function mapPlayersToArray(game: BackendGame): Player[] {
  return Object.entries(game.players)
    .sort((a, b) => b[1].total_score - a[1].total_score)
    .map(([name, player], index) => ({
      id: name,
      rank: index + 1,
      avatar: name.charAt(0).toUpperCase(),
      name,
      points: player.total_score,
      status:
        game.status !== "in_progress"
          ? "waiting"
          : player.submitted
            ? "guessed"
            : "drawing",
    }));
}

export function mapRankings(rankings: RankingEntry[]): GuesserRanking[] {
  return rankings.map((entry, index) => ({
    rank: index + 1,
    label: entry.label,
    confidence: Math.round(entry.confidence * 100),
  }));
}

export function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
