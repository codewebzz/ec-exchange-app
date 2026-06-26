import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../assets/colors';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../redux/reducers/authToken';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../helper/permissions';

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
  const { hasPermission } = usePermissions();

  const allSections = [
    {
      title: 'Dashboard',
      icon: 'view-dashboard-outline',
      route: 'Dashboard',
    },
    {
      title: 'Organization',
      icon: 'office-building-outline',
      items: [
        {
          label: 'Company',
          route: 'Company',
          permission: PERMISSIONS.ORGANIZATION_COMPANY_VIEW.value,
        },
        {
          label: 'Role & Permissions',
          route: 'RolePermissions',
          permission: PERMISSIONS.ORGANIZATION_PERMISSIONS_VIEW.value,
        },
      ],
    },
    {
      title: 'Master',
      icon: 'database-outline',
      items: [
        { label: 'Shift', route: 'Shift', permission: PERMISSIONS.MASTER_SHIFT_VIEW.value },
        { label: 'Ledger', route: 'Ledger', permission: PERMISSIONS.MASTER_LEDGER_VIEW.value },
        { label: 'Staff', route: 'Staff', permission: PERMISSIONS.MASTER_STAFF_VIEW.value },
        { label: 'Agent', route: 'Agent', permission: PERMISSIONS.MASTER_AGENTS_VIEW.value },
      ],
    },
    {
      title: 'Transactions',
      icon: 'cash-multiple',
      items: [
        {
          label: 'Transaction',
          route: 'Transaction',
          permission: PERMISSIONS.TRANSACTIONS_TRANSACTION_VIEW.value,
        },
        {
          label: 'Declare Transaction',
          route: 'DeclareTransaction',
          permission: PERMISSIONS.TRANSACTIONS_DECLARE_VIEW.value,
        },
      ],
    },
    {
      title: 'Voucher',
      icon: 'file-document-outline',
      items: [
        {
          label: 'Journal Voucher',
          route: 'JournalVoucher',
          permission: PERMISSIONS.VOUCHER_JOURNAL_VIEW.value,
        },
        {
          label: 'Limit Voucher',
          route: 'LimitVoucher',
          permission: PERMISSIONS.VOUCHER_LIMIT_VIEW.value,
        },
        {
          label: 'Vapsi Voucher',
          route: 'VapsiVoucher',
          permission: PERMISSIONS.VOUCHER_VAPSI_VIEW.value,
        },
      ],
    },
    {
      title: 'Result',
      icon: 'clipboard-text-outline',
      items: [
        {
          label: 'Jantri',
          route: 'JantariResult',
          permission: PERMISSIONS.RESULT_JANTRI_VIEW.value,
        },
        {
          label: 'Collection',
          route: 'CollectionResult',
          permission: PERMISSIONS.RESULT_COLLECTION_VIEW.value,
        },
        {
          label: 'Live Prediction',
          route: 'LivePredaction',
          permission: PERMISSIONS.RESULT_LIVE_PREDICTION_VIEW.value,
        },
      ],
    },
    {
      title: 'Reports',
      icon: 'chart-bar',
      items: [
        {
          label: 'Daily',
          route: 'Daily',
          permission: PERMISSIONS.REPORTS_DAILY_VIEW.value,
        },
        {
          label: 'AllShift',
          route: 'AllShift',
          permission: PERMISSIONS.REPORTS_SHIFT_VIEW.value,
        },
        {
          label: 'Settling',
          route: 'Settling',
          permission: PERMISSIONS.REPORTS_SETTLING_VIEW.value,
        },
        {
          label: 'TPC',
          route: 'TPC',
          permission: PERMISSIONS.REPORTS_TPC_VIEW.value,
        },
        {
          label: 'Profit Loss',
          route: 'ProfitLoss',
          permission: PERMISSIONS.REPORTS_PROFIT_LOSS_VIEW.value,
        },
        {
          label: 'LimitBalance',
          route: 'LimitBalance',
          permission: PERMISSIONS.REPORTS_LIMIT_BALANCE_VIEW.value,
        },
        // Result History has no permission guard — always visible
        { label: 'Result History', route: 'ResultHistory' },
      ],
    },
  ];

  // Filter sections: remove items the user lacks permission for,
  // then remove group sections where ALL items are filtered out.
  const sections = allSections
    .map(section => {
      if (!section.items) {
        // Top-level route (e.g. Dashboard) — always show
        return section;
      }
      const visibleItems = section.items.filter(
        (item: any) => !item.permission || hasPermission(item.permission)
      );
      return { ...section, items: visibleItems };
    })
    .filter(section => {
      // Keep sections that are either top-level routes OR have at least one visible item
      if (!section.items) return true;
      return section.items.length > 0;
    });

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