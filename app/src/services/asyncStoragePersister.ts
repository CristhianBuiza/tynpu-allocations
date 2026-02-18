import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const STORAGE_KEY = "REACT_QUERY_OFFLINE_CACHE";

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: STORAGE_KEY,
});
