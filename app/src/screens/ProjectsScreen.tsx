import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../types/api';

type ProjectsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: '#DCFCE7', text: '#166534' },
  completed: { bg: '#F3F4F6', text: '#1F2937' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  planning: { bg: '#DBEAFE', text: '#1E40AF' },
};

const ProjectsScreen: React.FC = () => {
  const navigation = useNavigation<ProjectsScreenNavigationProp>();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useProjects();

  const projects = data?.pages.flatMap(page => page.data) ?? [];
  const insets = useSafeAreaInsets();

  const renderProjectItem = ({ item }: { item: Project }) => {
    const colors = statusColors[item.status] ?? statusColors.planning;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusDot, { backgroundColor: colors.bg }]}>
            <Ionicons
              name={item.status === 'active' ? 'rocket' : item.status === 'completed' ? 'checkmark-circle' : item.status === 'cancelled' ? 'close-circle' : 'time'}
              size={16}
              color={colors.text}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.client}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>  
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.startDate).toLocaleDateString()} — {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.budgetRow}>
          <Ionicons name="cash-outline" size={14} color="#6B7280" />
          <Text style={styles.budgetText}>${Number(item.budget).toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Error loading projects</Text>
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
        data={projects}
        renderItem={renderProjectItem}
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
            <Ionicons name="briefcase-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No projects found</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budgetText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
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

export default ProjectsScreen;
