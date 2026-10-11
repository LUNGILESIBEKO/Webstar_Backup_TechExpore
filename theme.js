import { useTheme } from "./ThemeContext";

export const BRAND = {
  deep: "#042F2E",
  dark: "#0d5451",
  mid: "#0F766E",
  light: "#1a9e99",
  aqua: "#4dd4ce",
  mint: "#E6F4F1",
  // Tactile button gradients (top -> bottom) and the glow they cast.
  aquaTop: "#7ff0ea",
  aquaBottom: "#33c9c1",
  tealTop: "#14938b",
  tealBottom: "#0b5a56",
};

export const PALETTE = {
  white: "#ffffff",
  black: "#000000",
  ink: "#0f172a", 
  text: "#1e293b", 
  textOnDark: "#e2e8f0", 
  slateDark: "#334155",
  slate: "#64748b", 
  slateLight: "#94a3b8", 
  slatePale: "#cbd5e1",
  paper: "#f8fafc", 
  danger: "#dc2626",
  dangerOnDark: "#f87171",
  dangerSoft: "#fca5a5",
  success: "#15803d",
  successOnDark: "#4ade80",
};

export const LAYOUT = {
  pad: 20, 
  radius: 18, 
  buttonRadius: 14,
};

export function gradientFor(dark) {
  return dark ? ["#061413", "#0c1f2b", "#12263a"] : ["#031f1e", "#0a4a46", "#13867f"];
}

export function useCardTheme() {
  const { dark } = useTheme();

  return {
    dark,
    blurTint: dark ? "dark" : "light",
    G: dark ? "rgba(22,36,48,0.78)" : "rgba(255,255,255,0.90)",
    border: {
      borderWidth: 1,
      borderColor: dark ? "rgba(77,212,206,0.16)" : "rgba(255,255,255,0.7)",
    },
    text: dark ? PALETTE.textOnDark : PALETTE.text,
    subtext: dark ? PALETTE.slateLight : PALETTE.slate,
    accent: dark ? BRAND.aqua : BRAND.dark,
    accentSoft: dark ? "rgba(77,212,206,0.16)" : "rgba(13,84,81,0.10)",
    track: dark ? "rgba(255,255,255,0.14)" : "rgba(13,84,81,0.14)",
    divider: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
    inputBg: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
    amber: dark ? "#f2b84b" : "#b45309",
    rose: dark ? PALETTE.dangerOnDark : PALETTE.danger,
    green: dark ? PALETTE.successOnDark : PALETTE.success,
  };
}
