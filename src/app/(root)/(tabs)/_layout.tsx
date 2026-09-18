import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Layout, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: FontSize.extraSmall, fontWeight: FontWeight.semiBold as any },
        tabBarStyle: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0, height: 0, borderTopWidth: 0 },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? Images.homeSelect : Images.homeUnselect}
              style={{ width: 24, height: 24, tintColor: focused ? Colors.primary : Colors.textMuted }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? Images.orderSelect : Images.orderUnselect}
              style={{ width: 24, height: 24, tintColor: focused ? Colors.primary : Colors.textMuted }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Store',
          tabBarIcon: () => null,
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? Images.walletSelect : Images.walletUnselect}
              style={{ width: 24, height: 24, tintColor: focused ? Colors.primary : Colors.textMuted }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? Images.shopIcon : Images.menu}
              style={{ width: 24, height: 24, tintColor: focused ? Colors.primary : Colors.textMuted }}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        left: Spacing.default,
        right: Spacing.default,
        bottom: insets.bottom + Spacing.small,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: Radius.extraLarge,
        paddingBottom: 8,
        paddingTop: 6,
        height: Layout.bottomTabHeight,
        shadowColor: Colors.shadowStrong,
        shadowOpacity: 0.28,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 10 },
        elevation: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.7)',
      }}
    >
      {state.routes.map((route: any, idx: number) => {
        const isCenter = route.name === 'store';
        const isFocused = state.index === idx;
        const options = descriptors[route.key].options;

        if (isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 }}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.85}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -36,
                  backgroundColor: Colors.primary,
                  shadowColor: Colors.primary,
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 10,
                  borderWidth: 4,
                  borderColor: '#FFFFFF',
                }}
              >
                <Image source={Images.shopIcon} style={{ width: 28, height: 28, tintColor: '#FFFFFF' }} />
              </View>
              <Text style={{ fontSize: FontSize.extraSmall, color: Colors.primary, fontWeight: FontWeight.bold as any, marginTop: 2 }}>
                {options.title ?? 'Store'}
              </Text>
            </TouchableOpacity>
          );
        }

        const icon = options.tabBarIcon ? options.tabBarIcon({ focused: isFocused }) : null;
        return (
          <TouchableOpacity
            key={route.key}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            {isFocused ? (
              <View
                style={{
                  position: 'absolute',
                  top: -3,
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.primary,
                }}
              />
            ) : null}
            {icon}
            <Text
              style={{
                fontSize: FontSize.extraSmall,
                color: isFocused ? Colors.primary : Colors.textMuted,
                fontWeight: isFocused ? (FontWeight.bold as any) : (FontWeight.semiBold as any),
                letterSpacing: 0.2,
              }}
            >
              {options.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
