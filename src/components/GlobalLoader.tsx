import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS } from '../assets/colors';

const { width, height } = Dimensions.get('window');

interface GlobalLoaderProps {
  visible: boolean;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  indicatorColor?: string;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  visible,
  text = 'Loading...',
  backgroundColor = 'rgba(0, 0, 0, 0.5)',
  textColor = COLORS.WHITE,
  indicatorColor = COLORS.WHITE,
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor }]}>
        <View style={styles.container}>
          <ActivityIndicator
            size="large"
            color={indicatorColor}
            style={styles.indicator}
          />
          <Text style={[styles.text, { color: textColor }]}>
            {text}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width,
    height,
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    minWidth: 120,
  },
  indicator: {
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default GlobalLoader;
