import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

await mkdir('assets', { recursive: true });

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="76%" cy="12%" r="90%">
      <stop offset="0" stop-color="#173129"/>
      <stop offset=".46" stop-color="#090d0f"/>
      <stop offset="1" stop-color="#030405"/>
    </radialGradient>
    <linearGradient id="mint" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9af5dc"/>
      <stop offset="1" stop-color="#36b99c"/>
    </linearGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>
  <circle cx="790" cy="170" r="250" fill="#55e7c1" opacity=".055"/>
  <rect x="190" y="240" width="644" height="422" rx="72" fill="#0b1012" stroke="#27312f" stroke-width="10"/>
  <rect x="238" y="292" width="548" height="318" rx="36" fill="#030505" stroke="#26332f" stroke-width="6"/>
  <path d="M292 486h74l41-102 65 194 45-108 34 65h99" fill="none" stroke="#55e7c1" stroke-width="25" stroke-linecap="round" stroke-linejoin="round" opacity=".2" filter="url(#glow)"/>
  <path d="M292 486h74l41-102 65 194 45-108 34 65h99" fill="none" stroke="url(#mint)" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="292" cy="486" r="12" fill="#e9faf5"/>
  <circle cx="650" cy="535" r="12" fill="#e9faf5"/>
  <path d="M457 754h110" stroke="#55e7c1" stroke-width="22" stroke-linecap="round"/>
  <path d="M512 754v54" stroke="#27312f" stroke-width="20" stroke-linecap="round"/>
  <circle cx="774" cy="288" r="15" fill="#55e7c1"/>
  <circle cx="735" cy="288" r="15" fill="#f4ca68"/>
  <circle cx="696" cy="288" r="15" fill="#76808a"/>
</svg>`;

const foregroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="mint" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#c4ffed"/>
      <stop offset="1" stop-color="#45d5b3"/>
    </linearGradient>
  </defs>
  <rect x="192" y="252" width="640" height="414" rx="72" fill="none" stroke="url(#mint)" stroke-width="24"/>
  <path d="M294 488h76l40-102 66 195 44-108 35 65h101" fill="none" stroke="url(#mint)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M454 746h116M512 746v55" stroke="#edfff9" stroke-width="23" stroke-linecap="round"/>
  <circle cx="760" cy="304" r="15" fill="#62e8c5"/>
</svg>`;

const backgroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <defs>
    <radialGradient id="g" cx="78%" cy="12%" r="100%">
      <stop offset="0" stop-color="#173129"/>
      <stop offset=".55" stop-color="#080b0d"/>
      <stop offset="1" stop-color="#030405"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#g)"/>
</svg>`;

const monochromeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect x="192" y="252" width="640" height="414" rx="72" fill="none" stroke="#ffffff" stroke-width="24"/>
  <path d="M294 488h76l40-102 66 195 44-108 35 65h101" fill="none" stroke="#ffffff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M454 746h116M512 746v55" stroke="#ffffff" stroke-width="23" stroke-linecap="round"/>
</svg>`;

await Promise.all([
  sharp(Buffer.from(iconSvg)).png().toFile('assets/icon.png'),
  sharp(Buffer.from(foregroundSvg)).png().toFile('assets/android-icon-foreground.png'),
  sharp(Buffer.from(backgroundSvg)).png().toFile('assets/android-icon-background.png'),
  sharp(Buffer.from(monochromeSvg)).png().toFile('assets/android-icon-monochrome.png'),
  sharp(Buffer.from(foregroundSvg)).png().resize(512, 512).toFile('assets/splash-icon.png'),
  sharp(Buffer.from(iconSvg)).png().resize(48, 48).toFile('assets/favicon.png'),
]);

console.log('Generated 车屏管家 app icons.');
