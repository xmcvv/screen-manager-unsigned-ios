import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon } from '../../components/Icon';
import { Screen } from '../../components/Screen';
import {
  Button,
  Card,
  EmptyState,
  KeyValue,
  ProgressBar,
  SectionHeader,
} from '../../components/UI';
import { ScreenManagerApi } from '../../lib/api';
import {
  crc32Hex,
  prepareWallpaper,
} from '../../lib/codec';
import { useScreenManager } from '../../state/ScreenManagerProvider';
import { colors, radii, spacing } from '../../theme';
import type { WallpaperPrepared } from '../../types/api';

type ManageMode = 'wallpaper' | 'firmware';

export default function ManageScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<ManageMode>(
    params.mode === 'firmware' ? 'firmware' : 'wallpaper',
  );

  useEffect(() => {
    if (params.mode === 'firmware' || params.mode === 'wallpaper') {
      setMode(params.mode);
    }
  }, [params.mode]);

  return (
    <Screen
      eyebrow="SCREEN OPERATIONS"
      title="内容管理"
      headerRight={
        <Pressable
          accessibilityRole="button"
          style={styles.settings}
          onPress={() => router.push('/settings')}
        >
          <Icon name="settings" size={21} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.segment}>
        <SegmentButton
          icon="image"
          label="仪表壁纸"
          active={mode === 'wallpaper'}
          onPress={() => setMode('wallpaper')}
        />
        <SegmentButton
          icon="shield"
          label="P4 固件"
          active={mode === 'firmware'}
          onPress={() => setMode('firmware')}
        />
      </View>
      {mode === 'wallpaper' ? <WallpaperPanel /> : <FirmwarePanel />}
    </Screen>
  );
}

