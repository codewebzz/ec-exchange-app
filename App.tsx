import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootStack from './src/route/RootStack';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/assets/colors';
import Toast from 'react-native-toast-message';
import toastConfig from './src/helper/toastConfig';
import SplashScreen from './src/components/SplashScreen';
import UpdateRequiredScreen from './src/components/UpdateRequiredScreen';
import { GlobalLoaderProvider } from './src/context/GlobalLoaderContext';
import GradientBackground from './src/components/GradientBackground';
import { SocketProvider } from './src/context/SocketContext';
import APIService from './src/screens/services/APIService';
import { APP_CONFIG } from './src/config/appConfig';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [versionCheckPassed, setVersionCheckPassed] = useState<boolean | null>(null);
  const [latestVersion, setLatestVersion] = useState<string>('');

  const checkAppVersion = async () => {
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const version = APP_CONFIG.version;
      const res = await APIService.CheckAppVersion(platform, version);
      if (res && typeof res.is_latest === 'boolean') {
        setLatestVersion(res.latest_version || '');
        if (res.is_latest) {
          setVersionCheckPassed(true);
        } else {
          setVersionCheckPassed(false);
        }
      } else {
        // In case of unexpected format, don't block user
        setVersionCheckPassed(true);
      }
    } catch (error) {
      console.warn('Version check error, allowing app to load:', error);
      // If network fails during initial check, let app proceed so user isn't stuck offline
      setVersionCheckPassed(true);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Run version check immediately on app startup
  React.useEffect(() => {
    checkAppVersion();
  }, []);

  // Show splash animation while initializing
  if (showSplash || versionCheckPassed === null) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  // If app is not the latest version, show the friendly update required screen
  if (versionCheckPassed === false) {
    return (
      <UpdateRequiredScreen
        clientVersion={APP_CONFIG.version}
        latestVersion={latestVersion}
        onRetry={checkAppVersion}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <NavigationContainer>
          <Provider store={store}>
            <SocketProvider>
              <GlobalLoaderProvider>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.HEADERBG} />
                <GradientBackground colors={["#fdf0d0", "#e0efea"]} locations={[0, 30]}>
                  <RootStack />
                </GradientBackground>
                <Toast config={toastConfig} />
              </GlobalLoaderProvider>
            </SocketProvider>
          </Provider>
        </NavigationContainer>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

export default App;


