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

const renderCustomDrawer = (props: any) => <CustomDrawer {...props} />;

export default function DrawerStack() {
  return (
    <Drawer.Navigator
      drawerContent={renderCustomDrawer}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Dashboard" component={withFreshKey(DashboardScreen)} />
      <Drawer.Screen name="Shift" component={withFreshKey(Shift)}/>
      <Drawer.Screen name="Staff" component={withFreshKey(Staff)}/>
      <Drawer.Screen name="Agent" component={withFreshKey(Agent)}/>
      <Drawer.Screen name="Ledger" component={withFreshKey(Ledger)}/>
      <Drawer.Screen name="Company" component={withFreshKey(Company)}/>
      <Drawer.Screen name="JournalVoucher" component={withFreshKey(JournalVoucher)}/>
      <Drawer.Screen name="LimitVoucher" component={withFreshKey(LimitVoucher)}/>
      <Drawer.Screen name="VapsiVoucher" component={withFreshKey(VapsiVoucher)}/>
      <Drawer.Screen name="Daily" component={withFreshKey(Daily)}/>
      <Drawer.Screen name="AllShift" component={withFreshKey(AllShift)}/>
      <Drawer.Screen name="Settling" component={withFreshKey(Settling)}/>
      <Drawer.Screen name="TPC" component={withFreshKey(TPC)}/>
      <Drawer.Screen name="ProfitLoss" component={withFreshKey(ProfitLoss)}/>
      <Drawer.Screen name="LimitBalance" component={withFreshKey(LimitBalance)}/>
      <Drawer.Screen name="ResultHistory" component={withFreshKey(ResultHistory)}/>
      <Drawer.Screen name="Transaction" component={withFreshKey(TransactionStackNavigator)}/>
      <Drawer.Screen name="DeclareTransaction" component={withFreshKey(DeclareTransaction)}/>
      <TransactionStack.Screen name="AddTransaction" component={withFreshKey(AddTransaction)} />
      <Drawer.Screen name="JantariResult" component={withFreshKey(JantariResult)}/>
      <Drawer.Screen name="CollectionResult" component={withFreshKey(CollectionResult)}/>
      <Drawer.Screen name="LivePredaction" component={withFreshKey(LivePredaction)}/>
      <Drawer.Screen name="RolePermissions" component={withFreshKey(RolePermissions)}/>
    </Drawer.Navigator>
  );
}
