import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { UserProvider } from '../src/context/UserContext';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    "UberMove-Bold": require("../assets/fonts/UberMove-Bold.ttf"),
    "UberMove-Regular": require("../assets/fonts/UberMove-Regular.ttf"),
    "UberMoveText-Medium": require("../assets/fonts/UberMoveText-Medium.ttf"),
    "UberMoveText-Regular": require("../assets/fonts/UberMoveText-Regular.ttf"),
  });

  useEffect(() => {
    // If we had fonts to load, check 'loaded'. Since we commented them out, we proceed.
    SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <UserProvider>
      <Slot />
    </UserProvider>
  );
}
