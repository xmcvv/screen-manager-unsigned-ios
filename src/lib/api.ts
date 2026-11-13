import * as FileSystem from 'expo-file-system';
import type {
  ApiError,
  DashboardConfig,
  StatusResponse,
  Telemetry,
  WallpaperPrepared,
} from '../types/api';
import {
  decodeDashboardConfig,
  encodeDashboardConfig,
} from './codec';

export type SnapshotResponse = {
  status: StatusResponse;
  telemetry: Telemetry;
  dashboard?: DashboardConfig;
};

function asApiError(error: unknown): ApiError {
  if (error instanceof Error) return error as ApiError;
  return new Error(String(error)) as ApiError;
}

export function normalizeBaseUrl(input: string) {
  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) return 'http://192.168.4.1:8080';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

export class ScreenManagerApi {
  constructor(public readonly baseUrl: string) {}

  private url(path: string) {
    return `${normalizeBaseUrl(this.baseUrl)}${path}`;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    timeoutMs = 5000,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(this.url(path), {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(init.headers ?? {}),
        },
      });
      if (!response.ok) {
        const text = await response.text();
        const error = new Error(
          text || `车机返回 HTTP ${response.status}`,
        ) as ApiError;
        error.status = response.status;
        throw error;
      }
      return (await response.json()) as T;
    } catch (error) {
      throw asApiError(error);
    } finally {
      clearTimeout(timer);
    }
  }

  async snapshot() {
    return this.request<SnapshotResponse>('/api/v1/snapshot');
  }

  async status() {
    return this.request<StatusResponse>('/api/v1/status');
  }

  async telemetry() {
    return this.request<Telemetry>('/api/v1/telemetry');
  }

  async dashboard() {
    const payload = await this.request<unknown>('/api/v1/dashboard');
    if (
      payload &&
      typeof payload === 'object' &&
      'slots' in payload
    ) {
      return payload as DashboardConfig;
    }
    if (typeof payload === 'string') {
      const binary = Uint8Array.from(atob(payload), (char) =>
        char.charCodeAt(0),
      );
      return decodeDashboardConfig(binary);
    }
    throw new Error('仪表配置格式无效');
  }

  async saveDashboard(config: DashboardConfig) {
    return this.request<{ ok: boolean }>('/api/v1/dashboard', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: encodeDashboardConfig(config),
    });
  }

  async uploadWallpaper(
    wallpaper: WallpaperPrepared,
    onProgress?: (progress: number) => void,
  ) {
    const file = new FileSystem.File(
      FileSystem.Paths.cache,
      'screen-manager-wallpaper.rgb565',
    );
    if (!file.exists) file.create();
    await file.write(wallpaper.bytes);

    const upload = file.createUploadTask(
      this.url(
        `/api/v1/wallpaper?crc32=0x${wallpaper.crc32
          .toString(16)
          .padStart(8, '0')}`,
      ),
      {
        httpMethod: 'PUT',
        uploadType: FileSystem.UploadType.BINARY_CONTENT,
        mimeType: 'application/octet-stream',
        headers: {
          'X-Wallpaper-CRC32': `0x${wallpaper.crc32
            .toString(16)
            .padStart(8, '0')}`,
        },
        onProgress: ({ bytesSent, totalBytes }) => {
          onProgress?.(totalBytes ? bytesSent / totalBytes : 0);
        },
      },
    );
    const result = await upload.uploadAsync();
    upload.release();
    if (result.status < 200 || result.status >= 300) {
      throw new Error(result.body || `壁纸上传失败 (${result.status})`);
    }
    onProgress?.(1);
    return JSON.parse(result.body) as { ok: boolean; crc32: string };
  }

  async uploadFirmware(
    uri: string,
    onProgress?: (progress: number) => void,
  ) {
    const file = new FileSystem.File(uri);
    const md5 = await file.digest('MD5');
    const upload = file.createUploadTask(
      this.url(`/api/v1/firmware/p4?md5=${encodeURIComponent(md5)}`),
      {
        httpMethod: 'POST',
        uploadType: FileSystem.UploadType.BINARY_CONTENT,
        mimeType: 'application/octet-stream',
        headers: {
          'X-Firmware-MD5': md5,
        },
        onProgress: ({ bytesSent, totalBytes }) => {
          onProgress?.(totalBytes ? bytesSent / totalBytes : 0);
        },
      },
    );
    const result = await upload.uploadAsync();
    upload.release();
    if (result.status < 200 || result.status >= 300) {
      throw new Error(result.body || `固件上传失败 (${result.status})`);
    }
    onProgress?.(1);
    return JSON.parse(result.body) as {
      ok: boolean;
      md5: string;
      restarting: boolean;
    };
  }

  async rebootP4() {
    return this.request<{ ok: boolean }>('/api/v1/p4/reboot', {
      method: 'POST',
    });
  }
}
