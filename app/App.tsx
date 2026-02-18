import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { asyncStoragePersister } from './src/services/asyncStoragePersister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep cache for offline use
    },
  },
});

const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <StatusBar style="auto" />
        <AppNavigator />
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}