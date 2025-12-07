import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, LogBox, View } from 'react-native';
import { ROUTES } from '../src/constants/routes';
import { COLORS } from '../src/constants/theme';
import { UserProvider, useUser } from '../src/context/UserContext';

// Ignore specific logs
LogBox.ignoreLogs([
  'AuthApiError: Invalid Refresh Token: Refresh Token Not Found',
]);

SplashScreen.preventAutoHideAsync();

/**
 * Route Guard Component - Handles authentication-based routing
 */
function RouteGuard({ children }: { children: React.ReactNode }) {
  const { session } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (isNavigating) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const isAuthRoute = segments[0] === 'login' || segments[0] === 'signup-email' || segments[0] === 'signup-wizard';

    if (!session && inAuthGroup) {
      // User is not authenticated but trying to access protected routes
      setIsNavigating(true);
      router.replace(ROUTES.LOGIN);
      setTimeout(() => setIsNavigating(false), 100);
    } else if (session && (segments[0] === undefined || segments[0] === 'login')) {
      // User is authenticated but on auth pages, redirect to tabs
      setIsNavigating(true);
      router.replace(ROUTES.TABS.ROOT);
      setTimeout(() => setIsNavigating(false), 100);
    }
  }, [session, segments]);

  return <>{children}</>;
}

export default function Layout() {
  const [loaded, error] = useFonts({
    "UberMove-Bold": require("../assets/fonts/UberMove-Bold.ttf"),
    "UberMove-Regular": require("../assets/fonts/UberMove-Regular.ttf"),
    "UberMoveText-Medium": require("../assets/fonts/UberMoveText-Medium.ttf"),
    "UberMoveText-Regular": require("../assets/fonts/UberMoveText-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <UserProvider>
      <RouteGuard>
        <Slot />
      </RouteGuard>
    </UserProvider>
  );
}
