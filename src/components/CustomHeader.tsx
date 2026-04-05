// components/CustomHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  title: string;
  onMenuPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
}

const CustomHeader = ({ title, onMenuPress, rightIcon, onRightPress }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>

    <View style={styles.header}>
      {/* Left Menu Icon */}
      <TouchableOpacity onPress={onMenuPress}>
        <Icon name="menu" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Center Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Right Icon (optional) */}
      <TouchableOpacity onPress={onRightPress}>
        {rightIcon ? <Icon name={rightIcon} size={24} color="#fff" /> : <View style={{ width: 24 }} />}
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
     safeArea: {
    backgroundColor: '#16233A',
    // paddingTop:scale(40)
  },
  header: {
    backgroundColor: '#16233A',
    height: scale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
  },
  title: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: '600',
  },
});

export default CustomHeader;
