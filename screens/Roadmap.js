import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  Home,
  Compass,
  Map,
  User,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
} from 'lucide-react-native';


const roadmapData = {
  overallProgress: 40,
  milestonesCompleted: 2,
  milestonesTotal: 5,
  steps: [
    {
      id: 1,
      category: 'Foundation',
      title: 'Node.js & Express REST APIs',
      duration: '4 Weeks',
      status: 'completed',
      description:
        'Master JavaScript/TypeScript runtime, async execution, middleware, CLI tools, and RESTful routing.',
      resources: [
        { label: 'FreeCodeCamp Node.js Course', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE' },
        { label: 'JWT Authentication Guide', url: 'https://www.youtube.com/watch?v=f2EqECiTBL8' },
      ],
    },
    {
      id: 2,
      category: 'Databases',
      title: 'SQL, PostgreSQL & Indexing',
      duration: '3 Weeks',
      status: 'completed',
      description:
        'Design relational schemas, write raw SQL queries, configure indexes, and optimize query execution plans.',
      resources: [
        { label: 'SQLBolt Interactive Tutorial', url: 'https://sqlbolt.com/' },
        { label: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com/' },
      ],
    },
    {
      id: 3,
      category: 'Portfolio',
      title: 'CRUD APIs, Auth & Real Datasets',
      duration: '4 Weeks',
      status: 'current',
      description:
        'Build 3 full backend projects with Role-Based Access Control (RBAC), Docker containers, and live database hosting.',
      resources: [
        { label: 'Roadmap.sh Backend Guide', url: 'https://roadmap.sh/backend' },
        { label: 'Backend Project Ideas', url: 'https://www.freecodecamp.org/news/backend-web-development-project-ideas/' },
      ],
    },
    {
      id: 4,
      category: 'Cloud Certs',
      title: 'AWS Solutions Architect Associate',
      duration: '6 Weeks',
      status: 'pending',
      description:
        'Learn cloud infrastructure: EC2, S3, RDS, Lambda, VPC networking, and IAM policies for production deployments.',
      resources: [
        { label: 'AWS SAA Official Exam Page', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
        { label: 'GCP Associate Cloud Engineer', url: 'https://cloud.google.com/learn/certification/cloud-engineer' },
      ],
    },
    {
      id: 5,
      category: 'Career & Jobs',
      title: 'Internships & Remote Roles',
      duration: 'Ongoing',
      status: 'pending',
      description:
        'Optimize GitHub profile, complete backend coding challenges, and apply to South African & global tech platforms.',
      resources: [
        { label: 'OfferZen South Africa', url: 'https://www.offerzen.com/' },
        { label: 'Wellfound Startup Jobs', url: 'https://wellfound.com/' },
      ],
    },
  ],
};

export default function Roadmap() {
  const { overallProgress, milestonesCompleted, milestonesTotal, steps } = roadmapData;
  const [expandedStepId, setExpandedStepId] = useState(3); // Default expanded to 'current'

  const toggleExpand = (id) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  const handleOpenLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', `Cannot open URL: ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A5C53', '#05342F']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.pathTitle}>Backend Developer Path • Johannesburg, SA</Text>
            <Text style={styles.mainTitle}>Your Roadmap</Text>

          
            <View style={styles.progressCard}>
              <View style={styles.progressTopRow}>
                <Text style={styles.progressLabel}>Overall progress</Text>
                <Text style={styles.progressPercent}>{overallProgress}%</Text>
              </View>

              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${overallProgress}%` }]} />
              </View>

              <Text style={styles.progressSubtext}>
                {milestonesCompleted} of {milestonesTotal} milestones completed
              </Text>
            </View>

            <View style={styles.timelineContainer}>
              {steps.map((step, index) => {
                const isExpanded = expandedStepId === step.id;

                return (
                  <View key={step.id} style={styles.stepRow}>
                    
                    {index !== steps.length - 1 && (
                      <View
                        style={[
                          styles.verticalLine,
                          {
                            backgroundColor:
                              step.status === 'completed'
                                ? '#FFFFFF'
                                : 'rgba(255,255,255,0.2)',
                          },
                        ]}
                      />
                    )}

              
                    <View style={styles.circleContainer}>
                      {step.status === 'completed' ? (
                        <View style={styles.completedCircle}>
                          <Check size={18} color="#0A5C53" strokeWidth={3} />
                        </View>
                      ) : step.status === 'current' ? (
                        <View style={styles.currentCircleOuter}>
                          <Text style={styles.currentCircleText}>{step.id}</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingCircle}>
                          <Text style={styles.pendingCircleText}>{step.id}</Text>
                        </View>
                      )}
                    </View>

                    
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => toggleExpand(step.id)}
                      style={styles.stepContentCard}
                    >
                      <View style={styles.cardHeader}>
                        <Text style={styles.stepCategory}>{step.category}</Text>
                        {isExpanded ? (
                          <ChevronUp size={18} color="#88B3AD" />
                        ) : (
                          <ChevronDown size={18} color="#88B3AD" />
                        )}
                      </View>

                      <View style={styles.stepTitleRow}>
                        <Text style={styles.stepTitle} numberOfLines={2}>
                          {step.title}
                        </Text>
                        <Text style={styles.stepDuration}>{step.duration}</Text>
                      </View>

                      <Text style={styles.stepDescription}>{step.description}</Text>

                      
                      {step.status === 'current' && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}> You are here</Text>
                        </View>
                      )}

                     
                      {isExpanded && step.resources && step.resources.length > 0 && (
                        <View style={styles.resourceSection}>
                          <View style={styles.resourceHeaderRow}>
                            <BookOpen size={14} color="#2DD4BF" />
                            <Text style={styles.resourceSectionTitle}>Curated Resources</Text>
                          </View>
                          {step.resources.map((res, rIdx) => (
                            <TouchableOpacity
                              key={rIdx}
                              style={styles.resourceLinkButton}
                              onPress={() => handleOpenLink(res.url)}
                            >
                              <Text style={styles.resourceLinkText}>{res.label}</Text>
                              <ExternalLink size={14} color="#2DD4BF" />
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

       
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Home size={22} color="#88B3AD" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Compass size={22} color="#88B3AD" />
            <Text style={styles.navText}>Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Map size={22} color="#FFFFFF" />
            <Text style={[styles.navText, styles.activeNavText]}>Roadmap</Text>
            <View style={styles.activeDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <User size={22} color="#88B3AD" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05342F',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 54,
  },
  pathTitle: {
    color: '#88B3AD',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 28,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  progressPercent: {
    color: '#2DD4BF',
    fontWeight: '700',
    fontSize: 20,
  },
  progressBarTrack: {
    height: 8,
    width: '100%',
    backgroundColor: '#08443E',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2DD4BF',
    borderRadius: 4,
  },
  progressSubtext: {
    color: '#88B3AD',
    fontSize: 13,
  },
  timelineContainer: {
    position: 'relative',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  verticalLine: {
    position: 'absolute',
    left: 16,
    top: 36,
    bottom: -24,
    width: 2,
    marginLeft: -1,
  },
  circleContainer: {
    zIndex: 10,
    marginRight: 14,
    paddingTop: 2,
  },
  completedCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentCircleOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2DD4BF',
  },
  currentCircleText: {
    color: '#0A5C53',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pendingCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingCircleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContentCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCategory: {
    color: '#2DD4BF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 20,
    flex: 1,
    marginRight: 8,
  },
  stepDuration: {
    color: '#88B3AD',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  stepDescription: {
    color: '#B0CECA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 11,
    color: '#2DD4BF',
  },
  resourceSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  resourceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  resourceSectionTitle: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '700',
  },
  resourceLinkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  resourceLinkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5, 52, 47, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#88B3AD',
    fontSize: 10,
    marginTop: 4,
  },
  activeNavText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  activeDot: {
    width: 4,
    height: 4,
    backgroundColor: '#2DD4BF',
    borderRadius: 2,
    marginTop: 3,
  },
});