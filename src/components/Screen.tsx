import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type ScreenProps = PropsWithChildren<{
  title?: string;
  eyebrow?: string;
  headerRight?: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}>;

export function Screen({
  children,
  title,
  eyebrow,
  headerRight,
  scroll = true,
  contentContainerStyle,
}: ScreenProps) {
  const content = (
    <View style={styles.inner}>
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
          </View>
          {headerRight}
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0B1110', colors.background, colors.background]}
        locations={[0, 0.36, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, contentContainerStyle]}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 180,
    top: -190,
    right: -80,
    backgroundColor: 'rgba(100,230,196,0.06)',
  },
  safe: { flex: 1 },
  scroll: {
    paddingBottom: 130,
  },
  inner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerCopy: { flex: 1 },
  eyebrow: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginBottom: 5,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
});
