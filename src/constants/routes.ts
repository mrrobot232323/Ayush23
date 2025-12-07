/**
 * Centralized Routes Configuration
 * All routes in the application are defined here for easy management
 */

export const ROUTES = {
  // Auth Routes
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP_EMAIL: '/signup-email',
  
  // Signup Wizard Routes
  SIGNUP_WIZARD: {
    STEP_1: '/signup-wizard/step-1',
    STEP_2_GENDER: '/signup-wizard/step-2-gender',
    STEP_3_STYLE: '/signup-wizard/step-3-style',
    STEP_4_OCCUPATION: '/signup-wizard/step-4-occupation',
    STEP_4_WHOMEET: '/signup-wizard/step-4-whomeet',
    STEP_5_ADDTRIP: '/signup-wizard/step-5-addtrip',
    STEP_5_LOOKINGFOR: '/signup-wizard/step-5-lookingfor',
    STEP_6_PROMPTS: '/signup-wizard/step-6-prompts',
    STEP_7_PHOTOS: '/signup-wizard/step-7-photos',
    STEP_8_LOCATION: '/signup-wizard/step-8-location',
  },
  
  // Main Tabs Routes
  TABS: {
    ROOT: '/(tabs)',
    DISCOVER: '/(tabs)',
    EXPLORE: '/(tabs)/explore',
    CREATE: '/(tabs)/create',
    CHATS: '/(tabs)/chats',
    PROFILE: '/(tabs)/profile',
  },
  
  // Profile Routes
  PROFILE_DETAIL: '/profile-detail',
  EDIT_PROFILE: '/edit-profile',
  
  // Chat Routes
  CHAT_ROOM: '/chat-room',
  
  // Other Routes
  DISCOVER: '/discover',
  MATCHES: '/matches',
  NOTIFICATIONS: '/notifications',
  MODAL: '/modal',
} as const;

/**
 * Navigation helper functions
 */
export type RouteKey = 
  | keyof typeof ROUTES
  | keyof typeof ROUTES.SIGNUP_WIZARD
  | keyof typeof ROUTES.TABS;

/**
 * Get route path by key
 */
export const getRoute = (key: string): string => {
  // Handle nested routes
  if (key.includes('.')) {
    const [parent, child] = key.split('.');
    const parentRoutes = ROUTES[parent as keyof typeof ROUTES] as any;
    return parentRoutes?.[child] || '/';
  }
  
  return (ROUTES[key as keyof typeof ROUTES] as string) || '/';
};
