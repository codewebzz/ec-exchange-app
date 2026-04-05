import React, { useState } from 'react';
import {
  ScrollView,
  Button,
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
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
import GradientBackground from '../../../components/GradientBackground';
const AddStaffSchema = Yup.object().shape({
  staffName: Yup.string().required('Staff Name is required'),
  role: Yup.string().required('Role is required'),
  wMode: Yup.string().required('Work Mode is required'),
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  agent: Yup.string().required('Agent is required'),
  mobile: Yup.string().required('Mobile is required').matches(/^[0-9]{10}$/, 'Mobile must be 10 digits'),
  address: Yup.string().required('Address is required'),
});

// Edit schemas
const EditInfoSchema = Yup.object().shape({
  staffName: Yup.string().required('Staff Name is required'),
  role: Yup.string().required('Role is required'),
  wMode: Yup.string().required('Work Mode is required'),
  username: Yup.string().required('Username is required'),
  agent: Yup.string().required('Agent is required'),
  mobile: Yup.string().required('Mobile is required').matches(/^[0-9]{10}$/, 'Mobile must be 10 digits'),
  address: Yup.string().required('Address is required'),
});

const EditPasswordSchema = Yup.object().shape({
  password: Yup.string().required('Password is required'),
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
const Staff = ({ navigation }: any) => {
  const [open, setOpen] = useState(false);
  const shifts = useSelector((state: any) => state.shift);
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [getData, setData] = useState([]);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownValue, setDropdownValue] = React.useState<string | null>(null);
  const [dropdownLabel, setDropdownLabel] = React.useState(null);
  const [dropdownItems, setDropdownItems] = React.useState([
    // { label: 'admin', value: '1' },
    // { label: 'fanter', value: '2' },
    // { label: 'owner', value: '3' },
    // { label: 'super admin', value: '4' },
    // { label: 'cash agent', value: '5' },
    // { label: 'data entry operator', value: '6' },
  ]);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [openDropdown2, setOpenDropdown2] = React.useState(false);
  const [dropdownValue2, setDropdownValue2] = React.useState<string | null>(
    null,
  );
  const [dropdownLabel2, setDropdownLabel2] = React.useState(null);
  const [dropdownItems2, setDropdownItems2] = React.useState([
    { label: 'Common', value: '1' },
    { label: 'Whatsapp', value: '2' },
    { label: 'Calling', value: '3' },
  ]);
  const [openDropdown3, setOpenDropdown3] = React.useState(false);
  const [dropdownValue3, setDropdownValue3] = React.useState<string | null>(
    null,
  );
  const [dropdownItems3, setDropdownItems3] = React.useState([
    // { label: 'Bhasker-Leaged-Cash', value: '1' },
    // { label: 'Suresh-Leaged-Cash', value: '2' },
    // { label: 'Umesh-Leaged-Cash', value: '3' },
  ]);
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<boolean>(false);
  const statusDropdownItems = [
    { label: 'Active', value: 'Active' },
    { label: 'NotActive', value: 'NotActive' },
    { label: 'Hidden', value: 'Hidden' },
    { label: 'Deleted', value: 'Deleted' },
    // { label: 'Locked', value: 'Locked' },
  ];
  const { query, setQuery, filteredItems } = useSearchBar<any>(getData, {
    selector: (item) => String(item?.staff_name ?? ''),
    debounceMs: 200,
  });
  React.useEffect(() => {
    getStaff();
  }, [selectedStatus]);
  const getStaff = async () => {
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
        // case 'Locked':
        //   apiParams = { locked: 1 };
        //   break;
        case 'NotActive':
          apiParams = { inactive: 1 };
          break;
        case 'Active':
        default:
          apiParams = { active: 1 };
          break;
      }

      const response = await APIService.GetStaff(apiParams);
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
      await getStaff();
    } finally {
      setRefreshing(false);
    }
  };
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
        selectedCompany.staff_role?.name,
      );
      setDropdownValue(staffRoleValue);

      const workModeValue = findDropdownValue(
        dropdownItems2,
        selectedCompany.work_mode?.name,
      );
      setDropdownValue2(workModeValue);

      const agentValue = findDropdownValue(
        dropdownItems3,
        selectedCompany.agent?.name,
      );
      setDropdownValue3(agentValue);

    }
  }, [selectedCompany]);

  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const handleSheetChanges = (index: number) => {
    Keyboard.dismiss();
    if (index === -1) {
      setIsOpenBottomSheet(false);
      setVisible(false);
      setIsEditing(false);
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
  const handleClosePress = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
    setIsOpenBottomSheet(false);
    setVisible(false);
    setIsEditing(false);
  };
  const handleAddShift = () => {
    setIsOpenBottomSheet(true);
    setSelectedCompany(null);
    setIsEditing(false);
    setDropdownValue(null);
    setDropdownValue2(null);
    setDropdownValue3(null);
  };
  const handleEditShift = (item: any) => {
    setSelectedCompany(item);
    setIsEditing(true);
    setIsOpenBottomSheet(true);
  };
  const [activeTab, setActiveTab] = useState(0);

  // const getStaff = async () => {
  //   try {
  //     const response = await APIService.GetStaff();
  //     if (response?.success) {
  //       setData(response?.data);
  //     }
  //   } catch (error) {
  //     console.error('Shift fetch failed', error);
  //   }
  // };
  const handleCreateStaff = async (values: any) => {
    try {
      const payload = {
        staff_name: values?.staffName || '',
        staff_role: values?.role !== null && values?.role !== undefined && values?.role !== '' ? Number(values.role) : null,
        agent_id: values?.agent !== null && values?.agent !== undefined && values?.agent !== '' ? Number(values.agent) : 0,
        password: values?.password || '',
        mobile: values?.mobile || '',
        address: values?.address || '',
        username: values?.username || '',
        work_mode: values?.wMode !== null && values?.wMode !== undefined && values?.wMode !== '' ? Number(values.wMode) : null,
      };
      const response = await APIService.CreateStaff(payload);
      if (response?.success) {
        setIsOpenBottomSheet(false);
        setIsEditing(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message,
          position: 'bottom',
        });
        getStaff();
      }
    } catch (error) {
      console.error('Create shift failed', error);
    }
  };
  const handleUpdateShift = async (values: any) => {
    try {
      const payload = {
        // staff_name: values?.staffName || '',
        staff_role: values?.role !== null && values?.role !== undefined && values?.role !== '' ? Number(values.role) : null,
        agent_id: values?.agent !== null && values?.agent !== undefined && values?.agent !== '' ? Number(values.agent) : 0,
        password: values?.password || '',
        mobile: values?.mobile || '',
        address: values?.address || '',
        // username: values?.username || '',
        work_mode: values?.wMode !== null && values?.wMode !== undefined && values?.wMode !== '' ? Number(values.wMode) : null,
      };

      const response = await APIService.UpdateStaff(payload, selectedCompany?.id);
      if (response?.success) {
        setIsOpenBottomSheet(false);
        setIsEditing(false);
        setSelectedCompany(null);
        setIsOpenBottomSheet(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message || 'Shift updated successfully',
          position: 'bottom',
        });
        getStaff();
      }
    } catch (error) {
      console.error('Update shift failed', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update shift',
        position: 'bottom',
      });
    }
  };
  const handleFormSubmit = (values: any, { resetForm }: any) => {
    if (isEditing) {
      resetForm();
      handleUpdateShift(values);
    } else {
      resetForm();
      handleCreateStaff(values);
    }
  };
  React.useEffect(() => {
    fetchLedgerData();
    fetchAgentData();
  }, []);

  // Fetch ledger dropdown data
  const fetchLedgerData = async () => {
    try {
      setLedgerLoading(true);
      const response = await APIService.roleDropDownAPI();
      console.log('Ledger data response:', response);

      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format for ledgers
        const transformedLedgers = response.data.map((ledger: any) => ({
          label: ledger.real_name || ledger.name || 'Unknown Ledger',
          value: ledger.id?.toString() || ledger.ledger_id?.toString() || ''
        }));
        setDropdownItems(transformedLedgers);
        console.log('Transformed ledger items:', transformedLedgers);
      } else {
        console.log('No ledger data found or API error');
        setDropdownItems([]);
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setDropdownItems([]);
    } finally {
      setLedgerLoading(false);
    }
  };
  const fetchAgentData = async () => {
    try {
      setLedgerLoading(true);
      const response = await APIService.getMasterLedgerAgent();
      console.log('Ledger data response:', response);

      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format for ledgers
        const transformedLedgers = response.data.map((ledger: any) => ({
          label: ledger.real_name || ledger.name || 'Unknown Ledger',
          value: ledger.id?.toString() || ledger.ledger_id?.toString() || ''
        }));
        setDropdownItems3(transformedLedgers);
        console.log('Transformed ledger items:', transformedLedgers);
      } else {
        console.log('No ledger data found or API error');
        setDropdownItems3([]);
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setDropdownItems3([]);
    } finally {
      setLedgerLoading(false);
    }
  };
  const handleToggleActive = async (item: any) => {
    console.log(item)
    try {
      const userId = item?.id;
      const isCurrentlyActive = item?.active_status;

      if (!userId) return;

      const response = isCurrentlyActive
        ? await APIService.ToggleStaffDeActive(userId)
        : await APIService.ToggleStaffActive(userId);

      if (response?.success) {
        getStaff();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message || `User ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully`,
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GradientBackground colors={["#fdf0d0", "#e0efea"]} locations={[0, 30]}>
        <SafeAreaView
          style={style.safeAreaContainer}
          edges={['top', 'left', 'right']}
        >
          <ScreenHeader
            title={'Staff'}
            navigation={navigation}
            hideBackButton={true} showDrawerButton={true}
          >
            <TouchableOpacity onPress={() => setShowSearch((s) => !s)}>
              <Ionicons name={showSearch ? null : 'search'} size={20} color={showSearch ? "transparent" : COLORS.WHITE} />
            </TouchableOpacity>
          </ScreenHeader>
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
              {!isOpenBottomSheet && (
                showSearch ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10), width: '100%' }}>
                    <View style={{ flex: 1 }}>
                      <CustomTextInput
                        placeholder="Search staff by name..."
                        value={query}
                        onChangeText={setQuery}
                        style={{ backgroundColor: COLORS.WHITE, minHeight: 40, borderRadius: 8, paddingHorizontal: 12 }}
                      />
                    </View>
                    <TouchableOpacity onPress={() => { setQuery(''); setShowSearch(false); }}>
                      <Ionicons name={'close-circle'} size={22} color={"red"} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(4), width: '100%', justifyContent: 'space-between' }}>
                    <View style={[style.statusFilterContainer, { top: -10 }]}>
                      <CustomDropdown
                        label={undefined}
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
                      title="+ Add Staff"
                      onPress={handleAddShift}
                      style={{ width: '50%' }}
                    />
                  </View>
                )
              )}

            </View>
            {/* <View
            style={{
              marginVertical: scale(10),
              marginHorizontal: scale(15),
              alignItems: 'flex-end',
            }}
          >
           
          </View> */}
            <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled">
              {Array.isArray(getData) && getData.length === 0 ? (
                <Text style={style.noResultsText}>No data found</Text>
              ) : (<DeclareStatusCard
                data={filteredItems}
                config={[
                  { key: 'staff_name', label: 'Party Name' },
                  { key: 'username', label: 'User Name' },
                  { key: 'updated_by', label: 'Updated By' },
                  { key: 'updated_at', label: 'Updated At' },
                ]}
                actionOneLabel="Is Active"
                actionTwoLabel="Action"
                // statusKey="status"
                onActionOne={handleToggleActive}
                onActionTwo={(item: any) => {
                  handleEditShift(item);
                }}
                refreshing={refreshing}
                onRefresh={getData && getData.length > 0 ? onRefresh : undefined}
              />)}
            </ScrollView>
            {isOpenBottomSheet && (
              <BottomSheet
                backgroundStyle={{ backgroundColor: COLORS.BGFILESCOLOR }}
                ref={bottomSheetRef}
                style={{ borderWidth: 1, borderRadius: scale(10) }}
                index={0}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                onChange={handleSheetChanges}
                backdropComponent={renderBackdrop}
                enablePanDownToClose={true}
                onClose={() => {
                  setIsOpenBottomSheet(false);
                  setIsEditing(false);
                }}
              >
                <BottomSheetScrollView
                  style={{
                    padding: 16,
                    backgroundColor: COLORS.BGFILESCOLOR,
                    flex: 1,
                  }}
                  keyboardShouldPersistTaps="handled"
                >
                  <Formik
                    key={(selectedCompany?.id ?? 'new').toString()}
                    initialValues={{
                      staffName: selectedCompany?.staff_name || '',
                      role: findDropdownValue(dropdownItems, selectedCompany?.staff_role?.name) || '',
                      wMode: findDropdownValue(dropdownItems2, selectedCompany?.work_mode?.name) || '',
                      username: selectedCompany?.username || '',
                      password: '',
                      agent: findDropdownValue(dropdownItems3, selectedCompany?.agent?.name) || '',
                      mobile: selectedCompany?.mobile || '',
                      address: selectedCompany?.address || '',
                    }}
                    enableReinitialize={false}
                    validationSchema={isEditing ? (activeTab === 1 ? EditPasswordSchema : EditInfoSchema) : AddStaffSchema}
                    onSubmit={handleFormSubmit}
                  >
                    {({
                      handleChange,
                      handleSubmit,
                      values,
                      errors,
                      touched,
                      setFieldValue,
                    }) => (
                      <View>
                        {!isEditing ? (
                          <View>
                            <CustomTextInput
                              label="Shaff Name"
                              value={values.staffName}
                              onChangeText={handleChange('staffName')}
                              error={
                                touched.staffName &&
                                  typeof errors.staffName === 'string'
                                  ? errors.staffName
                                  : undefined
                              }
                            />

                            <CustomDropdown
                              label="Role"
                              open={openDropdown}
                              value={dropdownValue}
                              items={dropdownItems}
                              setOpen={setOpenDropdown}
                              setValue={(val: any) => {
                                setDropdownValue(val());
                                setFieldValue('role', val());
                              }}
                              setItems={setDropdownItems}
                              error={errors.role}
                            />

                            <View style={style.flexSingleColumb}>
                              <CustomDropdown
                                label="W-Mode"
                                open={openDropdown2}
                                value={dropdownValue2}
                                items={dropdownItems2}
                                setOpen={setOpenDropdown2}
                                setValue={(val: any) => {
                                  setDropdownValue2(val());
                                  setFieldValue('wMode', val());
                                }}
                                setItems={setDropdownItems2}
                                error={errors.wMode}
                              />
                            </View>
                            <View style={style.flexSingleColumb}>
                              <CustomTextInput
                                label="UserName"
                                value={values.username}
                                onChangeText={handleChange('username')}
                                error={typeof errors.username === 'string' ? errors.username : undefined}
                              />
                            </View>



                            <View style={style.flexSingleColumb}>
                              <CustomTextInput
                                label="Password"
                                value={values.password}
                                onChangeText={handleChange('password')}
                                error={typeof errors.password === 'string' ? errors.password : undefined}
                              />
                            </View>
                            <View style={style.flexSingleColumb}>
                              <CustomDropdown
                                label="Agent"
                                open={openDropdown3}
                                value={dropdownValue3}
                                items={dropdownItems3}
                                setOpen={setOpenDropdown3}
                                setValue={(val: any) => {
                                  setDropdownValue3(val());
                                  setFieldValue('agent', val());
                                }}
                                setItems={setDropdownItems3}
                                error={errors.agent}
                              />
                            </View>

                            <CustomTextInput
                              label="Mobile"
                              value={values.mobile}
                              onChangeText={handleChange('mobile')}
                              error={
                                touched.mobile &&
                                  typeof errors.mobile === 'string'
                                  ? errors.mobile
                                  : undefined
                              }
                              keyboardType="numeric"
                              maxLength={10}
                            />
                            <CustomTextInput
                              label="Address"
                              value={values.address}
                              onChangeText={handleChange('address')}
                              error={
                                touched.address &&
                                  typeof errors.address === 'string'
                                  ? errors.address
                                  : undefined
                              }
                            />
                            <View style={{ marginVertical: scale(20) }}>

                              <CustomButton
                                title="Save"
                                onPress={() => {
                                  handleSubmit();
                                }}
                                textColor={COLORS.WHITE}
                              />
                            </View>
                          </View>
                        ) : (
                          <View>
                            <TabHeader
                              tabs={['Info', 'Password']}
                              onTabPress={setActiveTab}
                              activeTab={activeTab}
                              // Custom styling options
                              backgroundColor="#E8E8E8"
                              activeBackgroundColor={COLORS.BGFILESCOLOR}
                              borderRadius={10}
                              height={40}
                              containerStyle={{ marginHorizontal: 30 }}
                              activeTextStyle={{
                                color: COLORS.BLACK,
                                fontWeight: 'bold',
                              }}
                              textStyle={{ fontSize: 14 }}
                            />
                            {activeTab === 0 ? (
                              <View>
                                <CustomDropdown
                                  label="Role"
                                  open={openDropdown}
                                  value={dropdownValue}
                                  items={dropdownItems}
                                  setOpen={setOpenDropdown}
                                  setValue={(val: any) => {
                                    setDropdownValue(val());
                                    setFieldValue('role', val());
                                  }}
                                  setItems={setDropdownItems}
                                  error={errors.role}
                                />
                                <CustomDropdown
                                  label="W-Mode"
                                  open={openDropdown2}
                                  value={dropdownValue2}
                                  items={dropdownItems2}
                                  setOpen={setOpenDropdown2}
                                  setValue={(val: any) => {
                                    setDropdownValue2(val());
                                    setFieldValue('wMode', val());
                                  }}
                                  setItems={setDropdownItems2}
                                  error={errors.wMode}
                                />
                                <CustomDropdown
                                  label="Agent"
                                  open={openDropdown3}
                                  value={dropdownValue3}
                                  items={dropdownItems3}
                                  setOpen={setOpenDropdown3}
                                  setValue={(val: any) => {
                                    setDropdownValue3(val());
                                    setFieldValue('agent', val());
                                  }}
                                  setItems={setDropdownItems3}
                                  error={errors.agent}
                                />
                                <CustomTextInput
                                  label="Mobile"
                                  value={values.mobile}
                                  onChangeText={handleChange('mobile')}
                                  error={
                                    touched.mobile &&
                                      typeof errors.mobile === 'string'
                                      ? errors.mobile
                                      : undefined
                                  }
                                  keyboardType="numeric"
                                  maxLength={10}
                                />
                                <CustomTextInput
                                  label="Address"
                                  value={values.address}
                                  onChangeText={handleChange('address')}
                                  error={
                                    touched.address &&
                                      typeof errors.address === 'string'
                                      ? errors.address
                                      : undefined
                                  }
                                />
                                <CustomButton
                                  title="Save"
                                  onPress={() => {
                                    handleSubmit();
                                  }}
                                  textColor={COLORS.WHITE}
                                />
                              </View>
                            ) : (
                              <View>
                                <CustomTextInput
                                  label="Password"
                                  value={values.password}
                                  onChangeText={handleChange('password')}
                                  error={errors.password}
                                />
                                <CustomButton
                                  title="Save"
                                  onPress={() => {
                                    handleSubmit();
                                  }}
                                  textColor={COLORS.WHITE}
                                />
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    )}
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
    width: '100%',
  },
  flexDoubleColumb: { flexDirection: 'row', justifyContent: 'space-between' },
  container: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: '#fef7e5',
  },
  statusFilterContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // gap: scale(10),
    width: '50%',
  },
  statusFilterLabel: {
    fontSize: scale(14),
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});
export default Staff;
