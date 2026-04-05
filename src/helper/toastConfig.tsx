import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale } from 'react-native-size-matters';
import { BaseToastProps } from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
  position?: 'top' | 'bottom' | 'center';
}

const toastConfig = {

  warn: ({ text1, text2, position = 'bottom' }: CustomToastProps) => (
    <View
      style={[
        styles.container,
        styles.warnContainer,
        position === 'top' && { alignSelf: 'center', marginTop: scale(50) },
        position === 'bottom' && { alignSelf: 'center', marginBottom: scale(30) },
      ]}
    >
      <View style={styles.textWrapper}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(5) }}>
          <Ionicons name="warning-outline" size={scale(18)} color={'#856404'} style={{ marginEnd: scale(5) }} />
          <Text style={styles.warnText}>{text1 || 'Warning'}</Text>
        </View>
        {text2 && <Text style={styles.subText}>{text2}</Text>}
      </View>
    </View>
  ),

  error: ({ text1, text2, position = 'bottom' }: CustomToastProps) => (
    <View
      style={[
        styles.container,
        styles.errorContainer,
        position === 'top' && { alignSelf: 'center', marginTop: scale(50) },
        position === 'bottom' && { alignSelf: 'center', marginBottom: scale(30) },
      ]}
    >
      <View style={styles.textWrapper}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(5) }}>
          <Ionicons name="alert-circle-outline" size={scale(18)} color={'#D92D20'} style={{ marginEnd: scale(5) }} />
          <Text style={styles.errorText}>{text1 || 'Error'}</Text>
        </View>
        {text2 && <Text style={styles.subText}>{text2}</Text>}
      </View>
    </View>
  ),

  success: ({ text1, text2, position = 'bottom' }: CustomToastProps) => (
    <View
      style={[
        styles.container,
        styles.successContainer,
        position === 'top' && { alignSelf: 'center', marginTop: scale(50) },
        position === 'bottom' && { alignSelf: 'center', marginBottom: scale(30) },
      ]}
    >
      <View style={styles.textWrapper}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(5) }}>
          <Ionicons name="checkmark-circle-outline" size={scale(18)} color={'#067647'} style={{ marginEnd: scale(5) }} />
          <Text style={styles.successText}>{text1 || 'Success'}</Text>
        </View>
        {text2 && <Text style={styles.subText}>{text2}</Text>}
      </View>
    </View>
  ),
};

export default toastConfig;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  warnContainer: {
    backgroundColor: '#f5ebd3',
    borderColor: '#856404',
    borderWidth: 1,
  },
  errorContainer: {
    backgroundColor: '#FEF3F2',
    borderColor: '#D92D20',
    borderWidth: 1,
  },
  successContainer: {
    backgroundColor: '#ECFDF3',
    borderColor: '#ABEFC6',
    borderWidth: 1,
  },
  warnText: {
    color: '#856404',
    fontSize: scale(14),
    fontWeight: '600',
  },
  errorText: {
    color: '#D92D20',
    fontSize: scale(14),
    fontWeight: '600',
  },
  successText: {
    color: '#067647',
    fontSize: 12,
    fontWeight: '600',
  },
  subText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '800'
  },
  optionText: {
    marginLeft: 12,
    color: '#007BFF',
    fontWeight: '600',
    fontSize: 12,
  },
});
