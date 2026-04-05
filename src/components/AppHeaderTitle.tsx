import { Text, View } from 'react-native';
import React from 'react';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../assets/colors';

const AppHeaderTitle = (screenName: string): React.ReactNode => {
  return (
    <View>
      <Text
        numberOfLines={1}
        style={{
          fontSize: scale(16),
          color: COLORS.WHITE,
          marginBottom: scale(2),
          textAlign: 'center',
        }}>
        {screenName}
      </Text>
    </View>
  );
};

export default AppHeaderTitle;
