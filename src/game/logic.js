// Pure scoring logic. No React, no storage — everything here is derived
// from a game: { players: [{ id, name }], rounds: [{ id, scores: { [playerId]: number } }] }

export const DEFAULT_MAX_SCORE = 50;

export function emptyGame() {
  return { players: [], rounds: [] };
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
