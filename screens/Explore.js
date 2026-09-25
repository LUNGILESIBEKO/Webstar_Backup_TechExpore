import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Search,
  Home as HomeIcon,
  Compass,
  Map,
  User,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ExternalLink,
} from "lucide-react-native";
import { useFonts, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from "@expo-google-fonts/manrope";

const TAB_KEYS = ["Skills", "Certs", "Jobs"];

const SKILLS = [
  { name: "Python", badge: "Rising", category: "Backend / Data", pct: 94 },
  { name: "Cloud Computing", badge: "Rising", category: "Cloud / Infrastructure", pct: 91 },
  { name: "Docker & Kubernetes", badge: "Rising", category: "DevOps", pct: 88 },
  { name: "TypeScript", badge: "Rising", category: "Frontend / Full-Stack", pct: 84 },
  { name: "Cybersecurity", badge: "Rising", category: "Security", pct: 79 },
  { name: "SQL & Data Analysis", badge: "Steady", category: "Data / Analytics", pct: 75 },
];

const CERTS = [
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

const FILTERS = ["All", "Backend", "Cloud", "Frontend", "DevOps"];

const JOBS = [
  { role: "Cloud Engineer", demand: "Very High Demand", yoy: "+31% YoY", min: "R450k", max: "R1.1M", avg: "R775k / year", fill: 70 },
  { role: "Backend Developer", demand: "High Demand", yoy: "+18% YoY", min: "R320k", max: "R850k", avg: "R600k / year", fill: 55 },
  { role: "DevOps Engineer", demand: "Very High Demand", yoy: "+27% YoY", min: "R480k", max: "R950k", avg: "R675k / year", fill: 65 },
  { role: "Data Scientist", demand: "Very High Demand", yoy: "+24% YoY", min: "R420k", max: "R1M", avg: "R720k / year", fill: 68 },
  { role: "Frontend Developer", demand: "High Demand", yoy: "+15% YoY", min: "R280k", max: "R720k", avg: "R500k / year", fill: 50 },
];

const COLORS = {
  mint: "#5eead4",
  amber: "#f2b84b",
  rose: "#f87171",
  green: "#4ade80",
  white: "#ffffff",
  textMuted: "rgba(255,255,255,0.55)",
  textDim: "rgba(255,255,255,0.4)",
  cardBg: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.08)",
  trackBg: "rgba(255,255,255,0.12)",
};

const TABS = [
  { key: "Home", label: "Home", icon: HomeIcon },
  { key: "Explore", label: "Explore", icon: Compass },
  { key: "Roadmap", label: "Roadmap", icon: Map },
  { key: "Profile", label: "Profile", icon: User },
];

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

function Pill({ children, bg, color }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{children}</Text>
    </View>
  );
}

function LevelBadge({ level }) {
  const map = {
    Beginner: { bg: "rgba(94, 234, 212, 0.16)", color: COLORS.mint },
    Intermediate: { bg: "rgba(242, 184, 75, 0.18)", color: COLORS.amber },
    Advanced: { bg: "rgba(248, 113, 113, 0.16)", color: COLORS.rose },
  };
  const s = map[level] || map.Beginner;
  return <Pill bg={s.bg} color={s.color}>{level}</Pill>;
}

function DemandBadge({ demand }) {
  const isVeryHigh = demand === "Very High Demand";
  const bg = isVeryHigh ? "rgba(242, 184, 75, 0.18)" : "rgba(94, 234, 212, 0.16)";
  const color = isVeryHigh ? COLORS.amber : COLORS.mint;
  return <Pill bg={bg} color={color}>{demand}</Pill>;
}

