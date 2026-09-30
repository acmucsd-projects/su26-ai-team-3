// VITE_API_BASE overrides this for setups where frontend/backend are on
// different hosts (e.g. two separate tunnel URLs). Otherwise derive from
// whatever host the page was loaded from, so plain localhost/LAN usage
// still works with no configuration.
export const API_BASE = import.meta.env.VITE_API_BASE ?? `http://${window.location.hostname}:8000`;

export interface BackendPlayer {
  score: number | null;
  total_score: number;
  submitted: boolean;
}

export interface BackendGame {
  game_id: string;
  host: string;
  status: "waiting" | "in_progress" | "round_over" | "finished";
  round: number;
  max_rounds: number;
  category: string | null;
  prompt: string | null;
  max_similarity: number | null;
  last_round: LastRound | null;
  players: Record<string, BackendPlayer>;
}

export interface LastRound {
  round: number;
  prompt: string;
  category: string;
  scores: Record<string, number | null>;
  winner: string | null;
}

export interface RankingEntry {
  label: string;
  confidence: number;
}

export interface PredictResultItem {
  player_name: string;
  score: number;
  prediction: string;
  confidence: number;
  rankings: RankingEntry[];
}

export interface PredictResponse {
  message: string;
  results: PredictResultItem[];
}

export interface EndRoundResponse {
  message: string;
  scores: Record<string, number>;
  winner: string | null;
  topscore: number | null;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // response had no JSON body; fall back to statusText
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

function jsonInit(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function createGame(hostName: string): Promise<BackendGame> {
  return request<BackendGame>("/games", jsonInit({ host_name: hostName }));
}

export function joinGame(gameId: string, playerName: string): Promise<BackendGame> {
  return request<BackendGame>(`/games/${gameId}/join`, jsonInit({ player_name: playerName }));
}

export function getGame(gameId: string): Promise<BackendGame> {
  return request<BackendGame>(`/games/${gameId}`);
}

export function startGame(gameId: string): Promise<BackendGame> {
  return request<BackendGame>(`/games/${gameId}/start`, { method: "POST" });
}

export interface DrawingPayload {
  player_name: string;
  pixels: number[][];
  width: number;
  height: number;
  round: number;
}

export function predict(gameId: string, drawings: DrawingPayload[]): Promise<PredictResponse> {
  return request<PredictResponse>(`/games/${gameId}/predict`, jsonInit(drawings));
}

export function endRound(gameId: string, maxRounds?: number): Promise<EndRoundResponse> {
  const qs = maxRounds ? `?max_rounds=${maxRounds}` : "";
  return request<EndRoundResponse>(`/games/${gameId}/end-round${qs}`, { method: "POST" });
}
