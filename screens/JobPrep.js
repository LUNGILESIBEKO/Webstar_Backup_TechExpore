import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useCardTheme, BRAND, PALETTE } from '../theme';
import { useFirestoreList } from '../FirestoreHooks';
import { useUserDoc, myTrackFrom } from '../careerEngine';
import { Screen, ScreenHeader, GlassCard, SegmentedTabs, SectionTitle, Pill } from '../components/UI';

const TABS = [
  { key: 'cv', label: 'CV Tips' },
  { key: 'interview', label: 'Interview' },
  { key: 'jobsearch', label: 'Job Search' },
];

const TIPS = {
  cv: [
    {
      title: 'Lead with impact, not duties',
      body: "Write 'Built REST API serving 50k daily requests, reducing response time by 40%' — not 'Responsible for building APIs'. Quantify everything.",
    },
    {
      title: 'Always include a GitHub link',
      body: 'SA hiring managers check GitHub. Pin your 3 best repos, add READMEs with screenshots, and keep commit history clean.',
    },
    {
      title: 'Tailor your skills section',
      body: "Mirror the exact terminology in the job posting. If they say 'PostgreSQL', don't write 'relational databases'. ATS systems are literal.",
    },
    {
      title: 'One page for under 3 years experience',
      body: "Ruthlessly cut filler. If a bullet doesn't demonstrate a skill or outcome, delete it. White space is your friend.",
    },
    {
      title: 'Add your location and remote preference',
      body: "Specify 'Cape Town — open to remote' so you don't get filtered out of remote-first roles.",
    },
  ],
  interview: [
    {
      title: 'Use the STAR method',
      body: 'Situation, Task, Action, Result. Practice 5 STAR stories covering teamwork, conflict, failure, success, and learning.',
    },
    {
      title: 'Practice coding out loud',
      body: 'SA interviews often include live coding. Narrate your thinking — interviewers care as much about your process as the solution.',
    },
    {
      title: "Research the company's stack",
      body: 'Check LinkedIn, their engineering blog, and job ads. Ask intelligent questions about their architecture and team setup.',
    },
    {
      title: 'Prepare 3 strong questions to ask',
      body: "'What does the first 90 days look like?', 'What is the biggest technical debt you're dealing with?', 'How do you handle code review?'",
    },
    {
      title: 'Know your salary range',
      body: 'Check PayScale ZA, Glassdoor, and OfferZen. Never be the first to give a number — ask what the budget is.',
    },
  ],
  jobsearch: [
    {
      title: "OfferZen is SA's best tech board",
      body: 'Companies apply to you. Create a strong profile and get inbound from SA and international companies hiring now.',
    },
    {
      title: 'Attend tech meetups',
      body: 'Cape Town JS, Johannesburg Python Meetup, PyCon ZA — these communities lead to referrals. Most hires come through networks.',
    },
    {
      title: 'Check LinkedIn properly',
      body: "Turn on 'Open to Work' for recruiters only. Connect with hiring managers and send a personalised 3-line message.",
    },
    {
      title: 'Target scale-ups, not just big corps',
      body: 'Companies like Synthesis, BBD, DVT, and Clickatell hire heavily in SA and offer great mentorship.',
    },
    {
      title: 'Consider remote for international salary',
      body: 'Remote.co, We Work Remotely, and Toptal connect SA devs with USD/EUR salaries. Senior SA devs earn $80k–$150k remotely.',
    },
  ],
};

// Firestore's `job_prep_tips` collection stores one flat list (each doc has
// category: 'cv' | 'interview' | 'jobsearch', plus title/body/order); this
// groups it back into the same { cv: [...], interview: [...], ... } shape
// the hardcoded TIPS object above already used, and sorts each group by
// `order` (docs with no order keep whatever position Firestore returned).
function groupTips(flatList) {
  const grouped = { cv: [], interview: [], jobsearch: [] };
  flatList.forEach((tip) => {
    if (grouped[tip.category]) grouped[tip.category].push(tip);
  });
  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  });
  return grouped;
}

const TIPS_FALLBACK_FLAT = Object.entries(TIPS).flatMap(([category, tips]) =>
  tips.map((tip, i) => ({ ...tip, category, order: i + 1 }))
);

function TipCard({ tip, index, t, tag }) {
  return (
    <GlassCard style={{ marginBottom: 14 }}>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
        {tag ? <Pill label={tag} /> : null}
      </View>
      <Text style={[styles.tipTitle, { color: t.text }]}>{tip.title}</Text>
      <Text style={[styles.tipBody, { color: t.subtext }]}>{tip.body}</Text>
    </GlassCard>
  );
}

export default function JobPrepHubScreen({ navigation }) {
  const flatTips = useFirestoreList('job_prep_tips', TIPS_FALLBACK_FLAT, null);
  const tipsByCategory = groupTips(flatTips);

  const [activeTab, setActiveTab] = useState('cv');
  const t = useCardTheme();

  // The student's career from their quiz result: their tips come first.
  const { profile, loaded } = useUserDoc();
  const track = useMemo(() => myTrackFrom(profile?.quizResult), [profile?.quizResult]);
  const myTips = track ? track.content.prep[activeTab] || [] : [];
  const generalTips = tipsByCategory[activeTab];

  const goBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation?.reset({ index: 0, routes: [{ name: 'Main', params: { tab: 'Home' } }] });
    }
  };

  return (
    <Screen>
      <ScreenHeader
        onBack={goBack}
        eyebrow="Get hired faster"
        title="Job Prep Hub"
        subtitle={track ? `Tailored for your match: ${track.title}` : undefined}
      >
        <View style={{ marginTop: 16 }}>
          <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </View>
      </ScreenHeader>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {track ? (
          <>
            <SectionTitle>{`For a ${track.title}`}</SectionTitle>
            {myTips.map((tip, index) => (
              <TipCard key={`mine-${tip.title}`} tip={tip} index={index} t={t} tag={track.title} />
            ))}
            <SectionTitle style={{ marginTop: 10 }}>General tips for any tech role</SectionTitle>
          </>
        ) : loaded ? (
          <GlassCard onPress={() => navigation?.navigate?.('Quiz')} style={{ marginBottom: 14 }}>
            <Text style={[styles.tipTitle, { color: t.text }]}>Get tips for your career</Text>
            <Text style={[styles.tipBody, { color: t.subtext }]}>
              Take the career quiz and this hub will show CV, interview and job search advice for
              your best match. Tap to start. Until then, here are tips that suit any tech role.
            </Text>
          </GlassCard>
        ) : null}

        {generalTips.map((tip, index) => (
          <TipCard key={`gen-${tip.title}`} tip={tip} index={index} t={t} />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BRAND.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: PALETTE.white, fontSize: 12, fontWeight: '700' },
  tipTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  tipBody: { fontSize: 13.5, lineHeight: 20 },
});