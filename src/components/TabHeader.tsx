import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';

const { width } = Dimensions.get('window');

interface TabHeaderProps {
  tabs?: string[];
  onTabPress?: (index: number) => void;
  activeTab?: number;
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeTextStyle?: TextStyle;
  backgroundColor?: string;
  activeBackgroundColor?: string;
  borderRadius?: number;
  height?: number;
}

const TabHeader: React.FC<TabHeaderProps> = ({ 
  tabs = [], 
  onTabPress, 
  activeTab = 0,
  containerStyle = {},
  tabStyle = {},
  activeTabStyle = {},
  textStyle = {},
  activeTextStyle = {},
  backgroundColor = '#F5F5DC',
  activeBackgroundColor = '#FFFFFF',
  borderRadius = 15,
  height = 25,
}) => {
  const [selectedTab, setSelectedTab] = useState(activeTab);

  const handleTabPress = (index:any) => {
    setSelectedTab(index);
    if (onTabPress) {
      onTabPress(index);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor, borderRadius, height }, containerStyle]}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tab,
            {
              backgroundColor: selectedTab === index ? activeBackgroundColor : 'transparent',
              borderRadius: borderRadius - 5,
            },
            tabStyle,
            selectedTab === index && activeTabStyle,
          ]}
          onPress={() => handleTabPress(index)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: selectedTab === index ? '#333' : '#666',
                fontWeight: selectedTab === index ? '600' : '400',
              },
              textStyle,
              selectedTab === index && activeTextStyle,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 20,
    marginVertical: 20,
    alignSelf: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  tabText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TabHeader;