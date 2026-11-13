import { StyleSheet, Text, View } from 'react-native';
import { formatMetricValue, metricById } from '../lib/catalog';
import { colors, radii } from '../theme';
import type { DashboardConfig, LinkState, Telemetry } from '../types/api';
import { Icon } from './Icon';
import { Pulse } from './Pulse';

type InstrumentPreviewProps = {
  config: DashboardConfig;
  telemetry: Telemetry;
  wifi: LinkState;
  usb: LinkState;
  compact?: boolean;
};

export function InstrumentPreview({
  config,
  telemetry,
  wifi,
  usb,
  compact = false,
}: InstrumentPreviewProps) {
  const day = config.theme === 'day';
  const palette = day
    ? {
        bg: '#E8E6DF',
        text: '#101210',
        muted: '#5F665F',
        line: 'rgba(15,18,15,0.12)',
        accent: '#137A65',
      }
    : {
        bg: '#030404',
        text: '#F7F8F7',
        muted: '#7D8781',
        line: 'rgba(255,255,255,0.1)',
        accent: '#5EE7C2',
      };
  const speed = Math.round(telemetry.speedKph);
  const gear = ['P', 'R', 'N', 'D'][telemetry.gear] ?? 'D';
  const mode = ['ECO', 'STD', 'SPORT'][telemetry.mode] ?? 'STD';

  return (
    <View
      style={[
        styles.frame,
        {
          backgroundColor: palette.bg,
          borderColor: palette.line,
          borderRadius: compact ? radii.medium : 18,
        },
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.previewTop}>
          <View>
            <Text style={[styles.previewBrand, { color: palette.muted }]}>
              VEHICLE / LIVE
            </Text>
            <Text style={[styles.previewMode, { color: palette.accent }]}>
              {mode}
            </Text>
          </View>
          <View style={styles.previewLinks}>
            <Pulse state={wifi}>
              <Icon
                name="wifi"
                size={compact ? 13 : 15}
                color={
                  wifi === 'online'
                    ? palette.accent
                    : wifi === 'connecting'
                      ? colors.amber
                      : colors.red
                }
              />
            </Pulse>
            <Pulse state={usb}>
              <Icon
                name="usb"
                size={compact ? 13 : 15}
                color={
                  usb === 'online'
                    ? palette.accent
                    : usb === 'connecting'
                      ? colors.amber
                      : colors.red
                }
              />
            </Pulse>
            <View
              style={[
                styles.previewBattery,
                { borderColor: palette.muted },
              ]}
            >
              <View
                style={[
                  styles.previewBatteryFill,
                  {
                    backgroundColor: palette.text,
                    width: `${Math.max(8, telemetry.soc)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.previewSoc, { color: palette.muted }]}>
              {telemetry.soc}%
            </Text>
          </View>
        </View>

        <View style={styles.previewBody}>
          <View style={styles.previewHero}>
            <View style={styles.speedRow}>
              <Text
                style={[
                  styles.previewSpeed,
                  { color: palette.text, fontSize: compact ? 58 : 70 },
                ]}
              >
                {speed}
              </Text>
              <Text style={[styles.previewUnit, { color: palette.muted }]}>
                km/h
              </Text>
            </View>
            <View style={styles.previewMeta}>
              <View
                style={[
                  styles.gearPill,
                  { backgroundColor: `${palette.accent}22` },
                ]}
              >
                <Text style={{ color: palette.accent, fontWeight: '800' }}>
                  {gear}
                </Text>
              </View>
              <Text style={[styles.previewMetaText, { color: palette.muted }]}>
                {telemetry.rangeKm.toFixed(0)} km 续航
              </Text>
              <Text style={[styles.previewMetaText, { color: palette.muted }]}>
                {telemetry.odometerKm.toFixed(0)} km
              </Text>
            </View>
          </View>

          <View style={[styles.previewRail, { borderColor: palette.line }]}>
            {config.slots.map((slot, index) => {
              const metric = metricById[slot.metric];
              return (
                <View
                  key={`${index}-${slot.metric}`}
                  style={[
                    styles.previewMetric,
                    index < config.slots.length - 1
                      ? { borderBottomColor: palette.line, borderBottomWidth: 1 }
                      : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.previewMetricLabel,
                      { color: palette.muted },
                    ]}
                    numberOfLines={1}
                  >
                    {slot.visible ? metric.deviceLabel : '隐藏'}
                  </Text>
                  <View style={styles.previewMetricValueRow}>
                    <Text
                      style={[
                        styles.previewMetricValue,
                        {
                          color: slot.visible ? palette.text : palette.muted,
                        },
                      ]}
                    >
                      {slot.visible
                        ? formatMetricValue(slot, telemetry)
                        : '—'}
                    </Text>
                    <Text
                      style={[
                        styles.previewMetricUnit,
                        { color: palette.muted },
                      ]}
                    >
                      {slot.visible ? metric.unit : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 5 / 3,
    overflow: 'hidden',
    borderWidth: 1,
  },
  inner: {
    flex: 1,
    padding: 15,
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  previewBrand: {
    fontSize: 6,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  previewMode: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  previewLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  previewBattery: {
    width: 24,
    height: 10,
    borderRadius: 2,
    padding: 2,
    borderWidth: 1,
  },
  previewBatteryFill: {
    height: '100%',
    borderRadius: 1,
  },
  previewSoc: {
    fontSize: 7,
    fontWeight: '700',
  },
  previewBody: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
  },
  previewHero: {
    flex: 1.38,
    justifyContent: 'center',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  previewSpeed: {
    lineHeight: 72,
    fontWeight: '300',
    letterSpacing: -5,
  },
  previewUnit: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 7,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  gearPill: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewMetaText: {
    fontSize: 7,
    fontWeight: '600',
  },
  previewRail: {
    width: '39%',
    borderLeftWidth: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  previewMetric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    minHeight: 23,
  },
  previewMetricLabel: {
    fontSize: 5.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
  previewMetricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  previewMetricValue: {
    fontSize: 10,
    fontWeight: '700',
  },
  previewMetricUnit: {
    fontSize: 5,
    fontWeight: '600',
  },
});
