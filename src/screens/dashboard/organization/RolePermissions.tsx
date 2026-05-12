import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../assets/colors';
import CustomButton from '../../../components/CustomButton';
import CustomDropdown from '../../../components/CustomDropdown';
import DeclareStatusCard from '../../../components/DeclareStatusCard';
import GradientBackground from '../../../components/GradientBackground';
import ScreenHeader from '../../../components/ScreenHeader';
import useSearchBar from '../../../hooks/useSearchBar';
import APIService from '../../services/APIService';
import { PermissionsSelector } from '../../../components/PermissionsSelector';

const RolePermissions = ({ navigation }: any) => {
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
  const [permissionStates, setPermissionStates] = useState<string[]>([]);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [isDefaultPermissions, setIsDefaultPermissions] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  const [getData, setData] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState<string | null>(null);
  const [roleDropdownData, setRoleDropdownData] = React.useState<any[]>([]);

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const handleSheetChange = (index: number) => {
    Keyboard.dismiss();
    if (index === -1) {
      setIsOpenBottomSheet(false);
    } else {
      setIsOpenBottomSheet(true);
    }
  };

  // Search hook using common useSearchBar for roles list
  const { query: roleQuery, setQuery: setRoleQuery, filteredItems } = useSearchBar<any>(getData, {
    selector: (item: any) =>
      String(item?.staff_name ?? item?.staff_role ?? item?.username ?? item?.mobile ?? ''),
    debounceMs: 200,
  });

  const snapPoints = React.useMemo(() => ['100%'], []);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={1}
        appearsOnIndex={-1}
      />
    ),
    [],
  );

  const handleClosePress = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
    setIsOpenBottomSheet(false);
    setSelectedParty(null);
    setIsDefaultPermissions(false);
    setPermissionStates([]);
    setDropdownValue(null);
  };

  // Fetch roles data from API
  React.useEffect(() => {
    getRoles();
  }, []);

  const getRoles = async () => {
    try {
      const response = await APIService.GetStaff({ active: 1 });
      if (response?.success) {
        // Helper to stringify objects into readable labels
        const stringifyField = (val: any) => {
          if (val == null) return '';
          if (typeof val === 'object') {
            if (val.name) return String(val.name);
            if (val.label) return String(val.label);
            if (val.title) return String(val.title);
            if (val.username) return String(val.username);
            if (val.real_name) return String(val.real_name);
            if (val.id !== undefined) return String(val.id);
            try { return Object.values(val).map((v: any) => String(v)).join(', '); } catch { return JSON.stringify(val); }
          }
          return String(val);
        };

        const dataWithSerialNumbers = response?.data?.map((item: any, index: number) => {
          return {
            ...item,
            sNo: index + 1,
            staff_name: stringifyField(item.staff_name),
            staff_role: stringifyField(item.staff_role),
            username: stringifyField(item.username),
            work_mode: stringifyField(item.work_mode),
            mobile: stringifyField(item.mobile),
            address: stringifyField(item.address),
            created_by: stringifyField(item.created_by),
            updated_by: stringifyField(item.updated_by),
          };
        });
        setData(dataWithSerialNumbers);
      }
    } catch (error) {
      console.error('Roles fetch failed', error);
    }
  };

  console.log('roleDropdownData', roleDropdownData)
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await getRoles();
    } finally {
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchRoleDropdownData();
  }, []);

  const fetchRoleDropdownData = async () => {
    try {
      const response = await APIService.GetAllPermissionsRoles();

      if (response && response.success && response.data) {
        const transformedRoles = response.data.map((role: any) => ({
          label: role.name || 'Unknown Role',
          value: role.id?.toString() || ''
        }));
        setRoleDropdownData(transformedRoles);
      } else {
        setRoleDropdownData([]);
      }
    } catch (error) {
      console.error('Error fetching role dropdown data:', error);
      setRoleDropdownData([]);
    }
  };

  const fetchPermissionsForRole = async (roleId: number) => {
    setIsLoadingPermissions(true);
    try {
      const response = await APIService.GetPermissionsForRole(roleId);
      if (response.success && response.data) {
        setPermissionStates(response.data.permissions || []);
      } else {
        setPermissionStates([]);
      }
    } catch (error) {
      console.error('Error fetching permissions for role:', error);
      setPermissionStates([]);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const fetchPermissionsForStaff = async (staffId: number) => {
    setIsLoadingPermissions(true);
    try {
      const response = await APIService.GetPermissionsForStaff(staffId);
      if (response.success && response.data) {
        setPermissionStates(response.data.permissions || []);
      } else {
        setPermissionStates([]);
      }
    } catch (error) {
      console.error('Error fetching permissions for staff:', error);
      setPermissionStates([]);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GradientBackground colors={["#fdf0d0", "#e0efea"]} locations={[0, 30]}>
        <SafeAreaView
          style={styles.safeAreaContainer}
          edges={['top', 'left', 'right']}
        >
          <ScreenHeader
            title={'Role & Permissions'}
            navigation={navigation}
            hideBackButton={true} showDrawerButton={true}
          />
          <View style={styles.container}>
            {/* Search and Add Button Section */}
            <View style={styles.topSection}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search roles..."
                  value={roleQuery}
                  onChangeText={setRoleQuery}
                  placeholderTextColor="#999"
                />
              </View>
              <CustomButton
                textColor={COLORS.WHITE}
                title="Default permissions"
                onPress={() => {
                  setIsOpenBottomSheet(true);
                  setIsDefaultPermissions(true);
                  setSelectedParty(null);
                  setPermissionStates([]);
                  setDropdownValue(null);
                }}
                style={styles.addButton}
              />
            </View>

            {/* Table Section */}
            <ScrollView style={styles.tableContainer} keyboardShouldPersistTaps="handled">
              {filteredItems && filteredItems.length > 0 ? (
                <DeclareStatusCard
                  data={filteredItems}
                  config={[
                    { key: 'sNo', label: 'S.No.' },
                    { key: 'staff_name', label: 'Party Name' },
                    { key: 'staff_role', label: 'Role' },
                    { key: 'username', label: 'Username' },
                    { key: 'work_mode', label: 'W-Mode' },
                    { key: 'mobile', label: 'Mobile' },
                    { key: 'address', label: 'Address' },
                    { key: 'created_by', label: 'Added By' },
                    { key: 'updated_by', label: 'Updated By' },
                  ]}
                  isButtonOne={true}
                  actionOneLabel="Permissions"
                  isButtonTwo={false}
                  useToggleOne={false}
                  onActionOne={(item: any) => {
                    setSelectedParty(item);
                    setIsOpenBottomSheet(true);
                    setIsDefaultPermissions(false);
                    setPermissionStates([]);
                    fetchPermissionsForStaff(item.id);
                  }}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No data available</Text>
                </View>
              )}
            </ScrollView>

            {/* Permissions Bottom Sheet */}
            {isOpenBottomSheet && (
              <BottomSheet
                backgroundStyle={{ backgroundColor: COLORS.BGFILESCOLOR }}
                ref={bottomSheetRef}
                style={{ borderWidth: 1, borderRadius: scale(10) }}
                index={0}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                onChange={handleSheetChange}
                backdropComponent={renderBackdrop}
                enablePanDownToClose={true}
                onClose={() => {
                  setIsOpenBottomSheet(false);
                }}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {isDefaultPermissions ? 'Set Default Permissions' : 'Manage Permissions'}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {isDefaultPermissions ? 'Manage role permissions' : `Update permissions for ${selectedParty?.staff_name || ''}`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleClosePress}>
                    <Icon name="cancel" size={scale(20)} />
                  </TouchableOpacity>
                </View>

                <BottomSheetScrollView
                  style={styles.modalContent}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.permissionFormContainer}>
                    {/* Role Selection Section - Only for Default Permissions */}
                    {isDefaultPermissions && (
                      <View style={styles.roleSelectionSection}>
                        <Text style={styles.requiredLabel}>
                          Select Role <Text style={styles.asterisk}>*</Text>
                        </Text>
                        <CustomDropdown
                          label=""
                          open={openDropdown}
                          value={dropdownValue}
                          items={roleDropdownData}
                          setOpen={setOpenDropdown}
                          setValue={(val: any) => {
                            const selectedValue = val();

                            console.log('selectedValue', selectedValue)
                            setDropdownValue(selectedValue);
                            setOpenDropdown(false);
                            if (selectedValue) {
                              fetchPermissionsForRole(Number(selectedValue));
                            } else {
                              setPermissionStates([]);
                            }
                          }}
                          setItems={setRoleDropdownData}
                          placeholder="Select a role..."
                          zIndex={1000}
                        />
                      </View>
                    )}

                    {/* Permissions Selector Section */}
                    {isLoadingPermissions ? (
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading permissions...</Text>
                      </View>
                    ) : (
                      (!isDefaultPermissions || dropdownValue) ? (
                        <View style={styles.permissionsWrapper}>
                          <PermissionsSelector
                            selectedPermissions={permissionStates}
                            onPermissionsChange={setPermissionStates}
                          />

                          <CustomButton
                            title={isDefaultPermissions ? "Assign Permissions" : "Save Permissions"}
                            onPress={async () => {
                              try {
                                let response;
                                if (isDefaultPermissions) {
                                  response = await APIService.UpdatePermissionData({
                                    role: Number(dropdownValue),
                                    permissions: permissionStates
                                  });
                                } else {
                                  response = await APIService.UpdateStaffPermissions({
                                    staff_id: selectedParty.id,
                                    permissions: permissionStates
                                  });
                                }

                                if (response?.success) {
                                  Toast.show({
                                    type: 'success',
                                    text1: 'Success',
                                    text2: response?.message || 'Permissions updated successfully',
                                    position: 'bottom',
                                  });
                                  handleClosePress();
                                }
                              } catch (error) {
                                console.error('Save permissions failed', error);
                                Toast.show({
                                  type: 'error',
                                  text1: 'Error',
                                  text2: 'Failed to save permissions.',
                                  position: 'bottom',
                                });
                              }
                            }}
                            style={styles.saveButton}
                            textColor={COLORS.WHITE}
                          />
                        </View>
                      ) : (
                        <View style={styles.emptyPermissionsState}>
                          <Icon name="shield" size={scale(48)} color="#ccc" />
                          <Text style={styles.emptyPermissionsText}>Please select a role to assign permissions</Text>
                        </View>
                      )
                    )}
                  </View>
                </BottomSheetScrollView>
              </BottomSheet>
            )}
          </View>
        </SafeAreaView>
      </GradientBackground>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: scale(10),
    marginHorizontal: scale(15),
    marginVertical: scale(10),
    borderRadius: scale(8),
  },
  searchContainer: {
    flex: 1,
    marginRight: scale(10),
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: scale(8),
    fontSize: scale(14),
    backgroundColor: '#fff',
  },
  addButton: {
    width: '45%',
  },
  tableContainer: {
    paddingHorizontal: scale(15),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  modalSubtitle: {
    fontSize: scale(12),
    color: '#666',
    marginTop: scale(2),
  },
  modalContent: {
    padding: scale(15),
  },
  permissionFormContainer: {
    paddingBottom: scale(40),
  },
  roleSelectionSection: {
    marginBottom: scale(20),
  },
  requiredLabel: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(8),
  },
  asterisk: {
    color: 'red',
  },
  permissionsWrapper: {
    marginTop: scale(10),
  },
  loadingContainer: {
    padding: scale(40),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: scale(10),
    color: '#666',
  },
  saveButton: {
    marginTop: scale(20),
    backgroundColor: '#1a1a1a',
  },
  emptyPermissionsState: {
    alignItems: 'center',
    padding: scale(40),
  },
  emptyPermissionsText: {
    marginTop: scale(10),
    color: '#999',
    textAlign: 'center',
  },
  emptyState: {
    padding: scale(40),
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
  },
});

export default RolePermissions;
