import type { GuesserRanking, Player } from "./types";

export const players: Player[] = [
  { id: "1", rank: 1, avatar: "🦊", name: "sketchking", points: 1240, status: "drawing" },
  { id: "2", rank: 2, avatar: "🐙", name: "drawmaster", points: 980, status: "guessed" },
  { id: "3", rank: 3, avatar: "🐸", name: "artsy_goblin", points: 760, status: "guessed" },
  { id: "4", rank: 4, avatar: "🐼", name: "penelope_q", points: 610, status: "waiting" },
  { id: "5", rank: 5, avatar: "🦋", name: "noodlebrush", points: 540, status: "waiting" },
  { id: "6", rank: 6, avatar: "🦁", name: "zap_wizard", points: 390, status: "waiting" },
];

export const guesserRankings: GuesserRanking[] = [
  { rank: 1, label: "a shape of some kind", confidence: 12 },
  { rank: 2, label: "maybe a building?", confidence: 28 },
  { rank: 3, label: "some tall structure", confidence: 41 },
  { rank: 4, label: "a tower or pillar", confidence: 55 },
  { rank: 5, label: "coastal structure?", confidence: 63 },
  { rank: 6, label: "a tower by water", confidence: 74 },
  { rank: 7, label: "beacon tower", confidence: 82 },
];

export const currentBestGuess = "beacon tower";
export const currentConfidence = 82;
export const wordToDraw = "lighthouse";
export const currentRound = 2;
export const totalRounds = 3;
export const timeRemaining = 27;
