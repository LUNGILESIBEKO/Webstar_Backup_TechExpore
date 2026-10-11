import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import Svg, { Path, Line, Polyline, Circle } from "react-native-svg";
import { BlurView } from "expo-blur";
import { useTheme } from "../ThemeContext";
import { useCardTheme, PALETTE, BRAND } from "../theme";
import { Screen, ScreenHeader } from "../components/UI";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import {
  deleteUser,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { db, auth } from "../Firebase";
import { useFirestoreList } from "../FirestoreHooks";

const prefs = [
  { label: "Push Notifications", key: "notifs" },
  { label: "Email Digest (Weekly)", key: "email" },
  { label: "Mentor Availability Alerts", key: "mentor" },
  { label: "New Job Listings", key: "jobs" },
];

// Choices for the "Year of Study" dropdown in Edit Profile.
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Other"];

// Fallback list; Firestore's `institutions` collection can replace this
// (each doc just needs a `name` and an `order`).
const SA_INSTITUTIONS_FALLBACK = [
  "University of Cape Town (UCT)",
  "University of the Witwatersrand (Wits)",
  "Stellenbosch University",
  "University of Pretoria (UP)",
  "University of Johannesburg (UJ)",
  "University of KwaZulu-Natal (UKZN)",
  "Rhodes University",
  "CPUT",
  "Tshwane University of Technology (TUT)",
  "Nelson Mandela University",
  "North-West University",
  "University of Limpopo",
  "Other",
];

const PRIVACY = `Last updated: 1 September 2025

1. Information We Collect
We collect information you provide directly — name, email address, institution, and quiz responses. We also collect usage data such as screens visited and features used to improve the app experience.

2. How We Use Your Information
Your data is used solely to personalise your career recommendations, roadmap progress, and mentor matching. We do not sell your personal information to third parties.

3. Data Storage
All data is stored securely using industry-standard encryption. We retain your account data for as long as your account is active. You may request deletion at any time from the Settings screen.

4. Third-Party Services
We use anonymised analytics to understand how users interact with the app. No personally identifiable information is shared with analytics providers.

5. Your Rights
You have the right to access, correct, or delete your personal data at any time. Contact us at privacy@techcareerexplorer.co.za.

6. Changes to This Policy
We may update this policy periodically. Significant changes will be communicated via in-app notification.`;

const TERMS = `Last updated: 1 September 2025

1. Acceptance of Terms
By using Tech Career Explorer, you agree to these Terms of Service. If you do not agree, please do not use the app.

2. Use of the App
Tech Career Explorer is intended for South African students and young professionals exploring technology careers. You must be at least 16 years old to create an account.

3. Account Responsibility
You are responsible for maintaining the confidentiality of your login credentials. You agree not to share your account or use another person's account without permission.

4. Career Guidance Disclaimer
Career match results, salary data, and roadmap content are provided for informational purposes only. They are based on publicly available market data and should not be considered professional career counselling advice.

5. Intellectual Property
All content within the app — including career data, roadmap content, and design — is the property of Tech Career Explorer. You may not reproduce or distribute it without permission.

6. Termination
We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent or harmful behaviour.

7. Contact
For questions regarding these terms, contact legal@techcareerexplorer.co.za.`;

function ChevronRight() {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
      <Path d="M1 1L6 6L1 11" stroke={PALETTE.slatePale} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={PALETTE.slate} strokeWidth={2.5} strokeLinecap="round">
      <Line x1={18} y1={6} x2={6} y2={18} />
      <Line x1={6} y1={6} x2={18} y2={18} />
    </Svg>
  );
}

function CheckCircle() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={BRAND.dark} />
      <Path d="M8 12l3 3 5-5" stroke={PALETTE.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ToggleSwitch({ value, onToggle }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={[styles.toggleTrack, { backgroundColor: value ? BRAND.dark : PALETTE.slatePale }]}
    >
      <View style={[styles.toggleThumb, { left: value ? 23 : 3 }]} />
    </TouchableOpacity>
  );
}

function SheetHeader({ title, onClose }) {
  return (
    <View style={styles.sheetHeaderRow}>
      <Text style={styles.sheetTitle}>{title}</Text>
      <TouchableOpacity onPress={onClose} style={styles.sheetCloseButton}>
        <CloseIcon />
      </TouchableOpacity>
    </View>
  );
}

