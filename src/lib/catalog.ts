import type {
  DashboardConfig,
  InstrumentSlot,
  MetricId,
  Telemetry,
} from '../types/api';

export type MetricDefinition = {
  id: MetricId;
  index: number;
  name: string;
  shortName: string;
  deviceLabel: string;
  unit: string;
  value: (telemetry: Telemetry) => number | undefined;
  decimals: number;
};

export const metricCatalog: MetricDefinition[] = [
  {
    id: 'rpm',
    index: 0,
    name: '电机转速',
    shortName: '转速',
    deviceLabel: 'MOTOR RPM',
    unit: 'rpm',
    value: (t) => t.rpm,
    decimals: 0,
  },
  {
    id: 'power',
    index: 1,
    name: '输出功率',
    shortName: '功率',
    deviceLabel: 'POWER',
    unit: 'kW',
    value: (t) => t.powerKw,
    decimals: 1,
  },
  {
    id: 'current',
    index: 2,
    name: '工作电流',
    shortName: '电流',
    deviceLabel: 'CURRENT',
    unit: 'A',
    value: (t) => t.currentA,
    decimals: 1,
  },
  {
    id: 'voltage',
    index: 3,
    name: '电池电压',
    shortName: '电压',
    deviceLabel: 'VOLTAGE',
    unit: 'V',
    value: (t) => t.voltage,
    decimals: 1,
  },
  {
    id: 'motorTemp',
    index: 4,
    name: '电机温度',
    shortName: '电机温度',
    deviceLabel: 'MOTOR TEMP',
    unit: '°C',
    value: (t) => t.motorTempC,
    decimals: 1,
  },
  {
    id: 'range',
    index: 5,
    name: '剩余续航',
    shortName: '续航',
    deviceLabel: 'RANGE',
    unit: 'km',
    value: (t) => t.rangeKm,
    decimals: 0,
  },
  {
    id: 'soh',
    index: 6,
    name: '电池健康',
    shortName: '电池健康',
    deviceLabel: 'BATTERY HEALTH',
    unit: '%',
    value: (t) => t.soh,
    decimals: 0,
  },
  {
    id: 'tyreFront',
    index: 7,
    name: '前轮胎压',
    shortName: '前轮胎压',
    deviceLabel: 'TYRE FRONT',
    unit: 'bar',
    value: (t) => t.tyreFrontBar,
    decimals: 1,
  },
  {
    id: 'tyreRear',
    index: 8,
    name: '后轮胎压',
    shortName: '后轮胎压',
    deviceLabel: 'TYRE REAR',
    unit: 'bar',
    value: (t) => t.tyreRearBar,
    decimals: 1,
  },
  {
    id: 'batteryTemp',
    index: 9,
    name: '电池温度',
    shortName: '电池温度',
    deviceLabel: 'BATTERY TEMP',
    unit: '°C',
    value: (t) => t.batteryTempC,
    decimals: 1,
  },
];

export const metricById = Object.fromEntries(
  metricCatalog.map((metric) => [metric.id, metric]),
) as Record<MetricId, MetricDefinition>;

export const defaultDashboardConfig: DashboardConfig = {
  version: 1,
  theme: 'night',
  slots: [
    'rpm',
    'power',
    'current',
    'voltage',
    'motorTemp',
    'range',
  ].map((metric) => ({ metric: metric as MetricId, visible: true })),
};

export function formatMetricValue(
  slot: InstrumentSlot,
  telemetry: Telemetry,
) {
  const metric = metricById[slot.metric];
  const value = metric.value(telemetry);
  return value == null ? '--' : value.toFixed(metric.decimals);
}

export function validateDashboardConfig(config: DashboardConfig) {
  if (config.version !== 1 || config.slots.length !== 6) return false;
  return config.slots.every(
    (slot) =>
      slot &&
      typeof slot.visible === 'boolean' &&
      metricById[slot.metric] != null,
  );
}
