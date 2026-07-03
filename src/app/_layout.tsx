import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { UserProvider } from '../context/UserContext'; // <-- Import the provider

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Wrap the app with UserProvider */}
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </UserProvider>
    </ThemeProvider>
  );
}