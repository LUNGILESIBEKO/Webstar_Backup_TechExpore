import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { auth } from '../Firebase';
import {
  FileText,
  DollarSign,
  Award,
  Users,
  Sparkles,
  TrendingUp,
  Lightbulb,
} from 'lucide-react-native';
import { useCardTheme } from '../theme';
import { useUserDoc, useRoadmapSteps, trackIdFromResult, countCompleted } from '../careerEngine';
import {
  Screen,
  ScreenHeader,
  GlassCard,
  SectionTitle,
  PrimaryButton,
  SecondaryButton,
  Pill,
  StatsRow,
} from '../components/UI';

const QUICK_ACTIONS = [
  { key: 'JobPrep', title: 'Job Prep Hub', subtitle: 'CV tips and interview prep', icon: FileText, route: 'JobPrep' },
  // Salary Guide and Certifications both open the Explore screen, just
  // jumped to a different one of its internal tabs via route params.
  { key: 'SalaryGuide', title: 'Salary Guide', subtitle: 'SA market rates', icon: DollarSign, route: 'Explore', params: { initialTab: 'Jobs' } },
  { key: 'Certifications', title: 'Certifications', subtitle: 'Boost your credentials', icon: Award, route: 'Explore', params: { initialTab: 'Certs' } },
  { key: 'Mentorship', title: 'Find a Mentor', subtitle: 'Connect with SA pros', icon: Users, route: 'Mentorship' },
];

