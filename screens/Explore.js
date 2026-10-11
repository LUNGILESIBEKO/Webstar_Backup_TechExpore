import React, { useState, useEffect, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { Search, ChevronDown, ChevronUp, ExternalLink, Plus, Check, Sparkles } from "lucide-react-native";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../Firebase";
import { useUserDoc, myTrackFrom } from "../careerEngine";
import { useToast } from "../components/Toast";
import { useCardTheme, BRAND, PALETTE } from "../theme";
import { Screen, ScreenHeader, GlassCard, SectionTitle, Pill, ProgressBar, SegmentedTabs } from "../components/UI";

const TAB_KEYS = ["Skills", "Certs", "Jobs"];

const GENERAL_SKILLS = [
  { name: "Python", badge: "Rising", category: "Backend / Data", pct: 94 },
  { name: "Cloud Computing", badge: "Rising", category: "Cloud / Infrastructure", pct: 91 },
  { name: "Docker & Kubernetes", badge: "Rising", category: "DevOps", pct: 88 },
  { name: "TypeScript", badge: "Rising", category: "Frontend / Full-Stack", pct: 84 },
  { name: "Cybersecurity", badge: "Rising", category: "Security", pct: 79 },
  { name: "SQL & Data Analysis", badge: "Steady", category: "Data / Analytics", pct: 75 },
];

const GENERAL_CERTS = [
  {
    name: "AWS Certified Solutions Architect – Associate",
    provider: "Amazon Web Services",
    level: "Intermediate",
    tags: ["Cloud Engineer", "Cloud Architect", "DevOps"],
    cost: "~R2 500",
    prep: "3–6 months",
    category: "Cloud",
    url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
  },
  {
    name: "Google Associate Cloud Engineer",
    provider: "Google Cloud",
    level: "Intermediate",
    tags: ["Cloud Engineer", "DevOps"],
    cost: "~R2 300",
    prep: "2–4 months",
    category: "Cloud",
    url: "https://cloud.google.com/certification/cloud-engineer",
  },
  {
    name: "Microsoft Azure Fundamentals (AZ-900)",
    provider: "Microsoft",
    level: "Beginner",
    tags: ["Cloud", "IT Support"],
    cost: "~R1 200",
    prep: "3–6 weeks",
    category: "Cloud",
    url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
  },
  {
    name: "Meta Front-End Developer",
    provider: "Meta (Coursera)",
    level: "Beginner",
    tags: ["Frontend", "Web Dev"],
    cost: "~R950 / mo",
    prep: "5–7 months",
    category: "Frontend",
    url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
  },
  {
    name: "Certified Kubernetes Administrator",
    provider: "CNCF",
    level: "Advanced",
    tags: ["DevOps", "Cloud"],
    cost: "~R6 800",
    prep: "2–3 months",
    category: "DevOps",
    url: "https://www.cncf.io/training/certification/cka/",
  },
  {
    name: "CompTIA Security+",
    provider: "CompTIA",
    level: "Beginner",
    tags: ["Cybersecurity", "Backend"],
    cost: "~R7 200",
    prep: "2–3 months",
    category: "Backend",
    url: "https://www.comptia.org/certifications/security",
  },
];


const GENERAL_JOBS = [
  { role: "Cloud Engineer", demand: "Very High Demand", yoy: "+31% YoY", min: "R450k", max: "R1.1M", avg: "R775k / year", fill: 70 },
  { role: "Backend Developer", demand: "High Demand", yoy: "+18% YoY", min: "R320k", max: "R850k", avg: "R600k / year", fill: 55 },
  { role: "DevOps Engineer", demand: "Very High Demand", yoy: "+27% YoY", min: "R480k", max: "R950k", avg: "R675k / year", fill: 65 },
  { role: "Data Scientist", demand: "Very High Demand", yoy: "+24% YoY", min: "R420k", max: "R1M", avg: "R720k / year", fill: 68 },
  { role: "Frontend Developer", demand: "High Demand", yoy: "+15% YoY", min: "R280k", max: "R720k", avg: "R500k / year", fill: 50 },
];

// Shown to students who have not taken the quiz yet, or who pick "All careers".
const GENERAL = { skills: GENERAL_SKILLS, certs: GENERAL_CERTS, jobs: GENERAL_JOBS };

async function openCertLink(url) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Can't open this link", url);
    }
  } catch (err) {
    Alert.alert("Something went wrong", "Please try again in a moment.");
  }
}

