import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_MAX_SCORE, dealerFor, emptyGame, gameRecord, makeId, validatePlayerName } from './logic';

const ROSTER_LIMIT = 24;
const HISTORY_LIMIT = 200;

// The single source of truth for the app. It is saved to the device after
// every change, so a game survives the app being closed.
export const useGameStore = create(
  persist(
    (set, get) => ({
      game: emptyGame(),
      maxScore: DEFAULT_MAX_SCORE,
      showDealer: true,
      roster: [], // names of players from earlier games, most recent first
      pastGames: [], // finished games, newest first (see gameRecord)

      /** Returns an error message, or null on success. */
      addPlayer: (rawName) => {
        const { game, roster } = get();
        const error = validatePlayerName(game.players, rawName);
        if (error) return error;
        const name = rawName.trim();
        set({
          game: { ...game, players: [...game.players, { id: makeId(), name }] },
          roster: [name, ...roster.filter((n) => n.toLowerCase() !== name.toLowerCase())].slice(0, ROSTER_LIMIT),
        });
        return null;
      },

      removePlayer: (playerId) => {
        const { game } = get();
        set({ game: { ...game, players: game.players.filter((p) => p.id !== playerId) } });
      },

      forgetRosterName: (name) => set({ roster: get().roster.filter((n) => n !== name) }),

      /** scores: { [playerId]: number } — the points each player scored this round. */
      submitRound: (scores) => {
        const { game } = get();
        set({ game: { ...game, rounds: [...game.rounds, { id: makeId(), scores }] } });
      },

      updateRound: (roundId, scores) => {
        const { game } = get();
        set({ game: { ...game, rounds: game.rounds.map((r) => (r.id === roundId ? { ...r, scores } : r)) } });
      },

      deleteRound: (roundId) => {
        const { game } = get();
        set({ game: { ...game, rounds: game.rounds.filter((r) => r.id !== roundId) } });
      },

      undoLastRound: () => {
        const { game } = get();
        set({ game: { ...game, rounds: game.rounds.slice(0, -1) } });
      },

      /** Makes this player deal the next round; later rounds rotate from them. */
      setDealer: (playerId) => {
        const { game } = get();
        set({ game: { ...game, dealerStart: { playerId, round: game.rounds.length } } });
      },

      setShowDealer: (showDealer) => set({ showDealer }),

      /** Saves the current game to past games (replacing an earlier save of the same game). */
      archiveGame: () => {
        const { game, maxScore, pastGames } = get();
        if (game.rounds.length === 0) return;
        const record = gameRecord(game, maxScore);
        set({ pastGames: [record, ...pastGames.filter((g) => g.id !== record.id)].slice(0, HISTORY_LIMIT) });
      },

      clearPastGames: () => set({ pastGames: [] }),

      /** Clears scores. Keeps the player list when keepPlayers is true (rematch). */
      newGame: ({ keepPlayers = false } = {}) => {
        const { game } = get();
        if (!keepPlayers) {
          set({ game: emptyGame() });
          return;
        }
        // For a rematch the deal carries on from whoever was due next.
        const next = dealerFor(game);
        set({ game: emptyGame(game.players, next ? { playerId: next, round: 0 } : null) });
      },

      setMaxScore: (maxScore) => set({ maxScore }),
    }),
    {
      name: 'pueblo-game',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        game: s.game,
        maxScore: s.maxScore,
        showDealer: s.showDealer,
        roster: s.roster,
        pastGames: s.pastGames,
      }),
      // Version 1 (app 1.1 before this change) had no game id, roster or history.
      migrate: (state, version) => {
        if (version < 2) {
          const game = state?.game ?? emptyGame();
          return {
            ...state,
            game: { id: makeId(), dealerStart: null, ...game },
            showDealer: true,
            roster: (game.players ?? []).map((p) => p.name),
            pastGames: [],
          };
        }
        return state;
      },
    }
  )
);
