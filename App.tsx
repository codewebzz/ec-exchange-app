import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootStack from './src/route/RootStack';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/assets/colors';
import Toast from 'react-native-toast-message';
import toastConfig from './src/helper/toastConfig';
import SplashScreen from './src/components/SplashScreen';
import { GlobalLoaderProvider } from './src/context/GlobalLoaderContext';
import GradientBackground from './src/components/GradientBackground';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Provider store={store}>
          <GlobalLoaderProvider>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.HEADERBG} />
            <GradientBackground colors={[ "#fdf0d0","#e0efea"]} locations={[0,30]}>
              <RootStack />
            </GradientBackground>
            <Toast config={toastConfig} />
          </GlobalLoaderProvider>
        </Provider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;


