import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { Button, Card, KeyValue, SectionHeader } from '../components/UI';
import { ScreenManagerApi, normalizeBaseUrl } from '../lib/api';
import { useScreenManager } from '../state/ScreenManagerProvider';
import { colors, radii, spacing } from '../theme';

export default function SettingsScreen() {
  const {
    endpoint,
    setEndpoint,
    refresh,
    connection,
    status,
    lastError,
  } = useScreenManager();
  const [address, setAddress] = useState(endpoint);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    setAddress(endpoint);
  }, [endpoint]);

  const save = async () => {
    setTesting(true);
    setMessage(undefined);
    const normalized = normalizeBaseUrl(address);
    try {
      await new ScreenManagerApi(normalized).snapshot();
      await setEndpoint(normalized);
      setMessage('连接成功，地址已保存。');
      await refresh(false);
    } catch (error) {
      await setEndpoint(normalized);
      setMessage(
        error instanceof Error
          ? `暂时无法连接：${error.message}`
          : '暂时无法连接车机。',
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <Screen
      eyebrow="CONNECTION & DEVICE"
      title="连接设置"
      headerRight={
        <Pressable
          accessibilityLabel="关闭设置"
          style={styles.close}
          onPress={() => router.back()}
        >
          <Icon name="chevronLeft" size={22} color={colors.text} />
        </Pressable>
      }
    >
      <Card>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>车机管理地址</Text>
          <View style={styles.liveState}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    connection === 'online'
                      ? colors.mint
                      : connection === 'connecting'
                        ? colors.amber
                        : colors.red,
                },
              ]}
            />
            <Text
              style={[
                styles.liveText,
                {
                  color:
                    connection === 'online'
                      ? colors.mint
                      : connection === 'connecting'
                        ? colors.amber
                        : colors.red,
                },
              ]}
            >
              {connection === 'online'
                ? '在线'
                : connection === 'connecting'
                  ? '连接中'
                  : '离线'}
            </Text>
          </View>
        </View>
        <TextInput
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.4.1:8080"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          selectionColor={colors.mint}
        />
        <Text style={styles.fieldHelp}>
          车机热点默认地址为 192.168.4.1，管理服务端口 8080。
        </Text>
        {message ? (
          <Text
            style={[
              styles.message,
              {
                color: message.startsWith('连接成功')
                  ? colors.mint
                  : colors.red,
              },
            ]}
          >
            {message}
          </Text>
        ) : null}
        {lastError && !message ? (
          <Text style={[styles.message, { color: colors.red }]}>
            最近错误：{lastError}
          </Text>
        ) : null}
        <Button
          title="测试并保存"
          icon="wifi"
          loading={testing}
          onPress={() => void save()}
          style={styles.save}
        />
      </Card>

      <SectionHeader title="连接方式" />
      <Card style={styles.guideCard}>
        <GuideStep
          number="01"
          title="打开手机 Wi-Fi"
          body="连接车机热点 SD5580-CARPLAY。首次连接后无需重复手动点选。"
        />
        <View style={styles.line} />
        <GuideStep
          number="02"
          title="返回车屏管家"
          body="App 会自动探测 192.168.4.1:8080，并恢复实时遥测。"
        />
        <View style={styles.line} />
        <GuideStep
          number="03"
          title="保留无线 CarPlay"
          body="管理数据与 CarPlay 共用无线网络；P4 图像仍走高速 USB 内网。"
        />
      </Card>

      <SectionHeader title="设备信息" />
      <Card style={styles.infoCard}>
        <KeyValue label="设备名称" value={status.device.name} />
        <View style={styles.line} />
        <KeyValue label="显示板" value={status.device.model} />
        <View style={styles.line} />
        <KeyValue
          label="P4 固件"
          value={status.device.firmware || '--'}
        />
        <View style={styles.line} />
        <KeyValue label="API" value={`v${status.apiVersion}`} />
        <View style={styles.line} />
        <KeyValue
          label="蓝牙管理"
          value="未启用 · 使用本地 Wi-Fi"
          valueColor={colors.textSecondary}
        />
      </Card>

      <Card style={styles.privacy}>
        <Icon name="shield" size={20} color={colors.mint} />
        <View style={styles.privacyCopy}>
          <Text style={styles.privacyTitle}>本地直连，不经过云端</Text>
          <Text style={styles.privacyText}>
            壁纸、仪表配置、遥测和固件均只在手机与车机本地网络之间传输。
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

function GuideStep({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepNumber}>{number}</Text>
      <View style={styles.stepCopy}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  close: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  liveState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 10, fontWeight: '700' },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    fontSize: 14,
  },
  fieldHelp: {
    color: colors.textTertiary,
    fontSize: 10,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  message: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  save: { marginTop: spacing.md },
  guideCard: { paddingVertical: spacing.sm },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  stepNumber: {
    width: 28,
    color: colors.mint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingTop: 2,
  },
  stepCopy: { flex: 1 },
  stepTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  stepBody: {
    color: colors.textTertiary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  line: { height: 1, backgroundColor: colors.lineSoft },
  infoCard: { paddingVertical: spacing.sm },
  privacy: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.mintSoft,
    borderColor: 'rgba(100,230,196,0.19)',
  },
  privacyCopy: { flex: 1 },
  privacyTitle: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: '700',
  },
  privacyText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
});
