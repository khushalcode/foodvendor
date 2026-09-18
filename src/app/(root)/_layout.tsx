import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Colors } from '@/constants/colors';

export default function RootLayout() {
  const { session, loading } = useAuth();
  if (loading) return <CustomLoader overlay />;
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
