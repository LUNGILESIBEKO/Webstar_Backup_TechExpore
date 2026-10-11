// components/UI.js - the shared building blocks every screen is made from.
// Because every screen uses these, they all share the same background,
// header, cards, buttons, progress bars and bottom tab bar.

import React from "react";
import { View, Text, Pressable, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Home as HomeIcon, Compass, Map, User } from "lucide-react-native";
import { useCardTheme, BRAND, LAYOUT, PALETTE } from "../theme";

/* ------------------------------- Screen shell ------------------------------ */

// Wraps a screen: safe-area padding and light status bar. The gradient lives
// in App.js. The four main tabs (Home / Explore / Roadmap / Profile) are drawn
// inside screens/MainTabs.js, which owns ONE tab bar that never moves; a tab
// screen just passes activeTab so it leaves the bottom padding to that bar.
export function Screen({ children, activeTab }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: activeTab ? 0 : insets.bottom }}>
      <StatusBar barStyle="light-content" />
      {children}
    </View>
  );
}

/* --------------------------------- Header ---------------------------------- */

// eyebrow (small line) / title / subtitle, optional back button, optional
// avatar on the left and optional control on the right.
export function ScreenHeader({ eyebrow, title, subtitle, onBack, avatar, onAvatarPress, right, children }) {
  return (
    <View style={s.header}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [s.backButton, pressed && s.glassPressed]}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={18} color={PALETTE.white} />
        </Pressable>
      ) : null}

      <View style={s.headerRow}>
        {avatar ? (
          <Pressable
            onPress={onAvatarPress}
            disabled={!onAvatarPress}
            style={({ pressed }) => [s.avatar, pressed && { opacity: 0.8 }]}
          >
            <Text style={s.avatarText}>{avatar}</Text>
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          {!!eyebrow && <Text style={s.eyebrow}>{eyebrow}</Text>}
          <Text style={s.title} numberOfLines={2}>{title}</Text>
          {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        </View>
        {right || null}
      </View>

      {children}
    </View>
  );
}

// Round glass icon button for the right side of a header (e.g. settings gear).
export function HeaderButton({ onPress, children, label }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.headerButton, pressed && s.glassPressed]}
      accessibilityLabel={label}
    >
      {children}
    </Pressable>
  );
}

/* ---------------------------------- Cards ---------------------------------- */

export function GlassCard({ children, style, onPress, padded = true, ...rest }) {
  const { G, border, blurTint } = useCardTheme();
  const base = [s.card, padded && s.cardPadding, { backgroundColor: G }, border];
  const blur = <BlurView intensity={40} tint={blurTint} style={StyleSheet.absoluteFill} />;

  // Tappable cards only dim a little while pressed - they never shift or resize.
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        {...rest}
        style={({ pressed }) => [...base, style, pressed && { opacity: 0.88 }]}
      >
        {blur}
        {children}
      </Pressable>
    );
  }
  return (
    <View {...rest} style={[...base, style]}>
      {blur}
      {children}
    </View>
  );
}

export function SectionTitle({ children, style }) {
  return <Text style={[s.sectionTitle, style]}>{children}</Text>;
}

/* --------------------------------- Buttons --------------------------------- */

// Every button is a teal "key": a soft top-to-bottom gradient, a light edge on
// top and a glow underneath. Pressing it only changes its colour - the button
// never moves or resizes, so nothing on screen jumps.
//   variant "solid": deep teal, white text - use INSIDE cards.
//   variant "light": bright aqua, deep-teal text - use on the page gradient.
const BUTTON_LOOKS = {
  solid: {
    colors: [BRAND.tealTop, BRAND.tealBottom],
    pressed: [BRAND.tealBottom, BRAND.dark],
    text: PALETTE.white,
    glow: BRAND.mid,
  },
  light: {
    colors: [BRAND.aquaTop, BRAND.aquaBottom],
    pressed: [BRAND.aquaBottom, BRAND.light],
    text: BRAND.deep,
    glow: BRAND.aqua,
  },
};

