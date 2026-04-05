import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const ecAnim = useRef(new Animated.Value(-100)).current;
  const exchangeAnim = useRef(new Animated.Value(100)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    const startAnimations = () => {
      // EC animation - from top to center
      Animated.timing(ecAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Exchange animation - from bottom to center
      Animated.timing(exchangeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Loading line animation
      Animated.sequence([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(loadingAnim, {
              toValue: width - 100,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(loadingAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    };

    // Start animations after a small delay
    const timer = setTimeout(startAnimations, 200);

    // Complete splash screen after 3 seconds
    const completeTimer = setTimeout(() => {
      onAnimationComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [ecAnim, exchangeAnim, loadingAnim, loadingOpacity, onAnimationComplete]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      
      {/* EC Text */}
      <Animated.Text
        style={[
          styles.ecText,
          {
            transform: [{ translateY: ecAnim }],
          },
        ]}
      >
        EC
      </Animated.Text>

      {/* Exchange Text */}
      <Animated.Text
        style={[
          styles.exchangeText,
          {
            transform: [{ translateY: exchangeAnim }],
          },
        ]}
      >
        EXCHANGE
      </Animated.Text>

      {/* Loading Line */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: loadingOpacity,
          },
        ]}
      >
        <View style={styles.loadingBackground}>
          <Animated.View
            style={[
              styles.loadingLine,
              {
                transform: [{ translateX: loadingAnim }],
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ecText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  exchangeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 50,
  },
  loadingContainer: {
    width: width - 100,
    height: 4,
    justifyContent: 'center',
  },
  loadingBackground: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  loadingLine: {
    width: 50,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
});

export default SplashScreen; 