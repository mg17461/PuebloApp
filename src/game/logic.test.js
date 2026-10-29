import {
  history,
  parseMaxScore,
  parseScoreInput,
  playersAtMax,
  standings,
  totals,
  validatePlayerName,
} from './logic';

const players = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Beto' },
];

describe('totals and standings', () => {
  it('sums rounds and treats a missed round as 0', () => {
    const game = { players, rounds: [{ scores: { a: 5, b: 3 } }, { scores: { a: 2 } }] };
    expect(totals(game)).toEqual({ a: 7, b: 3 });
    expect(standings(game).map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('gives a player added mid-game 0 for earlier rounds', () => {
    const game = {
      players: [...players, { id: 'c', name: 'Caro' }],
      rounds: [{ scores: { a: 5, b: 3 } }, { scores: { a: 1, b: 1, c: 4 } }],
    };
    expect(totals(game)).toEqual({ a: 6, b: 4, c: 4 });
  });

  it('ignores scores of removed players', () => {
    const game = { players: [players[0]], rounds: [{ scores: { a: 5, b: 30 } }] };
    expect(totals(game)).toEqual({ a: 5 });
  });

  it('handles negative scores', () => {
    const game = { players, rounds: [{ scores: { a: 10, b: 0 } }, { scores: { a: -4, b: 2 } }] };
    expect(totals(game)).toEqual({ a: 6, b: 2 });
  });
});

describe('history', () => {
  it('returns running totals per round', () => {
    const game = { players, rounds: [{ scores: { a: 5, b: 3 } }, { scores: { a: 2, b: 1 } }] };
    expect(history(game).map((h) => h.totals)).toEqual([
      { a: 5, b: 3 },
      { a: 7, b: 4 },
    ]);
  });
});

describe('playersAtMax', () => {
  it('lists every player at or over the max, highest first', () => {
    const game = { players, rounds: [{ scores: { a: 50, b: 55 } }] };
    expect(playersAtMax(game, 50).map((p) => p.id)).toEqual(['b', 'a']);
    expect(playersAtMax(game, 60)).toEqual([]);
  });
});

describe('input parsing', () => {
  it('validates player names', () => {
    expect(validatePlayerName(players, '  ')).not.toBeNull();
    expect(validatePlayerName(players, ' ana ')).not.toBeNull();
    expect(validatePlayerName(players, 'Caro')).toBeNull();
  });

  it('parses score input', () => {
    expect(parseScoreInput('')).toBeNull();
    expect(parseScoreInput(undefined)).toBeNull();
    expect(parseScoreInput('12')).toBe(12);
    expect(parseScoreInput('1.2')).toBe(12);
  });

  it('only accepts a positive whole max score', () => {
    expect(parseMaxScore('')).toBeNull();
    expect(parseMaxScore('0')).toBeNull();
    expect(parseMaxScore('abc')).toBeNull();
    expect(parseMaxScore('2.5')).toBeNull();
    expect(parseMaxScore('100')).toBe(100);
  });
});

describe('dealer', () => {
  const { dealerFor } = require('./logic');
  const three = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }];
  const rounds = (n) => Array.from({ length: n }, () => ({ scores: {} }));

  it('starts with the first player and moves one seat per round', () => {
    expect(dealerFor({ players: three, rounds: rounds(0) })).toBe('a');
    expect(dealerFor({ players: three, rounds: rounds(1) })).toBe('b');
    expect(dealerFor({ players: three, rounds: rounds(3) })).toBe('a');
  });

  it('follows a chosen dealer, and goes back on undo', () => {
    const game = { players: three, rounds: rounds(2), dealerStart: { playerId: 'c', round: 2 } };
    expect(dealerFor(game)).toBe('c');
    expect(dealerFor({ ...game, rounds: rounds(3) })).toBe('a');
    expect(dealerFor({ ...game, rounds: rounds(1) })).toBe('b');
  });

  it('copes with the starting dealer being removed', () => {
    expect(dealerFor({ players: three, rounds: rounds(1), dealerStart: { playerId: 'zz', round: 0 } })).toBe('b');
    expect(dealerFor({ players: [], rounds: [] })).toBeNull();
  });
});

describe('stats', () => {
  const { gameRecord, playerStats } = require('./logic');
  const game = { id: 'g1', players, rounds: [{ scores: { a: 50, b: 20 } }] };

  it('records the winner and final standings', () => {
    const record = gameRecord(game, 50, 1);
    expect(record).toMatchObject({ id: 'g1', winnerName: 'Ana', rounds: 1 });
    expect(record.results).toEqual([{ name: 'Ana', total: 50 }, { name: 'Beto', total: 20 }]);
  });

  it('adds up wins and averages by name', () => {
    const r1 = gameRecord(game, 50);
    const r2 = { ...r1, id: 'g2', winnerName: 'beto', results: [{ name: 'beto', total: 60 }, { name: 'ANA', total: 10 }] };
    const stats = playerStats([r1, r2]);
    expect(stats.map((s) => [s.name, s.played, s.wins, s.average])).toEqual([
      ['Ana', 2, 1, 30],
      ['Beto', 2, 1, 40],
    ]);
  });
});
