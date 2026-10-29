const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export function LogoMark({ size = 34 }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.6}>
      <circle cx="12" cy="12" r="9" opacity="0.45" />
      <path d="M3 12.5h4.2l2.3-5.5 3.2 10.5 2.2-5h6.1" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg {...base}>
      <path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.8 6.8 0 0 0 9.7 9.7z" />
    </svg>
  );
}

export function PinIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M12 21s7-6.1 7-11.4A7 7 0 0 0 5 9.6C5 14.9 12 21 12 21z" />
      <circle cx="12" cy="9.6" r="2.4" />
    </svg>
  );
}

export function DownloadIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M12 3.5v11m0 0-4-4m4 4 4-4M5 20.5h14" />
    </svg>
  );
}

export function CloseIcon({ size = 14 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
