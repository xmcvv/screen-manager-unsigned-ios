import * as FileSystem from 'expo-file-system';
import type {
  ApiError,
  DashboardConfig,
  StatusResponse,
  Telemetry,
  TransferInfo,
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

type TransferStatusResponse = {
  ok: boolean;
  transfer: TransferInfo;
};

type TransferAccepted = {
  ok: boolean;
  accepted?: boolean;
  id?: number;
  kind?: string;
  state?: string;
};

function asApiError(error: unknown): ApiError {
  if (error instanceof Error) return error as ApiError;
  return new Error(String(error)) as ApiError;
}

function friendlyTransferError(error: unknown, action: string) {
  const message =
    error instanceof Error ? error.message : String(error);
  if (/abort|timed?\s*out|timeout/i.test(message)) {
    return new Error(
      `${action}超时。车机可能正在写入 P4，请稍后重试。`,
    );
  }
  if (/network request failed|unable to upload|socket/i.test(message)) {
    return new Error(
      `${action}时网络中断，请确认仍连接 SD5580-CARPLAY 后重试。`,
    );
  }
  return new Error(
    message || `${action}失败，请稍后重试。`,
  );
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
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

  async transferStatus() {
    return this.request<TransferStatusResponse>(
      '/api/v1/transfer',
      {},
      8000,
    );
  }

  private async waitForTransfer(
    kind: 'wallpaper' | 'firmware',
    initial: TransferAccepted,
    onProgress?: (progress: number) => void,
    timeoutMs = 180000,
  ) {
    if (!initial.accepted) {
      onProgress?.(1);
      return initial;
    }

    const deadline = Date.now() + timeoutMs;
    let transientFailures = 0;
    while (Date.now() < deadline) {
      await sleep(600);
      try {
        const response = await this.transferStatus();
        const transfer = response.transfer;
        transientFailures = 0;
        if (transfer.error) throw new Error(transfer.error);
        if (
          transfer.kind === kind ||
          transfer.kind === undefined
        ) {
          onProgress?.(
            Math.min(1, Math.max(0, transfer.progress ?? 0)),
          );
        }
        if (!transfer.active) {
          if (transfer.state === 'error') {
            throw new Error(transfer.error || `${kind} 写入失败`);
          }
          onProgress?.(1);
          return initial;
        }
      } catch (error) {
        transientFailures += 1;
        if (transientFailures >= 5) {
          throw error;
        }
      }
    }
    throw new Error(`${kind === 'wallpaper' ? '壁纸' : '固件'}写入超时`);
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
        // iOS background URLSession retries and times out local HTTP uploads
        // even after the app has shown an error. Keep this transfer tied to
        // the foreground task so failure is final and never crashes the app.
        sessionType: 'foreground',
        onProgress: ({ bytesSent, totalBytes }) => {
          onProgress?.(
            0.35 * (totalBytes ? bytesSent / totalBytes : 0),
          );
        },
      },
    );
    try {
      const result = await upload.uploadAsync();
      if (result.status < 200 || result.status >= 300) {
        throw new Error(result.body || `壁纸上传失败 (${result.status})`);
      }
      const accepted = JSON.parse(result.body || '{}') as TransferAccepted;
      await this.waitForTransfer('wallpaper', accepted, (progress) => {
        onProgress?.(0.35 + 0.65 * progress);
      });
      onProgress?.(1);
      return {
        ok: accepted.ok !== false,
        crc32: `0x${wallpaper.crc32.toString(16).padStart(8, '0')}`,
        accepted: accepted.accepted === true,
      };
    } catch (error) {
      throw friendlyTransferError(error, '壁纸上传');
    } finally {
      try {
        upload.release();
      } catch {
        // The native task may already have released itself after a failure.
      }
    }
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
        sessionType: 'foreground',
        onProgress: ({ bytesSent, totalBytes }) => {
          onProgress?.(
            0.35 * (totalBytes ? bytesSent / totalBytes : 0),
          );
        },
      },
    );
    try {
      const result = await upload.uploadAsync();
      if (result.status < 200 || result.status >= 300) {
        throw new Error(result.body || `固件上传失败 (${result.status})`);
      }
      const accepted = JSON.parse(result.body || '{}') as TransferAccepted;
      await this.waitForTransfer(
        'firmware',
        accepted,
        (progress) => {
          onProgress?.(0.35 + 0.65 * progress);
        },
        600000,
      );
      onProgress?.(1);
      return {
        ok: accepted.ok !== false,
        md5,
        restarting: true,
        accepted: accepted.accepted === true,
      };
    } catch (error) {
      throw friendlyTransferError(error, '固件上传');
    } finally {
      try {
        upload.release();
      } catch {
        // The native task may already have released itself after a failure.
      }
    }
  }

  async rebootP4() {
    return this.request<{ ok: boolean }>('/api/v1/p4/reboot', {
      method: 'POST',
    });
  }
}
