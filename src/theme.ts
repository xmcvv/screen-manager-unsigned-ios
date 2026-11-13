import type { LinkState } from './types/api';

export const colors = {
  background: '#050607',
  backgroundRaised: '#090B0D',
  surface: '#101316',
  surfaceRaised: '#161A1E',
  surfaceSoft: '#0C0F12',
  line: '#23292F',
  lineSoft: '#181D22',
  text: '#F5F7F8',
  textSecondary: '#9AA4AE',
  textTertiary: '#626C75',
  mint: '#64E6C4',
  mintSoft: 'rgba(100,230,196,0.14)',
  blue: '#79A8FF',
  blueSoft: 'rgba(121,168,255,0.14)',
  amber: '#F3C969',
  amberSoft: 'rgba(243,201,105,0.14)',
  red: '#FF7474',
  redSoft: 'rgba(255,116,116,0.14)',
  white: '#FFFFFF',
  black: '#000000',
};

export const radii = {
  small: 10,
  medium: 16,
  large: 24,
  pill: 999,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export function stateColor(state: LinkState) {
  if (state === 'online') return colors.mint;
  if (state === 'connecting') return colors.amber;
  return colors.red;
}

export function stateLabel(state: LinkState) {
  if (state === 'online') return '已连接';
  if (state === 'connecting') return '连接中';
  return '未连接';
}

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};
