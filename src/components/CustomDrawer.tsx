import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../assets/colors';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../redux/reducers/authToken';

const DrawerSection = ({ title, icon, items, route, navigation }: any) => {
  const [expanded, setExpanded] = useState(false);

  const hasSubItems = Array.isArray(items) && items.length > 0;

  const handleHeaderPress = () => {
    if (hasSubItems) {
      setExpanded(!expanded);
    } else if (route) {
      navigation.navigate(route);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={handleHeaderPress}
      >
        <Icon name={icon} size={18} color="#999" />
        <Text style={styles.sectionTitle}>{title}</Text>
        {hasSubItems && (
          <Icon
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size={16}
            color="#999"
            style={styles.chevronIcon}
          />
        )}
      </TouchableOpacity>

      {hasSubItems && expanded && items.map((item: any, index: number) => (
        <TouchableOpacity
          key={index}
          style={styles.item}
          onPress={() => {
            if (typeof item.route === 'string') {
              navigation.navigate(item.route);
            } else if (typeof item.route === 'object' && item.route.name) {
              navigation.navigate(item.route.name, item.route.params);
            }
          }}
        >
          <Text style={styles.itemText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};



const CustomDrawer = (props: any) => {
  const dispatch = useDispatch();

  const sections = [
    {
      title: 'Dashboard',
      icon: 'view-dashboard-outline',
      route: 'Dashboard',
    },
    {
      title: 'Organization',
      icon: 'office-building-outline',
      items: [{ label: 'Company', route: 'Company' },{ label: 'Role & Permissions', route: 'RolePermissions' }],
    },
    {
      title: 'Master',
      icon: 'database-outline',
      items: [
        { label: 'Shift', route: 'Shift' },
        { label: 'Ledger', route: 'Ledger' },
        { label: 'Staff', route: 'Staff' },
        { label: 'Agent', route: 'Agent' },
      ],
    },
    {
      title: 'Transactions',
      icon: 'cash-multiple',
      items: [
        { label: 'Transaction', route: 'Transaction' },
        { label: 'Declare Transaction', route:  'DeclareTransaction'   },
      ],
    },
    {
      title: 'Voucher',
      icon: 'file-document-outline',
      items: [
        { label: 'Journal Voucher', route: 'JournalVoucher' },
        { label: 'Limit Voucher', route: 'LimitVoucher' },
        { label: 'Vapsi Voucher', route: 'VapsiVoucher' },
      ],
    },
    {
      title: 'Result',
      icon: 'clipboard-text-outline',
      items: [
        { label: 'Jantri', route: 'JantariResult' },
        { label: 'Collection', route: 'CollectionResult' },
        { label: 'Live Prediction', route: 'LivePredaction' },
      ],
    },
    {
      title: 'Reports',
      icon: 'chart-bar',
      items: [
        { label: 'Daily', route: 'Daily' },
        { label: 'AllShift', route: 'AllShift' },
        { label: 'Settling', route: 'Settling' },
        { label: 'TPC', route: 'TPC' },
        { label: 'Profit Loss', route: 'ProfitLoss' },
        { label: 'LimitBalance', route: 'LimitBalance' },
      ],
    },
    // Logout is handled separately with token clearing
  ];
  

  return (
    <DrawerContentScrollView 
      {...props}
      style={styles.drawerScrollView}
      contentContainerStyle={styles.drawerContent}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>EcExchange</Text>
      </View>
      <View style={styles.sectionsContainer}>
        {sections.map((section, index) => (
          <DrawerSection key={index} {...section} navigation={props.navigation} />
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.sectionHeader, { marginTop: 28 }]}
          onPress={() => {
            dispatch(clearAuth());
            // RootStack will react to token removal and show Login
            props.navigation.closeDrawer();
          }}
        >
          <Icon name="logout" size={18} color="#999" />
          <Text style={styles.sectionTitle}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerScrollView: {
    backgroundColor: COLORS.BUTTONBG,
    flex: 1,
  },
  drawerContent: {
    backgroundColor: COLORS.BUTTONBG,
    flexGrow: 1,
  },
  container: {
    backgroundColor: COLORS.BUTTONBG,
  },
  header: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(10),
    backgroundColor: COLORS.BUTTONBG,
    borderRadius: scale(10),
  },
  headerText: {
    fontSize: scale(30),
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  sectionsContainer: {
    paddingVertical: scale(30),
    backgroundColor: COLORS.BUTTONBG,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  sectionTitle: {
    fontSize: 14,
    marginLeft: 8,
    color: '#A9B5C6',
    fontWeight: '600',
    flex: 1,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  item: {
    paddingVertical: 6,
    paddingLeft: 28,
  },
  itemText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default CustomDrawer;