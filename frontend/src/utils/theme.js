// Color manipulation helpers
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

export const rgbToString = ({ r, g, b }) => `${r}, ${g}, ${b}`;

export const rgbToHex = ({ r, g, b }) => {
  const toHex = (n) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const mixRgb = (color1, color2, weight) => {
  // weight is 0..1 (fraction of color2)
  return {
    r: Math.round(color1.r * (1 - weight) + color2.r * weight),
    g: Math.round(color1.g * (1 - weight) + color2.g * weight),
    b: Math.round(color1.b * (1 - weight) + color2.b * weight),
  };
};

export const applyBrandTheme = (branding) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Defaults (QuickServe standard SaaS indigo / charcoal / amber palette)
  const defaultPrimaryHex = '#4f46e5';
  const defaultSecondaryHex = '#1c1917';
  const defaultAccentHex = '#f59e0b';

  const primaryHex = branding?.primaryColor || defaultPrimaryHex;
  const secondaryHex = branding?.secondaryColor || defaultSecondaryHex;
  const accentHex = branding?.accentColor || defaultAccentHex;

  const primaryRgb = hexToRgb(primaryHex);
  const secondaryRgb = hexToRgb(secondaryHex);
  const accentRgb = hexToRgb(accentHex);

  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  // Generate harmonized shades
  const shade50 = mixRgb(primaryRgb, white, 0.94);
  const shade100 = mixRgb(primaryRgb, white, 0.86);
  const shade200 = mixRgb(primaryRgb, white, 0.72);
  const shade300 = mixRgb(primaryRgb, white, 0.52);
  const shade400 = mixRgb(primaryRgb, white, 0.30);
  const shade500 = primaryRgb;
  const shade600 = primaryRgb;
  const shade700 = mixRgb(primaryRgb, black, 0.15);
  const shade800 = mixRgb(primaryRgb, black, 0.30);
  const shade900 = secondaryRgb;
  const shade950 = mixRgb(secondaryRgb, black, 0.25);

  // Set CSS Variables as RGB channel triplets for Tailwind withOpacity
  root.style.setProperty('--brand-primary', rgbToString(primaryRgb));
  root.style.setProperty('--brand-secondary', rgbToString(secondaryRgb));
  root.style.setProperty('--brand-accent', rgbToString(accentRgb));

  root.style.setProperty('--brand-50', rgbToString(shade50));
  root.style.setProperty('--brand-100', rgbToString(shade100));
  root.style.setProperty('--brand-200', rgbToString(shade200));
  root.style.setProperty('--brand-300', rgbToString(shade300));
  root.style.setProperty('--brand-400', rgbToString(shade400));
  root.style.setProperty('--brand-500', rgbToString(shade500));
  root.style.setProperty('--brand-600', rgbToString(shade600));
  root.style.setProperty('--brand-700', rgbToString(shade700));
  root.style.setProperty('--brand-800', rgbToString(shade800));
  root.style.setProperty('--brand-900', rgbToString(shade900));
  root.style.setProperty('--brand-950', rgbToString(shade950));

  // Set direct hex variables for raw SVG or canvas consumers
  root.style.setProperty('--brand-primary-hex', primaryHex);
  root.style.setProperty('--brand-secondary-hex', secondaryHex);
  root.style.setProperty('--brand-accent-hex', accentHex);
};
