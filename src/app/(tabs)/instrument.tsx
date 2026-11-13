import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon } from '../../components/Icon';
import { InstrumentPreview } from '../../components/InstrumentPreview';
import { Button, Card, SectionHeader } from '../../components/UI';
import { Screen } from '../../components/Screen';
import { metricCatalog, metricById } from '../../lib/catalog';
import { useScreenManager } from '../../state/ScreenManagerProvider';
import { colors, radii, spacing } from '../../theme';
import type {
  DashboardConfig,
  InstrumentSlot,
  MetricId,
} from '../../types/api';

export default function InstrumentScreen() {
  const {
    dashboardConfig,
    setDashboardConfig,
    saveDashboardConfig,
    telemetry,
    status,
    connection,
  } = useScreenManager();
  const [draft, setDraft] = useState<DashboardConfig>(dashboardConfig);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    setDraft(dashboardConfig);
  }, [dashboardConfig]);

  const updateSlot = (index: number, slot: InstrumentSlot) => {
    setDraft((current) => ({
      ...current,
      slots: current.slots.map((item, itemIndex) =>
        itemIndex === index ? slot : item,
      ),
    }));
    setMessage(undefined);
  };

  const moveSlot = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.slots.length) return;
    const slots = [...draft.slots];
    [slots[index], slots[target]] = [slots[target], slots[index]];
    setDraft({ ...draft, slots });
    setMessage(undefined);
  };

  const save = async () => {
    setSaving(true);
    setMessage(undefined);
    try {
      await saveDashboardConfig(draft);
      setMessage('已应用到 P4，并保存为开机默认布局');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '布局保存失败',
      );
    } finally {
      setSaving(false);
    }
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(dashboardConfig);

  return (
    <Screen eyebrow="DASHBOARD STUDIO" title="仪表编辑">
      <Card style={styles.previewCard}>
        <InstrumentPreview
          config={draft}
          telemetry={telemetry}
          wifi={status.links.wifi.state}
          usb={status.links.usb.state}
          compact
        />
        <View style={styles.previewFooter}>
          <Text style={styles.previewHint}>
            {connection === 'online'
              ? '当前遥测实时预览'
              : '离线预览 · 连接后可实时应用'}
          </Text>
          <View style={styles.themeToggle}>
            <ThemeOption
              label="深色"
              active={draft.theme === 'night'}
              onPress={() => setDraft({ ...draft, theme: 'night' })}
            />
            <ThemeOption
              label="浅色"
              active={draft.theme === 'day'}
              onPress={() => setDraft({ ...draft, theme: 'day' })}
            />
          </View>
        </View>
      </Card>

      <SectionHeader
        title="六个显示模块"
        action={<Text style={styles.counter}>6 / 6</Text>}
      />
      <Card style={styles.slotList}>
        {draft.slots.map((slot, index) => {
          const metric = metricById[slot.metric];
          return (
            <View key={`${index}-${slot.metric}`}>
              <View style={styles.slotRow}>
                <View style={styles.slotIndex}>
                  <Text style={styles.slotIndexText}>{index + 1}</Text>
                </View>
                <Pressable
                  style={styles.slotCopy}
                  onPress={() => setEditingSlot(index)}
                >
                  <Text
                    style={[
                      styles.slotTitle,
                      !slot.visible ? styles.slotTitleMuted : null,
                    ]}
                  >
                    {metric.name}
                  </Text>
                  <Text style={styles.slotMeta}>
                    {metric.deviceLabel} · {metric.unit}
                  </Text>
                </Pressable>
                <View style={styles.rowActions}>
                  <SmallIconButton
                    icon="arrowUp"
                    disabled={index === 0}
                    onPress={() => moveSlot(index, -1)}
                  />
                  <SmallIconButton
                    icon="arrowDown"
                    disabled={index === draft.slots.length - 1}
                    onPress={() => moveSlot(index, 1)}
                  />
                  <SmallIconButton
                    icon={slot.visible ? 'eye' : 'eyeOff'}
                    color={slot.visible ? colors.text : colors.textTertiary}
                    onPress={() =>
                      updateSlot(index, {
                        ...slot,
                        visible: !slot.visible,
                      })
                    }
                  />
                </View>
              </View>
              {index < draft.slots.length - 1 ? (
                <View style={styles.separator} />
              ) : null}
            </View>
          );
        })}
      </Card>

      <Card style={styles.noteCard}>
        <Icon name="info" size={18} color={colors.blue} />
        <Text style={styles.noteText}>
          同一指标可以出现在多个位置。布局通过独立配置帧下发，P4
          写入 NVS，断电重启后仍会保留。
        </Text>
      </Card>

      {message ? (
        <Text
          style={[
            styles.message,
            {
              color: message.startsWith('已')
                ? colors.mint
                : colors.red,
            },
          ]}
        >
          {message}
        </Text>
      ) : null}

      <Button
        title={dirty ? '应用到仪表' : '布局已同步'}
        icon={dirty ? 'check' : 'shield'}
        loading={saving}
        disabled={!dirty || connection !== 'online'}
        onPress={() => void save()}
        style={styles.saveButton}
      />

      <SlotPicker
        visible={editingSlot != null}
        current={
          editingSlot == null
            ? undefined
            : draft.slots[editingSlot].metric
        }
        onClose={() => setEditingSlot(null)}
        onSelect={(metric) => {
          if (editingSlot == null) return;
          updateSlot(editingSlot, {
            ...draft.slots[editingSlot],
            metric,
          });
          setEditingSlot(null);
        }}
      />
    </Screen>
  );
}

