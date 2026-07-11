import { useSyncExternalStore } from 'react';
import {
  getResourcesData,
  RESOURCES_UPDATED_EVENT,
  type ResourcesData,
} from '@/lib/resourcesData';

// getResourcesData already returns a stable reference from its in-memory cache,
// so we can call it directly as the snapshot getter and rely on the update event
// to invalidate that cache.
function getSnapshot(): ResourcesData {
  return getResourcesData();
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(RESOURCES_UPDATED_EVENT, cb);
  // 'storage' fires when another tab writes to localStorage — keeps tabs in sync.
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(RESOURCES_UPDATED_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

function getServerSnapshot(): ResourcesData {
  return getResourcesData();
}

export function useResourcesData(): ResourcesData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
