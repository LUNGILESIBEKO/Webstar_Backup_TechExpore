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


const SESSION_TIMEOUT_MS = 15 * 60 * 1000; 
const LAST_ACTIVE_KEY = "lastActiveAt";


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
 
  React.useEffect(() => { checkFirestoreConnection(); }, []);

  
  const lastActive = React.useRef(Date.now());

  const markActive = React.useCallback(() => {
    const now = Date.now();
   
    if (now - lastActive.current > 10000) {
      AsyncStorage.setItem(LAST_ACTIVE_KEY, String(now)).catch(() => {});
    }
    lastActive.current = now;
    return false; 
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