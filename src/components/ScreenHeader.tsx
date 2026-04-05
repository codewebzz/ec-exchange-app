import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale } from 'react-native-size-matters';
import AppHeaderTitle from './AppHeaderTitle';
import { COLORS } from '../assets/colors';

const ScreenHeader: React.FC<any> = ({
  navigation,
  title,
  children,
  hideBackButton,
  customBackNavigation,
  showDrawerButton, // New prop to show drawer button
  onBackPress,
}) => {
  const renderLeftButton = () => {
    if (hideBackButton) {
      if (customBackNavigation) {
        return (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate(customBackNavigation)}>
            <Ionicons
              name="arrow-back-outline"
              size={moderateScale(24)}
              color="black"
            />
          </TouchableOpacity>
        );
      } else if (showDrawerButton) {
        return (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.openDrawer()}>
            <Ionicons
              name="menu-outline"
              size={moderateScale(24)}
              color="white"
            />
          </TouchableOpacity>
        );
      } else {
        return <View style={styles.placeholder} />;
      }
    } else {
      return (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (typeof onBackPress === 'function') {
              onBackPress();
            } else {
              navigation.goBack();
            }
          }}>
          <Ionicons
            name="arrow-back-outline"
            size={moderateScale(24)}
            color="white"
          />
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={[styles.header]}>
      <View style={styles.leftContainer}>
        {renderLeftButton()}
      </View>

      <View style={styles.centerContainer}>
        {typeof title === 'string' ? AppHeaderTitle(title) : title}
      </View>

      <View style={styles.rightContainer}>
        {children ? children : <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    backgroundColor: COLORS.BUTTONBG,
    paddingBottom: scale(5),
    paddingTop: Platform.OS === 'android' ? scale(10) : 0,
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontWeight: '500',
    fontSize: moderateScale(16),
    color: '#000',
    flex: 2,
    textAlign: 'center',
  },
  backButton: {
    padding: moderateScale(4),
  },
  placeholder: {
    width: moderateScale(32),
    height: moderateScale(32),
  },
});