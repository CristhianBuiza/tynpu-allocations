import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useConsultant } from '../hooks/useConsultants';
import { useProjects } from '../hooks/useProjects';
import { useAssignments } from '../hooks/useAssignments';

type ConsultantDetailScreenRouteProp = RouteProp<RootStackParamList, 'ConsultantDetail'>;

interface Props {
  route: ConsultantDetailScreenRouteProp;
}

const availabilityConfig: Record<string, { color: string; bg: string; label: string }> = {
  available: { color: '#166534', bg: '#DCFCE7', label: 'Available' },
  busy: { color: '#92400E', bg: '#FEF3C7', label: 'Busy' },
  unavailable: { color: '#991B1B', bg: '#FEE2E2', label: 'Unavailable' },
};

const ConsultantDetailScreen: React.FC<Props> = ({ route }) => {
  const { consultantId } = route.params;
  const { data: consultant, isLoading, isError, refetch } = useConsultant(consultantId);
  const { data: projectsData } = useProjects();
  const { data: assignmentsData } = useAssignments(consultantId);
  const assignments = assignmentsData?.pages.flatMap(page => page.data) ?? [];

  const projectMap = useMemo(() => {
    const map: Record<string, string> = {};
    projectsData?.pages.forEach(page => {
      page.data.forEach(p => { map[p.id] = p.name; });
    });
    return map;
  }, [projectsData]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading consultant...</Text>
      </View>
    );
  }

  if (isError || !consultant) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load consultant</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availability = availabilityConfig[consultant.availability] ?? availabilityConfig.unavailable;

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {consultant.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.consultantName}>{consultant.name}</Text>
        <Text style={styles.consultantEmail}>{consultant.email}</Text>
        
        <View style={styles.tagsRow}>
          <View style={[styles.tag, { backgroundColor: availability.bg }]}>
            <View style={[styles.dot, { backgroundColor: availability.color }]} />
            <Text style={[styles.tagText, { color: availability.color }]}>{availability.label}</Text>
          </View>
          <View style={styles.rateTag}>
            <Ionicons name="cash-outline" size={14} color="#2563EB" />
            <Text style={styles.rateText}>${consultant.hourlyRate}/hr</Text>
          </View>
        </View>
      </View>

      {/* Skills Card */}
      {consultant.skills && consultant.skills.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsGrid}>
            {consultant.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Assignments Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assignments ({assignments.length})</Text>
        {assignments.length === 0 ? (
          <Text style={styles.emptyText}>No assignments yet</Text>
        ) : (
          assignments.map((assignment, index) => {
            const projectName = assignment.project?.name || projectMap[assignment.projectId] || 'Unknown Project';
            return (
            <View key={assignment.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.assignmentRow}>
                <View style={styles.assignmentInfo}>
                  <Text style={styles.assignmentProject}>
                    {projectName}
                  </Text>
                  <Text style={styles.assignmentTime}>
                    {new Date(assignment.startTime).toLocaleDateString()} · {assignment.hours}h
                  </Text>
                </View>
                <Text style={[styles.assignmentStatus, { 
                  color: assignment.status === 'active' ? '#166534' : '#6B7280' 
                }]}>
                  {assignment.status}
                </Text>
              </View>
            </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    backgroundColor: '#DBEAFE',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 36,
  },
  consultantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  consultantEmail: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  rateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  skillText: {
    fontSize: 13,
    color: '#4338CA',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentProject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  assignmentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  assignmentStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ConsultantDetailScreen;
