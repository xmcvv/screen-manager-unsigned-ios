import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, shadows, spacing, stateColor, stateLabel } from '../theme';
import type { LinkState } from '../types/api';
import { Icon, type IconName } from './Icon';
import { Pulse } from './Pulse';

export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function LinkBadge({
  icon,
  label,
  state,
  detail,
}: {
  icon: IconName;
  label: string;
  state: LinkState;
  detail?: string;
}) {
  return (
    <View style={styles.linkBadge}>
      <Pulse state={state}>
        <Icon name={icon} size={24} color={stateColor(state)} />
      </Pulse>
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={[styles.linkState, { color: stateColor(state) }]}>
        {detail ?? stateLabel(state)}
      </Text>
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress?: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const color =
    variant === 'primary'
      ? colors.background
      : variant === 'danger'
        ? colors.red
        : colors.text;
  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        styles[`button_${variant}`],
        pressed && !isDisabled ? styles.buttonPressed : null,
        isDisabled ? styles.buttonDisabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} size="small" />
      ) : icon ? (
        <Icon name={icon} size={19} color={color} strokeWidth={2} />
      ) : null}
      <Text style={[styles.buttonText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  color = colors.text,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed ? styles.iconButtonPressed : null,
      ]}
    >
      <Icon name={icon} size={21} color={color} />
    </Pressable>
  );
}

export function KeyValue({
  label,
  value,
  valueColor = colors.text,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.keyValue}>
      <Text style={styles.key}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export function EmptyState({
  icon = 'info',
  title,
  body,
}: {
  icon?: IconName;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={26} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  const normalized = Math.min(1, Math.max(0, progress));
  return (
    <View style={styles.progressTrack}>
      <View
        style={[styles.progressFill, { width: `${normalized * 100}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: spacing.lg,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  linkBadge: {
    flex: 1,
    minWidth: 74,
    alignItems: 'center',
    gap: 6,
  },
  linkLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  linkState: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  button: {
    minHeight: 50,
    borderRadius: 15,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    borderWidth: 1,
  },
  button_primary: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },
  button_secondary: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.line,
  },
  button_danger: {
    backgroundColor: colors.redSoft,
    borderColor: 'rgba(255,116,116,0.34)',
  },
  button_ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.line,
  },
  buttonPressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  buttonDisabled: { opacity: 0.42 },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  iconButtonPressed: { opacity: 0.68 },
  keyValue: {
    minHeight: 38,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  key: { color: colors.textSecondary, fontSize: 13 },
  value: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptyBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.mint,
  },
});