function Field({ label, value, onChange, secureTextEntry, placeholder, keyboardType }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={styles.fieldInput}
        placeholderTextColor={PALETTE.slateLight}
      />
    </View>
  );
}

function Dropdown({ label, value, options, onSelect, placeholder = "Select" }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setOpen((o) => !o)} style={styles.dropdownButton}>
        <Text style={[styles.dropdownValue, !value && { color: PALETTE.slateLight }]}>{value || placeholder}</Text>
        <Svg width={12} height={8} viewBox="0 0 12 8" fill="none" style={open ? { transform: [{ rotate: "180deg" }] } : null}>
          <Path d="M1 1L6 6L11 1" stroke={PALETTE.slate} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownList}>
          {options.map((opt, i) => {
            const active = opt === value;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                style={[styles.dropdownItem, i < options.length - 1 && styles.rowBorder, active && styles.dropdownItemActive]}
              >
                <Text style={[styles.dropdownItemText, active && styles.institutionTextActive]}>{opt}</Text>
                {active && <CheckCircle />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

function SaveBtn({ onSave, onClose, label = "Save Changes", disabled }) {
  return (
    <View style={styles.saveRow}>
      <TouchableOpacity onPress={onClose} style={styles.cancelButton} disabled={disabled}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSave}
        style={[styles.saveButton, disabled && { opacity: 0.6 }]}
        disabled={disabled}
      >
        <Text style={styles.saveButtonText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Sheet({ visible, onClose, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheetBody}>
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen({ navigate, onLogout }) {
  const { dark, toggle: toggleDark } = useTheme();
  const t = useCardTheme();
  const [toggles, setToggles] = useState({ notifs: true, email: true, mentor: false, jobs: true });
  const [showDelete, setShowDelete] = useState(false);
  const [modal, setModal] = useState(null); // "editProfile" | "changePassword" | "institution" | "privacy" | "terms" | null
  const [saved, setSaved] = useState(false);

  // Edit profile state
  const [name, setName] = useState("Lerato Mokoena");
  const [email, setEmail] = useState("lerato.mokoena@students.up.ac.za");
  const [year, setYear] = useState("3rd Year");

  // Live institution list from Firestore, falling back to the hardcoded one.
  const SA_INSTITUTIONS = useFirestoreList(
    "institutions",
    SA_INSTITUTIONS_FALLBACK.map((name, i) => ({ name, order: i + 1 })),
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  ).map((row) => (typeof row === "string" ? row : row.name));

  const uid = auth.currentUser?.uid;

  // This is the part that actually gets INSERTED BY THE USER: everything
  // typed or toggled on this screen is saved to that person's own document
  // at users/{uid} in Firestore, so it's there next time they open the app
  // (and, per the security rules, only that person can read or write it).
  useEffect(() => {
    if (!uid) return; // not signed in - just use the local defaults above
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.fullName) setName(data.fullName);
          if (data.email) setEmail(data.email);
          if (data.year) setYear(data.year);
          if (data.institution) setInstitution(data.institution);
          if (data.notificationPrefs) setToggles((prev) => ({ ...prev, ...data.notificationPrefs }));
        } else if (auth.currentUser?.displayName || auth.currentUser?.email) {
          // Brand-new account, nothing saved yet - start from what Firebase
          // Auth already knows (the name/email given at sign-up).
          if (auth.currentUser.displayName) setName(auth.currentUser.displayName);
          if (auth.currentUser.email) setEmail(auth.currentUser.email);
        }
      } catch (err) {
        console.warn("Could not load saved profile from Firestore:", err.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const saveToFirestore = (fields) => {
    if (!uid) return; // not signed in - changes only last for this session
    setDoc(doc(db, "users", uid), fields, { merge: true }).catch((err) =>
      console.warn("Could not save profile to Firestore:", err.message)
    );
  };

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // "Yes, Delete" used to just call onLogout() - it never actually removed
  // anything. This deletes the user's Firestore profile doc AND their
  // Firebase Auth account, then logs them out.
  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (!auth.currentUser) {
      onLogout();
      return;
    }

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid));
      await deleteUser(auth.currentUser);
      onLogout();
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setDeleteError(
          "For security, please log out and log back in, then try deleting your account again."
        );
      } else {
        setDeleteError("Could not delete account: " + err.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  // Change password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // Institution state
  const [institution, setInstitution] = useState("University of Pretoria (UP)");

  const cardText = dark ? PALETTE.textOnDark : PALETTE.black;
  const rowText = dark ? PALETTE.slatePale : PALETTE.text;

  const handleSave = () => {
    // "Edit Profile" sheet - persist name/email/year to this user's document.
    saveToFirestore({ fullName: name, email, year, updatedAt: serverTimestamp() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setModal(null);
    }, 1200);
  };

  // This is the fix: previously this only validated the new password
  // locally and then saved unrelated profile fields to Firestore - the
  // actual Firebase Authentication password was never touched, so the
  // old password kept working forever. Now it reauthenticates with the
  // current password (Firebase requires a recent sign-in for this) and
  // then calls updatePassword, which is the call that actually replaces
  // the credential - after this resolves, the old password no longer
  // works for sign-in.
  const handlePasswordSave = async () => {
    setPwError("");

    if (!currentPw) {
      setPwError("Please enter your current password.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPw === currentPw) {
      setPwError("New password must be different from your current password.");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setPwError("You need to be signed in to change your password.");
      return;
    }

    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPw);

      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setModal(null);
      }, 1200);
    } catch (err) {
      console.error("Change password error:", err.code, err.message);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setPwError("Current password is incorrect.");
      } else if (err.code === "auth/weak-password") {
        setPwError("Please choose a stronger password.");
      } else if (err.code === "auth/requires-recent-login") {
        setPwError("For security, please log out and back in, then try again.");
      } else if (err.code === "auth/too-many-requests") {
        setPwError("Too many attempts. Wait a bit and try again.");
      } else {
        setPwError("Could not update password: " + err.message);
      }
    } finally {
      setPwSaving(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setPwError("");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  return (
    <Screen>
      <ScreenHeader onBack={() => navigate("profile")} eyebrow="Account & preferences" title="Settings" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <View>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={[styles.card, { backgroundColor: t.G }, t.border]}>
            <BlurView intensity={40} tint={t.blurTint} style={StyleSheet.absoluteFill} />
            {[
              { label: "Edit Profile", action: () => setModal("editProfile") },
              { label: "Change Password", action: () => setModal("changePassword") },
              { label: "University / Institution", action: () => setModal("institution") },
            ].map(({ label, action }, i, arr) => (
              <TouchableOpacity
                key={label}
                onPress={action}
                style={[styles.row, i < arr.length - 1 && styles.rowBorder]}
              >
                <Text style={[styles.rowLabel, { color: cardText }]}>{label}</Text>
                <ChevronRight />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Appearance */}
        <View>
          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={[styles.card, { backgroundColor: t.G }, t.border]}>
            <BlurView intensity={40} tint={t.blurTint} style={StyleSheet.absoluteFill} />
            <View style={styles.appearanceRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.appearanceTitle, { color: cardText }]}>Dark Mode</Text>
                <Text style={styles.appearanceSubtitle}>{dark ? "Dark theme active" : "Light theme active"}</Text>
              </View>
              <ToggleSwitch
                value={dark}
                onToggle={() => {
                  toggleDark();
                  saveToFirestore({ darkMode: !dark });
                }}
              />
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: t.G }, t.border]}>
            <BlurView intensity={40} tint={t.blurTint} style={StyleSheet.absoluteFill} />
            {prefs.map((p, i, arr) => (
              <View key={p.key} style={[styles.prefRow, i < arr.length - 1 && styles.rowBorder]}>
                <Text style={[styles.rowLabel, { color: rowText, flex: 1, fontSize: 14 }]}>{p.label}</Text>
                <ToggleSwitch
                  value={toggles[p.key]}
                  onToggle={() => {
                    const next = { ...toggles, [p.key]: !toggles[p.key] };
                    setToggles(next);
                    saveToFirestore({ notificationPrefs: next });
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View>
          <Text style={styles.sectionLabel}>About</Text>
          <View style={[styles.card, { backgroundColor: t.G }, t.border]}>
            <BlurView intensity={40} tint={t.blurTint} style={StyleSheet.absoluteFill} />
            <TouchableOpacity onPress={() => setModal("privacy")} style={[styles.row, styles.rowBorder]}>
              <Text style={[styles.rowLabel, { color: cardText }]}>Privacy Policy</Text>
              <ChevronRight />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal("terms")} style={[styles.row, styles.rowBorder]}>
              <Text style={[styles.rowLabel, { color: cardText }]}>Terms of Service</Text>
              <ChevronRight />
            </TouchableOpacity>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: cardText }]}>App Version</Text>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View>
          <Text style={styles.sectionLabel}>Account Actions</Text>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={PALETTE.white} strokeWidth={2} strokeLinecap="round" />
              <Polyline points="16,17 21,12 16,7" stroke={PALETTE.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <Line x1={21} y1={12} x2={9} y2={12} stroke={PALETTE.white} strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          {!showDelete ? (
            <TouchableOpacity onPress={() => setShowDelete(true)} style={styles.deleteButton}>
              <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Polyline points="3,6 5,6 21,6" stroke={PALETTE.danger} strokeWidth={2} strokeLinecap="round" />
                <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke={PALETTE.danger} strokeWidth={2} strokeLinecap="round" />
                <Line x1={10} y1={11} x2={10} y2={17} stroke={PALETTE.danger} strokeWidth={2} strokeLinecap="round" />
                <Line x1={14} y1={11} x2={14} y2={17} stroke={PALETTE.danger} strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.confirmCard}>
              <BlurView intensity={40} tint={t.blurTint} style={StyleSheet.absoluteFill} />
              <Text style={styles.confirmTitle}>Are you sure?</Text>
              <Text style={styles.confirmBody}>
                This permanently deletes your account, matches, and all progress.
              </Text>
              {!!deleteError && <Text style={styles.deleteErrorText}>{deleteError}</Text>}
              <View style={styles.confirmRow}>
                <TouchableOpacity
                  onPress={() => {
                    setShowDelete(false);
                    setDeleteError("");
                  }}
                  disabled={deleting}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  disabled={deleting}
                  style={[styles.confirmDeleteButton, deleting && { opacity: 0.6 }]}
                >
                  <Text style={styles.confirmDeleteText}>{deleting ? "Deleting…" : "Yes, Delete"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Edit Profile Sheet ── */}
      <Sheet visible={modal === "editProfile"} onClose={closeModal}>
        <SheetHeader title="Edit Profile" onClose={closeModal} />
        <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" />
        <Field label="Email Address" value={email} onChange={setEmail} placeholder="your@email.com" keyboardType="email-address" />
        <Dropdown label="Year of Study" value={year} options={YEAR_OPTIONS} onSelect={setYear} placeholder="Select your year" />
        {saved && <Text style={styles.savedText}>Saved!</Text>}
        <SaveBtn onSave={handleSave} onClose={closeModal} />
      </Sheet>

      {/* ── Change Password Sheet ── */}
      <Sheet visible={modal === "changePassword"} onClose={closeModal}>
        <SheetHeader title="Change Password" onClose={closeModal} />
        <Field label="Current Password" value={currentPw} onChange={setCurrentPw} secureTextEntry placeholder="••••••••" />
        <Field label="New Password" value={newPw} onChange={setNewPw} secureTextEntry placeholder="••••••••" />
        <Field label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} secureTextEntry placeholder="••••••••" />
        {!!pwError && <Text style={styles.errorText}>{pwError}</Text>}
        {saved && <Text style={styles.savedText}>Password updated!</Text>}
        <SaveBtn
          onSave={handlePasswordSave}
          onClose={closeModal}
          label={pwSaving ? "Updating…" : "Save Changes"}
          disabled={pwSaving}
        />
      </Sheet>

      {/* ── Institution Sheet ── */}
      <Sheet visible={modal === "institution"} onClose={closeModal}>
        <SheetHeader title="University / Institution" onClose={closeModal} />
        <Text style={styles.sheetHint}>Select your current institution</Text>
        <View style={{ gap: 8, marginBottom: 20 }}>
          {SA_INSTITUTIONS.map((inst) => {
            const active = institution === inst;
            return (
              <TouchableOpacity
                key={inst}
                onPress={() => {
                  setInstitution(inst);
                  saveToFirestore({ institution: inst });
                }}
                style={[styles.institutionRow, active && styles.institutionRowActive]}
              >
                <Text style={[styles.institutionText, active && styles.institutionTextActive]}>{inst}</Text>
                {active && <CheckCircle />}
              </TouchableOpacity>
            );
          })}
        </View>
        {saved && <Text style={styles.savedText}>Saved!</Text>}
        <SaveBtn onSave={handleSave} onClose={closeModal} />
      </Sheet>

      {/* ── Privacy Policy Sheet ── */}
      <Sheet visible={modal === "privacy"} onClose={closeModal}>
        <SheetHeader title="Privacy Policy" onClose={closeModal} />
        <Text style={styles.legalText}>{PRIVACY}</Text>
        <TouchableOpacity onPress={closeModal} style={styles.legalCloseButton}>
          <Text style={styles.legalCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </Sheet>

      {/* ── Terms of Service Sheet ── */}
      <Sheet visible={modal === "terms"} onClose={closeModal}>
        <SheetHeader title="Terms of Service" onClose={closeModal} />
        <Text style={styles.legalText}>{TERMS}</Text>
        <TouchableOpacity onPress={closeModal} style={styles.legalCloseButton}>
          <Text style={styles.legalCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 18 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
  },
  row: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(128,128,128,0.18)" },
  rowLabel: { fontSize: 15 },
  versionText: { fontFamily: "monospace", fontSize: 13, color: PALETTE.slateLight },
  appearanceRow: { paddingVertical: 15, paddingHorizontal: 18, flexDirection: "row", alignItems: "center" },
  appearanceTitle: { fontSize: 14 },
  appearanceSubtitle: { fontSize: 11, color: PALETTE.slateLight },
  prefRow: { paddingVertical: 15, paddingHorizontal: 18, flexDirection: "row", alignItems: "center" },
  toggleTrack: { width: 48, height: 28, borderRadius: 14, justifyContent: "center" },
  toggleThumb: {
    position: "absolute",
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PALETTE.white,
    shadowColor: PALETTE.black,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoutButton: {
    width: "100%",
    paddingVertical: 17,
    borderRadius: 14,
    backgroundColor: BRAND.dark,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoutText: { color: PALETTE.white, fontSize: 16, fontWeight: "700" },
  deleteButton: {
    width: "100%",
    paddingVertical: 17,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PALETTE.dangerSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
  },
  deleteText: { color: PALETTE.danger, fontSize: 16, fontWeight: "700" },
  deleteErrorText: { color: PALETTE.danger, fontSize: 13, marginBottom: 10 },
  confirmCard: { borderWidth: 2, borderColor: PALETTE.dangerSoft, borderRadius: 16, padding: 20, overflow: "hidden" },
  confirmTitle: { fontSize: 16, fontWeight: "700", color: PALETTE.danger, marginBottom: 8 },
  confirmBody: { fontSize: 13, color: PALETTE.slate, marginBottom: 16, lineHeight: 19 },
  confirmRow: { flexDirection: "row", gap: 10 },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
  },
  cancelButtonText: { color: PALETTE.slateDark, fontSize: 15, fontWeight: "600" },
  confirmDeleteButton: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: PALETTE.danger, alignItems: "center" },
  confirmDeleteText: { color: PALETTE.white, fontSize: 15, fontWeight: "700" },

  // ---- Bottom sheet / modal ----
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheetBody: {
    backgroundColor: PALETTE.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    maxHeight: "82%",
  },
  sheetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: PALETTE.ink },
  sheetCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetHint: { fontSize: 13, color: PALETTE.slate, marginBottom: 16 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: PALETTE.slate,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldInput: {
    width: "100%",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.8)",
    fontSize: 15,
    color: PALETTE.ink,
  },
  saveRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: BRAND.dark, alignItems: "center" },
  saveButtonText: { color: PALETTE.white, fontSize: 15, fontWeight: "700" },
  savedText: { textAlign: "center", color: BRAND.dark, fontSize: 13, fontWeight: "700", marginBottom: 8 },
  errorText: { color: PALETTE.danger, fontSize: 13, marginBottom: 12 },
  dropdownButton: {
    width: "100%",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: { fontSize: 15, color: PALETTE.ink },
  dropdownList: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.95)",
    overflow: "hidden",
  },
  dropdownItem: { paddingVertical: 13, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dropdownItemActive: { backgroundColor: "rgba(13,84,81,0.08)" },
  dropdownItemText: { fontSize: 14, color: PALETTE.slateDark },
  institutionRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  institutionRowActive: { borderWidth: 2, borderColor: BRAND.dark, backgroundColor: "rgba(13,84,81,0.08)" },
  institutionText: { fontSize: 14, color: PALETTE.slateDark },
  institutionTextActive: { color: BRAND.dark, fontWeight: "700" },
  legalText: { fontSize: 13, color: PALETTE.slateDark, lineHeight: 22 },
  legalCloseButton: { width: "100%", marginTop: 24, paddingVertical: 14, borderRadius: 12, backgroundColor: BRAND.dark, alignItems: "center" },
  legalCloseButtonText: { color: PALETTE.white, fontSize: 15, fontWeight: "700" },
});