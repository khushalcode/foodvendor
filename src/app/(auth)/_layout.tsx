import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Colors } from '@/constants/colors';

export default function AuthLayout() {
  const { session, loading } = useAuth();
  if (loading) return <CustomLoader overlay />;
  if (session) return <Redirect href="/(root)/home" />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="new-password" />
    </Stack>
  );
}