function ProgressBar({ pct }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

function SkillsTab() {
  return (
    <>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>In-Demand Skills</Text>
        <Pill bg="rgba(255,255,255,0.1)" color={COLORS.textMuted}>SA 2025</Pill>
      </View>
      {SKILLS.map((s) => (
        <View style={styles.card} key={s.name}>
          <View style={styles.rowBetween}>
            <View style={styles.rowAlign}>
              <Text style={styles.skillName}>{s.name}</Text>
              <Pill bg="rgba(94, 234, 212, 0.16)" color={COLORS.mint}>{s.badge}</Pill>
            </View>
            <Text style={styles.skillPct}>{s.pct}%</Text>
          </View>
          <Text style={styles.mutedSm}>{s.category}</Text>
          <ProgressBar pct={s.pct} />
        </View>
      ))}
    </>
  );
}

function CertsTab() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(CERTS[0].name);
  const [query, setQuery] = useState("");

  const filtered = CERTS.filter((c) => {
    const matchesFilter = filter === "All" || c.category === filter;
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <>
      <View style={styles.searchBar}>
        <Search size={16} color={COLORS.textDim} />
        <TextInput
          placeholder="Search certifications..."
          placeholderTextColor={COLORS.textDim}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {filtered.map((c) => {
        const isOpen = expanded === c.name;
        return (
          <View style={styles.card} key={c.name}>
            <View style={[styles.rowBetween, { alignItems: "flex-start" }]}>
              <Text style={styles.certName}>{c.name}</Text>
              <LevelBadge level={c.level} />
            </View>
            <Text style={styles.mutedSm}>{c.provider}</Text>
            {isOpen && (
              <>
                <View style={styles.tagRow}>
                  {c.tags.map((t) => (
                    <View style={styles.tagChip} key={t}>
                      <Text style={styles.tagChipText}>{t}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.certDetails}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>COST</Text>
                    <Text style={styles.detailValue}>{c.cost}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>PREP TIME</Text>
                    <Text style={styles.detailValue}>{c.prep}</Text>
                  </View>
                </View>
              </>
            )}

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.showToggle}
                onPress={() => setExpanded(isOpen ? null : c.name)}
              >
                <Text style={styles.showToggleText}>{isOpen ? "Show less" : "Show details"}</Text>
                {isOpen ? <ChevronUp size={14} color={COLORS.mint} /> : <ChevronDown size={14} color={COLORS.mint} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.enrollButton}
                onPress={() => openCertLink(c.url)}
              >
                <Text style={styles.enrollButtonText}>Get Certified</Text>
                <ExternalLink size={13} color="#12463d" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </>
  );
}

function JobsTab() {
  return (
    <>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Salary Ranges</Text>
        <Pill bg="rgba(255,255,255,0.1)" color={COLORS.textMuted}>ZAR / year · 2025</Pill>
      </View>
      {JOBS.map((j) => (
        <View style={styles.card} key={j.role}>
          <View style={[styles.rowBetween, { alignItems: "flex-start" }]}>
            <Text style={styles.skillName}>{j.role}</Text>
            <Text style={styles.yoy}>{j.yoy}</Text>
          </View>
          <View style={{ marginTop: 8, alignSelf: "flex-start" }}>
            <DemandBadge demand={j.demand} />
          </View>
          <View style={styles.rangeRow}>
            <Text style={styles.rangeText}>{j.min}</Text>
            <Text style={styles.rangeText}>{j.max}</Text>
          </View>
          <ProgressBar pct={j.fill} />
          <Text style={styles.avgLabel}>Avg: {j.avg}</Text>
        </View>
      ))}
    </>
  );
}

export default function ExploreScreen({ navigation, route }) {
  const [tab, setTab] = useState(
    TAB_KEYS.includes(route?.params?.initialTab) ? route.params.initialTab : "Skills"
  );
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (TAB_KEYS.includes(route?.params?.initialTab)) {
      setTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const fontMedium = fontsLoaded ? "Manrope_500Medium" : undefined;
  const fontBold = fontsLoaded ? "Manrope_700Bold" : undefined;
  const fontExtraBold = fontsLoaded ? "Manrope_800ExtraBold" : undefined;

  // Same fallback pattern Home.js uses: navigate if the route is
  // registered, otherwise show a "coming soon" alert instead of crashing.
  const safeNavigate = (screenName, params) => {
    if (!navigation) {
      Alert.alert(screenName, "Navigation is not connected in this preview.");
      return;
    }
    const knownRoutes = navigation.getState()?.routeNames || [];
    if (knownRoutes.includes(screenName)) {
      navigation.navigate(screenName, params);
    } else {
      Alert.alert("Coming soon", `The ${screenName} screen isn't wired up yet.`);
    }
  };

  const goBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      safeNavigate("Home");
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={["#1c5e53", "#12463d", "#071e1c"]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <ArrowLeft size={18} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={[styles.eyebrow, { fontFamily: fontBold }]}>EXPLORE</Text>
          <Text style={[styles.title, { fontFamily: fontExtraBold }]}>SA Tech Landscape</Text>
          <Text style={[styles.subtitle, { fontFamily: fontMedium }]}>
            Skills, certifications, and market insights
          </Text>

          <View style={styles.tabs}>
            {TAB_KEYS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive, { fontFamily: fontBold }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === "Skills" && <SkillsTab />}
          {tab === "Certs" && <CertsTab />}
          {tab === "Jobs" && <JobsTab />}
        </ScrollView>

        <View style={styles.bottomNav}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === "Explore";
            return (
              <TouchableOpacity
                key={t.key}
                style={styles.navItem}
                activeOpacity={0.7}
                onPress={() => safeNavigate(t.key)}
              >
                <Icon size={20} color={isActive ? COLORS.white : COLORS.textDim} />
                <Text style={[styles.navLabel, isActive && { color: COLORS.white }]}>{t.label}</Text>
                {isActive && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#071e1c" },
  gradient: { flex: 1 },
  content: { padding: 20, paddingBottom: 20 },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  eyebrow: {
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  title: {
    color: COLORS.white,
    fontSize: 26,
    marginTop: 6,
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 18,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 999,
  },
  tabActive: { backgroundColor: COLORS.white },
  tabText: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  tabTextActive: { color: "#12463d" },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { color: COLORS.white, fontSize: 16, fontWeight: "800" },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  pillText: { fontSize: 11, fontWeight: "700" },

  card: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowAlign: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flexShrink: 1,
  },

  skillName: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  skillPct: { color: COLORS.mint, fontSize: 16, fontWeight: "800" },
  mutedSm: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 4 },

  track: {
    height: 6,
    backgroundColor: COLORS.trackBg,
    borderRadius: 999,
    marginTop: 12,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: COLORS.mint, borderRadius: 999 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginBottom: 14,
  },
  searchInput: { color: COLORS.white, fontSize: 13, flex: 1 },

  filterRow: { marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: COLORS.white, borderColor: COLORS.white },
  filterChipText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },
  filterChipTextActive: { color: "#12463d" },

  certName: { color: COLORS.white, fontSize: 14.5, fontWeight: "700", flex: 1, marginRight: 10, lineHeight: 20 },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tagChipText: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600" },

  certDetails: { flexDirection: "row", gap: 10, marginTop: 14 },
  detailLabel: { color: "rgba(255,255,255,0.4)", fontSize: 10.5, fontWeight: "700", letterSpacing: 0.5, marginBottom: 3 },
  detailValue: { color: COLORS.white, fontSize: 13.5, fontWeight: "700" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  showToggle: { flexDirection: "row", alignItems: "center", gap: 4 },
  showToggleText: { color: COLORS.mint, fontSize: 12.5, fontWeight: "700" },

  enrollButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.mint,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  enrollButtonText: { color: "#12463d", fontSize: 12.5, fontWeight: "800" },

  yoy: { color: COLORS.green, fontSize: 13, fontWeight: "800" },
  rangeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  rangeText: { color: "rgba(255,255,255,0.5)", fontSize: 11.5, fontWeight: "600" },
  avgLabel: { textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 11.5, fontWeight: "600", marginTop: 8 },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(5, 25, 23, 0.55)",
  },
  navItem: { alignItems: "center", gap: 4 },
  navLabel: { fontSize: 10.5, fontWeight: "700", color: COLORS.textDim },
  activeDot: { width: 4, height: 4, borderRadius: 999, backgroundColor: COLORS.mint, marginTop: 2 },
});
