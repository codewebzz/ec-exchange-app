// In App.js in a new project

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../assets/colors';
import Login from '../screens/auth/Login';
import DrawerStack from './DrawerStack';
import { fetchUserPermissions, clearPermissions } from '../redux/reducers/permissionsSlice';
import { fetchShiftPermissions, clearShiftPermissions } from '../redux/reducers/shiftPermissionsSlice';
import { fetchUserDetails, clearUserDetails } from '../redux/reducers/userSlice';

const Stack = createNativeStackNavigator();

const RootStack = () => {
  const token = useSelector((state: any) => state?.authorization?.token);
  const dispatch = useDispatch();

  // Fetch permissions and user details sequentially with a settling buffer when a token is present
  React.useEffect(() => {
    let isMounted = true;

    if (!token) {
      // Clear stale state on logout
      dispatch(clearPermissions());
      dispatch(clearShiftPermissions());
      dispatch(clearUserDetails());
      return;
    }

    const loadStartupData = async () => {
      // Settle buffer (1000ms) after login so backend session registers and token is fully active
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
      if (!isMounted) return;

      try {
        // Step 1: User details first
        await dispatch(fetchUserDetails() as any).unwrap();
      } catch (err) {
        console.error('❌ [Startup] fetchUserDetails error:', err);
      }

      if (!isMounted) return;
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
      if (!isMounted) return;

      try {
        // Step 2: User permissions
        await dispatch(fetchUserPermissions() as any).unwrap();
      } catch (err) {
        console.error('❌ [Startup] fetchUserPermissions error:', err);
      }

      if (!isMounted) return;
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
      if (!isMounted) return;

      try {
        // Step 3: Shift permissions
        await dispatch(fetchShiftPermissions() as any).unwrap();
      } catch (err) {
        console.error('❌ [Startup] fetchShiftPermissions error:', err);
      }
    };

    loadStartupData();

    return () => {
      isMounted = false;
    };
  }, [token, dispatch]);

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