export function PrimaryButton({ label, onPress, disabled, loading, variant = "solid", style }) {
  const look = BUTTON_LOOKS[variant] || BUTTON_LOOKS.solid;
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.button,
        { shadowColor: look.glow },
        s.buttonShadow,
        off && { opacity: 0.5 },
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          <LinearGradient
            colors={pressed ? look.pressed : look.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[s.buttonEdge, { pointerEvents: "none" }]} />
          {loading ? (
            <ActivityIndicator color={look.text} />
          ) : (
            <Text style={[s.buttonText, { color: look.text }]}>{label}</Text>
          )}
        </>
      )}
    </Pressable>
  );
}

// Outlined / glassy secondary button.
export function SecondaryButton({ label, onPress, disabled, style, textColor = PALETTE.white }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.button,
        s.buttonSecondary,
        pressed && { backgroundColor: "rgba(77,212,206,0.22)" },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Text style={[s.buttonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

/* ----------------------------- Small components ---------------------------- */

export function Pill({ label, tone = "accent", style }) {
  const t = useCardTheme();
  const colors = {
    accent: { bg: t.accentSoft, fg: t.accent },
    amber: { bg: "rgba(242,184,75,0.2)", fg: t.amber },
    rose: { bg: "rgba(248,113,113,0.18)", fg: t.rose },
    green: { bg: "rgba(74,222,128,0.18)", fg: t.green },
    muted: { bg: t.track, fg: t.subtext },
  }[tone] || { bg: t.accentSoft, fg: t.accent };
  return (
    <View style={[s.pill, { backgroundColor: colors.bg }, style]}>
      <Text style={[s.pillText, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

// onGradient: use on the page background itself (white), otherwise inside a card.
export function ProgressBar({ pct, onGradient, style }) {
  const t = useCardTheme();
  const clamped = Math.max(0, Math.min(100, pct || 0));
  return (
    <View style={[s.progressTrack, { backgroundColor: onGradient ? "rgba(255,255,255,0.2)" : t.track }, style]}>
      <View
        style={[
          s.progressFill,
          { width: `${clamped}%`, backgroundColor: onGradient ? BRAND.aqua : t.accent },
        ]}
      />
    </View>
  );
}

// Segmented tabs used inside a screen (Explore tabs, Job Prep tabs).
export function SegmentedTabs({ tabs, active, onChange }) {
  return (
    <View style={s.segment}>
      {tabs.map((tab) => {
        const key = typeof tab === "string" ? tab : tab.key;
        const label = typeof tab === "string" ? tab : tab.label;
        const isActive = key === active;
        return (
          <Pressable
            key={key}
            style={({ pressed }) => [
              s.segmentItem,
              isActive && s.segmentItemActive,
              !isActive && pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
            ]}
            onPress={() => onChange(key)}
          >
            <Text style={[s.segmentText, isActive && { color: BRAND.deep }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Shown when a screen has nothing to display yet (e.g. quiz not taken).
export function EmptyState({ title, message, actionLabel, onAction }) {
  const t = useCardTheme();
  return (
    <GlassCard style={{ alignItems: "center", paddingVertical: 28 }}>
      <Text style={[s.emptyTitle, { color: t.text }]}>{title}</Text>
      <Text style={[s.emptyMessage, { color: t.subtext }]}>{message}</Text>
      {actionLabel ? <PrimaryButton label={actionLabel} onPress={onAction} style={{ alignSelf: "stretch" }} /> : null}
    </GlassCard>
  );
}

// A row of 2-3 headline numbers inside one glass card (Home and Profile).
export function StatsRow({ items }) {
  const t = useCardTheme();
  return (
    <GlassCard padded={false} style={s.statsCard}>
      {items.map((item, i) => (
        <View key={i} style={s.statCell}>
          <Text style={[s.statValue, { color: t.accent }]}>{item.value}</Text>
          <Text style={[s.statLabel, { color: t.text }]}>{item.label}</Text>
          {!!item.sub && <Text style={[s.statSub, { color: t.subtext }]}>{item.sub}</Text>}
        </View>
      ))}
    </GlassCard>
  );
}

/* --------------------------------- Tab bar --------------------------------- */

export const TABS = [
  { key: "Home", label: "Home", icon: HomeIcon },
  { key: "Explore", label: "Explore", icon: Compass },
  { key: "Roadmap", label: "Roadmap", icon: Map },
  { key: "Profile", label: "Profile", icon: User },
];

// ONE bar, drawn once by screens/MainTabs.js. Every tab has the same fixed
// size and the active one only changes colour, so tapping a tab never makes
// the bar (or anything in it) move - just like WhatsApp.
export function TabBar({ active, onChange }) {
  const insets = useSafeAreaInsets();
  const { dark } = useCardTheme();

  return (
    <View
      style={[
        s.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: dark ? "rgba(6,16,20,0.97)" : "rgba(3,31,30,0.96)",
        },
      ]}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            style={s.tabItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => !isActive && onChange(tab.key)}
          >
            {({ pressed }) => (
              <>
                <View
                  style={[
                    s.tabIconPill,
                    isActive && s.tabIconPillActive,
                    !isActive && pressed && { backgroundColor: "rgba(255,255,255,0.08)" },
                  ]}
                >
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.4 : 2}
                    color={isActive ? BRAND.aqua : "rgba(255,255,255,0.6)"}
                  />
                </View>
                <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{tab.label}</Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------------------------- Styles --------------------------------- */

const s = StyleSheet.create({
  header: {
    paddingHorizontal: LAYOUT.pad,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "rgba(77,212,206,0.14)",
    borderWidth: 1,
    borderColor: "rgba(77,212,206,0.32)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  glassPressed: { backgroundColor: "rgba(77,212,206,0.30)" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: BRAND.mid,
    borderWidth: 2,
    borderColor: "rgba(77,212,206,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: PALETTE.white },
  eyebrow: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "800", color: PALETTE.white },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(77,212,206,0.14)",
    borderWidth: 1,
    borderColor: "rgba(77,212,206,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    borderRadius: LAYOUT.radius,
    overflow: "hidden",
    shadowColor: PALETTE.black,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardPadding: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: PALETTE.white, marginBottom: 10 },

  button: {
    borderRadius: LAYOUT.buttonRadius,
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonShadow: {
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  // thin bright edge along the top gives the button its raised, tactile look
  buttonEdge: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: LAYOUT.buttonRadius,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderBottomColor: "rgba(0,0,0,0.12)",
  },
  buttonSecondary: {
    backgroundColor: "rgba(77,212,206,0.10)",
    borderWidth: 1.5,
    borderColor: "rgba(77,212,206,0.5)",
  },
  buttonText: { fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },

  pill: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999, alignSelf: "flex-start" },
  pillText: { fontSize: 11, fontWeight: "700" },

  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },

  segment: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: 14,
    padding: 4,
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  segmentItemActive: {
    backgroundColor: BRAND.aqua,
    shadowColor: BRAND.aqua,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "700" },

  statsCard: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 8 },
  statCell: { flex: 1, alignItems: "center", paddingVertical: 6, paddingHorizontal: 4 },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2, textAlign: "center" },
  statSub: { fontSize: 10, marginTop: 1, textAlign: "center" },

  emptyTitle: { fontSize: 17, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  emptyMessage: { fontSize: 13.5, lineHeight: 20, textAlign: "center", marginBottom: 18 },

  tabBar: {
    flexDirection: "row",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(77,212,206,0.18)",
  },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  // Same size whether active or not, so the bar never shifts when you tap.
  tabIconPill: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconPillActive: { backgroundColor: "rgba(77,212,206,0.18)" },
  tabLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600" },
  tabLabelActive: { color: BRAND.aqua, fontWeight: "700" },
});