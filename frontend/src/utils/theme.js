// Utility to calculate rgb from hex
export const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return { r: 79, g: 70, b: 229 };
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return { r: 79, g: 70, b: 229 };
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 79, g: 70, b: 229 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

export const adjustBrightness = (hex, percent) => {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (val) => Math.min(255, Math.max(0, Math.round(val + (val * percent) / 100)));
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
};

export const applyBrandTheme = (branding) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Defaults (QuickServe default indigo/blue palette)
  const defaultPrimary = '#4f46e5';
  const defaultSecondary = '#312e81';
  const defaultAccent = '#06b6d4';

  const primary = branding?.primaryColor || defaultPrimary;
  const secondary = branding?.secondaryColor || defaultSecondary;
  const accent = branding?.accentColor || defaultAccent;

  const { r, g, b } = hexToRgb(primary);
  const secRgb = hexToRgb(secondary);
  const accRgb = hexToRgb(accent);

  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-secondary', secondary);
  root.style.setProperty('--brand-accent', accent);

  // Dynamic Tailwind shades for brand
  root.style.setProperty('--brand-50', `rgba(${r}, ${g}, ${b}, 0.06)`);
  root.style.setProperty('--brand-100', `rgba(${r}, ${g}, ${b}, 0.14)`);
  root.style.setProperty('--brand-200', `rgba(${r}, ${g}, ${b}, 0.25)`);
  root.style.setProperty('--brand-300', `rgba(${r}, ${g}, ${b}, 0.40)`);
  root.style.setProperty('--brand-400', `rgba(${r}, ${g}, ${b}, 0.65)`);
  root.style.setProperty('--brand-500', primary);
  root.style.setProperty('--brand-600', primary);
  root.style.setProperty('--brand-700', adjustBrightness(primary, -15));
  root.style.setProperty('--brand-800', adjustBrightness(primary, -30));
  root.style.setProperty('--brand-900', secondary);
  root.style.setProperty('--brand-950', adjustBrightness(secondary, -20));

  // RGB components for rgba() usage
  root.style.setProperty('--brand-primary-rgb', `${r}, ${g}, ${b}`);
  root.style.setProperty('--brand-secondary-rgb', `${secRgb.r}, ${secRgb.g}, ${secRgb.b}`);
  root.style.setProperty('--brand-accent-rgb', `${accRgb.r}, ${accRgb.g}, ${accRgb.b}`);
};
