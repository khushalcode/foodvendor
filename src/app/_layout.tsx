import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/hooks/useAuth';
import { SnackbarProvider } from '@/components/ui/custom-snackbar';
import { initI18n } from '@/locale/i18n';
import { Colors } from '@/constants/colors';
import * as Font from 'expo-font';

SplashScreen.preventAutoHideAsync().catch(() => { /* ignore */ });

const Poppins = require('../../assets/font/Poppins-Regular.ttf');
const PoppinsMedium = require('../../assets/font/Poppins-Medium.ttf');
const PoppinsBold = require('../../assets/font/Poppins-Bold.ttf');
const Roboto = require('../../assets/font/Roboto-Regular.ttf');
const RobotoMedium = require('../../assets/font/Roboto-Medium.ttf');
const RobotoBold = require('../../assets/font/Roboto-Bold.ttf');

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          initI18n(),
          Font.loadAsync({
            Poppins,
            'Poppins-Medium': PoppinsMedium,
            'Poppins-Bold': PoppinsBold,
            Roboto,
            'Roboto-Medium': RobotoMedium,
            'Roboto-Bold': RobotoBold,
            RobotoMono: Roboto,
          }),
        ]);
      } finally {
        setReady(true);
        SplashScreen.hideAsync().catch(() => { /* ignore */ });
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SnackbarProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(root)" />
              <Stack.Screen name="index" />
            </Stack>
            <StatusBar style="auto" />
          </SnackbarProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
