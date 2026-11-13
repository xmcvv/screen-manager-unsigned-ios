import { router } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Icon } from '../../components/Icon';
import { Screen } from '../../components/Screen';
import { Sparkline } from '../../components/Sparkline';
import { Card, KeyValue, SectionHeader } from '../../components/UI';
import { useScreenManager } from '../../state/ScreenManagerProvider';
import { colors, radii, spacing } from '../../theme';

export default function TelemetryScreen() {
  const { width } = useWindowDimensions();
  const { telemetry, status, history, connection } = useScreenManager();
  const chartWidth = Math.max(240, width - spacing.lg * 2 - spacing.lg * 2);
  const speeds = history.length
    ? history.map((point) => point.speed)
    : [18, 25, 31, 42, 49, 46, 53, 62, 68, 61];
  const powers = history.length
    ? history.map((point) => point.power)
    : [0.7, 0.82, 1.1, 1.38, 1.2, 1.65, 1.48, 1.72, 1.9, 1.46];
  const voltage = history.length
    ? history.map((point) => point.voltage)
    : [79.6, 79.5, 79.3, 79.1, 79, 78.9, 78.8, 78.7, 78.6, 78.4];
  const memPct = status.system.memoryTotalKb
    ? (100 * (status.system.memoryUsedKb ?? 0)) /
      status.system.memoryTotalKb
    : 0;
  const storagePct = status.system.storageTotalKb
    ? (100 * (status.system.storageTotalKb - (status.system.storageFreeKb ?? 0))) /
      status.system.storageTotalKb
    : 0;

  return (
    <Screen
      eyebrow={connection === 'online' ? 'LIVE TELEMETRY' : 'LAST KNOWN'}
      title="车辆状态"
      headerRight={
        <Pressable
          accessibilityRole="button"
          style={styles.iconButton}
          onPress={() => router.push('/settings')}
        >
          <Icon name="settings" size={21} color={colors.text} />
        </Pressable>
      }
    >
      <Card style={styles.speedCard}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.overline}>实时车速</Text>
            <View style={styles.speedRow}>
              <Text style={styles.speed}>
                {telemetry.speedKph.toFixed(0)}
              </Text>
              <Text style={styles.speedUnit}>km/h</Text>
            </View>
          </View>
          <View style={styles.gear}>
            <Text style={styles.gearText}>
              {['P', 'R', 'N', 'D'][telemetry.gear] ?? 'D'}
            </Text>
          </View>
        </View>
        <Sparkline values={speeds} width={chartWidth} height={96} />
        <View style={styles.chartMeta}>
          <Text style={styles.chartMetaText}>
            续航 {telemetry.rangeKm.toFixed(0)} km
          </Text>
          <Text style={styles.chartMetaText}>
            里程 {telemetry.odometerKm.toFixed(0)} km
          </Text>
          <Text style={styles.chartMetaText}>
            {['ECO', 'STD', 'SPORT'][telemetry.mode] ?? 'STD'}
          </Text>
        </View>
      </Card>

      <SectionHeader title="动力与电池" />
      <View style={styles.metricGrid}>
        <TelemetryTile
          icon="battery"
          label="电池电量"
          value={`${telemetry.soc}`}
          unit="%"
          color={telemetry.soc < 20 ? colors.red : colors.blue}
        />
        <TelemetryTile
          icon="activity"
          label="输出功率"
          value={telemetry.powerKw.toFixed(1)}
          unit="kW"
          color={colors.mint}
        />
        <TelemetryTile
          icon="gauge"
          label="母线电压"
          value={telemetry.voltage.toFixed(1)}
          unit="V"
          color={colors.text}
        />
        <TelemetryTile
          icon="thermometer"
          label="电机温度"
          value={telemetry.motorTempC.toFixed(1)}
          unit="°C"
          color={
            telemetry.motorTempC >= 80
              ? colors.red
              : telemetry.motorTempC >= 65
                ? colors.amber
                : colors.text
          }
        />
        <TelemetryTile
          icon="activity"
          label="工作电流"
          value={telemetry.currentA.toFixed(1)}
          unit="A"
          color={colors.text}
        />
        <TelemetryTile
          icon="shield"
          label="电池健康"
          value={`${telemetry.soh}`}
          unit="%"
          color={colors.mint}
        />
      </View>

      <SectionHeader title="趋势" />
      <Card>
        <View style={styles.trendHeader}>
          <Text style={styles.trendTitle}>功率变化</Text>
          <Text style={styles.trendValue}>
            {telemetry.powerKw.toFixed(1)} kW
          </Text>
        </View>
        <Sparkline
          values={powers}
          width={chartWidth}
          height={72}
          color={colors.amber}
        />
        <View style={styles.trendSpacer} />
        <View style={styles.trendHeader}>
          <Text style={styles.trendTitle}>电池电压</Text>
          <Text style={styles.trendValue}>
            {telemetry.voltage.toFixed(1)} V
          </Text>
        </View>
        <Sparkline
          values={voltage}
          width={chartWidth}
          height={62}
          color={colors.blue}
        />
      </Card>

      <SectionHeader title="主控状态" />
      <Card>
        <KeyValue
          label="CPU 负载"
          value={`${Math.round(status.system.cpuPct ?? 0)}%`}
        />
        <View style={styles.separator} />
        <KeyValue
          label="内存占用"
          value={`${Math.round(memPct)}%`}
        />
        <View style={styles.separator} />
        <KeyValue
          label="板载存储"
          value={`${Math.round(storagePct)}%`}
        />
        <View style={styles.separator} />
        <KeyValue
          label="主控温度"
          value={
            status.system.temperatureC == null
              ? '--'
              : `${status.system.temperatureC.toFixed(1)} °C`
          }
          valueColor={
            (status.system.temperatureC ?? 0) >= 75
              ? colors.amber
              : colors.text
          }
        />
        <View style={styles.separator} />
        <KeyValue
          label="P4 链路"
          value={
            status.links.p4.state === 'online' ? '稳定' : '等待连接'
          }
          valueColor={
            status.links.p4.state === 'online'
              ? colors.mint
              : colors.amber
          }
        />
      </Card>

      {telemetry.alert > 0 ? (
        <Card style={styles.alert}>
          <Icon name="warning" size={20} color={colors.red} />
          <View style={styles.alertCopy}>
            <Text style={styles.alertTitle}>车辆告警</Text>
            <Text style={styles.alertText}>
              {telemetry.message || '检测到需要处理的车辆状态'}
            </Text>
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

function TelemetryTile({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: 'battery' | 'activity' | 'gauge' | 'thermometer' | 'shield';
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <Card style={styles.tile}>
      <View style={styles.tileTop}>
        <Icon name={icon} size={17} color={color} />
        <Text style={styles.tileLabel}>{label}</Text>
      </View>
      <View style={styles.tileValueRow}>
        <Text style={styles.tileValue}>{value}</Text>
        <Text style={styles.tileUnit}>{unit}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedCard: { paddingBottom: spacing.sm },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  overline: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  speed: {
    color: colors.text,
    fontSize: 70,
    lineHeight: 78,
    fontWeight: '300',
    letterSpacing: -3.5,
  },
  speedUnit: {
    color: colors.textTertiary,
    fontSize: 13,
    marginLeft: spacing.sm,
    marginBottom: 12,
    fontWeight: '600',
  },
  gear: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.mintSoft,
    borderWidth: 1,
    borderColor: 'rgba(100,230,196,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearText: {
    color: colors.mint,
    fontSize: 18,
    fontWeight: '800',
  },
  chartMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  chartMetaText: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: '48.2%',
    padding: spacing.md,
    borderRadius: radii.medium,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  tileLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  tileValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: spacing.md,
  },
  tileValue: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  tileUnit: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  trendTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  trendValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  trendSpacer: { height: spacing.lg },
  separator: { height: 1, backgroundColor: colors.lineSoft },
  alert: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderColor: 'rgba(255,116,116,0.32)',
    backgroundColor: colors.redSoft,
  },
  alertCopy: { flex: 1 },
  alertTitle: {
    color: colors.red,
    fontWeight: '700',
    fontSize: 13,
  },
  alertText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
});
