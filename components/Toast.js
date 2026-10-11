// components/Toast.js - in-app pop-up notifications.
//
//   const toast = useToast();
//   toast.show({ title: "Request sent", message: "Sipho will be notified", type: "success" });
//
// type: "success" | "info" | "error". The pop-up slides in from the top, sits
// above every screen, dismisses itself after `duration` ms, and can be tapped
// to dismiss (or to run `onPress`).

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { Animated, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Check, X } from "lucide-react-native";
import { useTheme } from "../ThemeContext";
import { BRAND, PALETTE } from "../theme";

const ToastContext = createContext({ show: () => {}, hide: () => {} });

export const useToast = () => useContext(ToastContext);

const TYPES = {
  success: { color: BRAND.dark, Icon: Check },
  info: { color: BRAND.light, Icon: Bell },
  error: { color: PALETTE.danger, Icon: X },
};

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();
  const [toast, setToast] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) setToast(null);
      }
    );
  }, [anim]);

  const show = useCallback(
    (opts) => {
      clearTimeout(timer.current);
      setToast({ type: "info", ...opts });
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, opts.duration ?? 4000);
    },
    [anim, hide]
  );

  const kind = TYPES[toast?.type] || TYPES.info;
  const Icon = kind.Icon;

  return (
    <ToastContext.Provider value={{ show, hide }}>
      <View style={{ flex: 1 }}>
        {children}
        {toast && (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.wrap,
              {
                top: insets.top + 8,
                opacity: anim,
                transform: [
                  { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) },
                ],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              onPress={() => {
                toast.onPress?.();
                hide();
              }}
              style={[styles.toast, { backgroundColor: dark ? PALETTE.text : "rgba(255,255,255,0.97)" }]}
            >
              <View style={[styles.iconCircle, { backgroundColor: kind.color }]}>
                <Icon size={16} color={PALETTE.white} strokeWidth={3} />
              </View>
              <View style={{ flex: 1 }}>
                {!!toast.title && (
                  <Text style={[styles.title, { color: dark ? PALETTE.textOnDark : PALETTE.text }]}>
                    {toast.title}
                  </Text>
                )}
                {!!toast.message && (
                  <Text style={[styles.message, { color: dark ? PALETTE.slateLight : PALETTE.slate }]}>
                    {toast.message}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 20,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: PALETTE.black,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "700" },
  message: { fontSize: 12.5, lineHeight: 17, marginTop: 1 },
});