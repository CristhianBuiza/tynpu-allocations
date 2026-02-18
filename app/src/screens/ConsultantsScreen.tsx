import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useConsultants } from '../hooks/useConsultants';
import { Consultant } from '../types/api';

type ConsultantsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const availabilityConfig: Record<string, { color: string; label: string }> = {
  available: { color: '#22C55E', label: 'Available' },
  busy: { color: '#F59E0B', label: 'Busy' },
  unavailable: { color: '#EF4444', label: 'Unavailable' },
};

const ConsultantsScreen: React.FC = () => {
  const navigation = useNavigation<ConsultantsScreenNavigationProp>();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useConsultants();

  const consultants = data?.pages.flatMap(page => page.data) ?? [];
  const insets = useSafeAreaInsets();

  const renderConsultantItem = ({ item }: { item: Consultant }) => {
    const availability = availabilityConfig[item.availability] ?? availabilityConfig.unavailable;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ConsultantDetail', { consultantId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>

            <View style={styles.availabilityRow}>
              <View style={[styles.availabilityDot, { backgroundColor: availability.color }]} />
              <Text style={styles.availabilityText}>{availability.label}</Text>
              <Text style={styles.rateText}>${item.hourlyRate}/hr</Text>
            </View>

            {item.skills && item.skills.length > 0 && (
              <View style={styles.skillsRow}>
                {item.skills.slice(0, 3).map((skill, index) => (
                  <View key={index} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
                {item.skills.length > 3 && (
                  <View style={styles.moreSkills}>
                    <Text style={styles.moreSkillsText}>+{item.skills.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
        <Text style={styles.loadingText}>Loading consultants...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Error loading consultants</Text>
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
        data={consultants}
        renderItem={renderConsultantItem}
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
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No consultants found</Text>
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: '#DBEAFE',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 12,
  },
  rateText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 11,
    color: '#4338CA',
    fontWeight: '500',
  },
  moreSkills: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  moreSkillsText: {
    fontSize: 11,
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

export default ConsultantsScreen;
