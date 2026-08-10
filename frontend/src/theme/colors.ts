// Qaans app theme — clean, modern B2B palette
export const colors = {
  // Brand
  primary: "#0F172A",        // slate-900 — main dark
  primaryFg: "#FFFFFF",
  brand: "#2563EB",          // blue-600 — CTAs / accents
  brandSoft: "#EFF6FF",      // blue-50 — soft tint backgrounds
  brandFg: "#FFFFFF",

  // Status
  success: "#16A34A",
  successSoft: "#DCFCE7",
  warning: "#EAB308",
  warningSoft: "#FEF9C3",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
  info: "#3B82F6",
  infoSoft: "#DBEAFE",

  // Surfaces
  background: "#F8FAFC",
  card: "#FFFFFF",
  surfaceAlt: "#F1F5F9",

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  // Borders
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",

  // Black/White
  black: "#000000",
  white: "#FFFFFF",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const shadow = {
  card: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  strong: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};
