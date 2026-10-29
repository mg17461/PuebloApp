import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { fonts, playerColor, space, type, useTheme } from '../theme';

const HEIGHT = 180;
const PAD = { top: 12, right: 12, bottom: 24, left: 32 };

/**
 * Running totals per player as lines, with the max score as a dashed line.
 * rows: output of history(game); players: [{ id, name }] in join order.
 */
export default function ScoreChart({ rows, players, maxScore }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const allTotals = rows.flatMap((r) => players.map((p) => r.totals[p.id] ?? 0));
  const top = Math.max(maxScore, ...allTotals, 1);
  const bottom = Math.min(0, ...allTotals);
  const plotW = Math.max(1, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (round) => PAD.left + (rows.length === 0 ? 0 : (round / rows.length) * plotW);
  const y = (value) => PAD.top + plotH - ((value - bottom) / (top - bottom)) * plotH;

  const ticks = [bottom, Math.round((top + bottom) / 2), top].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={`Chart of running totals over ${rows.length} rounds`}
    >
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          {ticks.map((v) => (
            <React.Fragment key={v}>
              <Line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke={theme.border} strokeWidth={1} />
              <SvgText x={PAD.left - 8} y={y(v) + 4} fontSize={11} fontFamily={fonts.medium} fill={theme.textTertiary} textAnchor="end">
                {v}
              </SvgText>
            </React.Fragment>
          ))}
          <Line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={y(maxScore)}
            y2={y(maxScore)}
            stroke={theme.danger}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          {[0, rows.length].map((r) => (
            <SvgText key={r} x={x(r)} y={HEIGHT - 6} fontSize={11} fontFamily={fonts.medium} fill={theme.textTertiary} textAnchor="middle">
              {r === 0 ? 'Start' : `R${r}`}
            </SvgText>
          ))}
          {players.map((p, i) => {
            const points = [`${x(0)},${y(0)}`, ...rows.map((r) => `${x(r.round)},${y(r.totals[p.id] ?? 0)}`)].join(' ');
            const lastTotal = rows.length ? rows[rows.length - 1].totals[p.id] ?? 0 : 0;
            return (
              <React.Fragment key={p.id}>
                <Polyline points={points} fill="none" stroke={playerColor(i)} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                <Circle cx={x(rows.length)} cy={y(lastTotal)} r={4} fill={playerColor(i)} />
              </React.Fragment>
            );
          })}
        </Svg>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.sm }}>
        {players.map((p, i) => (
          <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: playerColor(i) }} />
            <Text style={{ ...type.caption, color: theme.textSecondary }}>{p.name}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: theme.danger }} />
          <Text style={{ ...type.caption, color: theme.textSecondary }}>Max {maxScore}</Text>
        </View>
      </View>
    </View>
  );
}
