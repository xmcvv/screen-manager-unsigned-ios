import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { InstrumentPreview } from '../../components/InstrumentPreview';
import { Icon } from '../../components/Icon';
import { Pulse } from '../../components/Pulse';
import { Button, Card, LinkBadge, SectionHeader } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { useScreenManager } from '../../state/ScreenManagerProvider';
import {
  colors,
  radii,
  spacing,
  stateColor,
  stateLabel,
} from '../../theme';

export default function HomeScreen() {
  const {
    connection,
    status,
    telemetry,
    dashboardConfig,
    endpoint,
    refresh,
  } = useScreenManager();
  const online = connection === 'online';
  const { links, system } = status;

  return (
    <Screen
      eyebrow="SD5580 / P4"
      title="车屏管家"
      headerRight={
        <PressableSettings />
      }
    >
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <View style={styles.connectionRow}>
              <Pulse state={connection}>
                <View
                  style={[
                    styles.connectionDot,
                    { backgroundColor: stateColor(connection) },
                  ]}
                />
              </Pulse>
              <Text style={[styles.connectionText, { color: stateColor(connection) }]}>
                {online ? '车机在线' : stateLabel(connection)}
              </Text>
            </View>
            <Text style={styles.endpoint}>{endpoint.replace(/^https?:\/\//, '')}</Text>
          </View>
          <Button
            title={online ? '刷新' : '重连'}
            icon="refresh"
            variant="secondary"
            onPress={() => void refresh(false)}
            style={styles.refreshButton}
          />
        </View>

        {!online ? (
          <View style={styles.offlineHint}>
            <Icon name="wifi" size={18} color={colors.amber} />
            <Text style={styles.offlineText}>
              手机连接车机热点 SD5580-CARPLAY 后，可自动发现管理服务。
            </Text>
          </View>
        ) : null}

        <View style={styles.links}>
          <LinkBadge
            icon="wifi"
            label="无线"
            state={links.wifi.state}
            detail={
              links.wifi.rssi == null ? undefined : `${links.wifi.rssi} dBm`
            }
          />
          <LinkBadge
            icon="usb"
            label="高速 USB"
            state={links.usb.state}
            detail={links.usb.ip}
          />
          <LinkBadge icon="chip" label="P4" state={links.p4.state} />
          <LinkBadge
            icon="carplay"
            label="CarPlay"
            state={links.carplay.state}
            detail={
              links.carplay.state === 'online'
                ? '就绪'
                : links.carplay.state === 'connecting'
                  ? '连接中'
                  : '待机'
            }
          />
        </View>
      </Card>

      <SectionHeader
        title="实时仪表"
        action={
          <Text
            onPress={() => router.push('/instrument')}
            style={styles.sectionAction}
          >
            编辑布局
          </Text>
        }
      />
      <Card style={styles.previewCard}>
        <InstrumentPreview
          config={dashboardConfig}
          telemetry={telemetry}
          wifi={links.wifi.state}
          usb={links.usb.state}
        />
      </Card>

      <SectionHeader title="车辆概览" />
      <View style={styles.metricGrid}>
        <QuickMetric
          icon="gauge"
          label="车速"
          value={telemetry.speedKph.toFixed(0)}
          unit="km/h"
          color={colors.mint}
        />
        <QuickMetric
          icon="battery"
          label="电量"
          value={telemetry.soc.toFixed(0)}
          unit="%"
          color={colors.blue}
        />
        <QuickMetric
          icon="activity"
          label="功率"
          value={telemetry.powerKw.toFixed(1)}
          unit="kW"
          color={colors.amber}
        />
        <QuickMetric
          icon="thermometer"
          label="电机"
          value={telemetry.motorTempC.toFixed(0)}
          unit="°C"
          color={colors.text}
        />
      </View>

      <SectionHeader title="快捷操作" />
      <Card style={styles.actions}>
        <ActionRow
          icon="image"
          title="更换仪表壁纸"
          subtitle="自动裁剪为 800 × 480"
          onPress={() => router.push('/manage?mode=wallpaper')}
        />
        <View style={styles.divider} />
        <ActionRow
          icon="shield"
          title="升级 P4 固件"
          subtitle="镜像校验，失败不切换分区"
          onPress={() => router.push('/manage?mode=firmware')}
        />
        <View style={styles.divider} />
        <ActionRow
          icon="activity"
          title="查看性能与诊断"
          subtitle={`CPU ${Math.round(system.cpuPct ?? 0)}% · RAM ${
            system.memoryTotalKb
              ? Math.round(
                  ((system.memoryUsedKb ?? 0) / system.memoryTotalKb) * 100,
                )
              : 0
          }%`}
          onPress={() => router.push('/telemetry')}
        />
      </Card>
    </Screen>
  );
}

function PressableSettings() {
  return (
    <Pressable
      accessibilityRole="button"
      style={styles.settings}
      onPress={() => router.push('/settings')}
    >
      <Icon name="settings" size={21} color={colors.text} />
    </Pressable>
  );
}

function QuickMetric({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: 'gauge' | 'battery' | 'activity' | 'thermometer';
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <Card style={styles.quickMetric}>
      <View style={[styles.quickIcon, { backgroundColor: `${color}16` }]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <View style={styles.quickValueRow}>
        <Text style={styles.quickValue}>{value}</Text>
        <Text style={styles.quickUnit}>{unit}</Text>
      </View>
    </Card>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: 'image' | 'shield' | 'activity';
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <View
      accessibilityRole="button"
      onTouchEnd={onPress}
      style={styles.actionRow}
    >
      <View style={styles.actionIcon}>
        <Icon name={icon} size={20} color={colors.mint} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevronRight" size={18} color={colors.textTertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  settings: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { padding: spacing.lg },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  endpoint: {
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 7,
    letterSpacing: 0.3,
  },
  refreshButton: {
    minHeight: 42,
    paddingHorizontal: 14,
  },
  offlineHint: {
    marginTop: spacing.md,
    borderRadius: radii.medium,
    backgroundColor: colors.amberSoft,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    padding: spacing.sm,
  },
  offlineText: {
    color: colors.amber,
    lineHeight: 18,
    fontSize: 12,
    flex: 1,
  },
  links: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  sectionAction: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: '700',
  },
  previewCard: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceSoft,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickMetric: {
    width: '48.2%',
    padding: spacing.md,
    borderRadius: radii.medium,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  quickLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  quickValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 3,
  },
  quickValue: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  quickUnit: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: { flex: 1 },
  actionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  actionSubtitle: {
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lineSoft,
    marginLeft: 50,
  },
});
