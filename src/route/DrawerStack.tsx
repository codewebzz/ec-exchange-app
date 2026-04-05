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
    <TransactionStack.Navigator screenOptions={{ headerShown: false }}>
      <TransactionStack.Screen name="TransactionMain" component={Transaction} />
      <TransactionStack.Screen name="AddTransaction" component={AddTransaction} />
      <TransactionStack.Screen name="DeclareTransaction" component={DeclareTransaction} />
      <TransactionStack.Screen name="JantriScreen" component={JantriScreen} />
    </TransactionStack.Navigator>
  );
}

export default function DrawerStack() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Shift" component={Shift}/>
      <Drawer.Screen name="Staff" component={Staff}/>
      <Drawer.Screen name="Agent" component={Agent}/>
      <Drawer.Screen name="Ledger" component={Ledger}/>
      <Drawer.Screen name="Company" component={Company}/>
      <Drawer.Screen name="JournalVoucher" component={JournalVoucher}/>
      <Drawer.Screen name="LimitVoucher" component={LimitVoucher}/>
      <Drawer.Screen name="VapsiVoucher" component={VapsiVoucher}/>
      <Drawer.Screen name="Daily" component={Daily}/>
      <Drawer.Screen name="AllShift" component={AllShift}/>
      <Drawer.Screen name="Settling" component={Settling}/>
      <Drawer.Screen name="TPC" component={TPC}/>
      <Drawer.Screen name="ProfitLoss" component={ProfitLoss}/>
      <Drawer.Screen name="LimitBalance" component={LimitBalance}/>
      <Drawer.Screen name="Transaction" component={TransactionStackNavigator}/>
      <Drawer.Screen name="DeclareTransaction" component={DeclareTransaction}/>
      <TransactionStack.Screen name="AddTransaction" component={AddTransaction} />
      <Drawer.Screen name="JantariResult" component={JantariResult}/>
      <Drawer.Screen name="CollectionResult" component={CollectionResult}/>
      <Drawer.Screen name="LivePredaction" component={LivePredaction}/>
      <Drawer.Screen name="RolePermissions" component={RolePermissions}/>
    </Drawer.Navigator>
  );
}
