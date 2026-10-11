import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useCardTheme } from '../theme';
import { useUserDoc } from '../careerEngine';
import {
  Screen,
  ScreenHeader,
  GlassCard,
  SectionTitle,
  PrimaryButton,
  SecondaryButton,
  ProgressBar,
  EmptyState,
} from '../components/UI';

export default function CareerResultsScreen({ navigation, route }) {
  const t = useCardTheme();

  // Results come from the quiz that was just taken (route params) or, when
  // opened from Profile / Home, from the student's saved quizResult.
  const { profile, loaded } = useUserDoc();
  const params = route?.params || {};
  const saved = profile?.quizResult;
  const matches = params.matches || saved?.matches || [];
  const topMatch = params.topMatch || saved?.topMatch || matches[0];

  const goBack = () => {
    if (navigation?.canGoBack?.()) navigation.goBack();
    else navigation.reset({ index: 0, routes: [{ name: 'Main', params: { tab: 'Home' } }] });
  };

  const goHome = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { tab: 'Home', tabParams: { quizDone: true, topMatch, matches } } }],
    });

  const goRoadmap = () => navigation.reset({ index: 0, routes: [{ name: 'Main', params: { tab: 'Roadmap' } }] });
  const goQuiz = () => navigation.navigate('Quiz');

  return (
    <Screen>
      <ScreenHeader
        onBack={goBack}
        eyebrow="Based on your quiz answers"
        title="Your Career Matches"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!topMatch ? (
          loaded ? (
            <EmptyState
              title="No results yet"
              message="Take the career quiz to see which tech career path fits you best."
              actionLabel="Start Career Quiz"
              onAction={goQuiz}
            />
          ) : null
        ) : (
          <>
            <GlassCard style={{ alignItems: 'center', paddingVertical: 22, marginBottom: 22 }}>
              <View style={[styles.iconCircle, { backgroundColor: t.accentSoft }]}>
                <Sparkles size={20} color={t.accent} />
              </View>
              <Text style={[styles.topLabel, { color: t.accent }]}>TOP MATCH</Text>
              <Text style={[styles.topTitle, { color: t.text }]}>{topMatch.title}</Text>
              <Text style={[styles.topPercent, { color: t.subtext }]}>{topMatch.percent}% compatibility</Text>
            </GlassCard>

            <SectionTitle>All Matches</SectionTitle>
            {matches.map((match) => (
              <GlassCard key={match.id || match.title} style={{ marginBottom: 12 }}>
                <View style={styles.rowTop}>
                  <Text style={[styles.rowTitle, { color: t.text }]}>{match.title}</Text>
                  <Text style={[styles.rowPercent, { color: t.accent }]}>{match.percent}%</Text>
                </View>
                <ProgressBar pct={match.percent} />
              </GlassCard>
            ))}

            <PrimaryButton variant="light" label="View My Roadmap" onPress={goRoadmap} style={{ marginTop: 8 }} />
            <SecondaryButton label="Back to Home" onPress={goHome} style={{ marginTop: 12 }} />
            <SecondaryButton label="Retake Quiz" onPress={goQuiz} style={{ marginTop: 12 }} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  topLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  topTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  topPercent: { fontSize: 13 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowPercent: { fontSize: 14, fontWeight: '800' },
});
