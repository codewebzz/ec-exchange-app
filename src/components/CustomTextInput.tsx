import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../assets/colors';
import { scale } from 'react-native-size-matters';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  wrapperStyle?: ViewStyle;
}

const CustomTextInput: React.FC<CustomInputProps> = ({
  label,
  error,
  wrapperStyle,
  ...rest
}) => {
  const { placeholderTextColor = '#999', ...restProps } = rest;
  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={placeholderTextColor}
        {...restProps}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: scale(5),
    elevation: 10,
  },
  label: {
    marginBottom: 4,
    fontSize: scale(12),
    color: '#333',
    fontWeight:"800"
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor:COLORS.WHITE,
    borderColor: COLORS.WHITE,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomTextInput;
