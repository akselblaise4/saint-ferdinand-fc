export const colors = {
  club: {
    red: { DEFAULT: "#C8102E", dark: "#9E0C23", light: "#FEF2F2", muted: "#FEE2E2" },
    black: "#0A0A0A",
    gold: "#F59E0B",
    white: "#FFFFFF",
  },
  surface: {
    background: "#FFFFFF",
    foreground: "#0A0A0A",
    card: "#FFFFFF",
    "card-foreground": "#0A0A0A",
    popover: "#FFFFFF",
    "popover-foreground": "#0A0A0A",
  },
  brand: {
    primary: "#C8102E",
    "primary-foreground": "#FFFFFF",
    secondary: "#F3F4F6",
    "secondary-foreground": "#0A0A0A",
  },
  state: {
    muted: "#F3F4F6",
    "muted-foreground": "#737373",
    accent: "#FEF2F2",
    "accent-foreground": "#C8102E",
    destructive: "#EF4444",
    "destructive-foreground": "#FFFFFF",
  },
  border: "#E5E7EB",
  input: "#E5E7EB",
  ring: "#C8102E",
} as const;

export const typography = {
  fontFamily: {
    display: "'Bebas Neue', sans-serif",
    body: "'Geist', sans-serif",
    mono: "'Geist Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["0.9375rem", { lineHeight: "1.5rem", letterSpacing: "-0.01em" }],
    lg: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
    xl: ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
    "5xl": ["3rem", { lineHeight: "1" }],
    "6xl": ["3.75rem", { lineHeight: "1" }],
    "7xl": ["4.5rem", { lineHeight: "1" }],
    "8xl": ["6rem", { lineHeight: "1" }],
    "9xl": ["8rem", { lineHeight: "1" }],
  },
} as const;

export const spacing = {
  section: { mobile: "4rem", desktop: "6rem" },
  container: { padding: "1.5rem", maxWidth: "80rem" },
  grid: { gap: "1rem", column: "1rem" },
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  card: "0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 6px -1px rgb(0 0 0 / 0.02), 0 2px 4px 0 rgb(0 0 0 / 0.02)",
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;

export const animations = {
  duration: { fast: "150ms", normal: "300ms", slow: "500ms" },
  easing: {
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    smooth: "cubic-bezier(0.65, 0, 0.35, 1)",
  },
  keyframes: {
    "border-rotate": { to: { "--border-angle": "360deg" } },
    "scroll-indicator": { "0%, 100%": { opacity: "0.3", transform: "translateY(0)" }, "50%": { opacity: "1", transform: "translateY(6px)" } },
    "marquee-left": { from: { transform: "translateX(0%)" }, to: { transform: "translateX(-100%)" } },
    "marquee-right": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0%)" } },
    "marquee-up": { from: { transform: "translateY(0%)" }, to: { transform: "translateY(-100%)" } },
    "marquee-down": { from: { transform: "translateY(-100%)" }, to: { transform: "translateY(0%)" } },
    "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
    "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
    "scale-in": { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
    "slide-left": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
    "slide-right": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
    pulse: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
    "pulse-soft": { "0%, 100%": { opacity: "0.7" }, "50%": { opacity: "1" } },
    shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
    spotlight: { "0%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.5)" }, "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" } },
  },
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;
