// Pure scoring logic. No React, no storage — everything here is derived
// from a game: { players: [{ id, name }], rounds: [{ id, scores: { [playerId]: number } }] }

export const DEFAULT_MAX_SCORE = 50;

export function emptyGame(players = [], dealerStart = null) {
  return { id: makeId(), players, rounds: [], dealerStart };
}

export function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Returns an error message, or null if the name can be added. */
export function validatePlayerName(players, rawName) {
  const name = rawName.trim();
  if (!name) return 'Please enter a valid name.';
  if (players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    return 'This player already exists.';
  }
  return null;
}

/** Total score per player id. Players who missed a round count as 0 for it. */
export function totals(game) {
  const result = {};
  for (const p of game.players) result[p.id] = 0;
  for (const round of game.rounds) {
    for (const p of game.players) result[p.id] += round.scores[p.id] ?? 0;
  }
  return result;
}

/** Players with their totals, highest first. */
export function standings(game) {
  const t = totals(game);
  return game.players
    .map((p) => ({ ...p, total: t[p.id] }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Running total per player after each round:
 * [{ round: 1, totals: { [playerId]: n }, scores: { [playerId]: n } }, ...]
 */
export function history(game) {
  const running = {};
  for (const p of game.players) running[p.id] = 0;
  return game.rounds.map((round, i) => {
    for (const p of game.players) running[p.id] += round.scores[p.id] ?? 0;
    return { round: i + 1, totals: { ...running }, scores: round.scores };
  });
}

/** Points each player scored in the most recent round, or null before the first round. */
export function lastRoundScores(game) {
  return game.rounds.length ? game.rounds[game.rounds.length - 1].scores : null;
}

/** Players at or over the max score, highest first. Empty if the game isn't over. */
export function playersAtMax(game, maxScore) {
  return standings(game).filter((p) => p.total >= maxScore);
}

/** Turns a text field value into a number, or null if left empty. */
export function parseScoreInput(text) {
  const digits = String(text ?? '').replace(/[^0-9]/g, '');
  return digits === '' ? null : Number(digits);
}

/** Returns a positive whole number, or null if the input isn't one. */
export function parseMaxScore(text) {
  const n = Number(String(text).trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ---- Dealer ----------------------------------------------------------------
// The dealer moves one seat (in player order) each round. dealerStart records
// who dealt at which round: { playerId, round }.

const mod = (n, m) => ((n % m) + m) % m;

/** Id of the player dealing the next round, or null. */
export function dealerFor(game) {
  const n = game.players.length;
  if (n === 0) return null;
  const start = game.dealerStart;
  const startIndex = start ? game.players.findIndex((p) => p.id === start.playerId) : 0;
  const offset = game.rounds.length - (start?.round ?? 0);
  return game.players[mod(Math.max(0, startIndex) + offset, n)].id;
}

// ---- Past games and stats --------------------------------------------------

/** Compact record of a finished game, kept for stats. */
export function gameRecord(game, maxScore, finishedAt = Date.now()) {
  const ranked = standings(game);
  const winner = playersAtMax(game, maxScore)[0] ?? ranked[0];
  return {
    id: game.id,
    finishedAt,
    maxScore,
    rounds: game.rounds.length,
    winnerName: winner?.name ?? null,
    results: ranked.map((p) => ({ name: p.name, total: p.total })),
  };
}

/** Per-player totals across past games, best win rate first. Names are matched case-insensitively. */
export function playerStats(records) {
  const byName = new Map();
  for (const record of records) {
    for (const r of record.results) {
      const key = r.name.toLowerCase();
      const s = byName.get(key) ?? { name: r.name, played: 0, wins: 0, totalPoints: 0 };
      s.played += 1;
      s.totalPoints += r.total;
      if (record.winnerName && record.winnerName.toLowerCase() === key) s.wins += 1;
      byName.set(key, s);
    }
  }
  return [...byName.values()]
    .map((s) => ({ ...s, winRate: s.played ? s.wins / s.played : 0, average: s.played ? s.totalPoints / s.played : 0 }))
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate || a.name.localeCompare(b.name));
}

