import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../Firebase';
import { useCareerTracks, useQuizQuestions, scoreQuiz } from '../careerEngine';
import { useCardTheme } from '../theme';
import { Screen, ScreenHeader, GlassCard, PrimaryButton, SecondaryButton, ProgressBar } from '../components/UI';

// The questions, the career tracks and the scoring weights all come from
// careerEngine (Firestore first, Data/careerData.js as fallback). Nothing
// about the questions or the result is written in this screen.
export default function QuizScreen({ navigation }) {
  const t = useCardTheme();
  const tracks = useCareerTracks();
  const questions = useQuizQuestions(tracks);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // If the live questions arrive after the quiz started, start cleanly.
  const signature = questions.map((q) => q.id).join('|');
  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
  }, [signature]);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const selected = question ? answers[question.id] : undefined;
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const goBack = () => {
    if (navigation?.canGoBack?.()) navigation.goBack();
    else navigation?.reset({ index: 0, routes: [{ name: 'Main', params: { tab: 'Home' } }] });
  };

  const choose = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
  };

  const finish = () => {
    // Result is CALCULATED from the answers and the option weights.
    const matches = scoreQuiz(questions, answers, tracks);
    const topMatch = matches[0];

    // Saved on this student's own user document; the Roadmap reads the top
    // match from here to build their personal roadmap.
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(
        doc(db, 'users', uid),
        { quizResult: { answers, matches, topMatch, completedAt: serverTimestamp() } },
        { merge: true }
      ).catch((err) => console.warn('Could not save quiz result:', err.message));
    }

    navigation.navigate('CareerResults', { answers, matches, topMatch });
  };

  const next = () => {
    if (selected === undefined) return;
    if (isLast) finish();
    else setCurrentIndex((i) => i + 1);
  };

  const previous = () => setCurrentIndex((i) => Math.max(0, i - 1));

  return (
    <Screen>
      <ScreenHeader
        onBack={goBack}
        eyebrow={question ? `Question ${currentIndex + 1} of ${questions.length}` : 'Career Quiz'}
        title="Career Quiz"
      >
        <ProgressBar pct={progress} onGradient style={{ marginTop: 14 }} />
      </ScreenHeader>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {question ? (
          <GlassCard>
            <Text style={[styles.questionText, { color: t.text }]}>{question.text}</Text>

            {question.options.map((option, index) => {
              const isSelected = selected === index;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  onPress={() => choose(index)}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: isSelected ? t.accentSoft : t.inputBg,
                      borderColor: isSelected ? t.accent : 'transparent',
                    },
                  ]}
                >
                  <View style={[styles.radioOuter, { borderColor: isSelected ? t.accent : t.subtext }]}>
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: t.accent }]} />}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      { color: t.text, fontWeight: isSelected ? '700' : '600' },
                    ]}
                  >
                    {option.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </GlassCard>
        ) : (
          <GlassCard>
            <Text style={{ color: t.subtext, textAlign: 'center' }}>No quiz questions available right now.</Text>
          </GlassCard>
        )}

        <View style={styles.buttons}>
          {currentIndex > 0 && (
            <SecondaryButton label="Back" onPress={previous} style={{ flex: 1 }} />
          )}
          <PrimaryButton
            variant="light"
            label={isLast ? 'See My Results' : 'Next Question'}
            onPress={next}
            disabled={selected === undefined || !question}
            style={{ flex: 2 }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  questionText: { fontSize: 19, fontWeight: '700', lineHeight: 26, marginBottom: 18 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  optionText: { flex: 1, fontSize: 14, lineHeight: 19 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
