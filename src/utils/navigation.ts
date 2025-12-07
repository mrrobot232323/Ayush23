/**
 * Navigation Utilities
 * Centralized navigation helpers to simplify routing throughout the app
 */

import { useRouter } from 'expo-router';
import { ROUTES } from '../constants/routes';

/**
 * Custom hook for simplified navigation
 */
export const useNavigation = () => {
  const router = useRouter();

  return {
    /**
     * Navigate to a route
     */
    navigate: (route: string, params?: Record<string, any>) => {
      if (params) {
        router.push({
          pathname: route as any,
          params,
        });
      } else {
        router.push(route as any);
      }
    },

    /**
     * Replace current route (useful for auth flows)
     */
    replace: (route: string, params?: Record<string, any>) => {
      if (params) {
        router.replace({
          pathname: route as any,
          params,
        });
      } else {
        router.replace(route as any);
      }
    },

    /**
     * Go back
     */
    goBack: () => {
      router.back();
    },

    /**
     * Navigate to tabs
     */
    toTabs: (tab?: string) => {
      if (tab) {
        router.replace(`/(tabs)/${tab}` as any);
      } else {
        router.replace(ROUTES.TABS.ROOT as any);
      }
    },

    /**
     * Navigate to login
     */
    toLogin: () => {
      router.replace(ROUTES.LOGIN as any);
    },

    /**
     * Navigate to signup
     */
    toSignup: () => {
      router.push(ROUTES.SIGNUP_EMAIL as any);
    },

    /**
     * Navigate to profile
     */
    toProfile: (userId?: string) => {
      if (userId) {
        router.push({
          pathname: ROUTES.PROFILE_DETAIL as any,
          params: { userId },
        });
      } else {
        router.push(ROUTES.TABS.PROFILE as any);
      }
    },

    /**
     * Navigate to chat room
     */
    toChatRoom: (chatId: string) => {
      router.push({
        pathname: ROUTES.CHAT_ROOM as any,
        params: { chatId },
      });
    },

    /**
     * Navigate to edit profile
     */
    toEditProfile: () => {
      router.push(ROUTES.EDIT_PROFILE as any);
    },

    /**
     * Navigate to discover
     */
    toDiscover: () => {
      router.replace(ROUTES.TABS.DISCOVER as any);
    },

    /**
     * Navigate to notifications
     */
    toNotifications: () => {
      router.push(ROUTES.NOTIFICATIONS as any);
    },
  };
};

/**
 * Direct navigation functions (for use outside components)
 */
export const NavigationService = {
  /**
   * Get router instance (only works in components)
   */
  getRouter: () => {
    // This will be set by the navigation provider
    return null;
  },
};
