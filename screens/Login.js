import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

// ✅ Firebase imports
import { auth, db } from "../Firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { PALETTE, BRAND } from "../theme";

// Simple but solid email-shape check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/;
const MIN_PASSWORD_LENGTH = 6;
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Other"];

function getEmailError(value) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Email is required";
  if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address (e.g. you@example.com)";
  return "";
}

function getNameError(value) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Full name is required";
  if (!NAME_REGEX.test(trimmed)) return "Name can only contain letters (no numbers or symbols)";
  return "";
}

function getYearError(value, isSignup) {
  if (!isSignup) return "";
  if (!value) return "Please select your year of study";
  return "";
}

function getPasswordError(value) {
  if (value.length === 0) return "Password is required";
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (!/\d/.test(value)) return "Password must include at least one number";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password must include at least one symbol (e.g. ! @ # $)";
  return "";
}

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [yearTouched, setYearTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailError = getEmailError(email);
  const passwordError = getPasswordError(password);
  const nameError = isSignup ? getNameError(fullName) : "";
  const yearError = getYearError(yearOfStudy, isSignup);
  const showEmailError = (emailTouched || submitAttempted) && emailError;
  const showPasswordError = (passwordTouched || submitAttempted) && passwordError;
  const showNameError = (nameTouched || submitAttempted) && nameError;
  const showYearError = (yearTouched || submitAttempted) && yearError;

  const valid = !emailError && !passwordError && !nameError && !yearError;

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [resetSending, setResetSending] = useState(false);
  // "Please verify your email" message (+ resend link). Shown after sign-up
  // and whenever someone signs in before clicking the link in their email.
  const [notice, setNotice] = useState(null); // { text }
  const [resending, setResending] = useState(false);

  // Turns Firebase's technical error codes into friendly messages.
  const friendlyError = (code) => {
    switch (code) {
      case "auth/email-already-in-use": return "That email already has an account. Try signing in.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found": return "Wrong email or password. If you are new, tap Sign Up first.";
      case "auth/operation-not-allowed": return "Email/Password sign-in is not enabled in the Firebase console (Authentication > Sign-in method).";
      case "auth/network-request-failed": return "No internet connection.";
      case "auth/too-many-requests": return "Too many attempts. Wait a bit and try again.";
      default: return "Something went wrong (" + code + ").";
    }
  };

  // "Forgot password?" used to have no onPress at all - tapping it did
  // nothing. This sends a real Firebase password-reset email to whatever
  // is currently typed in the Email field.
  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (getEmailError(trimmedEmail)) {
      setEmailTouched(true);
      Alert.alert("Enter your email first", "Type your email address above, then tap \"Forgot password?\" again.");
      return;
    }
    setResetSending(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      Alert.alert("Check your inbox", `We've sent a password reset link to ${trimmedEmail}.`);
    } catch (error) {
      console.error("Password reset error:", error.code, error.message);
      Alert.alert("Couldn't send reset email", friendlyError(error.code));
    } finally {
      setResetSending(false);
    }
  };

  // Sends a fresh verification email. Firebase only allows that for a signed-in
  // user, so we sign in with what is typed, send the link, and sign out again.
  const handleResend = async () => {
    if (getEmailError(email) || !password) {
      setNotice(null);
      setAuthError("Type your email and password above, then tap \"Resend verification email\".");
      return;
    }
    setResending(true);
    setAuthError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await cred.user.reload();
      if (auth.currentUser?.emailVerified) {
        setNotice(null);
        setAuthError("Your email is already verified - tap Sign In.");
      } else {
        await sendEmailVerification(cred.user);
        setNotice({ text: `We sent a new verification link to ${email.trim()}. Open it, then tap Sign In. Check your spam folder too.` });
      }
    } catch (error) {
      console.error("Resend verification error:", error.code, error.message);
      setNotice(null);
      setAuthError(friendlyError(error.code));
    } finally {
      try { await signOut(auth); } catch (e) {}
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    if (!valid) {
      setSubmitAttempted(true);
      return;
    }
    setLoading(true);
    setAuthError("");
    setNotice(null);
    try {
      if (isSignup) {
        // 1) Create the login account in Firebase Authentication
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        // 2) Create this student's profile document at users/{uid} in Firestore
        await setDoc(doc(db, "users", cred.user.uid), {
          fullName: fullName.trim() || "Student",
          email: email.trim(),
          institution: "",
          course: "",
          year: yearOfStudy,
          skillsTracked: 0,
          roadmapStep: 0,
          roadmapTotal: 0,
          completedRoadmapSteps: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        // 3) Email them a verification link, then sign out: the student can
        //    only enter the app after clicking it (the Firestore rules need it too).
        try { await sendEmailVerification(cred.user); } catch (e) { console.warn("Verification email failed:", e.code); }
        await signOut(auth);
        setIsSignup(false);
        setSubmitAttempted(false);
        setNotice({ text: `Account created! We sent a verification link to ${email.trim()}. Open it, then come back and sign in. Check your spam folder too.` });
        return;
      }

      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Pick up a verification that happened after the last sign-in, and refresh
      // the login token so Firestore sees email_verified = true.
      await cred.user.reload();
      if (!auth.currentUser?.emailVerified) {
        await signOut(auth);
        setNotice({ text: `Please verify your email first - we sent a link to ${email.trim()}. Open it, then tap Sign In again.` });
        return;
      }
      await auth.currentUser.getIdToken(true);
      // Success: App.js adapter sends the user to Home
      setPassword("");
      setSubmitAttempted(false);
      onLogin && onLogin();
    } catch (error) {
      console.error("Auth/Firestore error:", error.code, error.message);
      setAuthError(friendlyError(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
              <Text style={styles.logoBadgeText}>TC</Text>
            </View>
            <View>
              <Text style={styles.brandName}>Tech Career</Text>
              <Text style={styles.brandSub}>Explorer</Text>
            </View>
          </View>

          <Text style={styles.heading}>{isSignup ? "Create your\naccount" : "Welcome\nback"}</Text>
          <Text style={styles.subheading}>
            {isSignup
              ? "Start mapping your tech career path today."
              : "Your career journey continues here."}
          </Text>
        </View>

        {/* Glass form card */}
        <View style={styles.formSection}>
          <View style={styles.formCard}>
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />

            {isSignup && (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  onBlur={() => setNameTouched(true)}
                  placeholder="Enter your Full Name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  autoCapitalize="words"
                  style={[styles.input, showNameError && styles.inputError]}
                />
                {!!showNameError && <Text style={styles.errorText}>{nameError}</Text>}
              </View>
            )}

            {isSignup && (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Year of Study</Text>
                <TouchableOpacity
                  onPress={() => {
                    setYearPickerOpen(true);
                    setYearTouched(true);
                  }}
                  style={[styles.input, styles.dropdownInput, showYearError && styles.inputError]}
                >
                  <Text style={yearOfStudy ? styles.dropdownValueText : styles.dropdownPlaceholderText}>
                    {yearOfStudy || "Select your year of study"}
                  </Text>
                  <Text style={styles.dropdownChevron}>▾</Text>
                </TouchableOpacity>
                {!!showYearError && <Text style={styles.errorText}>{yearError}</Text>}

                <Modal
                  visible={yearPickerOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setYearPickerOpen(false)}
                >
                  <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={1}
                    onPress={() => setYearPickerOpen(false)}
                  >
                    <View style={styles.dropdownSheet}>
                      <Text style={styles.dropdownSheetTitle}>Year of Study</Text>
                      <FlatList
                        data={YEAR_OPTIONS}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.dropdownOption}
                            onPress={() => {
                              setYearOfStudy(item);
                              setYearPickerOpen(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                yearOfStudy === item && styles.dropdownOptionTextSelected,
                              ]}
                            >
                              {item}
                            </Text>
                            {yearOfStudy === item && <Text style={styles.dropdownCheck}>✓</Text>}
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>
            )}

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@university.ac.za"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, showEmailError && styles.inputError]}
              />
              {!!showEmailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            <View style={[styles.fieldWrap, { marginBottom: isSignup ? 20 : 8 }]}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={{ position: "relative", justifyContent: "center" }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  style={[styles.input, { paddingRight: 56 }, showPasswordError && styles.inputError]}
                />
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  style={styles.showButton}
                >
                  <Text style={styles.showButtonText}>{showPass ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
              </View>
              {!!showPasswordError && <Text style={styles.errorText}>{passwordError}</Text>}
              {!showPasswordError && (
                <Text style={styles.hintText}>
                  At least {MIN_PASSWORD_LENGTH} characters, with a number and a symbol
                </Text>
              )}
            </View>

            {!isSignup && (
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={resetSending}
                style={styles.forgotWrap}
              >
                <Text style={styles.forgotText}>
                  {resetSending ? "Sending…" : "Forgot password?"}
                </Text>
              </TouchableOpacity>
            )}

            {!!authError && <Text style={styles.errorText}>{authError}</Text>}

            {!!notice && (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>{notice.text}</Text>
                <TouchableOpacity onPress={handleResend} disabled={resending}>
                  <Text style={styles.noticeLink}>
                    {resending ? "Sending…" : "Resend verification email"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              disabled={loading}
              onPress={handleSubmit}
              style={[styles.primaryButton, valid ? styles.primaryButtonActive : styles.primaryButtonDisabled]}
            >
              <Text style={[styles.primaryButtonText, valid ? styles.primaryButtonTextActive : styles.primaryButtonTextDisabled]}>
                {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* This used to call onLogin() directly, which dropped the user
                into Home with no real Firebase account (auth.currentUser
                stayed empty). That silently broke every save in the app for
                anyone who tapped it, since every write keys off the signed
                in user's uid. Real Google sign-in needs its own Google
                Cloud OAuth client + Firebase console setup, so for now this
                just says so instead of faking a session. */}
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Not set up yet",
                  "Google sign-in isn't connected yet. Please use email and password for now."
                )
              }
              style={styles.googleButton}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isSignup ? "Already have an account? " : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => { setIsSignup(!isSignup); setNotice(null); setAuthError(""); }}>
                <Text style={styles.switchLink}>{isSignup ? "Sign In" : "Sign Up"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  logoSection: { paddingHorizontal: 32, paddingTop: 24 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 44 },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoBadgeText: { fontWeight: "800", fontSize: 14, color: PALETTE.white },
  brandName: { fontWeight: "800", fontSize: 16, color: PALETTE.white },
  brandSub: {
    fontWeight: "600",
    fontSize: 11,
    color: PALETTE.white,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heading: {
    fontSize: 36,
    fontWeight: "800",
    color: PALETTE.white,
    marginBottom: 10,
    lineHeight: 42,
  },
  subheading: { fontSize: 15, color: PALETTE.white },
  formSection: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 24,
  },
  formCard: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    overflow: "hidden",
    shadowColor: PALETTE.black,
    shadowOpacity: 0.2,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: PALETTE.white,
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.1)",
    fontSize: 15,
    color: PALETTE.white,
  },
  showButton: {
    position: "absolute",
    right: 14,
  },
  showButtonText: { color: PALETTE.white, fontSize: 13 },
  inputError: {
    borderColor: PALETTE.dangerOnDark,
  },
  dropdownInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValueText: {
    color: PALETTE.white,
    fontSize: 15,
  },
  dropdownPlaceholderText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 15,
  },
  dropdownChevron: {
    color: PALETTE.white,
    fontSize: 14,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  dropdownSheet: {
    backgroundColor: BRAND.dark,
    borderRadius: 16,
    paddingVertical: 12,
    maxHeight: 320,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  dropdownSheetTitle: {
    color: PALETTE.white,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  dropdownOptionText: {
    color: PALETTE.white,
    fontSize: 15,
  },
  dropdownOptionTextSelected: {
    fontWeight: "700",
  },
  dropdownCheck: {
    color: BRAND.aqua,
    fontSize: 16,
    fontWeight: "700",
  },
  noticeBox: {
    backgroundColor: "rgba(77,212,206,0.16)",
    borderWidth: 1,
    borderColor: "rgba(77,212,206,0.5)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  noticeText: { color: PALETTE.white, fontSize: 13, lineHeight: 19 },
  noticeLink: { color: BRAND.aqua, fontSize: 13, fontWeight: "800", marginTop: 8 },
  errorText: {
    color: PALETTE.dangerSoft,
    fontSize: 12,
    marginTop: 6,
  },
  hintText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 6,
  },
  forgotWrap: { alignItems: "flex-end", marginBottom: 20 },
  forgotText: { color: PALETTE.white, fontSize: 13 },
  primaryButton: {
    width: "100%",
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonActive: {
    backgroundColor: BRAND.aqua,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: BRAND.aqua,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  primaryButtonDisabled: { backgroundColor: "rgba(255,255,255,0.3)" },
  primaryButtonText: { fontSize: 17, fontWeight: "800" },
  primaryButtonTextActive: { color: BRAND.deep },
  primaryButtonTextDisabled: { color: PALETTE.white },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  dividerText: { fontSize: 12, color: PALETTE.white },
  googleButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(77,212,206,0.5)",
    backgroundColor: "rgba(77,212,206,0.10)",
    alignItems: "center",
    marginBottom: 20,
  },
  googleButtonText: { color: PALETTE.white, fontSize: 15, fontWeight: "600" },
  switchRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  switchText: { fontSize: 14, color: PALETTE.white },
  switchLink: { fontSize: 14, fontWeight: "700", color: PALETTE.white },
});