function LevelBadge({ level }) {
  const tone = { Beginner: "green", Intermediate: "amber", Advanced: "rose" }[level] || "green";
  return <Pill label={level} tone={tone} />;
}

function DemandBadge({ demand }) {
  return <Pill label={demand} tone={demand === "Very High Demand" ? "amber" : "green"} />;
}

function SkillsTab({ content, mine, profile, setProfile }) {
  const t = useCardTheme();
  const toast = useToast();
  const tracked = Array.isArray(profile?.trackedSkills) ? profile.trackedSkills : [];

  // Track / untrack a skill. The screen updates straight away, then the list
  // and its count are saved on the student's own document (users/{uid}).
  // If the save fails the change is rolled back and a message is shown.
  const toggleTrack = async (name) => {
    const wasOn = tracked.includes(name);
    const next = wasOn ? tracked.filter((n) => n !== name) : [...tracked, name];
    const apply = (list) =>
      setProfile((p) => ({ ...(p || {}), trackedSkills: list, skillsTracked: list.length }));
    apply(next);

    const uid = auth.currentUser?.uid;
    if (!uid) {
      toast.show({ type: "info", title: "Sign in to save", message: "Tracked skills only last for this session." });
      return;
    }
    try {
      await setDoc(
        doc(db, "users", uid),
        { trackedSkills: next, skillsTracked: next.length },
        { merge: true }
      );
      toast.show({
        type: "success",
        title: wasOn ? "Stopped tracking" : "Skill tracked",
        message: name,
        duration: 1800,
      });
    } catch (err) {
      apply(tracked); // put it back the way it was
      toast.show({ type: "error", title: "Could not save", message: "Check your connection and try again." });
    }
  };

  return (
    <>
      <View style={styles.sectionRow}>
        <SectionTitle style={{ marginBottom: 0 }}>{mine ? "Skills for your career" : "In-Demand Skills"}</SectionTitle>
        <View style={styles.rowAlign}>
          <Pill label={`${tracked.length} tracked`} />
          <Pill label="Indicative" tone="muted" />
        </View>
      </View>
      {content.skills.map((s) => {
        const isOn = tracked.includes(s.name);
        return (
          <GlassCard key={s.name} style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.rowAlign}>
                <Text style={[styles.skillName, { color: t.text }]}>{s.name}</Text>
                <Pill label={s.badge} tone="green" />
              </View>
              <Text style={[styles.skillPct, { color: t.accent }]}>{s.pct}%</Text>
            </View>
            <ProgressBar pct={s.pct} style={{ marginTop: 12 }} />
            <View style={[styles.rowBetween, { marginTop: 12 }]}>
              <Text style={[styles.mutedSm, { color: t.subtext, marginTop: 0 }]}>{s.category}</Text>
              <Pressable
                onPress={() => toggleTrack(s.name)}
                accessibilityRole="button"
                accessibilityState={{ selected: isOn }}
                accessibilityLabel={`${isOn ? "Stop tracking" : "Track"} ${s.name}`}
                style={({ pressed }) => [
                  styles.trackButton,
                  isOn
                    ? { backgroundColor: BRAND.dark, borderColor: BRAND.dark }
                    : { backgroundColor: t.accentSoft, borderColor: t.accent },
                  pressed && { opacity: 0.8 },
                ]}
              >
                {isOn ? <Check size={14} color={PALETTE.white} strokeWidth={3} /> : <Plus size={14} color={t.accent} strokeWidth={3} />}
                <Text style={[styles.trackButtonText, { color: isOn ? PALETTE.white : t.accent }]}>
                  {isOn ? "Tracking" : "Track"}
                </Text>
              </Pressable>
            </View>
          </GlassCard>
        );
      })}
    </>
  );
}