const INSIGHTS = [
  {
    key: 'trending',
    tag: 'TRENDING',
    text: 'AWS skills required for 68% of SA cloud roles in 2025 — OfferZen report',
    icon: TrendingUp,
  },
  {
    key: 'salary',
    tag: 'SALARY',
    text: 'Backend devs earning avg R650k/yr in Johannesburg and Cape Town',
    icon: DollarSign,
  },
  {
    key: 'tip',
    tag: 'TIP',
    text: 'GitHub profile strength is the #1 factor in SA junior dev hiring',
    icon: Lightbulb,
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen({ navigation, route }) {
  const t = useCardTheme();

  // The greeting follows the clock: Good Morning (before 12:00), Good
  // Afternoon (12:00-17:59) and Good Evening (18:00 onwards). It re-checks
  // every minute so it switches over even if the app is left open.
  const [greet, setGreet] = useState(greeting());
  useEffect(() => {
    const id = setInterval(() => setGreet(greeting()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Student profile from Firestore (users/{uid}), refreshed every time Home
  // comes into view so quiz and roadmap changes show up straight away.
  const { profile } = useUserDoc();

  // The quiz result either arrives as navigation params (right after the quiz)
  // or from the saved result on the student's profile.
  const fromParams = route?.params?.quizDone ? route.params : null;
  const topMatch = fromParams?.topMatch || profile?.quizResult?.topMatch;
  const matches = fromParams?.matches || profile?.quizResult?.matches || [];
  const quizDone = !!topMatch;

  // Roadmap numbers are for the career track the quiz picked.
  const trackId = trackIdFromResult(quizDone ? { topMatch } : null);
  const roadmapSteps = useRoadmapSteps(trackId);
  const roadmapDone = countCompleted(roadmapSteps, profile?.completedRoadmapSteps);

  const displayName =
    profile?.fullName || auth.currentUser?.displayName || auth.currentUser?.email || 'Student';
  const firstName = displayName.split(/[\s@.]+/).filter(Boolean)[0] || 'there';
  const firstNameCap = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const initials =
    displayName
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('') || 'S';
  const subline =
    [profile?.year, profile?.institution].filter(Boolean).join(' · ') || 'Complete your profile in Settings';

  // Every button calls safeNavigate so it navigates when the screen is
  // registered, or shows a friendly message instead of crashing.
  const safeNavigate = (screenName, params) => {
    const knownRoutes = navigation?.getState()?.routeNames || [];
    if (knownRoutes.includes(screenName)) navigation.navigate(screenName, params);
  };

  const goToQuiz = () => safeNavigate('Quiz');
  const goToProfile = () => navigation.reset({ index: 0, routes: [{ name: 'Profile' }] });
  const goToResults = () => safeNavigate('CareerResults', { matches, topMatch });

  return (
    <Screen navigation={navigation} activeTab="Home">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          avatar={initials}
          onAvatarPress={goToProfile}
          title={`${greet}, ${firstNameCap}`}
          subtitle={subline}
        />

        <View style={styles.body}>
          <StatsRow
            items={[
              { value: quizDone ? `${topMatch.percent}%` : '—', label: 'Top Match' },
              { value: String(profile?.trackedSkills?.length ?? profile?.skillsTracked ?? 0), label: 'Skills tracked' },
              {
                value: trackId ? `${roadmapDone}/${roadmapSteps.length}` : '—',
                label: 'Roadmap steps',
              },
            ]}
          />

          <View style={{ height: 20 }} />

          {!quizDone ? (
            <GlassCard style={styles.matchCard}>
              <View style={[styles.iconCircle, { backgroundColor: t.accentSoft }]}>
                <Sparkles size={20} color={t.accent} />
              </View>
              <Text style={[styles.matchTitle, { color: t.text }]}>Find Your Career Match</Text>
              <Text style={[styles.matchMeta, { color: t.subtext }]}>A short quiz · about 2 minutes</Text>
              <Text style={[styles.matchBody, { color: t.text }]}>
                Take the quiz and discover which tech career path is built for you. Your roadmap is created from the result.
              </Text>
              <PrimaryButton label="Start Career Quiz" onPress={goToQuiz} />
            </GlassCard>
          ) : (
            <GlassCard style={styles.matchCard}>
              <Text style={[styles.topMatchLabel, { color: t.accent }]}>TOP MATCH</Text>
              <View style={styles.matchedRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.matchTitle, { color: t.text }]}>{topMatch.title}</Text>
                  <Text style={[styles.matchMeta, { color: t.subtext, marginBottom: 0 }]}>
                    {topMatch.percent}% compatibility match
                  </Text>
                </View>
                <View style={[styles.iconCircle, { backgroundColor: t.accentSoft, marginBottom: 0 }]}>
                  <Sparkles size={20} color={t.accent} />
                </View>
              </View>
              <View style={styles.matchedButtonsRow}>
                <PrimaryButton label="All Matches" onPress={goToResults} style={{ flex: 1, paddingVertical: 14 }} />
                <SecondaryButton
                  label="Retake Quiz"
                  onPress={goToQuiz}
                  style={{ flex: 1, paddingVertical: 14, backgroundColor: t.accentSoft, borderColor: 'transparent' }}
                  textColor={t.accent}
                />
              </View>
            </GlassCard>
          )}

          <SectionTitle>Quick Actions</SectionTitle>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <GlassCard
                  key={action.key}
                  style={styles.quickCard}
                  onPress={() => safeNavigate(action.route, action.params)}
                >
                  <View style={[styles.quickIconBox, { backgroundColor: t.accentSoft }]}>
                    <Icon size={18} color={t.accent} />
                  </View>
                  <Text style={[styles.quickTitle, { color: t.text }]}>{action.title}</Text>
                  <Text style={[styles.quickSubtitle, { color: t.subtext }]}>{action.subtitle}</Text>
                </GlassCard>
              );
            })}
          </View>

          <SectionTitle style={{ marginTop: 8 }}>SA Tech Insights</SectionTitle>
          {INSIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard key={item.key} style={{ marginBottom: 12 }}>
                <Pill label={item.tag} style={{ marginBottom: 10 }} />
                <View style={styles.insightRow}>
                  <View style={[styles.insightIconBox, { backgroundColor: t.accentSoft }]}>
                    <Icon size={16} color={t.accent} />
                  </View>
                  <Text style={[styles.insightText, { color: t.text }]}>{item.text}</Text>
                </View>
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  body: { paddingHorizontal: 20 },
  matchCard: { marginBottom: 24, padding: 20 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  topMatchLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  matchedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  matchTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  matchMeta: { fontSize: 13, marginBottom: 10 },
  matchBody: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  matchedButtonsRow: { flexDirection: 'row', gap: 10 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickCard: { width: '48%', marginBottom: 12 },
  quickIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  quickSubtitle: { fontSize: 11 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start' },
  insightIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightText: { flex: 1, fontSize: 13.5, lineHeight: 19, fontWeight: '500' },
});
