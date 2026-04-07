import React, { useState } from 'react';
import {
  ScrollView,
  Button,
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  Alert,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import DeclareStatusCard from '../../../components/DeclareStatusCard';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Formik } from 'formik';
import CustomDropdown from '../../../components/CustomDropdown';
import CustomDateTimePicker from '../../../components/CustomDatePicker';
import * as Yup from 'yup';
import CustomTextInput from '../../../components/CustomTextInput';
import CustomButton from '../../../components/CustomButton';
import { COLORS } from '../../../assets/colors';
import { scale } from 'react-native-size-matters';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../components/ScreenHeader';
import TabHeader from '../../../components/TabHeader';
import APIService from '../../services/APIService';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useSearchBar from '../../../hooks/useSearchBar';
import { useFormLogic } from '../leadgerhooks/FormLogicHook';
import { useTPCommission } from '../leadgerhooks/TPCommissionHook';
import { BasicFormFields } from '../leadgersections/BasicFormFields';
import { RateCommissionFields } from '../leadgersections/RateCommissionFields';
import { TPCommissionSection } from '../leadgersections/TPCommissionSection';
import { TPCommissionModal } from '../leadgerModal/TPCommissionModal';
import { useDropdownStates } from '../leadgerhooks/useDropdownStates';
import { useTPWapsi } from '../leadgerhooks/wapsiManagmentHook';
import { useTPPatti } from '../leadgerhooks/useTPPatti';
import { WapsiSection } from '../leadgersections/WapsiSection';
import { PattiSection } from '../leadgersections/PattiSection';
import { ContactAndAdditionalFields } from '../leadgersections/ContactAndAdditionalField';
import { WapsiModal } from '../leadgerModal/WapsiModal';
import { PattiModal } from '../leadgerModal/PattiModal';
import GradientBackground from '../../../components/GradientBackground';
const AddStaffSchema = Yup.object().shape({
  staffName: Yup.string().required('Shaff Name is required'),
  nextDay: Yup.string().required('Next Day is required'),
  openTime: Yup.string().required('Open Time is required'),
  closeTimeOwner: Yup.string().required('Closing Time is required'),
  owner: Yup.string().required('Owner Closing Time is required'),
  superAdmin: Yup.string().required('Super Admin Closing Time is required'),
  fanter: Yup.string().required('Fanter Closing Time is required'),
  caseAgent: Yup.string().required('Case Agent Closing Time is required'),
  admin: Yup.string().required('Admin Closing Time is required'),
  dataEntryOperator: Yup.string().required(
    'Data Entry Operator Closing Time is required',
  ),
});
interface DropdownItem {
  label: string;
  value: string;
}

