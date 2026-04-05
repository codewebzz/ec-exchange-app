import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import { useCountdown } from '../../../../hooks/useCountdown';
import { COLORS } from '../../../../assets/colors';

const CountdownHeaderTitle = ({ timeLimit }: { timeLimit: string }) => {
  const countdown = useCountdown(timeLimit);
  
  return (
    <View>
      <Text
        numberOfLines={1}
        style={styles.countdownText}>
        {countdown || '00:00:00'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  countdownText: {
    fontSize: scale(16),
    color: COLORS.WHITE,
    marginBottom: scale(2),
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CountdownHeaderTitle;