function CertsTab({ content }) {
  const t = useCardTheme();
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(content.certs[0]?.name || null);
  const [query, setQuery] = useState("");

  // Filter chips come from the certifications being shown (one set per career).
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(content.certs.map((c) => c.category)))],
    [content]
  );

  const filtered = content.certs.filter((c) => {
    const matchesFilter = filter === "All" || c.category === filter;
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <>
      <View style={[styles.searchBar, { backgroundColor: t.inputBg, borderColor: t.divider }]}>
        <Search size={16} color={t.subtext} />
        <TextInput
          placeholder="Search certifications..."
          placeholderTextColor={t.subtext}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: t.text }]}
        />
      </View>
      {categories.length > 2 && (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {categories.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && { color: BRAND.deep }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      )}
      {filtered.map((c) => {
        const isOpen = expanded === c.name;
        return (
          <GlassCard key={c.name} style={styles.card}>
            <View style={[styles.rowBetween, { alignItems: "flex-start" }]}>
              <Text style={[styles.certName, { color: t.text }]}>{c.name}</Text>
              <LevelBadge level={c.level} />
            </View>
            <Text style={[styles.mutedSm, { color: t.subtext }]}>{c.provider}</Text>
            {isOpen && (
              <>
                <View style={styles.tagRow}>
                  {c.tags.map((tag) => (
                    <Pill key={tag} label={tag} />
                  ))}
                </View>
                <View style={styles.certDetails}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailLabel, { color: t.subtext }]}>COST</Text>
                    <Text style={[styles.detailValue, { color: t.text }]}>{c.cost}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailLabel, { color: t.subtext }]}>PREP TIME</Text>
                    <Text style={[styles.detailValue, { color: t.text }]}>{c.prep}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.showToggle} onPress={() => setExpanded(isOpen ? null : c.name)}>
                <Text style={[styles.showToggleText, { color: t.accent }]}>{isOpen ? "Show less" : "Show details"}</Text>
                {isOpen ? <ChevronUp size={14} color={t.accent} /> : <ChevronDown size={14} color={t.accent} />}
              </TouchableOpacity>

              <TouchableOpacity style={styles.enrollButton} onPress={() => openCertLink(c.url)}>
                <Text style={styles.enrollButtonText}>Get Certified</Text>
                <ExternalLink size={13} color={PALETTE.white} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        );
      })}
    </>
  );
}

function JobsTab({ content, mine }) {
  const t = useCardTheme();
  return (
    <>
      <View style={styles.sectionRow}>
        <SectionTitle style={{ marginBottom: 0 }}>{mine ? "Jobs & Salaries" : "Salary Ranges"}</SectionTitle>
        <Pill label="ZAR / year · indicative" tone="muted" />
      </View>
      {content.jobs.map((j, i) => (
        <GlassCard key={j.role} style={styles.card}>
          <View style={[styles.rowBetween, { alignItems: "flex-start" }]}>
            <Text style={[styles.skillName, { color: t.text, flex: 1, marginRight: 10 }]}>{j.role}</Text>
            <Text style={[styles.yoy, { color: t.green }]}>{j.yoy}</Text>
          </View>
          <View style={[styles.rowAlign, { marginTop: 8 }]}>
            <DemandBadge demand={j.demand} />
            {mine && i === 0 && <Pill label="Your match" />}
          </View>
          <View style={styles.rangeRow}>
            <Text style={[styles.rangeText, { color: t.subtext }]}>{j.min}</Text>
            <Text style={[styles.rangeText, { color: t.subtext }]}>{j.max}</Text>
          </View>
          <ProgressBar pct={j.fill} style={{ marginTop: 6 }} />
          <Text style={[styles.avgLabel, { color: t.subtext }]}>Avg: {j.avg}</Text>
        </GlassCard>
      ))}
    </>
  );
}

