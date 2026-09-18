import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { CustomLoader } from '@/components/ui/custom-loader';

export default function IndexScreen() {
  const { session, loading } = useAuth();
  if (loading) return <CustomLoader overlay />;
  if (session) return <Redirect href="/(root)/(tabs)/home" />;
  return <Redirect href="/(auth)/sign-in" />;
}
