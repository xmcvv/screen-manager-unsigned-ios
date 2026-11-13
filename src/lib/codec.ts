import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as JPEG from 'jpeg-js';
import type { DashboardConfig, WallpaperPrepared } from '../types/api';
import { defaultDashboardConfig, metricById } from './catalog';

const WALLPAPER_WIDTH = 800;
const WALLPAPER_HEIGHT = 480;
export const WALLPAPER_BYTES =
  WALLPAPER_WIDTH * WALLPAPER_HEIGHT * 2;

export function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function prepareWallpaper(
  sourceUri: string,
  sourceWidth: number,
  sourceHeight: number,
): Promise<WallpaperPrepared> {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = WALLPAPER_WIDTH / WALLPAPER_HEIGHT;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  if (sourceRatio > targetRatio) {
    cropWidth = Math.round(sourceHeight * targetRatio);
  } else if (sourceRatio < targetRatio) {
    cropHeight = Math.round(sourceWidth / targetRatio);
  }

  const result = await ImageManipulator.manipulateAsync(
    sourceUri,
    [
      {
        crop: {
          originX: Math.max(0, Math.round((sourceWidth - cropWidth) / 2)),
          originY: Math.max(0, Math.round((sourceHeight - cropHeight) / 2)),
          width: cropWidth,
          height: cropHeight,
        },
      },
      {
        resize: {
          width: WALLPAPER_WIDTH,
          height: WALLPAPER_HEIGHT,
        },
      },
    ],
    {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  const sourceFile = new FileSystem.File(result.uri);
  const jpegBytes = await sourceFile.bytes();
  const jpegCodec = JPEG as typeof JPEG & {
    default?: typeof JPEG;
  };
  const decoder = jpegCodec.decode ?? jpegCodec.default?.decode;
  if (!decoder) {
    throw new Error('手机端 JPEG 解码器不可用。');
  }
  const decoded = decoder(jpegBytes, {
    useTArray: true,
    formatAsRGBA: true,
  });

  if (
    decoded.width !== WALLPAPER_WIDTH ||
    decoded.height !== WALLPAPER_HEIGHT
  ) {
    throw new Error('壁纸缩放结果异常，请重新选择图片。');
  }

  const rgb565 = new Uint8Array(WALLPAPER_BYTES);
  const pixels = decoded.data;
  let out = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] >> 3;
    const g = pixels[i + 1] >> 2;
    const b = pixels[i + 2] >> 3;
    const value = (r << 11) | (g << 5) | b;
    rgb565[out++] = value & 0xff;
    rgb565[out++] = value >> 8;
  }

  return {
    uri: result.uri,
    bytes: rgb565,
    crc32: crc32(rgb565),
    width: WALLPAPER_WIDTH,
    height: WALLPAPER_HEIGHT,
  };
}

export function encodeDashboardConfig(config: DashboardConfig) {
  const payload = new Uint8Array(9);
  payload[0] = 1;
  payload[1] = config.theme === 'day' ? 1 : 0;
  payload[2] = config.slots.reduce(
    (mask, slot, index) => mask | (slot.visible ? 1 << index : 0),
    0,
  );
  for (let i = 0; i < 6; i += 1) {
    payload[3 + i] = metricById[config.slots[i].metric]?.index ?? i;
  }
  return payload;
}

export function decodeDashboardConfig(payload: Uint8Array): DashboardConfig {
  if (payload.length < 9 || payload[0] !== 1) {
    return defaultDashboardConfig;
  }
  const byIndex = Object.values(metricById).sort((a, b) => a.index - b.index);
  return {
    version: 1,
    theme: payload[1] === 1 ? 'day' : 'night',
    slots: Array.from({ length: 6 }, (_, index) => ({
      metric: byIndex[payload[3 + index]]?.id ?? byIndex[index].id,
      visible: (payload[2] & (1 << index)) !== 0,
    })),
  };
}

export function crc32Hex(value: number) {
  return value.toString(16).padStart(8, '0').toUpperCase();
}
