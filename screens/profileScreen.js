import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { auth } from "../Firebase";
import { useCardTheme, BRAND, PALETTE } from "../theme";
import { useUserDoc, useRoadmapSteps, trackIdFromResult, countCompleted } from "../careerEngine";
import { Screen, ScreenHeader, HeaderButton, GlassCard, SectionTitle, StatsRow, Pill } from "../components/UI";

const quickActions = [
  { label: "My Roadmap", screen: "roadmap" },
  { label: "Find a Mentor", screen: "mentorship" },
  { label: "Prep Hub", screen: "prep" },
  { label: "Settings", screen: "settings" },
];

function initials(title) {
  return (title || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Firestore timestamps have .toDate(); turn one into "Today", "Yesterday" or a date, followed by the time.
function whenLabel(ts) {
  const d = ts?.toDate ? ts.toDate() : null;
  if (!d) return "";
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days <= 0) return `Today, ${time}`;
  if (days === 1) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString()}, ${time}`;
}

function SettingsGearIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={PALETTE.white} strokeWidth={2} />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={PALETTE.white}
        strokeWidth={2}
      />
    </Svg>
  );
}

export default function ProfileScreen({ navigate, navigation }) {
  const t = useCardTheme();

  // Everything on this screen comes from Firestore: users/{uid}
  // (re-read every time the screen comes into view).
  const { profile, loaded } = useUserDoc();

  const user = auth.currentUser;
  const fullName = profile?.fullName || user?.displayName || user?.email || "Student";
  const courseLine = [profile?.course, profile?.year].filter(Boolean).join(" · ");

  const quiz = profile?.quizResult;

  // Roadmap numbers are for the career track the quiz picked.
  const trackId = trackIdFromResult(quiz);
  const roadmapSteps = useRoadmapSteps(trackId);
  const totalSteps = roadmapSteps.length;
  const completedSteps = countCompleted(roadmapSteps, profile?.completedRoadmapSteps);
  const roadmapPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const mentorRequests = Array.isArray(profile?.mentorRequests) ? profile.mentorRequests : [];

  // Skills the student chose to track on the Explore screen.
  const trackedSkills = Array.isArray(profile?.trackedSkills) ? profile.trackedSkills : [];

  const stats = [
    { label: "Quiz", value: quiz ? "Done" : "Not yet", sub: quiz ? "Matched" : "Take the quiz" },
    {
      label: "Roadmap",
      value: trackId ? `${roadmapPercent}%` : "—",
      sub: trackId ? `${completedSteps} of ${totalSteps}` : "Take the quiz",
    },
    { label: "Mentors", value: String(mentorRequests.length), sub: "Requested" },
  ];

  // Top 3 matches saved by the quiz
  const savedCareers = Array.isArray(quiz?.matches) ? quiz.matches.slice(0, 3) : [];

  // Recent activity is built from what the student has really done
  const recentActivity = [];
  if (quiz) recentActivity.push({ text: "Completed Interest Quiz", time: whenLabel(quiz.completedAt) });
  if (quiz?.topMatch?.title)
    recentActivity.push({ text: `Top match: ${quiz.topMatch.title}`, time: whenLabel(quiz.completedAt) });
  if (completedSteps > 0)
    recentActivity.push({ text: `Completed ${completedSteps} roadmap step${completedSteps === 1 ? "" : "s"}`, time: whenLabel(profile?.roadmapUpdatedAt) });
  mentorRequests.forEach((name) =>
    recentActivity.push({ text: `Requested mentorship from ${name}`, time: whenLabel(profile?.mentorRequestTimes?.[name]) })
  );

  return (
    <Screen navigation={navigation} activeTab="Profile">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          avatar={initials(fullName) || "S"}
          eyebrow={profile?.institution || (loaded ? "Add your institution in Settings" : "Loading...")}
          title={fullName}
          subtitle={courseLine || undefined}
          right={
            <HeaderButton onPress={() => navigate("settings")} label="Settings">
              <SettingsGearIcon />
            </HeaderButton>
          }
        />

        <View style={styles.body}>
          <StatsRow items={stats} />

          <SectionTitle style={styles.sectionGap}>Saved Matches</SectionTitle>
          <View style={styles.list}>
            {savedCareers.length === 0 && (
              <GlassCard onPress={() => navigate("Quiz")} style={styles.rowCard}>
                <Text style={[styles.rowTitle, { color: t.subtext }]}>
                  No matches yet - tap to take the career quiz
                </Text>
              </GlassCard>
            )}
            {savedCareers.map((c, i) => (
              <GlassCard key={i} onPress={() => navigate("results")} style={styles.rowCard}>
                <View style={[styles.careerIcon, { backgroundColor: t.accentSoft }]}>
                  <Text style={[styles.careerIconText, { color: t.accent }]}>{initials(c.title)}</Text>
                </View>
                <Text style={[styles.rowTitle, { color: t.text }]}>{c.title}</Text>
                <View style={[styles.matchBadge, { backgroundColor: t.accentSoft }]}>
                  <Text style={[styles.matchBadgeText, { color: t.accent }]}>{c.percent ?? c.match}%</Text>
                </View>
              </GlassCard>
            ))}
          </View>

          <SectionTitle style={styles.sectionGap}>Tracked Skills</SectionTitle>
          <GlassCard onPress={() => navigate("Explore")} style={styles.skillsCard}>
            {trackedSkills.length === 0 ? (
              <Text style={[styles.rowTitle, { color: t.subtext }]}>
                No skills tracked yet - tap to pick some in Explore
              </Text>
            ) : (
              <View style={styles.skillsWrap}>
                {trackedSkills.map((name) => (
                  <Pill key={name} label={name} />
                ))}
              </View>
            )}
          </GlassCard>

          <SectionTitle style={styles.sectionGap}>Quick Actions</SectionTitle>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((a) => (
              <GlassCard key={a.label} onPress={() => navigate(a.screen)} style={styles.quickAction}>
                <Text style={[styles.quickActionText, { color: t.text }]}>{a.label}</Text>
              </GlassCard>
            ))}
          </View>

          <SectionTitle style={styles.sectionGap}>Recent Activity</SectionTitle>
          <View style={styles.list}>
            {recentActivity.length === 0 && (
              <GlassCard style={styles.rowCard}>
                <View style={[styles.activityDot, { backgroundColor: BRAND.aqua }]} />
                <Text style={[styles.activityText, { color: t.subtext }]}>
                  Nothing yet - take the quiz or start your roadmap.
                </Text>
              </GlassCard>
            )}
            {recentActivity.map((a, i) => (
              <GlassCard key={i} style={styles.rowCard}>
                <View style={[styles.activityDot, { backgroundColor: BRAND.aqua }]} />
                <Text style={[styles.activityText, { color: t.text }]}>{a.text}</Text>
                <Text style={[styles.activityTime, { color: t.subtext }]}>{a.time}</Text>
              </GlassCard>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  body: { paddingHorizontal: 20 },
  sectionGap: { marginTop: 20 },
  list: { gap: 8 },
  skillsCard: { paddingVertical: 14, paddingHorizontal: 16 },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  careerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  careerIconText: { fontSize: 11, fontWeight: "800" },
  rowTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  matchBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  matchBadgeText: { fontSize: 13, fontWeight: "800" },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickAction: { width: "48%", alignItems: "center", paddingVertical: 16, paddingHorizontal: 12 },
  quickActionText: { fontSize: 14, fontWeight: "700" },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityText: { fontSize: 13, fontWeight: "500", flex: 1 },
  activityTime: { fontSize: 11 },
});