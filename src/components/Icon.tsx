import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Rect,
} from 'react-native-svg';

export type IconName =
  | 'home'
  | 'activity'
  | 'dashboard'
  | 'manage'
  | 'settings'
  | 'wifi'
  | 'usb'
  | 'chip'
  | 'carplay'
  | 'refresh'
  | 'image'
  | 'upload'
  | 'shield'
  | 'chevronRight'
  | 'chevronLeft'
  | 'arrowUp'
  | 'arrowDown'
  | 'eye'
  | 'eyeOff'
  | 'check'
  | 'warning'
  | 'battery'
  | 'thermometer'
  | 'gauge'
  | 'trash'
  | 'info';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
};

export function Icon({
  name,
  size = 22,
  color = '#F5F7F8',
  strokeWidth = 1.8,
  filled = false,
}: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  let content;
  switch (name) {
    case 'home':
      content = (
        <>
          <Path {...common} d="M3 10.8 12 3l9 7.8" />
          <Path {...common} d="M5.5 9v11h13V9" />
          <Path {...common} d="M9.3 20v-6h5.4v6" />
        </>
      );
      break;
    case 'activity':
      content = (
        <>
          <Path {...common} d="M3 12h4l2-6 4.2 12 2.1-6H21" />
          <Circle {...common} cx="12" cy="12" r="9" />
        </>
      );
      break;
    case 'dashboard':
      content = (
        <>
          <Rect {...common} x="3" y="4" width="18" height="13" rx="3" />
          <Path {...common} d="M8 21h8M12 17v4" />
          <Path {...common} d="M7 12h2l1.5-4 2.8 7 1.5-3H17" />
        </>
      );
      break;
    case 'manage':
      content = (
        <>
          <Path {...common} d="M4 6.5h6l1.5 2H20v10.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 18.7V7.5a1 1 0 0 1 1-1Z" />
          <Path {...common} d="M3 10h17" />
          <Path {...common} d="M13.5 14.2h3.5" />
        </>
      );
      break;
    case 'settings':
      content = (
        <>
          <Circle {...common} cx="12" cy="12" r="3" />
          <Path
            {...common}
            d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 8.95 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.58 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.95a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.97 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.05 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"
          />
        </>
      );
      break;
    case 'wifi':
      content = (
        <>
          <Path {...common} d="M3.3 8.8a13.5 13.5 0 0 1 17.4 0" />
          <Path {...common} d="M6.4 12a8.8 8.8 0 0 1 11.2 0" />
          <Path {...common} d="M9.5 15.2a4 4 0 0 1 5 0" />
          <Circle cx="12" cy="19" r="1.2" fill={color} />
        </>
      );
      break;
    case 'usb':
      content = (
        <>
          <Path {...common} d="M12 21V5" />
          <Path {...common} d="m9 8 3-4 3 4" />
          <Path {...common} d="M12 12 8 9.5V6.8" />
          <Circle {...common} cx="8" cy="6" r="1.2" />
          <Path {...common} d="m12 16 4-2.5V10" />
          <Rect {...common} x="15" y="8.4" width="2" height="1.6" rx=".4" />
          <Path {...common} d="M12 14.5 10 16v2" />
          <Circle {...common} cx="9.5" cy="19.5" r="1.5" />
        </>
      );
      break;
    case 'chip':
      content = (
        <>
          <Rect {...common} x="6" y="6" width="12" height="12" rx="2.5" />
          <Rect {...common} x="9" y="9" width="6" height="6" rx="1" />
          <Path {...common} d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
        </>
      );
      break;
    case 'carplay':
      content = (
        <>
          <Rect {...common} x="3" y="4" width="18" height="14" rx="4" />
          <Path {...common} d="M8 21h8M12 18v3" />
          <Circle {...common} cx="12" cy="11" r="3.4" />
          <Path {...common} d="m10.6 9.6 3.1 1.4-3.1 1.4Z" fill={color} />
        </>
      );
      break;
    case 'refresh':
      content = (
        <>
          <Path {...common} d="M20 7v5h-5" />
          <Path {...common} d="M4 17v-5h5" />
          <Path {...common} d="M6.2 8.2A7.5 7.5 0 0 1 19.6 12M4.4 12a7.5 7.5 0 0 0 13.4 3.8" />
        </>
      );
      break;
    case 'image':
      content = (
        <>
          <Rect {...common} x="3" y="4" width="18" height="16" rx="3" />
          <Circle {...common} cx="8.5" cy="9" r="1.6" />
          <Path {...common} d="m5 17 4.4-4.2 3.2 2.9 2.5-2.4L20 18" />
        </>
      );
      break;
    case 'upload':
      content = (
        <>
          <Path {...common} d="M12 16V3M7.5 7.5 12 3l4.5 4.5" />
          <Path {...common} d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
        </>
      );
      break;
    case 'shield':
      content = (
        <>
          <Path {...common} d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" />
          <Path {...common} d="m8.5 12 2.2 2.2 4.8-5" />
        </>
      );
      break;
    case 'chevronRight':
      content = <Polyline {...common} points="9,5 16,12 9,19" />;
      break;
    case 'chevronLeft':
      content = <Polyline {...common} points="15,5 8,12 15,19" />;
      break;
    case 'arrowUp':
      content = <Path {...common} d="M12 19V5m-5 5 5-5 5 5" />;
      break;
    case 'arrowDown':
      content = <Path {...common} d="M12 5v14m-5-5 5 5 5-5" />;
      break;
    case 'eye':
      content = (
        <>
          <Path {...common} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <Circle {...common} cx="12" cy="12" r="2.6" />
        </>
      );
      break;
    case 'eyeOff':
      content = (
        <>
          <Path {...common} d="m3 3 18 18" />
          <Path {...common} d="M10.6 6.1A10 10 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.2 2.9M6.3 6.4C3.9 8 2.5 12 2.5 12s3.5 6 9.5 6a9.8 9.8 0 0 0 4.1-.9" />
        </>
      );
      break;
    case 'check':
      content = <Path {...common} d="m5 12.5 4.2 4.2L19 7" />;
      break;
    case 'warning':
      content = (
        <>
          <Path {...common} d="M12 3.5 21 20H3l9-16.5Z" />
          <Line {...common} x1="12" y1="9" x2="12" y2="14" />
          <Circle cx="12" cy="17.3" r="1" fill={color} />
        </>
      );
      break;
    case 'battery':
      content = (
        <>
          <Rect {...common} x="3" y="7" width="17" height="10" rx="2.5" />
          <Path {...common} d="M20 10h1.5v4H20" />
          <Path fill={color} stroke="none" d="M6 10h8v4H6Z" />
        </>
      );
      break;
    case 'thermometer':
      content = (
        <>
          <Path {...common} d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4.5 4.5 0 1 1-4 0Z" />
          <Circle cx="12" cy="18" r="1.4" fill={color} />
        </>
      );
      break;
    case 'gauge':
      content = (
        <>
          <Path {...common} d="M4 18a8 8 0 1 1 16 0" />
          <Path {...common} d="m12 14 4-4" />
          <Circle {...common} cx="12" cy="14" r="1.2" />
        </>
      );
      break;
    case 'trash':
      content = (
        <>
          <Path {...common} d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
        </>
      );
      break;
    case 'info':
      content = (
        <>
          <Circle {...common} cx="12" cy="12" r="9" />
          <Path {...common} d="M12 11v5" />
          <Circle cx="12" cy="8" r="1" fill={color} />
        </>
      );
      break;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {filled ? <Rect width="24" height="24" rx="7" fill={color} opacity={0.08} /> : null}
      {content}
    </Svg>
  );
}