function WallpaperPanel() {
  const {
    endpoint,
    connection,
    transferProgress,
    updateTransfer,
  } = useScreenManager();
  const [wallpaper, setWallpaper] =
    useState<WallpaperPrepared>();
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>();

  const pickImage = async () => {
    setMessage(undefined);
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage('需要相册访问权限才能选择壁纸。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      exif: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setProcessing(true);
    try {
      const prepared = await prepareWallpaper(
        asset.uri,
        asset.width,
        asset.height,
      );
      setWallpaper(prepared);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '图片处理失败',
      );
    } finally {
      setProcessing(false);
    }
  };

  const upload = async () => {
    if (!wallpaper) return;
    setUploading(true);
    setMessage(undefined);
    updateTransfer(0);
    try {
      const result = await new ScreenManagerApi(
        endpoint,
      ).uploadWallpaper(wallpaper, updateTransfer);
      setMessage(
        result.ok
          ? '壁纸已写入 P4，并立即刷新到仪表。'
          : '上传完成，但 P4 未确认写入。',
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '壁纸上传失败',
      );
    } finally {
      setUploading(false);
      setTimeout(() => updateTransfer(0), 900);
    }
  };

  return (
    <>
      <Card style={styles.mediaCard}>
        {wallpaper ? (
          <View style={styles.wallpaperPreview}>
            <Image
              source={{ uri: wallpaper.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View style={styles.previewShade} />
            <View style={styles.previewLabel}>
              <Text style={styles.previewLabelText}>800 × 480 / RGB565</Text>
            </View>
          </View>
        ) : (
          <View style={styles.wallpaperPlaceholder}>
            <View style={styles.placeholderIcon}>
              <Icon name="image" size={30} color={colors.mint} />
            </View>
            <Text style={styles.placeholderTitle}>选择一张图片</Text>
            <Text style={styles.placeholderBody}>
              应用会自动居中裁剪、缩放并转换为仪表可直读格式。
            </Text>
          </View>
        )}
      </Card>

      {wallpaper ? (
        <Card style={styles.fileInfo}>
          <KeyValue label="分辨率" value="800 × 480" />
          <View style={styles.separator} />
          <KeyValue
            label="像素数据"
            value={`${(wallpaper.bytes.length / 1024).toFixed(0)} KB`}
          />
          <View style={styles.separator} />
          <KeyValue
            label="CRC32"
            value={crc32Hex(wallpaper.crc32)}
            valueColor={colors.mint}
          />
        </Card>
      ) : null}

      {uploading || (transferProgress ?? 0) > 0 ? (
        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {uploading
                ? (transferProgress ?? 0) >= 0.99
                  ? 'P4 正在擦除并写入，约 60–90 秒'
                  : '正在传输到 P4'
                : '写入完成'}
            </Text>
            <Text style={styles.progressValue}>
              {Math.round((transferProgress ?? 0) * 100)}%
            </Text>
          </View>
          <ProgressBar progress={transferProgress ?? 0} />
        </View>
      ) : null}

      {message ? <Message text={message} /> : null}

      <View style={styles.buttonRow}>
        <Button
          title={wallpaper ? '重新选择' : '选择壁纸'}
          icon="image"
          variant="secondary"
          loading={processing}
          onPress={() => void pickImage()}
          style={styles.flexButton}
        />
        <Button
          title="应用到仪表"
          icon="upload"
          loading={uploading}
          disabled={!wallpaper || connection !== 'online'}
          onPress={() => void upload()}
          style={styles.flexButton}
        />
      </View>

      <SectionHeader title="处理说明" />
      <Card>
        <FlowStep
          number="01"
          title="自动裁切"
          body="保持 5:3 比例，居中裁掉多余区域，不拉伸画面。"
        />
        <View style={styles.separator} />
        <FlowStep
          number="02"
          title="本地转换"
          body="在手机上完成 RGB565 转换与 CRC32 计算，减少 P4 工作。"
        />
        <View style={styles.separator} />
        <FlowStep
          number="03"
          title="校验后切换"
          body="P4 写入独立壁纸分区，CRC 一致才热重载，坏图不会黑屏。"
        />
      </Card>
    </>
  );
}

type FirmwareFile = {
  uri: string;
  name: string;
  size: number;
  md5: string;
};

function FirmwarePanel() {
  const {
    endpoint,
    connection,
    status,
    transferProgress,
    updateTransfer,
    refresh,
  } = useScreenManager();
  const [firmware, setFirmware] = useState<FirmwareFile>();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>();

  const pickFirmware = async () => {
    setMessage(undefined);
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/octet-stream', 'application/x-binary', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    try {
      const file = new FileSystem.File(asset.uri);
      const info = file.info();
      const md5 = await file.digest('MD5');
      setFirmware({
        uri: asset.uri,
        name: asset.name,
        size: info.size ?? asset.size ?? 0,
        md5,
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '固件文件读取失败',
      );
    }
  };

  const startUpload = () => {
    if (!firmware) return;
    Alert.alert(
      '开始升级 P4 固件？',
      '升级期间仪表会短暂黑屏并自动重启。请保持手机与车机连接，不要断电。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认升级',
          style: 'destructive',
          onPress: () => void uploadFirmware(),
        },
      ],
    );
  };

  const uploadFirmware = async () => {
    if (!firmware) return;
    setUploading(true);
    setMessage(undefined);
    updateTransfer(0);
    try {
      const result = await new ScreenManagerApi(
        endpoint,
      ).uploadFirmware(firmware.uri, updateTransfer);
      setMessage(
        result.ok
          ? '固件校验通过，P4 正在切换分区并重启。'
          : 'P4 未确认升级完成。',
      );
      if (result.ok) {
        setTimeout(() => void refresh(true), 9000);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '固件升级失败',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Card style={styles.firmwareHero}>
        <View style={styles.firmwareIcon}>
          <Icon name="chip" size={30} color={colors.blue} />
        </View>
        <View style={styles.firmwareHeroCopy}>
          <Text style={styles.firmwareTitle}>ESP32-P4 显示固件</Text>
          <Text style={styles.firmwareSubtitle}>
            {status.device.firmware || '版本信息将在连接后显示'}
          </Text>
        </View>
        <View style={styles.versionPill}>
          <Text style={styles.versionText}>
            {connection === 'online' ? '可升级' : '离线'}
          </Text>
        </View>
      </Card>

      <SectionHeader title="本地固件包" />
      <Card style={firmware ? undefined : styles.emptyCard}>
        {firmware ? (
          <>
            <View style={styles.fileHeading}>
              <View style={styles.fileIcon}>
                <Icon name="shield" size={20} color={colors.mint} />
              </View>
              <View style={styles.fileCopy}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {firmware.name}
                </Text>
                <Text style={styles.fileSize}>
                  {(firmware.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => setFirmware(undefined)}
              >
                <Icon name="trash" size={19} color={colors.textTertiary} />
              </Pressable>
            </View>
            <View style={styles.separator} />
            <KeyValue
              label="MD5"
              value={firmware.md5.toUpperCase()}
              valueColor={colors.mint}
            />
            <View style={styles.separator} />
            <KeyValue label="目标" value="P4 OTA 备用分区" />
          </>
        ) : (
          <EmptyState
            icon="shield"
            title="尚未选择固件"
            body="支持 sd5580_link.bin。选择后会先在手机端计算 MD5。"
          />
        )}
      </Card>

      {uploading || (transferProgress ?? 0) > 0 ? (
        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {uploading ? '正在写入固件' : '传输完成'}
            </Text>
            <Text style={styles.progressValue}>
              {Math.round((transferProgress ?? 0) * 100)}%
            </Text>
          </View>
          <ProgressBar progress={transferProgress ?? 0} />
        </View>
      ) : null}

      {message ? <Message text={message} /> : null}

      <View style={styles.buttonRow}>
        <Button
          title="选择固件"
          icon="manage"
          variant="secondary"
          onPress={() => void pickFirmware()}
          style={styles.flexButton}
        />
        <Button
          title="升级 P4"
          icon="upload"
          loading={uploading}
          disabled={!firmware || connection !== 'online'}
          onPress={startUpload}
          style={styles.flexButton}
        />
      </View>

      <Card style={styles.warningCard}>
        <Icon name="warning" size={19} color={colors.amber} />
        <View style={styles.warningCopy}>
          <Text style={styles.warningTitle}>升级前请确认供电稳定</Text>
          <Text style={styles.warningText}>
            P4 会先完整接收并校验镜像，再切换启动分区。校验失败时不会切换，
            但升级过程中不要强制关闭电源。
          </Text>
        </View>
      </Card>
    </>
  );
}

function SegmentButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: 'image' | 'shield';
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segmentButton, active ? styles.segmentActive : null]}
    >
      <Icon
        name={icon}
        size={18}
        color={active ? colors.background : colors.textSecondary}
      />
      <Text
        style={[
          styles.segmentLabel,
          active ? styles.segmentLabelActive : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FlowStep({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.flowStep}>
      <Text style={styles.flowNumber}>{number}</Text>
      <View style={styles.flowCopy}>
        <Text style={styles.flowTitle}>{title}</Text>
        <Text style={styles.flowBody}>{body}</Text>
      </View>
    </View>
  );
}

function Message({ text }: { text: string }) {
  const success =
    text.includes('已') ||
    text.includes('完成') ||
    text.includes('通过');
  return (
    <View
      style={[
        styles.messageBox,
        {
          backgroundColor: success ? colors.mintSoft : colors.redSoft,
          borderColor: success
            ? 'rgba(100,230,196,0.25)'
            : 'rgba(255,116,116,0.25)',
        },
      ]}
    >
      <Icon
        name={success ? 'check' : 'warning'}
        size={17}
        color={success ? colors.mint : colors.red}
      />
      <Text
        style={[
          styles.messageText,
          { color: success ? colors.mint : colors.red },
        ]}
      >
        {text}
      </Text>
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
  segment: {
    padding: 4,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  segmentButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },
  segmentActive: { backgroundColor: colors.mint },
  segmentLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  segmentLabelActive: { color: colors.background },
  mediaCard: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceSoft,
  },
  wallpaperPreview: {
    width: '100%',
    aspectRatio: 5 / 3,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  previewShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  previewLabel: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(4,6,7,0.72)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  previewLabelText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  wallpaperPlaceholder: {
    aspectRatio: 5 / 3,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.xl,
  },
  placeholderIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.mintSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  placeholderBody: {
    color: colors.textTertiary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 260,
  },
  fileInfo: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  flexButton: { flex: 1, paddingHorizontal: 10 },
  separator: {
    height: 1,
    backgroundColor: colors.lineSoft,
    marginVertical: 3,
  },
  progressBlock: { marginTop: spacing.md },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  progressValue: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: '700',
  },
  flowStep: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  flowNumber: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    width: 26,
    paddingTop: 2,
  },
  flowCopy: { flex: 1 },
  flowTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  flowBody: {
    color: colors.textTertiary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  firmwareHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  firmwareIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firmwareHeroCopy: { flex: 1 },
  firmwareTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  firmwareSubtitle: {
    color: colors.textTertiary,
    fontSize: 10,
    marginTop: 4,
  },
  versionPill: {
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  versionText: {
    color: colors.mint,
    fontSize: 9,
    fontWeight: '700',
  },
  emptyCard: { paddingVertical: spacing.xs },
  fileHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.mintSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileCopy: { flex: 1 },
  fileName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  fileSize: {
    color: colors.textTertiary,
    fontSize: 10,
    marginTop: 3,
  },
  warningCard: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.amberSoft,
    borderColor: 'rgba(243,201,105,0.23)',
  },
  warningCopy: { flex: 1 },
  warningTitle: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '700',
  },
  warningText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  messageBox: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  messageText: {
    fontSize: 11,
    lineHeight: 17,
    flex: 1,
  },
});
