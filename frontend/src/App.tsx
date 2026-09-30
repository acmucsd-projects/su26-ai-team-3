import { useState, useEffect } from "react";
import LandingScreen from "./components/LandingScreen";
import LobbyScreen from "./components/LobbyScreen";
import GameScreen from "./components/GameScreen";
import RoundResultsScreen from "./components/RoundResultsScreen";
import ResultsScreen from "./components/ResultsScreen";
import { createGame, joinGame, getGame, startGame, ApiError, type BackendGame } from "./api";
import { toErrorMessage } from "./adapters";

function App() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [game, setGame] = useState<BackendGame | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Poll game state while a game is joined, regardless of phase
  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const g = await getGame(gameId);
        if (!cancelled) setGame(g);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          if (!cancelled) {
            setGameId(null);
            setPlayerName(null);
            setGame(null);
            setIsHost(false);
            setJoinError("Game session lost — it may no longer exist. Please create or join again.");
          }
        } else {
          console.error("Error polling game state:", error);
        }
      }
    };

    poll();
    const interval = setInterval(poll, 1500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [gameId]);

  const handleCreate = async (hostName: string) => {
    setJoinError(null);
    setIsSubmitting(true);
    try {
      const g = await createGame(hostName);
      setGame(g);
      setGameId(g.game_id);
      setPlayerName(hostName);
      setIsHost(true);
    } catch (error) {
      setJoinError(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (code: string, name: string) => {
    setJoinError(null);
    setIsSubmitting(true);
    try {
      const g = await joinGame(code, name);
      setGame(g);
      setGameId(code);
      setPlayerName(name);
      setIsHost(false);
    } catch (error) {
      setJoinError(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStart = async () => {
    if (!gameId) return;
    setIsStarting(true);
    try {
      setGame(await startGame(gameId));
    } catch (error) {
      console.error("Error starting game:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeave = () => {
    setGameId(null);
    setPlayerName(null);
    setGame(null);
    setIsHost(false);
    setJoinError(null);
  };

  if (!gameId || !playerName || !game) {
    return (
      <LandingScreen
        onCreate={handleCreate}
        onJoin={handleJoin}
        error={joinError}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (game.status === "waiting") {
    return (
      <LobbyScreen
        game={game}
        playerName={playerName}
        isHost={isHost}
        onStart={handleStart}
        isStarting={isStarting}
      />
    );
  }

  if (game.status === "in_progress") {
    return <GameScreen gameId={gameId} playerName={playerName} isHost={isHost} game={game} />;
  }

  if (game.status === "round_over") {
    return <RoundResultsScreen game={game} isHost={isHost} onStartNext={handleStart} />;
  }

  return <ResultsScreen game={game} playerName={playerName} onLeave={handleLeave} />;
}

export default App;
