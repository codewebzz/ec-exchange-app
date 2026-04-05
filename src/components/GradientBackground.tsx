import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../assets/colors';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  colors?: string[];
  locations?: number[];
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, colors, locations }) => {
  return (
    <View style={styles.container} >
      <LinearGradient
        colors={Array.isArray(colors) && colors.length >= 2 ? colors : ["#fdf0d0","#e0efea"]}
        locations={Array.isArray(locations) && locations.length === 2 ? locations:[0,40]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default GradientBackground;


