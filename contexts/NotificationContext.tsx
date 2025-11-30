import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  expoPushToken: string | null;
  notifications: any[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId?: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  notifications: [],
  unreadCount: 0,
  refreshNotifications: async () => {},
  markAsRead: async () => {},
});

// Configure local notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { userData } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Track which notification IDs we've already shown
  const shownNotificationIds = useRef<Set<number>>(new Set());
  
  const pollingInterval = useRef<NodeJS.Timeout>();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (userData?.userId) {
      console.log('✅ Notification system started');
      console.log('🔔 Works when app is OPEN or MINIMIZED');
      console.log('⏱️ Updates every 30 seconds');
      
      // Request notification permissions
      requestNotificationPermissions();
      
      // Start polling
      startPolling();

      // Listen to app state changes (foreground/background)
      const subscription = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        stopPolling();
        subscription.remove();
      };
    }
  }, [userData?.userId]);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('⚠️ Notification permissions not granted');
    } else {
      console.log('✅ Notification permissions granted');
    }
  };

  const handleAppStateChange = (nextAppState: any) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App came to foreground
      console.log('📱 App came to foreground');
      refreshNotifications();
    } else if (nextAppState.match(/inactive|background/)) {
      // App went to background
      console.log('📱 App minimized - continuing to check for notifications');
    }

    appState.current = nextAppState;
  };

  const refreshNotifications = async () => {
    if (!userData?.userId) return;

    try {
      const response = await fetch(
        `https://domainapi.shop/g/backend/notification/get-notifications.php?userId=${userData.userId}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        
        // Update app badge
        await Notifications.setBadgeCountAsync(data.unreadCount);
        
        // Check for NEW unread notifications that we haven't shown yet
        if (data.notifications.length > 0) {
          for (const notification of data.notifications) {
            // Only show if:
            // 1. It's unread
            // 2. We haven't shown it before
            if (!notification.isRead && !shownNotificationIds.current.has(notification.id)) {
              // Mark as shown
              shownNotificationIds.current.add(notification.id);
              
              // Show local notification
              await showLocalNotification(
                notification.title,
                notification.message,
                notification.type
              );
              
              console.log('🔔 New notification shown:', notification.title);
            }
          }
        }
        
        console.log(`📊 Notifications: ${data.unreadCount} unread`);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    }
  };

  const showLocalNotification = async (title: string, body: string, type: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          data: { 
            screen: 'posted-rides',
            type: type 
          },
          // Use your app icon as notification icon
          badge: 1,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  };

  const markAsRead = async (notificationId?: number) => {
    if (!userData?.userId) return;

    try {
      const response = await fetch(
        'https://domainapi.shop/g/backend/notification/mark-as-read.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userData.userId,
            notificationId: notificationId,
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Marked as read`);
        
        // Remove from shown notifications if marking specific one as read
        if (notificationId) {
          shownNotificationIds.current.delete(notificationId);
        } else {
          // Clear all shown notifications if marking all as read
          shownNotificationIds.current.clear();
        }
        
        await refreshNotifications();
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  const startPolling = () => {
    // Initial fetch
    refreshNotifications();
    
    // Poll every 30 seconds
    pollingInterval.current = setInterval(() => {
      refreshNotifications();
    }, 30000); // 30 seconds
    
    console.log('🔄 Started polling (every 30 seconds)');
    console.log('✅ Works when app is OPEN or MINIMIZED');
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      console.log('⏹️ Stopped polling');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
