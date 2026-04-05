// In App.js in a new project

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { COLORS } from '../assets/colors';
import Login from '../screens/auth/Login';
import DrawerStack from './DrawerStack';



const Stack = createNativeStackNavigator();

const RootStack = () => {
  const token = useSelector((state: any) => state?.authorization?.token);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarBackgroundColor: COLORS.BUTTONBG,
      }}
    >
      {token ? (
        // When authenticated, only show the app stack
        <Stack.Screen name="DrawerStack" component={DrawerStack} />
      ) : (
        // When not authenticated, only show the login screen
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

export default RootStack