// screens/MainTabs.js - the "real app" shell.
//
// Home / Explore / Roadmap / Profile all live inside this ONE screen, with ONE
// tab bar drawn once at the bottom. Tapping a tab only swaps the content above
// the bar (with a quick fade) - the bar itself never slides, re-mounts or
// moves, exactly like WhatsApp. Screens that open on top (Settings, Quiz,
// Mentorship, Job Prep ...) still slide in as normal and slide back out to the
// same tab you left.
//
// The old screens call navigation.navigate("Explore", params) /
// navigation.reset({ routes: [{ name: "Profile" }] }) and so on. The `tabNav`
// object below catches those calls for the four tab names and turns them into
// a tab switch, and passes everything else on to the real navigator, so none
// of those screens had to be rewritten.

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { TabBar, TABS } from "../components/UI";

import HomeScreen from "./Home";
import ExploreScreen from "./Explore";
import Roadmap from "./Roadmap";
import ProfileScreen from "./profileScreen";

const TAB_KEYS = TABS.map((t) => t.key);

// Lowercase keys used by the older screens -> real route names.
const ROUTE_MAP = {
  profile: "Profile",
  settings: "Settings",
  mentorship: "Mentorship",
  prep: "JobPrep",
  results: "CareerResults",
  roadmap: "Roadmap",
  login: "Login",
  home: "Home",
};
const mapRoute = (key) => ROUTE_MAP[key] || key;

export default function MainTabs({ navigation, route }) {
  const [active, setActive] = useState(
    TAB_KEYS.includes(route?.params?.tab) ? route.params.tab : "Home"
  );
  // Params handed to a tab when it was opened (e.g. Explore -> { initialTab }).
  const [tabParams, setTabParams] = useState(route?.params?.tabParams ? { [route.params.tab]: route.params.tabParams } : {});

  const select = useCallback((key, params) => {
    setTabParams((prev) => ({ ...prev, [key]: params }));
    setActive(key);
  }, []);

  // Another screen asked for a specific tab (e.g. "View My Roadmap").
  useEffect(() => {
    const wanted = route?.params?.tab;
    if (wanted && TAB_KEYS.includes(wanted)) select(wanted, route.params.tabParams);
  }, [route?.params?.tab, route?.params?.tabParams, select]);

  // Gentle fade of the content only - the tab bar is outside this view.
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    fade.setValue(0.4);
    Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [active, fade]);

  const tabNav = useMemo(
    () => ({
      ...navigation,
      navigate: (name, params) =>
        TAB_KEYS.includes(name) ? select(name, params) : navigation.navigate(name, params),
      reset: (state) => {
        const first = state?.routes?.[0];
        if (first && TAB_KEYS.includes(first.name)) select(first.name, first.params);
        else navigation.reset(state);
      },
      getState: () => {
        const real = navigation.getState();
        return { ...real, routeNames: [...TAB_KEYS, ...(real?.routeNames || [])] };
      },
    }),
    [navigation, select]
  );

  const screenRoute = { params: tabParams[active] };
  let screen;
  if (active === "Explore") screen = <ExploreScreen navigation={tabNav} route={screenRoute} />;
  else if (active === "Roadmap") screen = <Roadmap navigation={tabNav} route={screenRoute} />;
  else if (active === "Profile")
    screen = (
      <ProfileScreen navigation={tabNav} navigate={(key) => tabNav.navigate(mapRoute(key))} />
    );
  else screen = <HomeScreen navigation={tabNav} route={screenRoute} />;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.content, { opacity: fade }]}>{screen}</Animated.View>
      <TabBar active={active} onChange={(key) => select(key, undefined)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
