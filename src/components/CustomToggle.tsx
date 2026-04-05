import React from 'react';
import {View, Text, StyleSheet, Switch} from 'react-native';
import {scale} from 'react-native-size-matters';
import { COLORS } from '../assets/colors';

interface CustomToggleProps {
  label?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  style?: any;
  labelStyle?: any;
  infoText?: string;
  required?: boolean;
}

const CustomToggle: React.FC<CustomToggleProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
  style = {},
  labelStyle = {},
  required = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={{color: 'red'}}> *</Text>}
          </Text>
        </View>
      )}
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        thumbColor={COLORS.WHITE}
        trackColor={{false: '#ccc', true: COLORS.SUCCESSGREEN}}
        style={{
          transform: [{scaleX: 1}, {scaleY: 1}],
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    marginBottom: scale(5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#333',
    marginEnd: scale(10),
  },
  infoText: {
    fontSize: scale(11),
    color: COLORS.DEFAULTDARKGRAY,
    marginTop: 4,
  },
});

export default CustomToggle;
