import "react-native-gesture-handler";
import React from "react";
import { StyleSheet, View, AppState, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "./Firebase";
import { checkFirestoreConnection } from "./checkFirestore";

import { ThemeProvider, useTheme } from "./ThemeContext";
import { gradientFor } from "./theme";
import { ToastProvider } from "./components/Toast";


import MainTabs from "./screens/MainTabs";
import QuizScreen from "./screens/Quiz";
import CareerResultsScreen from "./screens/CareerResults";
import JobPrepHubScreen from "./screens/JobPrep";


import LoginScreen from "./screens/Login";
import SettingsScreen from "./screens/settingsScreen";
import MentorshipScreen from "./screens/mentor";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

// ---- Session timeout ----
// If a signed-in student does nothing (no taps, no scrolling) for this long,
// they are signed out and sent back to the Login screen.
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const LAST_ACTIVE_KEY = "lastActiveAt";

// Maps the lowercase route keys the older screens call internally
// (e.g. navigate("settings")) to the PascalCase route names registered
// below (e.g. "Settings"), so both naming styles can coexist.
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
// The four tabs (Home / Explore / Roadmap / Profile) live inside the "Main"
// screen, so they are opened with navigate("Main", { tab }).
const TAB_NAMES = ["Home", "Explore", "Roadmap", "Profile"];
const mapRoute = (key) => ROUTE_MAP[key] || key;
const go = (navigation, name, params) =>
  TAB_NAMES.includes(name)
    ? navigation.navigate("Main", { tab: name, tabParams: params })
    : navigation.navigate(name, params);

function LoginScreenAdapter({ navigation }) {
  return (
    <LoginScreen
      onLogin={() => navigation.reset({ index: 0, routes: [{ name: "Main", params: { tab: "Home" } }] })}
    />
  );
}

// Old screens' "back" buttons call navigate("profile") unconditionally.
// That's correct when they were pushed on top of Profile, but Mentor (and
// potentially others) can now be reached from Home too — pushing a new
// Profile screen instead of actually going back would leave stale screens
// stacked behind the user. This prefers a real goBack() when there's
// somewhere to go back to, and only falls back to a fresh Profile push
// when there isn't (e.g. deep-linking straight into the screen).
function goBackOrToProfile(navigation) {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.navigate("Main", { tab: "Profile" });
  }
}

function SettingsScreenAdapter({ navigation }) {
  return (
    <SettingsScreen
      navigate={(key) =>
        key === "profile" ? goBackOrToProfile(navigation) : go(navigation, mapRoute(key))
      }
      onLogout={async () => {
        try { await signOut(auth); } catch (e) { console.warn("Sign out failed:", e.message); }
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }}
    />
  );
}

function MentorshipScreenAdapter({ navigation }) {
  return (
    <MentorshipScreen
      navigate={(key) =>
        key === "profile" ? goBackOrToProfile(navigation) : go(navigation, mapRoute(key))
      }
    />
  );
}

// Shown for a moment at startup while we check whether the student is still
// signed in from last time.
function Splash() {
  const { dark } = useTheme();
  return (
    <LinearGradient
      colors={gradientFor(dark)}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.background, { alignItems: "center", justifyContent: "center" }]}
    >
      <ActivityIndicator size="large" color="#4dd4ce" />
    </LinearGradient>
  );
}

function RootStack({ initialRoute }) {
  const { dark } = useTheme();

  return (
    <LinearGradient
      colors={gradientFor(dark)}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreenAdapter} />
        <Stack.Screen name="Main" component={MainTabs} options={{ animation: "fade" }} />
        <Stack.Screen name="Settings" component={SettingsScreenAdapter} />
        <Stack.Screen name="Mentorship" component={MentorshipScreenAdapter} />
        <Stack.Screen name="JobPrep" component={JobPrepHubScreen} />
        <Stack.Screen name="CareerResults" component={CareerResultsScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
      </Stack.Navigator>
    </LinearGradient>
  );
}

export default function App() {
  // Runs once at startup: look in the console for ✅ or ❌
  React.useEffect(() => { checkFirestoreConnection(); }, []);

  // ---- Session timeout: log out after a period of no activity ----
  const lastActive = React.useRef(Date.now());

  const markActive = React.useCallback(() => {
    const now = Date.now();
    // Only write to storage at most once every 10 seconds
    if (now - lastActive.current > 10000) {
      AsyncStorage.setItem(LAST_ACTIVE_KEY, String(now)).catch(() => {});
    }
    lastActive.current = now;
    return false; // never block the touch - the screen underneath still gets it
  }, []);

  const expireSessionIfIdle = React.useCallback(async () => {
    if (!auth.currentUser) return;
    if (Date.now() - lastActive.current < SESSION_TIMEOUT_MS) return;
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Session sign out failed:", e.message);
    }
    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  }, []);

  // ---- Stay signed in ----
  // On startup, wait for Firebase to restore the saved login. If the student is
  // still signed in, their email is verified and they were not idle too long,
  // open straight on Main; otherwise open the Login screen.
  const [initialRoute, setInitialRoute] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      let route = "Login";
      try {
        await auth.authStateReady();

        // The last time the app was used is saved on the phone, so closing the
        // app and coming back after the timeout also needs a new login.
        try {
          const saved = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
          if (saved) lastActive.current = Number(saved);
        } catch (e) {}

        let user = auth.currentUser;
        if (user) {
          const idle = Date.now() - lastActive.current >= SESSION_TIMEOUT_MS;
          try {
            await user.reload(); // may fail offline - then use what we have saved
            await auth.currentUser?.getIdToken(true);
          } catch (e) {}
          user = auth.currentUser;
          if (idle || !user?.emailVerified) {
            await signOut(auth);
          } else {
            route = "Main";
            lastActive.current = Date.now();
          }
        }
      } catch (e) {
        console.warn("Could not restore login:", e?.message);
      }
      setInitialRoute(route);
    })();
  }, []);

  React.useEffect(() => {
    const interval = setInterval(expireSessionIfIdle, 30 * 1000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") expireSessionIfIdle(); // coming back from the background
      else AsyncStorage.setItem(LAST_ACTIVE_KEY, String(lastActive.current)).catch(() => {});
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [expireSessionIfIdle]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          {initialRoute ? (
            <View style={{ flex: 1 }} onStartShouldSetResponderCapture={markActive}>
              <NavigationContainer ref={navigationRef}>
                <RootStack initialRoute={initialRoute} />
              </NavigationContainer>
            </View>
          ) : (
            <Splash />
          )}
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
});