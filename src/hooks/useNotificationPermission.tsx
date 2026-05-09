import { useSyncExternalStore } from 'react';

// Define the type for the permission state
type NotificationPermissionState = NotificationPermission | 'loading';

export function useNotificationPermission() {
  const permission = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return permission;
}

function getSnapshot(): NotificationPermissionState {
  // Check if we are in a browser environment
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

/**
 * Optional: Provides a fallback for Server Side Rendering (SSR)
 */
function getServerSnapshot(): NotificationPermissionState {
  return 'loading';
}

function subscribe(callback: () => void) {
  // Check for API support
  if (!('permissions' in navigator)) return () => {};

  let permissionStatus: PermissionStatus | null = null;

  // We use an async IIFE or a simple promise chain because query() is asynchronous
  navigator.permissions.query({ name: 'notifications' }).then((status) => {
    permissionStatus = status;
    status.addEventListener('change', callback);
  });

  return () => {
    if (permissionStatus) {
      permissionStatus.removeEventListener('change', callback);
    }
  };
}