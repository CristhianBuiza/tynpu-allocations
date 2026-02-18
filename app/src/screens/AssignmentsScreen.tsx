import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAssignments } from '../hooks/useAssignments';
import { useProjects } from '../hooks/useProjects';
import { useConsultants } from '../hooks/useConsultants';
import { Assignment } from '../types/api';

const statusConfig: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  active: { bg: '#DCFCE7', text: '#166534', icon: 'play-circle' },
  completed: { bg: '#F3F4F6', text: '#1F2937', icon: 'checkmark-circle' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle' },
  scheduled: { bg: '#DBEAFE', text: '#1E40AF', icon: 'time' },
};

const AssignmentsScreen: React.FC = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useAssignments();

  const { data: projectsData } = useProjects();
  const { data: consultantsData } = useConsultants();

  const assignments = data?.pages.flatMap(page => page.data) ?? [];
  const insets = useSafeAreaInsets();

  // Build lookup maps for project and consultant names
  const projectMap = useMemo(() => {
    const map: Record<string, string> = {};
    projectsData?.pages.forEach(page => {
      page.data.forEach(p => { map[p.id] = p.name; });
    });
    return map;
  }, [projectsData]);

  const consultantMap = useMemo(() => {
    const map: Record<string, string> = {};
    consultantsData?.pages.forEach(page => {
      page.data.forEach(c => { map[c.id] = c.name; });
    });
    return map;
  }, [consultantsData]);

  const renderAssignmentItem = ({ item }: { item: Assignment }) => {
    const config = statusConfig[item.status] ?? statusConfig.scheduled;
    const projectName = item.project?.name || projectMap[item.projectId] || 'Unknown Project';
    const consultantName = item.consultant?.name || consultantMap[item.consultantId] || 'Unknown Consultant';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.projectName}>{projectName}</Text>
            <View style={styles.consultantRow}>
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text style={styles.consultantName}>{consultantName}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon} size={12} color={config.text} />
            <Text style={[styles.statusText, { color: config.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>
              {new Date(item.startTime).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text style={styles.detailText}>{item.hours}h</Text>
          </View>
        </View>

        <View style={styles.timeRange}>
          <Text style={styles.timeText}>
            {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {item.notes ? (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text-outline" size={14} color="#9CA3AF" />
            <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  };

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Error loading assignments</Text>
        <Text style={styles.errorSubtext}>{error?.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={assignments}
        renderItem={renderAssignmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: insets.bottom + 96 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No assignments found</Text>
            <Text style={styles.emptySubtitle}>Tap + to create one</Text>
          </View>
        }
      />
    </View>
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
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  consultantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  consultantName: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  timeRange: {
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    gap: 6,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  errorSubtext: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 4,
  },
});

export default AssignmentsScreen;
