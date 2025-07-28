import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="register"
        options={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
          headerTitle: '',
          headerBackTitle: 'Login',
          headerTintColor: Colors.text.primary,
        }}
      />
    </Stack>
  );
}