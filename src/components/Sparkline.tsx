import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { colors } from '../theme';

export function Sparkline({
  values,
  width = 300,
  height = 78,
  color = colors.mint,
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const safe = values.length > 1 ? values : [0, 0];
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const range = max - min || 1;
  const pad = 6;
  const points = safe.map((value, index) => {
    const x = pad + (index / (safe.length - 1)) * (width - pad * 2);
    const y =
      height - pad - ((value - min) / range) * (height - pad * 2);
    return { x, y };
  });
  const line = points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(' ');
  const area = `${line} L ${points.at(-1)?.x ?? width} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.22" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </SvgGradient>
        </Defs>
        <Path d={area} fill="url(#spark)" />
        <Path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
