import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinkProvider } from './src/contexts/LinkContext';
import { SettingsProvider, useSettings } from './src/contexts/SettingsContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddEditLinkScreen } from './src/screens/AddEditLinkScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TutorialScreen } from './src/screens/TutorialScreen';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ─── 导航器（依赖 settings 和 theme） ────────────────────────────────────────

function AppNavigator() {
  const { settings, loading } = useSettings();
  const { resolvedTheme } = useTheme();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // 处理 deep link：quicklink://open/{linkId}
  // 桌面快捷方式点击后触发，导航到 Home 并传递 linkId 供打开链接
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      const match = url.match(/^quicklink:\/\/open\/(.+)$/);
      if (match) {
        const linkId = match[1];
        navigationRef.current?.navigate('Home', { openLinkId: linkId } as any);
      }
    };

    // 处理 App 已在前台时收到的 deep link
    const subscription = Linking.addEventListener('url', handleUrl);

    // 处理 App 从 deep link 冷启动的情况
    Linking.getInitialURL().then(url => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, []);

  if (loading) return null;

  const handleNavigatorReady = () => {
    if (!settings.tutorialCompleted) {
      navigationRef.current?.navigate('Tutorial' as any);
    }
  };

  return (
    <NavigationContainer ref={navigationRef} onReady={handleNavigatorReady}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddEditLink" component={AddEditLinkScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Tutorial" component={TutorialScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── 主题桥接（将 SettingsContext 的 themeMode 传给 ThemeProvider） ──────────

function ThemedApp() {
  const { settings, setThemeMode } = useSettings();
  return (
    <ThemeProvider
      initialMode={settings.themeMode}
      onModeChange={setThemeMode}
    >
      <LinkProvider>
        <AppNavigator />
      </LinkProvider>
    </ThemeProvider>
  );
}

// ─── 根组件 ───────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SettingsProvider>
          <ThemedApp />
        </SettingsProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
