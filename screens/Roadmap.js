import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Check, ChevronDown, ChevronUp, ExternalLink, BookOpen } from 'lucide-react-native';
import { doc, setDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../Firebase';
import {
  useUserDoc,
  useRoadmapSteps,
  useCareerTracks,
  trackIdFromResult,
  withStatuses,
  countCompleted,
} from '../careerEngine';
import { useCardTheme, BRAND, PALETTE } from '../theme';
import { Screen, ScreenHeader, GlassCard, ProgressBar, EmptyState } from '../components/UI';

// The roadmap is BUILT from the student's quiz result: whichever career track
// the quiz ranks first decides which steps appear here. Retake the quiz and a
// new roadmap appears. Progress is saved per step on users/{uid}.
export default function Roadmap({ navigation }) {
  const t = useCardTheme();
  const uid = auth.currentUser?.uid;

  const { profile, setProfile, loaded } = useUserDoc();
  const tracks = useCareerTracks();
  const trackId = trackIdFromResult(profile?.quizResult);
  const trackTitle =
    tracks.find((tr) => tr.id === trackId)?.title || profile?.quizResult?.topMatch?.title;

  const templateSteps = useRoadmapSteps(trackId);

  // Step ids this student has ticked off (stored as strings like "backend-developer-1").
  const [completedIds, setCompletedIds] = useState([]);
  useEffect(() => {
    setCompletedIds((profile?.completedRoadmapSteps || []).map(String));
  }, [profile]);

  const steps = withStatuses(templateSteps, completedIds);
  const milestonesTotal = steps.length;
  const milestonesCompleted = countCompleted(steps, completedIds);
  const overallProgress = milestonesTotal ? Math.round((milestonesCompleted / milestonesTotal) * 100) : 0;
  const currentStep = steps.find((s) => s.status === 'current');

  const [expandedStepId, setExpandedStepId] = useState(null);
  useEffect(() => {
    // Open the "You are here" step by default.
    setExpandedStepId(currentStep ? currentStep.id : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, templateSteps.length]);

  // Tap a step's circle to toggle it done / not done.
  const toggleStepDone = async (stepId, isDone) => {
    const next = isDone ? completedIds.filter((id) => id !== stepId) : [...completedIds, stepId];
    setCompletedIds(next); // update the screen immediately
    setProfile((p) => ({ ...(p || {}), completedRoadmapSteps: next }));

    if (!uid) {
      Alert.alert('Sign in to save progress', 'Your progress will only be saved for this session.');
      return;
    }
    try {
      await setDoc(
        doc(db, 'users', uid),
        { completedRoadmapSteps: isDone ? arrayRemove(stepId) : arrayUnion(stepId), roadmapUpdatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      Alert.alert('Could not save progress', err.message);
    }
  };

  const handleOpenLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Error', `Cannot open URL: ${url}`);
    } catch (err) {
      Alert.alert('Error', `Cannot open URL: ${url}`);
    }
  };

  return (
    <Screen navigation={navigation} activeTab="Roadmap">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow={trackTitle ? `${trackTitle} path` : 'Personalised for you'}
          title="Your Roadmap"
          subtitle={profile?.institution || undefined}
        />

        <View style={styles.body}>
          {!trackId ? (
            loaded ? (
              <EmptyState
                title="Your roadmap is built from your quiz"
                message="Take the career quiz and we'll generate a step-by-step roadmap for the career that fits you best."
                actionLabel="Start Career Quiz"
                onAction={() => navigation.navigate('Quiz')}
              />
            ) : null
          ) : steps.length === 0 ? (
            <EmptyState
              title="Roadmap coming soon"
              message={`We don't have roadmap steps for ${trackTitle || 'this career'} yet. Check back soon.`}
            />
          ) : (
            <>
              <GlassCard style={{ marginBottom: 26 }}>
                <View style={styles.progressTopRow}>
                  <Text style={[styles.progressLabel, { color: t.text }]}>Overall progress</Text>
                  <Text style={[styles.progressPercent, { color: t.accent }]}>{overallProgress}%</Text>
                </View>
                <ProgressBar pct={overallProgress} style={{ height: 8, marginBottom: 12 }} />
                <Text style={[styles.progressSubtext, { color: t.subtext }]}>
                  {milestonesCompleted} of {milestonesTotal} milestones completed
                </Text>
              </GlassCard>

              {steps.map((step, index) => {
                const isExpanded = expandedStepId === step.id;
                const isLastStep = index === steps.length - 1;

                return (
                  <View key={step.id} style={styles.stepRow}>
                    {!isLastStep && (
                      <View
                        style={[
                          styles.verticalLine,
                          {
                            backgroundColor:
                              step.status === 'completed' ? BRAND.aqua : 'rgba(255,255,255,0.25)',
                          },
                        ]}
                      />
                    )}

                    <TouchableOpacity
                      style={styles.circleContainer}
                      activeOpacity={0.7}
                      onPress={() => toggleStepDone(step.id, step.status === 'completed')}
                    >
                      {step.status === 'completed' ? (
                        <View style={styles.completedCircle}>
                          <Check size={18} color={BRAND.deep} strokeWidth={3} />
                        </View>
                      ) : step.status === 'current' ? (
                        <View style={styles.currentCircle}>
                          <Text style={styles.currentCircleText}>{index + 1}</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingCircle}>
                          <Text style={styles.pendingCircleText}>{index + 1}</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <GlassCard
                      onPress={() => setExpandedStepId(isExpanded ? null : step.id)}
                      style={{ flex: 1 }}
                    >
                      <View style={styles.cardHeader}>
                        <Text style={[styles.stepCategory, { color: t.accent }]}>{step.category}</Text>
                        {isExpanded ? (
                          <ChevronUp size={18} color={t.subtext} />
                        ) : (
                          <ChevronDown size={18} color={t.subtext} />
                        )}
                      </View>

                      <View style={styles.stepTitleRow}>
                        <Text style={[styles.stepTitle, { color: t.text }]} numberOfLines={2}>
                          {step.title}
                        </Text>
                        <Text style={[styles.stepDuration, { color: t.subtext }]}>{step.duration}</Text>
                      </View>

                      <Text style={[styles.stepDescription, { color: t.subtext }]}>{step.description}</Text>

                      {step.status === 'current' && (
                        <View style={[styles.badge, { backgroundColor: t.accentSoft }]}>
                          <Text style={[styles.badgeText, { color: t.accent }]}>You are here</Text>
                        </View>
                      )}

                      {isExpanded && step.resources && step.resources.length > 0 && (
                        <View style={[styles.resourceSection, { borderTopColor: t.divider }]}>
                          <View style={styles.resourceHeaderRow}>
                            <BookOpen size={14} color={t.accent} />
                            <Text style={[styles.resourceSectionTitle, { color: t.accent }]}>
                              Curated Resources
                            </Text>
                          </View>
                          {step.resources.map((res, rIdx) => (
                            <TouchableOpacity
                              key={rIdx}
                              style={[styles.resourceLinkButton, { backgroundColor: t.accentSoft }]}
                              onPress={() => handleOpenLink(res.url)}
                            >
                              <Text style={[styles.resourceLinkText, { color: t.text }]}>{res.label}</Text>
                              <ExternalLink size={14} color={t.accent} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </GlassCard>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  body: { paddingHorizontal: 20 },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  progressLabel: { fontWeight: '700', fontSize: 14 },
  progressPercent: { fontWeight: '800', fontSize: 20 },
  progressSubtext: { fontSize: 13 },
  stepRow: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
  verticalLine: {
    position: 'absolute',
    left: 16,
    top: 36,
    bottom: -20,
    width: 2,
    marginLeft: -1,
  },
  circleContainer: { zIndex: 10, marginRight: 14, paddingTop: 2 },
  completedCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND.aqua,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND.deep,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: BRAND.aqua,
  },
  currentCircleText: { color: BRAND.aqua, fontWeight: '800', fontSize: 14 },
  pendingCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingCircleText: { color: PALETTE.white, fontWeight: '800', fontSize: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCategory: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  stepTitle: { fontWeight: '700', fontSize: 16, lineHeight: 20, flex: 1, marginRight: 8 },
  stepDuration: { fontSize: 11, fontWeight: '600' },
  stepDescription: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, marginTop: 4 },
  badgeText: { fontWeight: '700', fontSize: 11 },
  resourceSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  resourceHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  resourceSectionTitle: { fontSize: 12, fontWeight: '700' },
  resourceLinkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  resourceLinkText: { fontSize: 12.5, fontWeight: '600', flex: 1, marginRight: 8 },
});