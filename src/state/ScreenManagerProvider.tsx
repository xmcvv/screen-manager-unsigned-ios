import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScreenManagerApi, normalizeBaseUrl } from '../lib/api';
import {
  defaultDashboardConfig,
  validateDashboardConfig,
} from '../lib/catalog';
import type {
  DashboardConfig,
  LinkState,
  StatusResponse,
  Telemetry,
} from '../types/api';

const ENDPOINT_KEY = '@screen-manager/endpoint';
const CONFIG_KEY = '@screen-manager/dashboard';

export const demoTelemetry: Telemetry = {
  timestampMs: Date.now(),
  speedKph: 48,
  rpm: 2880,
  voltage: 79.2,
  currentA: 18.4,
  powerKw: 1.46,
  motorTempC: 41.2,
  controllerTempC: 35.8,
  batteryTempC: 28.4,
  gear: 3,
  soc: 78,
  soh: 96,
  rangeKm: 186,
  odometerKm: 12480,
  chargeState: 0,
  chargerPowerW: 0,
  chargeEtaMin: 0xffff,
  tyreFrontBar: 2.4,
  tyreRearBar: 2.5,
  mode: 1,
  alert: 0,
};

export const demoStatus: StatusResponse = {
  apiVersion: 1,
  device: {
    name: 'SD5580',
    model: 'JC4880P443',
    firmware: '等待连接',
    uptimeSec: 0,
  },
  links: {
    device: { state: 'offline' },
    p4: { state: 'offline' },
    usb: { state: 'offline' },
    wifi: { state: 'connecting' },
    carplay: { state: 'offline' },
  },
  system: {},
};

type HistoryPoint = {
  timestampMs: number;
  speed: number;
  voltage: number;
  power: number;
};

type ScreenManagerContextValue = {
  endpoint: string;
  setEndpoint: (endpoint: string) => Promise<void>;
  connection: LinkState;
  status: StatusResponse;
  telemetry: Telemetry;
  history: HistoryPoint[];
  dashboardConfig: DashboardConfig;
  setDashboardConfig: (config: DashboardConfig) => void;
  saveDashboardConfig: (config: DashboardConfig) => Promise<void>;
  refresh: (silent?: boolean) => Promise<boolean>;
  lastError?: string;
  updateTransfer: (progress: number) => void;
  transferProgress?: number;
};

const ScreenManagerContext =
  createContext<ScreenManagerContextValue | null>(null);

export function ScreenManagerProvider({
  children,
}: PropsWithChildren) {
  const [endpoint, setEndpointState] = useState(
    'http://192.168.4.1:8080',
  );
  const [connection, setConnection] =
    useState<LinkState>('connecting');
  const [status, setStatus] = useState<StatusResponse>(demoStatus);
  const [telemetry, setTelemetry] =
    useState<Telemetry>(demoTelemetry);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [dashboardConfig, setDashboardConfig] =
    useState<DashboardConfig>(defaultDashboardConfig);
  const [lastError, setLastError] = useState<string>();
  const [transferProgress, setTransferProgress] = useState<number>();
  const polling = useRef(false);
  const mounted = useRef(true);
  const consecutiveFailures = useRef(0);

  useEffect(() => {
    mounted.current = true;
    Promise.all([
      AsyncStorage.getItem(ENDPOINT_KEY),
      AsyncStorage.getItem(CONFIG_KEY),
    ])
      .then(([savedEndpoint, savedConfig]) => {
        if (!mounted.current) return;
        if (savedEndpoint) {
          setEndpointState(normalizeBaseUrl(savedEndpoint));
        }
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig) as DashboardConfig;
          if (validateDashboardConfig(parsed)) {
            setDashboardConfig(parsed);
          }
        }
      })
      .catch(() => undefined);
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(
    async (silent = false) => {
      if (polling.current) return false;
      polling.current = true;
      if (!silent) setConnection('connecting');
      try {
        const snapshot = await new ScreenManagerApi(
          endpoint,
        ).snapshot();
        if (!mounted.current) return true;
        setStatus(snapshot.status);
        setTelemetry(snapshot.telemetry);
        setConnection('online');
        consecutiveFailures.current = 0;
        setLastError(undefined);
        setHistory((current) => {
          const next = [
            ...current,
            {
              timestampMs: snapshot.telemetry.timestampMs,
              speed: snapshot.telemetry.speedKph,
              voltage: snapshot.telemetry.voltage,
              power: snapshot.telemetry.powerKw,
            },
          ];
          return next.slice(-36);
        });
        if (
          snapshot.dashboard &&
          validateDashboardConfig(snapshot.dashboard)
        ) {
          setDashboardConfig(snapshot.dashboard);
        }
        return true;
      } catch (error) {
        if (!mounted.current) return false;
        consecutiveFailures.current += 1;
        const message =
          error instanceof Error ? error.message : '无法连接车机';
        const friendly =
          message.includes('aborted') || /timeout|timed out/i.test(message)
            ? '连接超时'
            : message;
        setLastError(friendly);
        // A transfer briefly occupies the 5580 HTTP service while it stages
        // uploaded data. Keep the last known state through short gaps and only
        // show offline after three independent polling failures.
        if (consecutiveFailures.current >= 3) {
          setConnection('offline');
        }
        return false;
      } finally {
        polling.current = false;
      }
    },
    [endpoint],
  );

  useEffect(() => {
    void refresh(false);
    const timer = setInterval(() => {
      void refresh(true);
    }, 1400);
    return () => clearInterval(timer);
  }, [refresh]);

  const setEndpoint = useCallback(async (nextEndpoint: string) => {
    const normalized = normalizeBaseUrl(nextEndpoint);
    setEndpointState(normalized);
    await AsyncStorage.setItem(ENDPOINT_KEY, normalized);
    consecutiveFailures.current = 0;
    setConnection('connecting');
  }, []);

  const saveDashboardConfig = useCallback(
    async (config: DashboardConfig) => {
      await new ScreenManagerApi(endpoint).saveDashboard(config);
      setDashboardConfig(config);
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    },
    [endpoint],
  );

  const updateTransfer = useCallback((progress: number) => {
    setTransferProgress(progress);
  }, []);

  const value = useMemo<ScreenManagerContextValue>(
    () => ({
      endpoint,
      setEndpoint,
      connection,
      status,
      telemetry,
      history,
      dashboardConfig,
      setDashboardConfig,
      saveDashboardConfig,
      refresh,
      lastError,
      updateTransfer,
      transferProgress,
    }),
    [
      endpoint,
      setEndpoint,
      connection,
      status,
      telemetry,
      history,
      dashboardConfig,
      saveDashboardConfig,
      refresh,
      lastError,
      updateTransfer,
      transferProgress,
    ],
  );

  return (
    <ScreenManagerContext.Provider value={value}>
      {children}
    </ScreenManagerContext.Provider>
  );
}

export function useScreenManager() {
  const context = useContext(ScreenManagerContext);
  if (!context) {
    throw new Error(
      'useScreenManager must be used inside ScreenManagerProvider',
    );
  }
  return context;
}
