import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomDrawer from '../components/CustomDrawer';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import Shift from '../screens/dashboard/masters/Shift';
import Staff from '../screens/dashboard/masters/Staff';
import Agent from '../screens/dashboard/masters/Agent';
import Company from '../screens/dashboard/organization/Company';
import JournalVoucher from '../screens/dashboard/voucher/JournalVoucher';
import LimitVoucher from '../screens/dashboard/voucher/LimitVoucher';
import VapsiVoucher from '../screens/dashboard/voucher/VapsiVoucher';
import Daily from '../screens/dashboard/reports/Daily';
import AllShift from '../screens/dashboard/reports/AllShift';
import Settling from '../screens/dashboard/reports/Settling';
import TPC from '../screens/dashboard/reports/TPC';
import ProfitLoss from '../screens/dashboard/reports/ProfitLoss';
import LimitBalance from '../screens/dashboard/reports/LimitBalance';
import Ledger from '../screens/dashboard/masters/Ledger';
import ResultHistory from '../screens/dashboard/reports/ResultHistory';
import { Transaction } from '../screens/dashboard/Transaction/Transaction';
import AddTransaction from '../screens/dashboard/Transaction/AddTransaction';
import JantriScreen from '../screens/dashboard/Transaction/addTransaction/JantriScreen';
import DeclareTransaction from '../screens/dashboard/Transaction/DeclareTransaction';
import JantariResult from '../screens/dashboard/result/JantariResult';
import CollectionResult from '../screens/dashboard/result/CollectionResult';
import LivePredaction from '../screens/dashboard/result/LivePredaction';
import RolePermissions from '../screens/dashboard/organization/RolePermissions';

const Drawer = createDrawerNavigator();
const TransactionStack = createNativeStackNavigator();

// Transaction Stack Navigator
function TransactionStackNavigator() {
  return (
    <TransactionStack.Navigator screenOptions={{ headerShown: false, popToTopOnBlur: true }}>
      <TransactionStack.Screen name="TransactionMain" component={Transaction} />
      <TransactionStack.Screen name="AddTransaction" component={AddTransaction} />
      <TransactionStack.Screen name="DeclareTransaction" component={DeclareTransaction} />
      <TransactionStack.Screen name="JantriScreen" component={JantriScreen} />
    </TransactionStack.Navigator>
  );
}

const withFreshKey = (Component: React.ComponentType<any>) => {
  return function FreshKeyWrapper(props: any) {
    const key = props.route?.params?._key ?? 'init';
    return <Component key={key} {...props} />;
  };
};

// IMPORTANT: wrap once at module level. Calling withFreshKey() inside render creates a
// new component type on every render, which remounts every screen and causes an infinite
// update loop ("Maximum update depth exceeded") in release builds.
const FreshDashboard = withFreshKey(DashboardScreen);
const FreshShift = withFreshKey(Shift);
const FreshStaff = withFreshKey(Staff);
const FreshAgent = withFreshKey(Agent);
const FreshLedger = withFreshKey(Ledger);
const FreshCompany = withFreshKey(Company);
const FreshJournalVoucher = withFreshKey(JournalVoucher);
const FreshLimitVoucher = withFreshKey(LimitVoucher);
const FreshVapsiVoucher = withFreshKey(VapsiVoucher);
const FreshDaily = withFreshKey(Daily);
const FreshAllShift = withFreshKey(AllShift);
const FreshSettling = withFreshKey(Settling);
const FreshTPC = withFreshKey(TPC);
const FreshProfitLoss = withFreshKey(ProfitLoss);
const FreshLimitBalance = withFreshKey(LimitBalance);
const FreshResultHistory = withFreshKey(ResultHistory);
const FreshTransactionStack = withFreshKey(TransactionStackNavigator);
const FreshDeclareTransaction = withFreshKey(DeclareTransaction);
const FreshAddTransaction = withFreshKey(AddTransaction);
const FreshJantariResult = withFreshKey(JantariResult);
const FreshCollectionResult = withFreshKey(CollectionResult);
const FreshLivePredaction = withFreshKey(LivePredaction);
const FreshRolePermissions = withFreshKey(RolePermissions);

const renderCustomDrawer = (props: any) => <CustomDrawer {...props} />;

export default function DrawerStack() {
  return (
    <Drawer.Navigator
      drawerContent={renderCustomDrawer}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Dashboard" component={FreshDashboard} />
      <Drawer.Screen name="Shift" component={FreshShift} />
      <Drawer.Screen name="Staff" component={FreshStaff} />
      <Drawer.Screen name="Agent" component={FreshAgent} />
      <Drawer.Screen name="Ledger" component={FreshLedger} />
      <Drawer.Screen name="Company" component={FreshCompany} />
      <Drawer.Screen name="JournalVoucher" component={FreshJournalVoucher} />
      <Drawer.Screen name="LimitVoucher" component={FreshLimitVoucher} />
      <Drawer.Screen name="VapsiVoucher" component={FreshVapsiVoucher} />
      <Drawer.Screen name="Daily" component={FreshDaily} />
      <Drawer.Screen name="AllShift" component={FreshAllShift} />
      <Drawer.Screen name="Settling" component={FreshSettling} />
      <Drawer.Screen name="TPC" component={FreshTPC} />
      <Drawer.Screen name="ProfitLoss" component={FreshProfitLoss} />
      <Drawer.Screen name="LimitBalance" component={FreshLimitBalance} />
      <Drawer.Screen name="ResultHistory" component={FreshResultHistory} />
      <Drawer.Screen name="Transaction" component={FreshTransactionStack} />
      <Drawer.Screen name="DeclareTransaction" component={FreshDeclareTransaction} />
      <Drawer.Screen name="AddTransaction" component={FreshAddTransaction} />
      <Drawer.Screen name="JantariResult" component={FreshJantariResult} />
      <Drawer.Screen name="CollectionResult" component={FreshCollectionResult} />
      <Drawer.Screen name="LivePredaction" component={FreshLivePredaction} />
      <Drawer.Screen name="RolePermissions" component={FreshRolePermissions} />
    </Drawer.Navigator>
  );
}
