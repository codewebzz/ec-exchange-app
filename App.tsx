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

      if (!res || res?.error || res?.success === false) {
        const errorMsg = res?.error || res?.message || 'Unable to verify app version';
        Toast.show({
          type: 'error',
          text1: 'Version Check Failed',
          text2: errorMsg,
          position: 'bottom',
        });
        if (versionCheckPassed === null) {
          setVersionCheckPassed(true);
        }
        return;
      }

      const needsUpdate = res?.needs_update ?? (res?.is_latest === false);

      if (needsUpdate) {
        setLatestVersion(res?.latest_version != null ? String(res.latest_version) : '');
        setVersionCheckPassed(false);
      } else {
        setVersionCheckPassed(true);
      }
    } catch (error: any) {
      console.warn('Version check error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to check app version';

      Toast.show({
        type: 'error',
        text1: 'Version Check Failed',
        text2: errorMessage,
        position: 'bottom',
      });

      // If initial check fails, allow app to proceed so user isn't stuck offline
      if (versionCheckPassed === null) {
        setVersionCheckPassed(true);
      }
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Run version check immediately on app startup
  React.useEffect(() => {
    checkAppVersion();
  }, []);

  return (
    <SafeAreaProvider>
      {showSplash || versionCheckPassed === null ? (
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      ) : versionCheckPassed === false ? (
        <UpdateRequiredScreen
          clientVersion={APP_CONFIG.version}
          latestVersion={latestVersion}
          downloadUrl={APP_CONFIG.downloadApkUrl}
          onRetry={checkAppVersion}
        />
      ) : (
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
                </GlobalLoaderProvider>
              </SocketProvider>
            </Provider>
          </NavigationContainer>
        </KeyboardAvoidingView>
      )}
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
};

export default App;


