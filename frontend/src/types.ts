export interface Player {
  id: string;
  rank: number;
  avatar: string;
  name: string;
  points: number;
  status: "drawing" | "guessed" | "waiting";
}

export interface GuesserRanking {
  rank: number;
  label: string;
  confidence: number;
}
