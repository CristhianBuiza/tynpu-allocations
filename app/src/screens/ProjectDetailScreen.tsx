import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProject } from '../hooks/useProjects';
import { useConsultants } from '../hooks/useConsultants';
import { useAssignments } from '../hooks/useAssignments';

type ProjectDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

interface Props {
  route: ProjectDetailScreenRouteProp;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: '#DCFCE7', text: '#166534' },
  completed: { bg: '#F3F4F6', text: '#1F2937' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  planning: { bg: '#DBEAFE', text: '#1E40AF' },
  scheduled: { bg: '#DBEAFE', text: '#1E40AF' },
};

const ProjectDetailScreen: React.FC<Props> = ({ route }) => {
  const { projectId } = route.params;
  const { data: project, isLoading, isError, refetch } = useProject(projectId);
  const { data: consultantsData } = useConsultants();
  const { data: assignmentsData } = useAssignments(undefined, projectId);
  const assignments = assignmentsData?.pages.flatMap(page => page.data) ?? [];

  const consultantMap = useMemo(() => {
    const map: Record<string, string> = {};
    consultantsData?.pages.forEach(page => {
      page.data.forEach(c => { map[c.id] = c.name; });
    });
    return map;
  }, [consultantsData]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  if (isError || !project) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load project</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const colors = statusColors[project.status] ?? statusColors.planning;

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.projectName}>{project.name}</Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.clientName}>{project.client}</Text>
        {project.description && (
          <Text style={styles.description}>{project.description}</Text>
        )}
      </View>

      {/* Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>
              {new Date(project.startDate).toLocaleDateString()} — {new Date(project.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={18} color="#6B7280" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Budget</Text>
            <Text style={styles.detailValue}>${Number(project.budget).toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Assignments Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Assignments ({assignments.length})</Text>
        {assignments.length === 0 ? (
          <Text style={styles.emptyText}>No assignments yet</Text>
        ) : (
          assignments.map((assignment, index) => {
            const consultantName = assignment.consultant?.name || consultantMap[assignment.consultantId] || 'Unknown';
            const assignmentColors = statusColors[assignment.status] ?? statusColors.scheduled;
            return (
              <View key={assignment.id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.assignmentRow}>
                  <View style={styles.assignmentInfo}>
                    <Text style={styles.assignmentConsultant}>{consultantName}</Text>
                    <Text style={styles.assignmentTime}>
                      {new Date(assignment.startTime).toLocaleDateString()} · {assignment.hours}h
                    </Text>
                  </View>
                  <View style={[styles.miniStatusBadge, { backgroundColor: assignmentColors.bg }]}>
                    <Text style={[styles.miniStatusText, { color: assignmentColors.text }]}>
                      {assignment.status}
                    </Text>
                  </View>
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
  headerCard: {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  projectName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  detailsCard: {
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
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentConsultant: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  assignmentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  miniStatusText: {
    fontSize: 11,
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

export default ProjectDetailScreen;
