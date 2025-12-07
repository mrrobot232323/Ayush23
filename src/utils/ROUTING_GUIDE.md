# Routing Guide

This project uses a centralized routing system to simplify navigation throughout the app.

## Quick Start

### Using the Navigation Hook

Instead of using `useRouter()` from expo-router directly, use the `useNavigation()` hook:

```tsx
import { useNavigation } from '../src/utils/navigation';
import { ROUTES } from '../src/constants/routes';

function MyComponent() {
  const nav = useNavigation();
  
  // Navigate to a route
  nav.navigate(ROUTES.LOGIN);
  
  // Navigate with params
  nav.navigate(ROUTES.CHAT_ROOM, { chatId: '123' });
  
  // Replace current route
  nav.replace(ROUTES.TABS.ROOT);
  
  // Go back
  nav.goBack();
  
  // Use helper methods
  nav.toLogin();
  nav.toProfile();
  nav.toEditProfile();
  nav.toChatRoom('chat-id');
}
```

## Available Routes

All routes are defined in `src/constants/routes.ts`. Use the `ROUTES` constant to access routes:

```tsx
ROUTES.LANDING           // '/'
ROUTES.LOGIN             // '/login'
ROUTES.SIGNUP_EMAIL      // '/signup-email'
ROUTES.TABS.ROOT         // '/(tabs)'
ROUTES.TABS.DISCOVER     // '/(tabs)'
ROUTES.TABS.PROFILE      // '/(tabs)/profile'
ROUTES.EDIT_PROFILE      // '/edit-profile'
ROUTES.CHAT_ROOM         // '/chat-room'
// ... and more
```

## Migration from Old Router

### Before:
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/login');
router.replace('/(tabs)');
router.back();
```

### After:
```tsx
import { useNavigation } from '../src/utils/navigation';
import { ROUTES } from '../src/constants/routes';

const nav = useNavigation();
nav.navigate(ROUTES.LOGIN);
nav.replace(ROUTES.TABS.ROOT);
nav.goBack();
```

## Benefits

1. **Type Safety**: All routes are defined in one place
2. **Easy Refactoring**: Change a route path in one place
3. **Better DX**: Helper methods for common navigation patterns
4. **Consistency**: All navigation uses the same pattern
5. **Route Protection**: Automatic auth-based routing in `_layout.tsx`

## Route Protection

The app automatically handles authentication-based routing:
- Unauthenticated users trying to access protected routes are redirected to login
- Authenticated users on auth pages are redirected to tabs

This is handled in `app/_layout.tsx` via the `RouteGuard` component.