interface SelectedCompany {
  staff_role?: {
    name?: string;
    id?: string;
  };
  work_mode?: {
    name?: string;
    id?: string;
  };
  agent?: {
    name?: string;
    id?: string;
  };
}
const Ledger = ({ navigation }: any) => {
  const [open, setOpen] = useState(false);
  const shifts = useSelector((state: any) => state.shift);
  const [showSearch, setShowSearch] = useState(false);
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [shouldClearDropdowns, setShouldClearDropdowns] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Info, 1: Re-Name, 2: Re-Config, 3: Password, 4: Account
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<boolean>(false);
  const statusDropdownItems = [
    { label: 'Active', value: 'Active' },
    { label: 'NotActive', value: 'NotActive' },
    { label: 'Hidden', value: 'Hidden' },
    { label: 'Deleted', value: 'Deleted' },
    { label: 'Locked', value: 'Locked' },
  ];
  const [buttonLoading, setButtonLoading] = useState({
    loginStatus: false,
    accountStatus: false,
    hideStatus: false,
    deleteStatus: false,
  });
  const [accountStatus, setAccountStatus] = useState({
    isLocked: false,
    isDeactivated: false,
    isHidden: false,
    isDeleted: false,
  });
  const [getData, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const passwordFetchedRef = React.useRef<string | null>(null);
  // console.log(getData,"[getData][getData][getData][getData][getData][")
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState<string | null>(null);
  const [dropdownItems, setDropdownItems] = React.useState([
    { label: 'fanter', value: '1' },
    { label: 'cash agent', value: '2' },
    { label: 'direct expense', value: '3' },
    { label: 'distributer', value: '4' },
    { label: 'profit & loss', value: '5' },
    { label: 'indirect expense', value: '6' },
    { label: 'company', value: '7' },
  ]);
  const [openDropdown2, setOpenDropdown2] = React.useState(false);
  const [dropdownValue2, setDropdownValue2] = React.useState<string | null>(
    null,
  );
  const [dropdownItems2, setDropdownItems2] = React.useState([
    { label: 'Common', value: '1' },
    { label: 'Whatsapp', value: '2' },
    { label: 'Calling', value: '3' },
  ]);
  // Text Input Refs for focus jumping
  const leadgerNameRef = React.useRef<TextInput>(null);
  const realNameRef = React.useRef<TextInput>(null);
  const cappingRef = React.useRef<TextInput>(null);
  const dhaniRateRef = React.useRef<TextInput>(null);
  const commissionRef = React.useRef<TextInput>(null);
  const harupRateRef = React.useRef<TextInput>(null);
  const harupCommissionRef = React.useRef<TextInput>(null);
  const wapsiRef = React.useRef<TextInput>(null);
  const grantorNameRef = React.useRef<TextInput>(null);
  const mobileRef = React.useRef<TextInput>(null);
  const addressRef = React.useRef<TextInput>(null);

  // Dropdown Refs
  const groupDropdownRef = React.useRef<View>(null);
  const distributorDropdownRef = React.useRef<View>(null);
  const agentDropdownRef = React.useRef<View>(null);
  const limitTypeDropdownRef = React.useRef<View>(null);

  const inputRefs = {
    leadgerNameRef,
    realNameRef,
    cappingRef,
    dhaniRateRef,
    commissionRef,
    harupRateRef,
    harupCommissionRef,
    wapsiRef,
    grantorNameRef,
    mobileRef,
    addressRef,
    groupDropdownRef,
    distributorDropdownRef,
    agentDropdownRef,
    limitTypeDropdownRef,
  };

  const [dropdownValue3, setDropdownValue3] = React.useState<string | null>(
    null,
  );
  // Agent dropdown is now handled in useDropdownStates hook

  const findDropdownValue = (
    items: DropdownItem[],
    searchTerm: string | undefined,
    searchById: boolean = false,
  ): string | null => {
    if (!searchTerm) return null;

    const item = items.find(item => {
      if (searchById) {
        return item.value === searchTerm;
      } else {
        return item.label.toLowerCase() === searchTerm.toLowerCase();
      }
    });

    return item ? item.value : null;
  };
  React.useEffect(() => {
    if (selectedCompany) {
      // Method 1: Map by name (if parent sends name)
      const staffRoleValue = findDropdownValue(
        dropdownItems,
        selectedCompany.user_role?.name,
      );
      setDropdownValue(staffRoleValue);

      const workModeValue = findDropdownValue(
        dropdownItems2,
        selectedCompany.work_mode?.name,
      );
      setDropdownValue2(workModeValue);

      // Agent dropdown value will be set in the Formik render function
    }
  }, [selectedCompany]);

  // Trigger getLeadger when status filter changes
  React.useEffect(() => {
    getLeadger();
  }, [selectedStatus]);

  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const handleSheetChanges = (index: number) => {
    Keyboard.dismiss();
    if (index === -1) {
      // Modal is being closed - reset edit state only when user manually closes
      setIsOpenBottomSheet(false);
      setVisible(false);
      setIsEditing(false);
      setSelectedCompany(null);
      setPasswordLoading(false);
      passwordFetchedRef.current = null; // Reset password fetch ref when modal closes
    } else {
      setIsOpenBottomSheet(true);
      setVisible(true);
    }
  };
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
  const handleAddLedger = () => {
    setIsOpenBottomSheet(true);
    setSelectedCompany(null);
    setIsEditing(false);
    setDropdownValue(null);
    setDropdownValue2(null);
    setDropdownValue3(null);
    passwordFetchedRef.current = null; // Reset password fetch ref
  };
  const handleEditLedger = (item: any) => {
    console.log('Editing ledger item:', item);
    setSelectedCompany(item);
    setIsEditing(true);
    setIsOpenBottomSheet(true);
    setActiveTab(0); // Default to Info tab when editing
    passwordFetchedRef.current = null; // Reset password fetch ref for new edit
  };
  React.useEffect(() => {
    getLeadger();
  }, []);
  const { query, setQuery, filteredItems } = useSearchBar<any>(getData, {
    selector: (item) => String(item?.real_name ?? item?.name ?? ''),
    debounceMs: 200,
  });

  // i want to use this api @APIService.tsx (560-568) in @Ledger.tsx page and use generate password in password field when came from edit section
  const getLeadger = async () => {
    try {
      // Convert selected status to API query params (as object)
      let apiParams: Record<string, any> = {};

      switch (selectedStatus) {
        case 'Deleted':
          apiParams = { deleted: 1 };
          break;
        case 'Hidden':
          apiParams = { hidden: 1 };
          break;
        case 'Locked':
          apiParams = { locked: 1 };
          break;
        case 'NotActive':
          apiParams = { inactive: 1 };
          break;
        case 'Active':
        default:
          apiParams = { active: 1 };
          break;
      }

      const response = await APIService.GetLeadger(apiParams);

      if (response?.success) {
        setData(response?.data);
      }
    } catch (error) {
      console.error('Shift fetch failed', error);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await getLeadger();
    } finally {
      setRefreshing(false);
    }
  };

  // Helper: resolve ledger real_name by id for pre-filling Party Name fields during edit
  const getLedgerNameById = React.useCallback(
    (id: any): string => {
      if (!id) return '';
      const idStr = id.toString();
      const found: any = Array.isArray(getData)
        ? getData.find((row: any) => row?.id?.toString() === idStr || row?.user_id?.toString() === idStr)
        : undefined;
      return found?.real_name || found?.name || '';
    },
    [getData]
  );

  const handleCreateLeadger = async (payload: any) => {
    try {
      const response = await APIService.CreateLeadger(payload);
      if (response?.success) {
        setIsOpenBottomSheet(false);
        setIsEditing(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message,
          position: 'bottom',
        });
        getLeadger();
      } else {
        // Handle API response error (success: false)
        throw new Error(response?.message || 'Failed to create ledger');
      }
    } catch (error: any) {
      console.error('Create ledger failed', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to create ledger: ${error?.response?.data?.message || error?.message || 'Unknown error'}`,
        position: 'bottom',
      });
      throw error; // Re-throw to be caught by handleFormSubmit
    }
  };
  const handleUpdateLedger = async (payload: any) => {
    try {
      const userId = selectedCompany?.id ?? selectedCompany?.user_id;
      if (!userId) {
        console.log('Missing user id for update. Selected company object:', selectedCompany);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Cannot update: missing user id',
          position: 'bottom',
        });
        throw new Error('Missing user ID for update');
      }
      console.log('Updating ledger with ID:', userId);
      console.log('Update payload:', payload);
      console.log('API endpoint being called: api/update_user/' + userId);
      const response = await APIService.UpdateLedger(payload, userId);
      if (response?.success) {
        setIsOpenBottomSheet(false);
        setIsEditing(false);
        setSelectedCompany(null);
        setIsOpenBottomSheet(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message || 'Ledger updated successfully',
          position: 'bottom',
        });
        getLeadger();
      } else {
        // Handle API response error (success: false)
        throw new Error(response?.message || 'Failed to update ledger');
      }
    } catch (error: any) {
      console.error('Update ledger failed', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      console.error('Error message:', error?.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to update ledger: ${error?.response?.data?.message || error?.message || 'Unknown error'}`,
        position: 'bottom',
      });
      throw error; // Re-throw to be caught by handleFormSubmit
    }
  };
  const handleFormSubmit = async (values: any, { resetForm }: any) => {

    console.log('Form values:', values);
    console.log('Selected company:', selectedCompany);
    console.log('Is editing:', isEditing);
    console.log('Limit value:', values?.limit);
    console.log('Limit type will be:', values?.limit && Number(values.limit) > 0 ? 'yes' : 'no');
    console.log('Agent value from form:', values?.agent);
    console.log('Agent value type:', typeof values?.agent);
    console.log('Agent value after Number():', Number(values?.agent));
    try {
      // Common payload structure for both Create and Update
      const commonPayload = {
        // Ensure all required fields have fallback values
        real_name: values?.leadgerName || '',
        user_role: Number(values?.group) || '',
        mobile: values?.mobile || '',
        password: values?.password || '',
        address: values?.address || '',
        // Handle null/undefined numeric values safely
        dhai_rate: values?.dhaniRate ? Number(values.dhaniRate) : null,
        dhai_rate_commission: values?.commission ? Number(values.commission) : null,
        harup_rate: values?.harupRate ? Number(values.harupRate) : null,
        harup_rate_commission: values?.harupCommission ? Number(values.harupCommission) : null,
        limit_vouters_id: Number(values?.limit) || null,
        distributer_user_id: Number(values?.distributor) || null,
        agent: values?.agent && values?.agent !== '' ? Number(values.agent) : (selectedCompany?.agent_user?.id ?? ""),
        active_status: 1,
        limit_type: values?.limit && Number(values.limit) > 0 ? '1' : '2', // 'yes' if limit > 0, 'no' if limit = 0
        hide_account: 0,
        login_status: 0,
        // Handle arrays safely - check if they exist and are arrays before mapping
        third_party_commission: Array.isArray(values.tpCommissions) ? values.tpCommissions.map((item: any) => ({
          third_party_commission_userid: item.partyId,
          third_party_commission_dhai: parseFloat(item.dComm) || 0,
          third_party_commission_harup: parseFloat(item.hComm) || 0,
        })) : [],
        wapsi: values?.wapsi ? Number(values.wapsi) : null,
        wapsi_data: Array.isArray(values.tpWapsi) ? values.tpWapsi.map((item: any) => ({
          third_party_wapsi_userid: item.partyId,
          third_party_wapsi: parseFloat(item.wapsiAmount) || 0,
        })) : [],
        patti: Array.isArray(values.tpPatti) ? values.tpPatti.map((item: any) => ({
          patti_userid: item.partyId,
          patti_percentage: Number(item.percentage) || 0,
        })) : [],
      };

      console.log('Final payload being sent:', commonPayload);

      if (isEditing) {
        // Update existing ledger
        await handleUpdateLedger(commonPayload);
        // Reset form after successful update
        resetForm();
        setIsEditing(false);
        setSelectedCompany(null);
        getLeadger()
        // Clear dropdowns after successful update
        setShouldClearDropdowns(true);
      } else {
        // Create new ledger
        await handleCreateLeadger(commonPayload);
        // Reset form after successful create
        resetForm();
        // Clear dropdowns after successful create
        setShouldClearDropdowns(true);
      }
    } catch (error) {
      console.error('Form submission failed:', error);

      if (isEditing) {
        // For edit errors: Keep edit mode, don't reset form, don't clear selected company
        // This preserves the previous data and keeps the modal in edit mode
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update ledger. Please try again.',
          position: 'bottom',
        });
      } else {
        // For create errors: Reset form and clear everything
        resetForm();
        setShouldClearDropdowns(true);

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to create ledger. Form has been reset.',
          position: 'bottom',
        });
      }
    }
  };
  const handleToggleActive = async (item: any) => {
    console.log(item);
    try {
      const userId = item?.id;
      const isCurrentlyActive = item?.active_status;

      if (!userId) return;
      const payload = {
        user_id: userId,
      }
      const response = isCurrentlyActive
        ? await APIService.ToggleUserDeActive(userId)
        : await APIService.ToggleUserActive(userId);

      if (response?.success) {
        getLeadger();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2:
            response?.message ||
            `User ${isCurrentlyActive ? 'deactivated' : 'activated'
            } successfully`,
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Toggle active/inactive failed', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while updating status.',
        position: 'bottom',
      });
    }
  };

  // Account management handlers
  const handleLoginStatusToggle = async () => {
    try {
      setButtonLoading(prev => ({ ...prev, loginStatus: true }));
      const api = accountStatus.isLocked ? APIService.UnlockLeadger : APIService.LockLeadger;
      const response = await api(selectedCompany?.id);

      if (response.success) {
        setAccountStatus(prev => ({ ...prev, isLocked: !prev.isLocked }));
        getLeadger()
        Alert.alert('Success', `Ledger ${accountStatus.isLocked ? 'unlocked' : 'locked'} successfully`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update login status');
      }
    } catch (error) {
      console.error('Error updating login status:', error);
      Alert.alert('Error', 'Failed to update login status');
    } finally {
      setButtonLoading(prev => ({ ...prev, loginStatus: false }));
    }
  };

  const handleAccountStatusToggle = async () => {
    try {
      setButtonLoading(prev => ({ ...prev, accountStatus: true }));
      const api = accountStatus.isDeactivated ? APIService.ToggleUserActive : APIService.ToggleUserDeActive;
      const response = await api(selectedCompany?.id);

      if (response.success) {
        setAccountStatus(prev => ({ ...prev, isDeactivated: !prev.isDeactivated }));
        getLeadger()
        Alert.alert('Success', `Account ${accountStatus.isDeactivated ? 'activated' : 'deactivated'} successfully`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update account status');
      }
    } catch (error) {
      console.error('Error updating account status:', error);
      Alert.alert('Error', 'Failed to update account status');
    } finally {
      setButtonLoading(prev => ({ ...prev, accountStatus: false }));
    }
  };

  const handleHideToggle = async () => {
    try {
      setButtonLoading(prev => ({ ...prev, hideStatus: true }));
      const api = accountStatus.isHidden ? APIService.UnHideLeadger : APIService.HideLeadger;
      const response = await api(selectedCompany?.id);

      if (response.success) {
        setAccountStatus(prev => ({ ...prev, isHidden: !prev.isHidden }));
        getLeadger()
        Alert.alert('Success', `Ledger ${accountStatus.isHidden ? 'unhidden' : 'hidden'} successfully`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update hide status');
      }
    } catch (error) {
      console.error('Error updating hide status:', error);
      Alert.alert('Error', 'Failed to update hide status');
    } finally {
      setButtonLoading(prev => ({ ...prev, hideStatus: false }));
    }
  };

  const handleDeleteRestoreToggle = async () => {
    try {
      setButtonLoading(prev => ({ ...prev, deleteStatus: true }));
      const api = accountStatus.isDeleted ? APIService.RestoreLeadger : APIService.DeleteLeadger;
      const response = await api(selectedCompany?.id);

      if (response.success) {
        setAccountStatus(prev => ({ ...prev, isDeleted: !prev.isDeleted }));
        Alert.alert('Success', `Ledger ${accountStatus.isDeleted ? 'restored' : 'deleted'} successfully`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update delete status');
      }
    } catch (error) {
      console.error('Error updating delete status:', error);
      Alert.alert('Error', 'Failed to update delete status');
    } finally {
      setButtonLoading(prev => ({ ...prev, deleteStatus: false }));
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GradientBackground colors={["#fdf0d0", "#e0efea"]} locations={[0, 30]}>
        <SafeAreaView
          style={style.safeAreaContainer}
          edges={['top']}
        >
          <View style={style.headerContainer}>
            <ScreenHeader
              title={'Ledger'}
              navigation={navigation}
              hideBackButton={true} showDrawerButton={true}
            >
              <TouchableOpacity onPress={() => setShowSearch((s) => !s)}>
                <Ionicons name={showSearch ? 'close' : 'search'} size={20} color={showSearch ? COLORS.WHITE : COLORS.WHITE} />
              </TouchableOpacity>
            </ScreenHeader>
          </View>
          <View style={style.container}>
            <View
              style={{
                marginVertical: scale(10),
                marginHorizontal: scale(15),
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                // zIndex: 1, // Lower z-index to stay below bottom sheet
              }}
            >
              {/* Toggle between search bar and status filter/add button */}
              {!isOpenBottomSheet && (
                showSearch ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10), width: '100%' }}>
                    <View style={{ flex: 1 }}>
                      <CustomTextInput
                        placeholder="Search by party name..."
                        value={query}
                        onChangeText={setQuery}
                        style={{ backgroundColor: COLORS.WHITE, minHeight: 40, borderRadius: 8, paddingHorizontal: 12, elevation: 10 }}
                      />
                    </View>
                    <TouchableOpacity onPress={() => { setQuery(''); setShowSearch(false); }}>
                      <Ionicons name={'close-circle'} size={22} color={"red"} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: "flex-end", justifyContent: "space-between", width: '100%' }}>
                    <View style={[style.statusFilterContainer]}>
                      <CustomDropdown
                        label={"Status Filter:"}
                        open={statusDropdownOpen}
                        value={selectedStatus}
                        items={statusDropdownItems}
                        setOpen={setStatusDropdownOpen}
                        setValue={setSelectedStatus}
                        setItems={() => { }}
                        placeholder="Select Status"
                        zIndex={1}
                      />
                    </View>
                    <CustomButton
                      textColor={COLORS.WHITE}
                      title="+ Add (F2)"
                      onPress={handleAddLedger}
                      style={{ width: '40%', bottom: scale(2), paddingVertical: scale(12.0) }}
                    />
                  </View>
                )
              )}

            </View>
            <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled">
              {Array.isArray(getData) && getData.length === 0 ? (
                <Text style={style.noResultsText}>No data found</Text>
              ) : (
                <DeclareStatusCard
                  data={filteredItems}
                  config={[
                    { key: 'real_name', label: 'Party Name' },
                    { key: 'username', label: 'User Name' },
                    // { key: 'user_role', label: 'Group' },
                    // { key: 'agent_user', label: 'Agent' },
                    // { key: 'dhai_rate', label: 'Dhai' },
                    // { key: 'harup_rate', label: 'Harup' },
                    // { key: 'limit', label: 'Limit' },
                    // { key: 'wapsi', label: 'Wapsi' },
                    // { key: 'created_at', label: 'Created At' },
                    // { key: 'created_by', label: 'Created By' },
                    // { key: 'updated_at', label: 'Updated At' },
                    { key: 'updated_by', label: 'Updated By' },
                  ]}
                  isButtonOne={false}
                  actionOneLabel="Is Active"
                  actionTwoLabel="Action"
                  // statusKey="status"
                  onActionOne={handleToggleActive}
                  onActionTwo={(item: any) => {
                    handleEditLedger(item);
                    console.log(item, "[][][][][][shhshdghsghds][][][][]")
                  }}
                  refreshing={refreshing}
                  onRefresh={getData && getData.length > 0 ? onRefresh : undefined}
                />
              )}
            </ScrollView>
            {isOpenBottomSheet && (
              <BottomSheet
                backgroundStyle={{ backgroundColor: COLORS.BGFILESCOLOR }}
                ref={bottomSheetRef}
                style={{ borderWidth: 1, borderRadius: scale(10), zIndex: 10 }}
                index={0}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                onChange={handleSheetChanges}
                backdropComponent={renderBackdrop}
                enablePanDownToClose={true}
                keyboardBehavior="extend"
                keyboardBlurBehavior="restore"
                onClose={() => {
                  // Modal is being closed - reset edit state only when user manually closes
                  setIsOpenBottomSheet(false);
                  setIsEditing(false);
                  setSelectedCompany(null);
                  passwordFetchedRef.current = null; // Reset password fetch ref
                }}
              >
                <BottomSheetScrollView
                  style={{
                    backgroundColor: COLORS.BGFILESCOLOR,
                    flex: 1,
                  }}
                  contentContainerStyle={{ 
                    paddingHorizontal: 16,
                    paddingBottom: scale(350) // Drastically increase padding to ensure last inputs can be scrolled up
                  }}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Show TabHeader only when editing */}
                  {isEditing && (
                    <View style={{ marginBottom: scale(10) }}>
                      <Text style={{
                        fontSize: scale(18),
                        fontWeight: 'bold',
                        color: COLORS.BLACK,
                        textAlign: 'center',
                        marginBottom: scale(10)
                      }}>
                        Update Ledger Entry
                      </Text>
                      <Text style={{
                        fontSize: scale(12),
                        color: COLORS.BLACK,
                        textAlign: 'center',
                        marginBottom: scale(15)
                      }}>
                        Keep Records Accurate
                      </Text>
                      <TabHeader
                        tabs={["Info", "Re-Name", "Re-Config", "Password", "Account"]}
                        activeTab={activeTab}
                        onTabPress={(idx) => setActiveTab(idx)}
                        height={35}
                        textStyle={{ fontSize: scale(8) }}
                        containerStyle={{ marginHorizontal: 0, marginVertical: scale(5) }}
                      />
                    </View>
                  )}

                  <Formik
                    key={selectedCompany?.id || 'new'}
                    initialValues={{
                      leadgerName: selectedCompany?.real_name || '',
                      realName: selectedCompany?.real_name
                        || '',
                      capping: selectedCompany?.capping?.toString() || '',
                      group: selectedCompany?.user_role?.id?.toString() || '1',
                      dhaniRate: selectedCompany?.dhai_rate?.toString() || '0',
                      commission: selectedCompany?.dhai_rate_commission?.toString() || '0',
                      harupRate: selectedCompany?.harup_rate?.toString() || '0',
                      harupCommission: selectedCompany?.harup_rate_commission?.toString() || '0',
                      wMode: selectedCompany?.work_mode?.id?.toString() || '1',
                      username: selectedCompany?.username || '',
                      password: '',
                      agent: selectedCompany?.agent_user?.id?.toString() || '',
                      mobile: selectedCompany?.mobile || '',
                      address: selectedCompany?.address || '',
                      // Map API arrays into form-friendly shapes
                      tpCommissions: Array.isArray(selectedCompany?.third_party_commission)
                        ? selectedCompany.third_party_commission.map((item: any) => ({
                          partyName: getLedgerNameById(item.third_party_commission_userid),
                          partyId: item.third_party_commission_userid?.toString?.() || '',
                          dComm: item.third_party_commission_dhai?.toString?.() || '',
                          hComm: item.third_party_commission_harup?.toString?.() || '',
                        }))
                        : [],
                      wapsi: selectedCompany?.wapsi?.toString() || '0',
                      tpWapsi: Array.isArray(selectedCompany?.third_party_wapsi)
                        ? selectedCompany.third_party_wapsi.map((item: any) => ({
                          partyName: getLedgerNameById(item.third_party_wapsi_userid),
                          partyId: item.third_party_wapsi_userid?.toString?.() || '',
                          wapsiAmount: item.third_party_wapsi?.toString?.() || '',
                        }))
                        : [],
                      tpPatti: Array.isArray(selectedCompany?.patti)
                        ? selectedCompany.patti.map((item: any) => ({
                          partyName: getLedgerNameById(item.patti_userid),
                          partyId: item.patti_userid?.toString?.() || '',
                          percentage: item.patti_percentage?.toString?.() || '',
                        }))
                        : [],
                      distributor: selectedCompany?.distributer_user_id?.toString() || '',
                      limit: selectedCompany?.limit?.toString() || '0',
                      grantorName: selectedCompany?.grantor_name || '',
                    }}
                    onSubmit={handleFormSubmit}
                  >
                    {({
                      handleChange,
                      handleSubmit,
                      values,
                      errors,
                      touched,
                      setFieldValue,
                    }) => {
                      const dropdownStates = useDropdownStates();
                      const formLogic = useFormLogic(values, setFieldValue);

                      // Set agent dropdown value when editing
                      React.useEffect(() => {
                        if (selectedCompany?.agent_user?.id && dropdownStates.dropdownItems3.length > 0) {
                          const agentValue = selectedCompany.agent_user.id.toString();
                          dropdownStates.setDropdownValue3(agentValue);
                        }
                      }, [selectedCompany?.agent_user?.id, dropdownStates.dropdownItems3]);

                      // Clear all dropdowns when shouldClearDropdowns is true
                      React.useEffect(() => {
                        if (shouldClearDropdowns) {
                          dropdownStates.clearAllDropdownStates();
                          setShouldClearDropdowns(false);
                        }
                      }, [shouldClearDropdowns, dropdownStates]);

                      // Debug: Log form values when they change
                      React.useEffect(() => {
                        console.log('Form values changed:', values);
                        console.log('Agent value in form:', values.agent);
                      }, [values]);

                      // Fetch password when Password tab is opened during edit
                      React.useEffect(() => {
                        const fetchPassword = async () => {
                          // Only fetch if: editing mode, Password tab is active, username exists, and we haven't fetched for this username yet
                          if (isEditing && activeTab === 3 && selectedCompany?.username) {
                            // Check if we've already fetched password for this username
                            if (passwordFetchedRef.current === selectedCompany.username && values.password) {
                              return; // Already fetched and password is set
                            }

                            try {
                              setPasswordLoading(true);
                              // API expects (params, userName) - pass empty object as first param, username as second
                              const response = await APIService.getPassword({}, selectedCompany.username);
                              if (response?.success && response?.data) {
                                setFieldValue('password', response.data);
                                passwordFetchedRef.current = selectedCompany.username; // Mark as fetched
                                Toast.show({
                                  type: 'success',
                                  text1: 'Success',
                                  text2: 'Password generated successfully',
                                  position: 'bottom',
                                });
                              } else {
                                Toast.show({
                                  type: 'error',
                                  text1: 'Error',
                                  text2: response?.message || 'Failed to generate password',
                                  position: 'bottom',
                                });
                              }
                            } catch (error: any) {
                              console.error('Get password failed', error);
                              Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: error?.response?.data?.message || error?.message || 'Failed to generate password',
                                position: 'bottom',
                              });
                            } finally {
                              setPasswordLoading(false);
                            }
                          }
                        };
                        fetchPassword();
                      }, [isEditing, activeTab, selectedCompany?.username, setFieldValue, values.password]);
                      const tpCommission = useTPCommission(
                        values,
                        setFieldValue,
                        formLogic.editingTPIndex,
                      );

                      const tpWapsi = useTPWapsi(
                        values,
                        setFieldValue,
                        formLogic.editingTPWapsiIndex,
                        formLogic.setEditingTPWapsiIndex,
                      );
                      const tpPatti = useTPPatti(
                        values,
                        setFieldValue,
                        formLogic.editingPattiIndex,
                        formLogic.setEditingPattiIndex,
                      );

                      return (
                        <View style={{ marginBottom: scale(30) }}>
                          {/* Show content based on active tab when editing */}
                          {isEditing ? (
                            <>
                              {activeTab === 0 && (
                                <View>
                                  {/* Info tab - Read-only ledger data display */}
                                  <View style={style.infoContainer}>
                                    {/* First Row */}
                                    <View style={style.infoRow}>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>Distributor</Text>
                                        <TextInput
                                          style={[style.infoInput, style.disabledInput]}
                                          value={values.distributor}
                                          editable={false}
                                          placeholder=""
                                        />
                                      </View>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>Rate</Text>
                                        <TextInput
                                          style={[style.infoInput, style.disabledInput]}
                                          value={`${values.dhaniRate || '0'}/${values.harupRate || '0'} ${values.commission || '0'}/${values.harupCommission || '0'}`}
                                          editable={false}
                                          placeholder=""
                                        />
                                      </View>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>Wapsi</Text>
                                        <TextInput
                                          style={[style.infoInput, style.disabledInput]}
                                          value={values.wapsi || '0'}
                                          editable={false}
                                          placeholder=""
                                        />
                                      </View>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>3rd Party Commission</Text>
                                        <TextInput
                                          style={[style.infoInput, style.disabledInput]}
                                          value={Array.isArray(values.tpCommissions) && values.tpCommissions.length > 0 ? 'D-O/H-O | Active' : 'D-O/H-O | -- 0/0'}
                                          editable={false}
                                        />
                                      </View>
                                    </View>

                                    {/* Second Row */}
                                    <View style={style.infoRow}>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>Limit</Text>
                                        <TextInput
                                          style={[style.infoInput, style.disabledInput]}
                                          value={values.capping || '0'}
                                          editable={false}
                                          placeholder=""
                                        />
                                      </View>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>Agent</Text>
                                        <TextInput
                                          style={[style.infoInput, style.disabledInput]}
                                          value={selectedCompany?.agent_user?.name}
                                          editable={false}
                                          placeholder=""
                                        />
                                      </View>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>Real Name</Text>
                                        <TextInput
                                          style={[style.infoInput, style.disabledInput]}
                                          value={values.realName}
                                          editable={false}
                                        />
                                      </View>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>3rd Party Wapsi</Text>
                                        <TextInput
                                          style={[style.infoInput, style.disabledInput]}
                                          value={Array.isArray(values.tpWapsi) && values.tpWapsi.length > 0 ? 'Active 0%' : '0%'}
                                          editable={false}
                                          placeholder=""
                                        />
                                      </View>
                                    </View>

                                    {/* Third Row */}
                                    <View style={style.infoRow}>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>Grantor</Text>
                                        <TextInput
                                          placeholder=''
                                          placeholderTextColor="#888"
                                          style={[style.infoInput, style.disabledInput]}
                                          value={values.grantorName}
                                          editable={false}
                                        />
                                      </View>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>Mobile</Text>
                                        <TextInput
                                          placeholder='Mobile'
                                          style={[style.infoInput, style.disabledInput]}
                                          value={values.mobile}
                                          editable={false}
                                        />
                                      </View>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>Address</Text>
                                        <TextInput
                                          placeholder='Address'
                                          style={[style.infoInput, style.disabledInput]}
                                          value={values.address}
                                          editable={false}
                                        />
                                      </View>
                                      <View style={style.infoField}>
                                        <Text style={style.infoLabel}>Patti</Text>
                                        <TextInput
                                          style={[style.infoInput, style.disabledInput]}
                                          value={Array.isArray(values.tpPatti) && values.tpPatti.length > 0 ? 'Active' : '--'}
                                          editable={false}
                                          placeholder="Patti"
                                        />
                                      </View>
                                    </View>
                                  </View>
                                </View>
                              )}

                              {activeTab === 1 && (
                                <View>
                                  <CustomTextInput
                                    label="Ledger Name"
                                    value={values.leadgerName}
                                    onChangeText={handleChange('leadgerName')}
                                    onFocus={() => setFocusedField(null)}
                                    returnKeyType="done"
                                    onSubmitEditing={() => handleSubmit()}
                                  />
                                </View>
                              )}

                              {activeTab === 2 && (
                                <View>
                                  {/* Re-Config tab - Same layout as Create Ledger */}


                                  <RateCommissionFields
                                    values={values}
                                    errors={errors}
                                    touched={touched}
                                    handleChange={handleChange}
                                    formLogic={formLogic}
                                    inputRefs={inputRefs}
                                    setFocusedField={setFocusedField}
                                  />

                                  <TPCommissionSection
                                    values={values}
                                    tpCommission={tpCommission}
                                    formLogic={formLogic}
                                    dropdownItemsParty={dropdownStates.dropdownItemsParty}
                                    setDropdownValueParty={
                                      dropdownStates.setDropdownValueParty
                                    }
                                  />

                                  <WapsiSection
                                    values={values}
                                    errors={errors}
                                    touched={touched}
                                    handleChange={handleChange}
                                    tpWapsi={tpWapsi}
                                    formLogic={formLogic}
                                    inputRefs={inputRefs}
                                    setFocusedField={setFocusedField}
                                  />

                                  <PattiSection
                                    values={values}
                                    tpPatti={tpPatti}
                                    formLogic={formLogic}
                                    allLedgers={getData}
                                  />
                                </View>
                              )}

                              {activeTab === 3 && (
                                <View>
                                   <CustomTextInput
                                     label="Password"
                                     value={values.password}
                                     onChangeText={handleChange('password')}
                                     secureTextEntry={false}
                                     editable={!passwordLoading}
                                     onFocus={() => setFocusedField(null)}
                                     returnKeyType="done"
                                     onSubmitEditing={() => handleSubmit()}
                                   />
                                  {passwordLoading && (
                                    <View style={{ marginTop: scale(10), alignItems: 'center' }}>
                                      <ActivityIndicator size="small" color={COLORS.BLACK} />
                                      <Text style={{ marginTop: scale(5), fontSize: scale(12), color: COLORS.BLACK }}>
                                        Generating password...
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              )}

                              {activeTab === 4 && (
                                <View>
                                  {/* Account tab - 4 status buttons */}
                                  <View style={style.accountContainer}>
                                    {/* Login Status Button */}
                                    <View style={style.buttonContainer}>
                                      <Text style={style.buttonLabel}>Login Status</Text>
                                      <TouchableOpacity
                                        style={[
                                          style.statusButton,
                                          accountStatus.isLocked ? style.inactiveButton : style.activeButton
                                        ]}
                                        onPress={() => handleLoginStatusToggle()}
                                        disabled={buttonLoading.loginStatus}
                                      >
                                        <Text style={[
                                          style.buttonText,
                                          accountStatus.isLocked ? style.inactiveButtonText : style.activeButtonText
                                        ]}>
                                          {accountStatus.isLocked ? 'Inactive' : 'Active'}
                                        </Text>
                                        {buttonLoading.loginStatus && <ActivityIndicator size="small" color="#FFF" style={{ marginLeft: 8 }} />}
                                      </TouchableOpacity>
                                    </View>

                                    {/* Account Status Button */}
                                    <View style={style.buttonContainer}>
                                      <Text style={style.buttonLabel}>Account Status</Text>
                                      <TouchableOpacity
                                        style={[
                                          style.statusButton,
                                          accountStatus.isDeactivated ? style.inactiveButton : style.activeButton
                                        ]}
                                        onPress={() => handleAccountStatusToggle()}
                                        disabled={buttonLoading.accountStatus}
                                      >
                                        <Text style={[
                                          style.buttonText,
                                          accountStatus.isDeactivated ? style.inactiveButtonText : style.activeButtonText
                                        ]}>
                                          {accountStatus.isDeactivated ? 'Inactive' : 'Active'}
                                        </Text>
                                        {buttonLoading.accountStatus && <ActivityIndicator size="small" color="#FFF" style={{ marginLeft: 8 }} />}
                                      </TouchableOpacity>
                                    </View>

                                    {/* Is Hide Button */}
                                    <View style={style.buttonContainer}>
                                      <Text style={style.buttonLabel}>Is Hide</Text>
                                      <TouchableOpacity
                                        style={[
                                          style.statusButton,
                                          accountStatus.isHidden ? style.hiddenButton : style.visibleButton
                                        ]}
                                        onPress={() => handleHideToggle()}
                                        disabled={buttonLoading.hideStatus}
                                      >
                                        <Text style={[
                                          style.buttonText,
                                          accountStatus.isHidden ? style.hiddenButtonText : style.visibleButtonText
                                        ]}>
                                          {accountStatus.isHidden ? 'Hidden' : 'Visible'}
                                        </Text>
                                        {buttonLoading.hideStatus && <ActivityIndicator size="small" color="#FFF" style={{ marginLeft: 8 }} />}
                                      </TouchableOpacity>
                                    </View>

                                    {/* Delete/Restore Button */}
                                    <View style={style.buttonContainer}>
                                      <Text style={style.buttonLabel}>Delete/Restore</Text>
                                      <TouchableOpacity
                                        style={[
                                          style.statusButton,
                                          accountStatus.isDeleted ? style.restoreButton : style.deleteButton
                                        ]}
                                        onPress={() => handleDeleteRestoreToggle()}
                                        disabled={buttonLoading.deleteStatus}
                                      >
                                        <Text style={[
                                          style.buttonText,
                                          accountStatus.isDeleted ? style.restoreButtonText : style.deleteButtonText
                                        ]}>
                                          {accountStatus.isDeleted ? 'Restore' : 'Delete Now'}
                                        </Text>
                                        {buttonLoading.deleteStatus && <ActivityIndicator size="small" color="#FFF" style={{ marginLeft: 8 }} />}
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Show all form sections when adding new (not editing) */}
                              <BasicFormFields
                                values={values}
                                errors={errors}
                                touched={touched}
                                handleChange={handleChange}
                                dropdownProps={{ ...dropdownStates, setFieldValue }}
                                inputRefs={inputRefs}
                                focusedField={focusedField}
                                setFocusedField={setFocusedField}
                              />

                               <RateCommissionFields
                                values={values}
                                errors={errors}
                                touched={touched}
                                handleChange={handleChange}
                                formLogic={formLogic}
                                inputRefs={inputRefs}
                                setFocusedField={setFocusedField}
                              />

                              <TPCommissionSection
                                values={values}
                                tpCommission={tpCommission}
                                formLogic={formLogic}
                                dropdownItemsParty={dropdownStates.dropdownItemsParty}
                                setDropdownValueParty={
                                  dropdownStates.setDropdownValueParty
                                }
                              />

                              <WapsiSection
                                values={values}
                                errors={errors}
                                touched={touched}
                                handleChange={handleChange}
                                tpWapsi={tpWapsi}
                                formLogic={formLogic}
                                inputRefs={inputRefs}
                                setFocusedField={setFocusedField}
                              />

                              <PattiSection
                                values={values}
                                tpPatti={tpPatti}
                                formLogic={formLogic}
                                allLedgers={getData}
                              />

                              <ContactAndAdditionalFields
                                values={values}
                                errors={errors}
                                touched={touched}
                                handleChange={handleChange}
                                dropdownStates={dropdownStates}
                                setFieldValue={setFieldValue}
                                inputRefs={inputRefs}
                                focusedField={focusedField}
                                setFocusedField={setFocusedField}
                              />
                            </>
                          )}

                          {/* Show save button only when editing and on Re-Config tab, or when adding new */}
                          {((isEditing && activeTab === 2) || !isEditing) && (
                            <CustomButton
                              title={isEditing ? "Submit" : "Save"}
                              onPress={handleSubmit}
                              textColor={COLORS.BGFILESCOLOR}
                            />
                          )}

                          {/* Show submit button for other tabs when editing */}
                          {isEditing && activeTab !== 2 && activeTab !== 4 && (
                            <CustomButton
                              title="Submit"
                              onPress={handleSubmit}
                              textColor={COLORS.BGFILESCOLOR}
                            />
                          )}

                          {/* All modals with proper props */}
                          <TPCommissionModal
                            isOpen={tpCommission.isTPModalOpen}
                            modalData={tpCommission.tpModalData}
                            setModalData={tpCommission.setTpModalData}
                            onClose={tpCommission.closeModal}
                            onAdd={tpCommission.handleAddTPCommission}
                            values={values}
                            editingTPIndex={formLogic.editingTPIndex}
                            dropdownProps={{
                              openDropdownParty: dropdownStates.openDropdownParty,
                              setOpenDropdownParty:
                                dropdownStates.setOpenDropdownParty,
                              dropdownValueParty:
                                dropdownStates.dropdownValueParty,
                              setDropdownValueParty:
                                dropdownStates.setDropdownValueParty,
                              dropdownItemsParty:
                                dropdownStates.dropdownItemsParty,
                              setDropdownItemsParty:
                                dropdownStates.setDropdownItemsParty,
                              ledgerLoading: dropdownStates.ledgerLoading,
                            }}
                          />
                          <WapsiModal
                            isOpen={tpWapsi.isTPWapsiModalOpen}
                            modalData={tpWapsi.tpWapsiModalData}
                            setModalData={tpWapsi.setTpWapsiModalData}
                            onClose={tpWapsi.closeModal}
                            onAdd={tpWapsi.handleAddTPWapsi}
                            values={values}
                            editingTPWapsiIndex={formLogic.editingTPWapsiIndex}
                            calculateRemainingWapsi={
                              tpWapsi.calculateRemainingWapsi
                            }
                            dropdownProps={{
                              openDropdownWapsiParty:
                                dropdownStates.openDropdownWapsiParty,
                              setOpenDropdownWapsiParty:
                                dropdownStates.setOpenDropdownWapsiParty,
                              dropdownValueWapsiParty:
                                dropdownStates.dropdownValueWapsiParty,
                              setDropdownValueWapsiParty:
                                dropdownStates.setDropdownValueWapsiParty,
                              dropdownItemsWapsiParty:
                                dropdownStates.dropdownItemsWapsiParty,
                              setDropdownItemsWapsiParty:
                                dropdownStates.setDropdownItemsWapsiParty,
                              ledgerLoading: dropdownStates.ledgerLoading,
                            }}
                            onDelete={tpWapsi.handleDeleteTPWapsi}
                          />
                          <PattiModal
                            isOpen={tpPatti.isPattiModalOpen}
                            modalData={tpPatti.pattiModalData}
                            setModalData={tpPatti.setPattiModalData}
                            onClose={tpPatti.closeModal}
                            onAdd={tpPatti.handleAddPatti}
                            values={values}
                            editingPattiIndex={formLogic.editingPattiIndex}
                            calculateRemainingPercentage={
                              tpPatti.calculateRemainingPercentage
                            }
                            dropdownProps={{
                              openDropdownPattiParty:
                                dropdownStates.openDropdownPattiParty,
                              setOpenDropdownPattiParty:
                                dropdownStates.setOpenDropdownPattiParty,
                              dropdownValuePattiParty:
                                dropdownStates.dropdownValuePattiParty,
                              setDropdownValuePattiParty:
                                dropdownStates.setDropdownValuePattiParty,
                              dropdownItemsPattiParty:
                                dropdownStates.dropdownItemsPattiParty,
                              setDropdownItemsPattiParty:
                                dropdownStates.setDropdownItemsPattiParty,
                              ledgerLoading: dropdownStates.ledgerLoading,
                            }}
                          />
                        </View>
                      );
                    }}
                  </Formik>
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
  flexSingleColumb: {
    width: '48%',
  },
  flexDoubleColumb: { flexDirection: 'row', justifyContent: 'space-between' },
  container: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: '#fef7e5',
    paddingTop: 0, // Let SafeAreaView handle top padding
  },
  headerContainer: {
    backgroundColor: '#fef7e5',
    paddingTop: 0,
    zIndex: 1000, // Ensure header stays on top
  },
  // Re-Config tab styles
  reConfigContainer: {
    flexDirection: 'row',
    gap: scale(15),
  },
  commissionSection: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  thirdPartySection: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  colorBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  submitButton: {
    backgroundColor: '#1F2937',
    marginTop: 10,
  },
  tpInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  tpInputGroup: {
    flex: 1,
  },
  tpInputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 5,
    fontWeight: '500',
  },
  tpInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  tpDropdown: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  addButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tableContainer: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 50,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  summarySection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    // backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: scale(15),
  },
  infoRow: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(10),
  },
  infoField: {
    flex: 1,
    marginHorizontal: scale(5),
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: scale(5),
    fontWeight: '500',
  },
  infoInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: '#888',
  },
  // Account tab styles
  accountContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 15,
    gap: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  statusButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  activeButton: {
    backgroundColor: '#10B981',
  },
  inactiveButton: {
    backgroundColor: '#EF4444',
  },
  visibleButton: {
    backgroundColor: '#10B981',
  },
  hiddenButton: {
    backgroundColor: '#EF4444',
  },
  deleteButton: {
    backgroundColor: '#10B981',
  },
  restoreButton: {
    backgroundColor: '#059669',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  inactiveButtonText: {
    color: '#FFFFFF',
  },
  visibleButtonText: {
    color: '#FFFFFF',
  },
  hiddenButtonText: {
    color: '#FFFFFF',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
  restoreButtonText: {
    color: '#FFFFFF',
  },
  // Status filter dropdown styles
  statusFilterContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // gap: scale(10),
    width: '57%',
  },
  statusFilterLabel: {
    fontSize: scale(14),
    fontWeight: '600',
    color: COLORS.BLACK,
  },
});
export default Ledger;
