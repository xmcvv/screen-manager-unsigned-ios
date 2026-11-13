export type LinkState = 'online' | 'connecting' | 'offline';

export type LinkInfo = {
  state: LinkState;
  label?: string;
  lastSeenMs?: number;
  rssi?: number;
  ip?: string;
};

export type TransferInfo = {
  active: boolean;
  kind?: 'wallpaper' | 'firmware' | 'dashboard';
  progress?: number;
  message?: string;
};

export type StatusResponse = {
  apiVersion: number;
  device: {
    name: string;
    model: string;
    firmware?: string;
    firmwareMd5?: string;
    uptimeSec: number;
  };
  links: {
    device: LinkInfo;
    p4: LinkInfo;
    usb: LinkInfo;
    wifi: LinkInfo;
    carplay: LinkInfo;
  };
  system: {
    cpuPct?: number;
    load1?: number;
    memoryUsedKb?: number;
    memoryTotalKb?: number;
    temperatureC?: number;
    storageFreeKb?: number;
    storageTotalKb?: number;
  };
  transfer?: TransferInfo;
};

export type Telemetry = {
  timestampMs: number;
  speedKph: number;
  rpm: number;
  voltage: number;
  currentA: number;
  powerKw: number;
  motorTempC: number;
  controllerTempC: number;
  batteryTempC: number;
  gear: number;
  soc: number;
  soh: number;
  rangeKm: number;
  odometerKm: number;
  chargeState: number;
  chargerPowerW: number;
  chargeEtaMin?: number;
  tyreFrontBar?: number;
  tyreRearBar?: number;
  mode: number;
  alert: number;
  message?: string;
};

export type MetricId =
  | 'rpm'
  | 'power'
  | 'current'
  | 'voltage'
  | 'motorTemp'
  | 'range'
  | 'soh'
  | 'tyreFront'
  | 'tyreRear'
  | 'batteryTemp';

export type InstrumentSlot = {
  metric: MetricId;
  visible: boolean;
};

export type DashboardConfig = {
  version: 1;
  theme: 'night' | 'day';
  slots: InstrumentSlot[];
};

export type WallpaperPrepared = {
  uri: string;
  bytes: Uint8Array;
  crc32: number;
  width: 800;
  height: 480;
};

export type ApiError = Error & {
  status?: number;
};
