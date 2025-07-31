import { ReactNode } from "react";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, RobotoMono_400Regular, RobotoMono_700Bold } from "@expo-google-fonts/roboto-mono";
import { Text as RNText } from "react-native";

// If you want, you can type your AuthContext more specifically,
// but here's the recommended minimal typing for the layout:

function InitialLayout(): JSX.Element {
  const { user, isLoading } = useAuth();
  const segments: string[] = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const onWelcomeOrAuth = segments.length === 0 || inAuthGroup;

    if (user && onWelcomeOrAuth) {
      router.replace("/(tabs)/home");
    } else if (!user && !onWelcomeOrAuth) {
      router.replace("/");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="post/[slug]" />
    </Stack>
  );
}

export default function RootLayout(): JSX.Element {
  const [fontsLoaded] = useFonts({
    RobotoMono_400Regular,
    RobotoMono_700Bold,
  });

  // Type-safe for React Native Text
  if (fontsLoaded) {
    (RNText as any).defaultProps = (RNText as any).defaultProps || {};
    (RNText as any).defaultProps.style = [
      { fontFamily: "RobotoMono_400Regular" },
      (RNText as any).defaultProps.style,
    ];
  }

  if (!fontsLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <InitialLayout />
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