function ThemeOption({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.themeOption, active ? styles.themeOptionActive : null]}
    >
      <Text
        style={[
          styles.themeOptionText,
          active ? styles.themeOptionTextActive : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SmallIconButton({
  icon,
  onPress,
  disabled = false,
  color = colors.textSecondary,
}: {
  icon: 'arrowUp' | 'arrowDown' | 'eye' | 'eyeOff';
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <Pressable
      hitSlop={6}
      disabled={disabled}
      onPress={onPress}
      style={[styles.smallButton, disabled ? styles.smallButtonDisabled : null]}
    >
      <Icon name={icon} size={16} color={color} />
    </Pressable>
  );
}

function SlotPicker({
  visible,
  current,
  onClose,
  onSelect,
}: {
  visible: boolean;
  current?: MetricId;
  onClose: () => void;
  onSelect: (metric: MetricId) => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>选择显示指标</Text>
          <Text style={styles.sheetSubtitle}>
            可在右侧六个位置中任意组合
          </Text>
          <ScrollView
            style={styles.sheetScroll}
            showsVerticalScrollIndicator={false}
          >
            {metricCatalog.map((metric) => (
              <Pressable
                key={metric.id}
                onPress={() => onSelect(metric.id)}
                style={({ pressed }) => [
                  styles.metricOption,
                  pressed ? styles.metricOptionPressed : null,
                ]}
              >
                <View>
                  <Text style={styles.metricOptionName}>{metric.name}</Text>
                  <Text style={styles.metricOptionMeta}>
                    {metric.deviceLabel} · {metric.unit}
                  </Text>
                </View>
                {current === metric.id ? (
                  <Icon name="check" size={20} color={colors.mint} />
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceSoft,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  previewHint: {
    color: colors.textTertiary,
    fontSize: 10,
    flex: 1,
  },
  themeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 9,
    padding: 3,
  },
  themeOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  themeOptionActive: { backgroundColor: colors.surfaceRaised },
  themeOptionText: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  themeOptionTextActive: { color: colors.text },
  counter: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '600',
  },
  slotList: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    gap: spacing.sm,
  },
  slotIndex: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIndexText: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: '800',
  },
  slotCopy: { flex: 1 },
  slotTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  slotTitleMuted: { color: colors.textTertiary },
  slotMeta: {
    color: colors.textTertiary,
    fontSize: 9,
    marginTop: 4,
    letterSpacing: 0.6,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 5,
  },
  smallButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonDisabled: { opacity: 0.22 },
  separator: {
    height: 1,
    backgroundColor: colors.lineSoft,
    marginLeft: 42,
  },
  noteCard: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.blueSoft,
    borderColor: 'rgba(121,168,255,0.18)',
    padding: spacing.md,
  },
  noteText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    flex: 1,
  },
  message: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  saveButton: { marginTop: spacing.md },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 38,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  sheetSubtitle: {
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: 4,
  },
  sheetScroll: { marginTop: spacing.lg },
  metricOption: {
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricOptionPressed: { opacity: 0.6 },
  metricOptionName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  metricOptionMeta: {
    color: colors.textTertiary,
    fontSize: 9,
    letterSpacing: 0.6,
    marginTop: 4,
  },
});
