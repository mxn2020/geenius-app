export const colors = {
  brand: {
    50: "#f0f4ff",
    100: "#dce6ff",
    200: "#b9cdff",
    300: "#85aaff",
    400: "#527bff",
    500: "#2d52f5",
    600: "#1a35e0",
    700: "#1527b8",
    800: "#162196",
    900: "#171f78",
    950: "#111348",
  },
  neutral: {
    0: "#ffffff",
    50: "#f8f9fa",
    100: "#f1f3f5",
    200: "#e9ecef",
    300: "#dee2e6",
    400: "#ced4da",
    500: "#adb5bd",
    600: "#868e96",
    700: "#495057",
    800: "#343a40",
    900: "#212529",
    950: "#0d0f12",
  },
  success: {
    50: "#ebfbee",
    500: "#2f9e44",
    700: "#1e7233",
  },
  warning: {
    50: "#fff9db",
    500: "#f08c00",
    700: "#b35900",
  },
  danger: {
    50: "#fff5f5",
    500: "#e03131",
    700: "#b02020",
  },
} as const

export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  32: "128px",
} as const

export const typography = {
  fontFamily: {
    sans: '"Inter", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: "11px",
    sm: "13px",
    base: "15px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
    "4xl": "36px",
    "5xl": "48px",
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
  },
} as const

export const borderRadius = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "9999px",
} as const

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none",
} as const

export type Colors = typeof colors
export type Spacing = typeof spacing
export type Typography = typeof typography
export type BorderRadius = typeof borderRadius
export type Shadows = typeof shadows
