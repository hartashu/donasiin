import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// This component handles the redirection logic based on auth state
function InitialLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't run the redirect logic until the auth state is loaded.
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    // The root route is the welcome screen, which is not in any group.
    const onWelcomeOrAuth = segments.length === 0 || inAuthGroup;

    if (user && onWelcomeOrAuth) {
      // User is logged in but is on the welcome/auth screen. Redirect to the main app.
      router.replace('/(tabs)/home');
    } else if (!user && !onWelcomeOrAuth) {
      // User is not logged in and trying to access a protected route. Redirect to welcome.
      router.replace('/');
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Slot renders the current child route (welcome, auth, or tabs).
  return (
    <Slot />
  );
}

export default function RootLayout() {
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