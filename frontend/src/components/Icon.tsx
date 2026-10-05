import React from 'react';

const PATHS: Record<string, React.ReactNode> = {
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
    </>
  ),
  shield: <path d="M12 3.5 5 6v5.5c0 4.3 3 7.8 7 9 4-1.2 7-4.7 7-9V6z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  arrowRight: <path d="M5 12h14m-5-5 5 5-5 5" />,
  arrowUpRight: <path d="M7 17 17 7M9 7h8v8" />,
  arrowLeft: <path d="M19 12H5m5 5-5-5 5-5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  logout: <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />,
  trash: <path d="M5 7h14M10 7V4.5h4V7m-7 0 1 13h8l1-13" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  unlock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 7.6-1.8" />
    </>
  ),
  chat: <path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 3.5V17H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  spark: <path d="M12 3v5m0 8v5M3 12h5m8 0h5M6 6l3 3m6 6 3 3M18 6l-3 3m-6 6-3 3" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  book: <path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM17 20h2V6.5" />,
  code: <path d="m9 8-4 4 4 4m6-8 4 4-4 4" />,
  refresh: <path d="M19 8a7.5 7.5 0 0 0-13.5 1M5 16a7.5 7.5 0 0 0 13.5-1M19 4v4h-4M5 20v-4h4" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  layers: <path d="m12 4 8.5 4.5L12 13 3.5 8.5zM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H3" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  star: <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 18,
  className = '',
  strokeWidth = 1.8,
  filled = false,
}: {
  name: IconName | string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  filled?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? PATHS.spark}
    </svg>
  );
}

/** The Loadout mark: three stacked slots, one lit. */
export function LogoMark({ size = 28, light = false }: { size?: number; light?: boolean }) {
  const base = light ? '#fbfbf8' : '#17221b';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3" y="4" width="26" height="6.5" rx="3.25" fill={base} opacity="0.28" />
      <rect x="3" y="12.75" width="26" height="6.5" rx="3.25" fill="#ff5b1f" />
      <rect x="3" y="21.5" width="17" height="6.5" rx="3.25" fill={base} />
    </svg>
  );
}
