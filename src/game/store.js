import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_MAX_SCORE, emptyGame, makeId, validatePlayerName } from './logic';

// The single source of truth for the app. It is saved to the device after
// every change, so a game survives the app being closed.
export const useGameStore = create(
  persist(
    (set, get) => ({
      game: emptyGame(),
      maxScore: DEFAULT_MAX_SCORE,

      /** Returns an error message, or null on success. */
      addPlayer: (rawName) => {
        const { game } = get();
        const error = validatePlayerName(game.players, rawName);
        if (error) return error;
        const player = { id: makeId(), name: rawName.trim() };
        set({ game: { ...game, players: [...game.players, player] } });
        return null;
      },

      removePlayer: (playerId) => {
        const { game } = get();
        set({ game: { ...game, players: game.players.filter((p) => p.id !== playerId) } });
      },

      /** scores: { [playerId]: number } — the points each player scored this round. */
      submitRound: (scores) => {
        const { game } = get();
        set({ game: { ...game, rounds: [...game.rounds, { id: makeId(), scores }] } });
      },

      undoLastRound: () => {
        const { game } = get();
        set({ game: { ...game, rounds: game.rounds.slice(0, -1) } });
      },

      /** Clears scores. Keeps the player list when keepPlayers is true (rematch). */
      newGame: ({ keepPlayers = false } = {}) => {
        const { game } = get();
        set({ game: { players: keepPlayers ? game.players : [], rounds: [] } });
      },

      setMaxScore: (maxScore) => set({ maxScore }),
    }),
    {
      name: 'pueblo-game',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ game: state.game, maxScore: state.maxScore }),
    }
  )
);