export default function ExploreScreen({ navigation, route }) {
  const t = useCardTheme();
  const { profile, setProfile, loaded } = useUserDoc();
  // The student's career from the quiz. Everything below follows it.
  const track = useMemo(() => myTrackFrom(profile?.quizResult), [profile?.quizResult]);
  const [scope, setScope] = useState("mine"); // "mine" | "all"
  const showMine = !!track && scope === "mine";
  const content = showMine ? track.content : GENERAL;
  const [tab, setTab] = useState(
    TAB_KEYS.includes(route?.params?.initialTab) ? route.params.initialTab : "Skills"
  );

  useEffect(() => {
    if (TAB_KEYS.includes(route?.params?.initialTab)) {
      setTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  return (
    <Screen navigation={navigation} activeTab="Explore">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="Explore"
          title="SA Tech Landscape"
          subtitle={
            showMine
              ? `Built around your quiz result: ${track.title}`
              : "Skills, certifications, and market insights"
          }
        >
          <View style={{ marginTop: 16 }}>
            <SegmentedTabs tabs={TAB_KEYS} active={tab} onChange={setTab} />
          </View>
        </ScreenHeader>

        <View style={styles.body}>
          {/* Quiz done: choose between my career and everything. No quiz yet: invite them to take it. */}
          {track ? (
            <View style={styles.scopeRow}>
              {[
                { key: "mine", label: `My career · ${track.title}` },
                { key: "all", label: "All careers" },
              ].map((o) => (
                <Pressable
                  key={o.key}
                  onPress={() => setScope(o.key)}
                  style={({ pressed }) => [
                    styles.scopeChip,
                    scope === o.key && styles.scopeChipActive,
                    scope !== o.key && pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
                  ]}
                >
                  <Text style={[styles.scopeChipText, scope === o.key && { color: BRAND.deep }]} numberOfLines={1}>
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : loaded ? (
            <GlassCard onPress={() => navigation?.navigate?.("Quiz")} style={styles.card}>
              <View style={styles.rowAlign}>
                <Sparkles size={18} color={t.accent} />
                <Text style={[styles.skillName, { color: t.text }]}>Make this about you</Text>
              </View>
              <Text style={[styles.mutedSm, { color: t.subtext }]}>
                Take the career quiz and Explore will show the skills, certifications, jobs and
                salaries for your best match. Tap to start.
              </Text>
            </GlassCard>
          ) : null}

          {/* key: start fresh (filters, open card) whenever the career or scope changes */}
          {tab === "Skills" && (
            <SkillsTab key={`s-${showMine ? track.id : "all"}`} content={content} mine={showMine} profile={profile} setProfile={setProfile} />
          )}
          {tab === "Certs" && <CertsTab key={`c-${showMine ? track.id : "all"}`} content={content} />}
          {tab === "Jobs" && <JobsTab key={`j-${showMine ? track.id : "all"}`} content={content} mine={showMine} />}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  body: { paddingHorizontal: 20 },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  card: { marginBottom: 12 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowAlign: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", flexShrink: 1 },

  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    minWidth: 104,
    justifyContent: "center",
  },
  trackButtonText: { fontSize: 12.5, fontWeight: "800" },
  skillName: { fontSize: 15, fontWeight: "700" },
  skillPct: { fontSize: 16, fontWeight: "800" },
  mutedSm: { fontSize: 12, marginTop: 4 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginBottom: 14,
  },
  searchInput: { fontSize: 13, flex: 1 },

  scopeRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  scopeChip: { flex: 1, paddingVertical: 9, paddingHorizontal: 8, borderRadius: 10, alignItems: "center" },
  scopeChipActive: { backgroundColor: BRAND.aqua },
  scopeChipText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700" },

  filterRow: { marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(77,212,206,0.4)",
    backgroundColor: "rgba(77,212,206,0.08)",
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: BRAND.aqua, borderColor: BRAND.aqua },
  filterChipText: { color: "rgba(255,255,255,0.88)", fontSize: 12, fontWeight: "700" },

  certName: { fontSize: 14.5, fontWeight: "700", flex: 1, marginRight: 10, lineHeight: 20 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  certDetails: { flexDirection: "row", gap: 10, marginTop: 14 },
  detailLabel: { fontSize: 10.5, fontWeight: "700", letterSpacing: 0.5, marginBottom: 3 },
  detailValue: { fontSize: 13.5, fontWeight: "700" },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  showToggle: { flexDirection: "row", alignItems: "center", gap: 4 },
  showToggleText: { fontSize: 12.5, fontWeight: "700" },
  enrollButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: BRAND.dark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  enrollButtonText: { color: PALETTE.white, fontSize: 12.5, fontWeight: "800" },

  yoy: { fontSize: 13, fontWeight: "800" },
  rangeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  rangeText: { fontSize: 11.5, fontWeight: "600" },
  avgLabel: { textAlign: "center", fontSize: 11.5, fontWeight: "600", marginTop: 8 },
});