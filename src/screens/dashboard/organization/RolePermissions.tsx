import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Keyboard,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DeclareStatusCard from '../../../components/DeclareStatusCard';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomTextInput from '../../../components/CustomTextInput';
import CustomButton from '../../../components/CustomButton';
import CustomDropdown from '../../../components/CustomDropdown';
import { COLORS } from '../../../assets/colors';
import { scale } from 'react-native-size-matters';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../components/ScreenHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import APIService from '../../services/APIService';
import Toast from 'react-native-toast-message';
import GradientBackground from '../../../components/GradientBackground';
import useSearchBar from '../../../hooks/useSearchBar';

const AddRoleSchema = Yup.object().shape({
  partyName: Yup.string().required('Party Name is required'),
  role: Yup.string().required('Role is required'),
  username: Yup.string().required('Username is required'),
  workMode: Yup.string().required('Work Mode is required'),
  mobile: Yup.string()
    .matches(/^\d{10}$/, 'Mobile must be 10 digits')
    .nullable(),
  address: Yup.string().nullable(),
});

const RolePermissions = ({ navigation }: any) => {
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState('Active');
  const [statusItems, setStatusItems] = useState([
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ]);

  // New states for permission management
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Role, 2: Select Permissions, 3: Permission Details
  const [selectedRoleForPermission, setSelectedRoleForPermission] = useState<any>(null);
  const [selectedPermission, setSelectedPermission] = useState<any>(null);
  const [isPermissionDetailsOpen, setIsPermissionDetailsOpen] = useState(false);
  const [selectedPermissionSection, setSelectedPermissionSection] = useState<any>(null);
  const [permissionStates, setPermissionStates] = useState<any>({});
  const [selectedParty, setSelectedParty] = useState<any>(null);

  const [getData, setData] = React.useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState<string | null>(null);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const permissionDetailsRef = React.useRef<BottomSheet>(null);
  const handleSheetChange = (index: number) => {
    Keyboard.dismiss();
    if (index === -1) {
      setIsOpenBottomSheet(false);
    } else {
      setIsOpenBottomSheet(true);
    }
  };
  console.log(filteredData,"filteredData,filteredData,filteredData,filteredData")
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
    setIsEditing(false);
    setCurrentStep(1);
    setSelectedRoleForPermission(null);
    setSelectedPermission(null);
    setSelectedParty(null);
  };

  // Fetch roles data from API
  React.useEffect(() => {
    getRoles();
  }, [statusValue]);

  const getRoles = async () => {
    try {
      // Convert selected status to API query params
      let apiParams: Record<string, any> = {};

      switch (statusValue) {
        case 'Inactive':
          apiParams = { inactive: 1 };
          break;
        case 'Active':
        default:
          apiParams = { active: 1 };
          break;
      }

      const response = await APIService.GetStaff(apiParams);
      if (response?.success) {
        console.log('API Response:', response);
        console.log('Raw data:', response?.data);
        
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

        // Add serial numbers and normalize fields to strings to avoid [object Object]
        const dataWithSerialNumbers = response?.data?.map((item: any, index: number) => {
          const cleanItem = {
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
          console.log('Cleaned item:', cleanItem);
          return cleanItem;
        });
        setData(dataWithSerialNumbers);
      }
    } catch (error) {
      console.error('Roles fetch failed', error);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await getRoles();
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch role dropdown data for the permission assignment
  const [roleDropdownData, setRoleDropdownData] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    fetchRoleDropdownData();
  }, []);

  const fetchRoleDropdownData = async () => {
    try {
      const response = await APIService.roleDropDownAPI();
      
      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format
        const transformedRoles = response.data.map((role: any) => ({
          label: `${role.real_name || role.name || 'Unknown Role'} (${role.role_type || role.type || 'Role'})`,
          value: role.id?.toString() || role.role_id?.toString() || ''
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

  // Filter data based on search query
  React.useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = getData.filter((item: any) => {
      return (
        String(item.staff_name || '').toLowerCase().includes(query) ||
        String(item.staff_role || '').toLowerCase().includes(query) ||
        String(item.username || '').toLowerCase().includes(query) ||
        String(item.mobile || '').toLowerCase().includes(query)
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, getData]);

  const handleCreateRole = async (values: any) => {
    try {
      const payload = {
        party_name: values?.partyName,
        role: values?.role,
        username: values?.username,
        work_mode: values?.workMode,
        mobile: values?.mobile || '',
        address: values?.address || '',
      };
      console.log('Role payload:', payload);
      const response = isEditing ? await APIService.UpdateStaff(payload, selectedRole?.id) : await APIService.CreateStaff(payload);
      if (response?.success) {
        setIsOpenBottomSheet(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message || (isEditing ? 'Role updated successfully' : 'Role created successfully'),
          position: 'bottom',
        });
        getRoles();
      }
    } catch (error) {
      console.error('Create role failed', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save role. Please try again.',
        position: 'bottom',
      });
    }
  };


  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'super admin' },
    { label: 'Owner', value: 'owner' },
    { label: 'Fanter', value: 'fanter' },
    { label: 'Cash Agent', value: 'cash agent' },
  ];

  const workModeOptions = [
    { label: 'Common', value: 'common' },
    { label: 'Calling', value: 'calling' },
    { label: 'WhatsApp', value: 'whatsapp' },
  ];

  // Detailed permission sections data
  const detailedPermissionSections = [
    {
      id: 1,
      title: 'Master',
      icon: 'settings',
      color: '#2196F3',
      categories: [
        {
          name: 'Shift',
          permissions: [
            { id: 'shift_view', name: 'View', type: 'view', checked: false, disabled: false },
            { id: 'shift_add', name: 'Add (requires View)', type: 'add', checked: false, disabled: true },
            { id: 'shift_action', name: 'Action (requires View)', type: 'action', checked: false, disabled: true }
          ]
        },
        {
          name: 'Ledger',
          permissions: [
            { id: 'ledger_view', name: 'View', type: 'view', checked: false, disabled: false },
            { id: 'ledger_add', name: 'Add (requires View)', type: 'add', checked: false, disabled: true },
            { id: 'ledger_action', name: 'Action (requires View)', type: 'action', checked: false, disabled: true }
          ]
        },
        {
          name: 'Staff',
          permissions: [
            { id: 'staff_view', name: 'View', type: 'view', checked: false, disabled: false },
            { id: 'staff_add', name: 'Add (requires View)', type: 'add', checked: false, disabled: true },
            { id: 'staff_action', name: 'Action (requires View)', type: 'action', checked: false, disabled: true }
          ]
        },
        {
          name: 'Agents',
          permissions: [
            { id: 'agents_view', name: 'View', type: 'view', checked: false, disabled: false },
            { id: 'agents_add', name: 'Add (requires View)', type: 'add', checked: false, disabled: true },
            { id: 'agents_action', name: 'Action (requires View)', type: 'action', checked: false, disabled: true }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Transactions',
      icon: 'description',
      color: '#4CAF50',
      categories: [
        {
          name: 'Transaction',
          permissions: [
            { id: 'trans_view', name: 'View (View)', type: 'view', checked: false, disabled: false },
            { id: 'trans_add', name: 'Add (requires View)', type: 'add', checked: false, disabled: true },
            { id: 'trans_edit', name: 'Edit (requires View)', type: 'edit', checked: false, disabled: true },
            { id: 'trans_delete', name: 'Delete (requires View)', type: 'delete', checked: false, disabled: true },
            { id: 'trans_copy', name: 'Copy (requires View)', type: 'copy', checked: false, disabled: true },
            { id: 'trans_jantri_view', name: 'Jantri View (requires View)', type: 'jantri_view', checked: false, disabled: true },
            { id: 'trans_main_jantri', name: 'Main Jantri (requires View)', type: 'main_jantri', checked: false, disabled: true }
          ]
        },
        {
          name: 'Declare Transaction',
          permissions: [
            { id: 'declare_view', name: 'View (View)', type: 'view', checked: false, disabled: false },
            { id: 'declare_declare', name: 'Declare (requires View)', type: 'declare', checked: false, disabled: true },
            { id: 'declare_copy', name: 'Copy (requires View)', type: 'copy', checked: false, disabled: true },
            { id: 'declare_jantri_view', name: 'Jantri View (requires View)', type: 'jantri_view', checked: false, disabled: true },
            { id: 'declare_main_jantri', name: 'Main Jantri (requires View)', type: 'main_jantri', checked: false, disabled: true }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Voucher',
      icon: 'security',
      color: '#9C27B0',
      categories: [
        {
          name: 'Journal Voucher',
          permissions: [
            { id: 'journal_view', name: 'View (View)', type: 'view', checked: false, disabled: false },
            { id: 'journal_add', name: 'Add (requires View)', type: 'add', checked: false, disabled: true },
            { id: 'journal_edit', name: 'Edit (requires View)', type: 'edit', checked: false, disabled: true },
            { id: 'journal_delete', name: 'Delete (requires View)', type: 'delete', checked: false, disabled: true }
          ]
        },
        {
          name: 'Limit Voucher',
          permissions: [
            { id: 'limit_view', name: 'View (View)', type: 'view', checked: false, disabled: false },
            { id: 'limit_add', name: 'Add (requires View)', type: 'add', checked: false, disabled: true },
            { id: 'limit_edit', name: 'Edit (requires View)', type: 'edit', checked: false, disabled: true },
            { id: 'limit_delete', name: 'Delete (requires View)', type: 'delete', checked: false, disabled: true }
          ]
        },
        {
          name: 'Vapsi Voucher',
          permissions: [
            { id: 'vapsi_view', name: 'View (View)', type: 'view', checked: false, disabled: false },
            { id: 'vapsi_add', name: 'Add (requires View)', type: 'add', checked: false, disabled: true },
            { id: 'vapsi_edit', name: 'Edit (requires View)', type: 'edit', checked: false, disabled: true },
            { id: 'vapsi_delete', name: 'Delete (requires View)', type: 'delete', checked: false, disabled: true }
          ]
        }
      ]
    },
    {
      id: 4,
      title: 'Reports',
      icon: 'assessment',
      color: '#FF9800',
      categories: [
        {
          name: 'Daily Report',
          permissions: [
            { id: 'daily_view', name: 'View (View)', type: 'view', checked: false, disabled: false }
          ]
        },
        {
          name: 'All Shift Report',
          permissions: [
            { id: 'shift_report_view', name: 'View (View)', type: 'view', checked: false, disabled: false }
          ]
        },
        {
          name: 'Settling Report',
          permissions: [
            { id: 'settling_view', name: 'View (View)', type: 'view', checked: false, disabled: false }
          ]
        },
        {
          name: 'Limit Balance Report',
          permissions: [
            { id: 'limit_balance_view', name: 'View (View)', type: 'view', checked: false, disabled: false }
          ]
        },
        {
          name: 'Profit Loss Report',
          permissions: [
            { id: 'profit_loss_view', name: 'View (View)', type: 'view', checked: false, disabled: false }
          ]
        },
        {
          name: 'TPC Report',
          permissions: [
            { id: 'tpc_view', name: 'View (View)', type: 'view', checked: false, disabled: false }
          ]
        }
      ]
    },
    {
      id: 5,
      title: 'Result',
      icon: 'trending-up',
      color: '#4CAF50',
      categories: [
        {
          name: 'Live Prediction',
          permissions: [
            { id: 'live_prediction_view', name: 'View (View)', type: 'view', checked: false, disabled: false }
          ]
        },
        {
          name: 'Collection',
          permissions: [
            { id: 'collection_view', name: 'View (View)', type: 'view', checked: false, disabled: false }
          ]
        },
        {
          name: 'Jantri',
          permissions: [
            { id: 'jantri_view', name: 'View (View)', type: 'view', checked: false, disabled: false }
          ]
        }
      ]
    }
  ];

  // Simple permission sections for the main list
  const permissionSections = detailedPermissionSections.map(section => ({
    id: section.id,
    title: section.title,
    icon: section.icon,
    color: section.color
  }));

  // Handlers for permission management
  const handleRoleSelection = (role: any) => {
    setSelectedRoleForPermission(role);
    setCurrentStep(2);
  };

  const handlePermissionClick = (section: any) => {
    if (section && typeof section === 'object') {
      // Find the detailed section data
      const detailedSection = detailedPermissionSections.find(s => s.id === section.id);
      if (detailedSection) {
        setSelectedPermissionSection(detailedSection);
        setIsPermissionDetailsOpen(true);
      }
    } else {
      console.error('Invalid permission section:', section);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid permission data.',
        position: 'bottom',
      });
    }
  };

  // Handle permission checkbox changes
  const handlePermissionToggle = (permissionId: string, categoryName: string, sectionId: number, permission: any) => {
    const isCurrentlyChecked = permissionStates[permissionId] || permission.checked;
    const newCheckedState = !isCurrentlyChecked;
    
    setPermissionStates((prev: any) => {
      const newState = { ...prev, [permissionId]: newCheckedState };
      
      // If this is a "view" permission being unchecked, uncheck all other permissions in the same category
      if (permission.type === 'view' && !newCheckedState) {
        selectedPermissionSection?.categories.forEach((cat: any) => {
          if (cat.name === categoryName) {
            cat.permissions.forEach((perm: any) => {
              if (perm.type !== 'view') {
                newState[perm.id] = false;
              }
            });
          }
        });
      }
      
      return newState;
    });
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    try {
      if (!selectedPermissionSection) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Open a permission section to select permissions.',
          position: 'bottom',
        });
        return;
      }

      // Collect selected permission ids only
      const selectedPermissionIds: string[] = [];
      selectedPermissionSection.categories.forEach((category: any) => {
        category.permissions.forEach((permission: any) => {
          if (permissionStates[permission.id] || permission.checked) {
            selectedPermissionIds.push(permission.id);
          }
        });
      });

      if (selectedPermissionIds.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'No permissions selected',
          text2: 'Please select at least one permission.',
          position: 'bottom',
        });
        return;
      }

      // Only close details modal and keep selected permission states for final Assign
      Toast.show({
        type: 'success',
        text1: 'Saved',
        text2: 'Permissions staged. Tap Assign Permissions to submit.',
        position: 'bottom',
      });
      setIsPermissionDetailsOpen(false);
      setSelectedPermissionSection(null);
    } catch (error) {
      console.error('Save permissions failed', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save permissions. Please try again.',
        position: 'bottom',
      });
    }
  };

  return (
    <GestureHandlerRootView style={{flex:1}}>
         <GradientBackground colors={[ "#fdf0d0","#e0efea"]} locations={[0,30]}>
      <SafeAreaView
        style={style.safeAreaContainer}
        edges={['top', 'left', 'right']}
      >
        <ScreenHeader
          title={'Role & Permissions'}
          navigation={navigation}
          hideBackButton={true} showDrawerButton={true}
        />
        <View style={style.container}>
          {/* Search and Add Button Section */}
          <View style={style.topSection}>
            <View style={style.searchContainer}>
              {/* <Text style={style.searchLabel}>Search</Text> */}
              <TextInput
                style={style.searchInput}
                placeholder="Search roles..."
                value={roleQuery}
                onChangeText={setRoleQuery}
                placeholderTextColor="#999"
              />
            </View>
            <CustomButton
              textColor={COLORS.WHITE}
              title="+ Add "
              onPress={() => {
                setIsOpenBottomSheet(true);
                setSelectedRole(null);
                setIsEditing(false);
                setCurrentStep(1);
                setSelectedRoleForPermission(null);
                setSelectedPermission(null);
              }}
              style={style.addButton}
            />
          </View>

          {/* Table Section */}
          <ScrollView style={style.tableContainer} keyboardShouldPersistTaps="handled">
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
                  // When user taps "Permissions" on a specific party row
                  setSelectedParty(item);
                  setIsOpenBottomSheet(true);
                  setIsEditing(false);
                  setCurrentStep(1);
                  setSelectedRoleForPermission(null);
                  setSelectedPermission(null);

                  // Try to preselect role in dropdown by matching staff_role text with dropdown label
                  if (item?.staff_role && roleDropdownData && roleDropdownData.length > 0) {
                    const matchedRole = roleDropdownData.find((r: any) =>
                      String(r.label).toLowerCase().includes(String(item.staff_role).toLowerCase()),
                    );
                    if (matchedRole) {
                      setDropdownValue(matchedRole.value);
                      setOpenDropdown(false);
                      const roleObject = {
                        id: matchedRole.value,
                        real_name: matchedRole.label.split(' (')[0],
                        name: matchedRole.label.split(' (')[0],
                        role_type: matchedRole.label.split(' (')[1]?.replace(')', '') || 'Role',
                      };
                      setSelectedRoleForPermission(roleObject);
                    } else {
                      setDropdownValue(null);
                    }
                  } else {
                    setDropdownValue(null);
                  }
                }}
                // activeKey="isActive"
                refreshing={refreshing}
                onRefresh={filteredItems && filteredItems.length > 0 ? onRefresh : undefined}
              />
            ) : (
              <View style={style.emptyState}>
                <Text style={style.emptyStateText}>No data available</Text>
              </View>
            )}
          </ScrollView>

          {/* Status Filter */}
          {/* <View style={style.statusContainer}>
            <CustomDropdown
              label=""
              open={statusOpen}
              value={statusValue}
              items={statusItems}
              setOpen={setStatusOpen}
              setValue={(value: any) => {
                setStatusValue(value);
                setStatusOpen(false);
              }}
              setItems={setStatusItems}
              placeholder="Select Status"
              zIndex={1000}
            />
          </View> */}

          {/* Add/Edit Role Modal */}
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
              <View style={style.modalHeader}>
                <View style={style.modalTitleContainer}>
                  <Text style={style.modalTitle}>
                    Assign Permissions |
                    <Text style={style.modalSubtitle}>
                      {' '}
                      Manage role permissions
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClosePress}>
                  <Icon name="cancel" size={scale(20)} />
                </TouchableOpacity>
              </View>

              {selectedParty && (
                <View style={style.selectedRoleInfo}>
                  <Text style={style.selectedRoleTitle}>Selected Party</Text>
                  <Text style={style.selectedRoleName}>{selectedParty?.staff_name || '-'}</Text>
                  {selectedParty?.staff_role ? (
                    <Text style={style.selectedRoleType}>{selectedParty.staff_role}</Text>
                  ) : null}
                </View>
              )}
              <BottomSheetScrollView
                style={style.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={style.permissionFormContainer}>
                  {/* Role Selection Section */}
                  <View style={style.roleSelectionSection}>
                    <Text style={style.requiredLabel}>
                      Select Role <Text style={style.asterisk}>*</Text>
                    </Text>
                    <CustomDropdown
                             label=""
                             open={openDropdown}
                             value={dropdownValue}
                             items={roleDropdownData}
                             setOpen={setOpenDropdown}
                             setValue={(val: any) => {
                               setDropdownValue(val);
                               setOpenDropdown(false);
                               
                               // Find the selected role from the original API data
                               const selectedRole = roleDropdownData.find((role: any) => role.value === val);
                               
                               if (selectedRole) {
                                 // Create a role object with the necessary properties
                                 const roleObject = {
                                   id: selectedRole.value,
                                   real_name: selectedRole.label.split(' (')[0], // Extract name from label
                                   name: selectedRole.label.split(' (')[0],
                                   role_type: selectedRole.label.split(' (')[1]?.replace(')', '') || 'Role'
                                 };
                                 handleRoleSelection(roleObject);
                               } else {
                                 setSelectedRoleForPermission(null);
                               }
                             }}
                             setItems={setRoleDropdownData}
                             placeholder="Select a role..."
                             zIndex={1000}
                           />
                  </View>

                  {/* Permissions Section */}
                  <View style={style.permissionsSection}>
                    <View style={style.permissionsHeader}>
                      <Icon name="security" size={scale(20)} color="#666" />
                      <Text style={style.permissionsTitle}>Permissions</Text>
                    </View>
                    
                    {(selectedRoleForPermission || dropdownValue) ? (
                      <View style={style.permissionSections}>
                        {permissionSections && permissionSections.length > 0 ? permissionSections.map((section) => (
                          <TouchableOpacity
                            key={section.id}
                            style={style.permissionSection}
                            onPress={() => {
                              handlePermissionClick(section);
                            }}
                          >
                            <View style={style.sectionInfo}>
                              <View style={style.sectionIconContainer}>
                                <Icon 
                                  name={section.id === 1 ? 'settings' : 
                                        section.id === 2 ? 'description' :
                                        section.id === 3 ? 'security' :
                                        section.id === 4 ? 'assessment' :
                                        'trending-up'} 
                                  size={scale(20)} 
                                  color={section.id === 1 ? '#2196F3' : 
                                         section.id === 2 ? '#4CAF50' :
                                         section.id === 3 ? '#9C27B0' :
                                         section.id === 4 ? '#FF9800' :
                                         '#4CAF50'} 
                                />
                              </View>
                              <View style={style.sectionTextContainer}>
                                <Text style={[style.sectionTitle, {
                                  color: section.id === 1 ? '#2196F3' : 
                                         section.id === 2 ? '#4CAF50' :
                                         section.id === 3 ? '#9C27B0' :
                                         section.id === 4 ? '#FF9800' :
                                         '#4CAF50'
                                }]}>{section.title || 'Unknown Section'}</Text>
                              </View>
                            </View>
                            <Icon name="chevron-right" size={scale(20)} color="#666" />
                          </TouchableOpacity>
                        )) : (
                          <View style={style.permissionSection}>
                            <Text style={style.sectionTitle}>No permission sections available</Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View style={style.emptyStateContainer}>
                        <Icon name="security" size={scale(48)} color="#ccc" />
                        <Text style={style.emptyStateTitle}>Please select a role to assign permissions</Text>
                        <Text style={style.emptyStateSubtitle}>Choose a role from the dropdown above to view and assign permissions</Text>
                      </View>
                    )}
                  </View>

                  {/* Assign Permissions Button */}
                  {(selectedRoleForPermission || dropdownValue) && (
                    <View style={style.assignButtonContainer}>
                      <CustomButton
                        title="Assign Permissions"
                        onPress={async () => {
                          try {
                            const roleId = selectedRoleForPermission?.id || dropdownValue;
                            if (!roleId) {
                              Toast.show({
                                type: 'error',
                                text1: 'Missing role',
                                text2: 'Please select a role first.',
                                position: 'bottom',
                              });
                              return;
                            }

                            // Collect selected permissions (ids where checked is true)
                            const selectedPermissionIds = Object.keys(permissionStates).filter(
                              (key) => !!permissionStates[key]
                            );

                            const staffId = selectedParty?.id;
                            const payload: any = {
                              role: Number(roleId),
                              permissions: selectedPermissionIds,
                            };
                            if (staffId) {
                              payload.staff_id = Number(staffId);
                            }

                            const res = await APIService.UpdatePermissionData(payload);
                            if (res?.success) {
                              Toast.show({
                                type: 'success',
                                text1: 'Success',
                                text2: 'Permissions assigned successfully',
                                position: 'bottom',
                              });
                              setIsOpenBottomSheet(false);
                              setSelectedPermissionSection(null);
                              setPermissionStates({});
                            } else {
                              Toast.show({
                                type: 'error',
                                text1: 'Failed',
                                text2: res?.message || 'Unable to assign permissions.',
                                position: 'bottom',
                              });
                            }
                          } catch (error: any) {
                            console.error('Assign permissions failed', error?.response?.data || error);
                            Toast.show({
                              type: 'error',
                              text1: 'Error',
                              text2: error?.response?.data?.message || 'Something went wrong while assigning permissions.',
                              position: 'bottom',
                            });
                          }
                        }}
                        textColor={COLORS.WHITE}
                        style={style.assignPermissionsButton}
                      />
                    </View>
                  )}
                </View>
              </BottomSheetScrollView>
            </BottomSheet>
          )}

          {/* Permission Details Modal */}
          {isPermissionDetailsOpen && selectedPermissionSection && (
            <BottomSheet
              backgroundStyle={{ backgroundColor: COLORS.BGFILESCOLOR }}
              ref={permissionDetailsRef}
              style={{ borderWidth: 1, borderRadius: scale(10) }}
              index={0}
              snapPoints={['90%']}
              enableDynamicSizing={false}
              backdropComponent={renderBackdrop}
              enablePanDownToClose={true}
              onClose={() => {
                setIsPermissionDetailsOpen(false);
                setSelectedPermissionSection(null);
                setPermissionStates({});
              }}
            >
              <View style={style.modalHeader}>
                <View style={style.modalTitleContainer}>
                  <Icon name={selectedPermissionSection.icon} size={scale(20)} color={selectedPermissionSection.color} />
                  <Text style={[style.modalTitle, { color: selectedPermissionSection.color, marginLeft: scale(8) }]}>
                    {selectedPermissionSection.title} Permissions
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {
                  setIsPermissionDetailsOpen(false);
                  setSelectedPermissionSection(null);
                  setPermissionStates({});
                }}>
                  <Icon name="cancel" size={scale(20)} />
                </TouchableOpacity>
              </View>
              
              <BottomSheetScrollView
                style={style.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={style.permissionDetailsContainer}>
                  {/* Permission Categories */}
                  {selectedPermissionSection.categories.map((category: any, categoryIndex: number) => (
                    <View key={categoryIndex} style={style.permissionCategory}>
                      <Text style={[style.categoryTitle, { color: selectedPermissionSection.color }]}>
                        {category.name}
                      </Text>
                      <View style={style.permissionGrid}>
                        {category.permissions.map((permission: any, permissionIndex: number) => {
                          const isViewChecked = category.permissions.find((p: any) => p.type === 'view' && (permissionStates[p.id] || p.checked));
                          const isPermissionEnabled = permission.type === 'view' || isViewChecked;
                          const isCurrentlyChecked = permissionStates[permission.id] || permission.checked;
                          
                          return (
                            <TouchableOpacity
                              key={permissionIndex}
                              style={[
                                style.permissionItem,
                                !isPermissionEnabled && style.permissionItemDisabled,
                                isCurrentlyChecked && style.permissionItemActive
                              ]}
                              onPress={() => {
                                if (isPermissionEnabled) {
                                  handlePermissionToggle(permission.id, category.name, selectedPermissionSection.id, permission);
                                }
                              }}
                              disabled={!isPermissionEnabled}
                            >
                              <View style={style.permissionCheckbox}>
                                <Icon
                                  name={isCurrentlyChecked ? 'check-box' : 'check-box-outline-blank'}
                                  size={scale(20)}
                                  color={!isPermissionEnabled ? '#ccc' : isCurrentlyChecked ? selectedPermissionSection.color : '#666'}
                                />
                              </View>
                              <Text style={[
                                style.permissionText,
                                !isPermissionEnabled && style.permissionTextDisabled,
                                isCurrentlyChecked && { color: selectedPermissionSection.color }
                              ]}>
                                {permission.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ))}

                  {/* Save Button */}
                  <View style={style.permissionActions}>
                    <CustomButton
                      title="Save Permissions"
                      onPress={handleSavePermissions}
                      textColor={COLORS.WHITE}
                      style={[style.assignButton, { backgroundColor: selectedPermissionSection.color }] as any}
                    />
                  </View>
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

const style = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: '#fef7e5',
  },
  container: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: scale(10),
    // backgroundColor: '#fff',
    marginHorizontal: scale(15),
    marginVertical: scale(10),
    borderRadius: scale(8),
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
  },
  searchContainer: {
    flex: 1,
    marginRight: scale(10),
  },
  searchLabel: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(5),
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
    width: '30%',
    // top:scale(10)
  },
  tableContainer: {
    padding: scale(16),
  },
  statusContainer: {
    position: 'absolute',
    bottom: scale(20),
    right: scale(20),
    width: scale(120),
    zIndex: 1000,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingBottom: scale(10),
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginEnd: scale(5),
  },
  modalSubtitle: {
    fontSize: scale(12),
    fontWeight: '500',
    color: COLORS.BLACK,
    marginEnd: scale(5),
  },
  modalContent: {
    padding: scale(16),
    backgroundColor: COLORS.BGFILESCOLOR,
    flex: 1,
  },
  formContainer: {
    paddingVertical: scale(20),
  },
  saveButtonContainer: {
    marginVertical: scale(10),
  },
  // New styles for permission management
  stepContainer: {
    paddingVertical: scale(20),
  },
  stepTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: scale(15),
    textAlign: 'center',
  },
  roleList: {
    // gap: scale(10), // Not supported in older RN versions
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: scale(15),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: scale(10),
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: scale(14),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: scale(2),
  },
  roleType: {
    fontSize: scale(12),
    color: '#666',
  },
  selectedRoleInfo: {
    backgroundColor: '#f0f8ff',
    padding: scale(15),
    borderRadius: scale(8),
    marginBottom: scale(20),
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  selectedRoleTitle: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#007bff',
    marginBottom: scale(5),
  },
  selectedRoleName: {
    fontSize: scale(16),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: scale(2),
  },
  selectedRoleType: {
    fontSize: scale(14),
    color: '#666',
  },
  permissionSections: {
    // gap: scale(10), // Not supported in older RN versions
  },
  permissionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: scale(15),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: scale(10),
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: scale(14),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: scale(2),
  },
  sectionSubtitle: {
    fontSize: scale(12),
    color: '#666',
  },
  permissionDetailsContainer: {
    paddingVertical: scale(20),
  },
  permissionInfo: {
    backgroundColor: '#fff',
    padding: scale(20),
    borderRadius: scale(8),
    marginBottom: scale(20),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  permissionName: {
    fontSize: scale(18),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: scale(10),
  },
  permissionDescription: {
    fontSize: scale(14),
    color: '#666',
    lineHeight: scale(20),
  },
  rolePermissionInfo: {
    backgroundColor: '#f8f9fa',
    padding: scale(15),
    borderRadius: scale(8),
    marginBottom: scale(20),
  },
  infoTitle: {
    fontSize: scale(14),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: scale(10),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(8),
  },
  infoLabel: {
    fontSize: scale(12),
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: scale(12),
    color: COLORS.BLACK,
    fontWeight: '600',
  },
  permissionActions: {
    marginTop: scale(20),
  },
  assignButton: {
    backgroundColor: '#28a745',
  },
  emptyState: {
    padding: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: scale(14),
    color: '#666',
    textAlign: 'center',
  },
  // New styles for the updated permission form
  permissionFormContainer: {
    paddingVertical: scale(20),
  },
  roleSelectionSection: {
    marginBottom: scale(20),
  },
  requiredLabel: {
    fontSize: scale(14),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: scale(8),
  },
  asterisk: {
    color: '#2196F3',
    fontSize: scale(16),
  },
  permissionsSection: {
    marginBottom: scale(20),
  },
  permissionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(15),
  },
  permissionsTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginLeft: scale(8),
  },
  sectionIconContainer: {
    marginRight: scale(12),
  },
  sectionTextContainer: {
    flex: 1,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(40),
    paddingHorizontal: scale(20),
    backgroundColor: '#f8f9fa',
    borderRadius: scale(8),
    marginVertical: scale(20),
  },
  emptyStateTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: scale(12),
    marginBottom: scale(8),
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: scale(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: scale(20),
  },
  assignButtonContainer: {
    marginTop: scale(20),
    paddingTop: scale(20),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  assignPermissionsButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: scale(12),
  },
  // New styles for detailed permission modal
  permissionCategory: {
    marginBottom: scale(20),
  },
  categoryTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    marginBottom: scale(10),
    paddingHorizontal: scale(5),
  },
  permissionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: scale(8),
    minWidth: '45%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  permissionItemActive: {
    backgroundColor: '#f0f8ff',
    borderColor: '#2196F3',
  },
  permissionItemDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  permissionCheckbox: {
    marginRight: scale(8),
  },
  permissionText: {
    fontSize: scale(12),
    color: '#333',
    flex: 1,
  },
  permissionTextDisabled: {
    color: '#999',
  },
});

export default RolePermissions;
