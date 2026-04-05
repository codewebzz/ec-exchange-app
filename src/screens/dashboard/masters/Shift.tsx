import React, { cache, useState } from 'react';
import {
  ScrollView,
  Button,
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
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
import APIService from '../../services/APIService';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import TabHeader from '../../../components/TabHeader';
import useSearchBar from '../../../hooks/useSearchBar';
import GradientBackground from '../../../components/GradientBackground';
const AddShiftSchema = Yup.object().shape({
  name: Yup.string().required('Shift Name is required'),
  openTime: Yup.string()
    .test('valid-time', 'Open Time is required', (value) => {
      return Boolean(value) && value !== '--:--';
    })
    .required('Open Time is required'),
});

const Shift = ({ navigation }: any) => {
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [getData, setData] = useState([]);
  // Search hook for filtering shifts by name
  const { query, setQuery, filteredItems } = useSearchBar<any>(getData, {
    selector: (item) => String(item?.shift_name ?? ''),
    debounceMs: 200,
  });
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
  const [visible, setVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState<string | null>('1');
  const [dropdownItems, setDropdownItems] = React.useState([
    { label: 'Yes', value: '1' },
    { label: 'No', value: '0' },
  ]);
  const [openDropdown1, setOpenDropdown1] = React.useState(false);
  const [dropdownValue1, setDropdownValue1] = React.useState<string | null>('1');
  const [dropdownItems1, setDropdownItems1] = React.useState([
    { label: 'Both', value: '1' },
    { label: 'WebPanel', value: '2' },
    { label: 'Mobile-App', value: '3' },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Tabs and auto-open toggle
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Info, 1: Time, 2: Config
  const [autoOpen, setAutoOpen] = useState<boolean>(false);


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
    // Defaults: Next Day = Yes ('1'), Shift Working For = Both ('1')
    setDropdownValue('1');
    setDropdownValue1('1');
  };

  const handleEditShift = (item: any) => {
    setSelectedCompany(item);
    setIsEditing(true);
    setIsOpenBottomSheet(true);
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

  React.useEffect(() => {
    getShift();
  }, []);

  const formatTimeForForm = (time12h: string) => {
    if (!time12h) return '';
    const parsedTime = moment(time12h, 'hh:mm A');
    if (parsedTime.isValid()) {
      return parsedTime.format('HH:mm');
    }
    return '';
  };

  const formatDateForForm = (dateString: string) => {
    if (!dateString) return '';

    const parsedDate = moment(dateString, 'YYYY-MM-DD');
    if (parsedDate.isValid()) {
      return parsedDate.format('DD/MM/YYYY');
    }

    return '';
  };

  React.useEffect(() => {
    if (selectedCompany) {
      const nextDayValue = selectedCompany.next_day?.name?.toLowerCase() === 'yes' ? '1' : '0';
      setDropdownValue(nextDayValue);
      const modeName = selectedCompany.shift_mode?.name?.toLowerCase?.() || '';
      const shiftModeValue =
        modeName.includes('both') ? '1' :
          modeName.includes('web') ? '2' :
            modeName.includes('mobile') ? '3' : '1';
      setDropdownValue1(shiftModeValue);
      // If backend provides an auto-open flag, set it here; default false
      setAutoOpen(Boolean(selectedCompany?.auto_open));
    }
  }, [selectedCompany]);

  const getShift = async () => {
    try {
      const response = await APIService.GetShift();
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
      await getShift();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateShift = async (values: any) => {
    try {
      const payload = {
        shift_name: values?.name,
        open_date: values?.openDate,
        next_day: Number(values?.nextDay),
        shift_mode: Number(values?.shiftWorkingFor),
        super_admin_update_time: values?.superAdmin
          ? moment(values?.superAdmin, 'HH:mm').format('hh:mm A')
          : '',
        cash_agent_update_time: values?.cashAgent
          ? moment(values?.cashAgent, 'HH:mm').format('hh:mm A')
          : '',
        data_entry_operator_update_time: values?.dataEntryOperator
          ? moment(values?.dataEntryOperator, 'HH:mm').format('hh:mm A')
          : '',
        owner_update_time: values?.owner
          ? moment(values?.owner, 'HH:mm').format('hh:mm A')
          : '',
        open_time: values?.openTime ? moment(values?.openTime, 'HH:mm').format('hh:mm A') : '',
        fanter_update_time: values?.fanter
          ? moment(values?.fanter, 'HH:mm').format('hh:mm A')
          : '',
        admin_update_time: values?.admin
          ? moment(values?.admin, 'HH:mm').format('hh:mm A')
          : '',
      };
      const response = await APIService.CreateShift(payload);
      if (response?.success) {
        setIsOpenBottomSheet(false);
        setIsEditing(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message,
          position: 'bottom',
        });
        getShift();
      }
    } catch (error) {
      console.error('Create shift failed', error);
    }
  };

  const handleUpdateShift = async (values: any) => {
    try {
      const payload = {
        shift_name: values?.name,
        open_date: values?.openDate,
        open_time: values?.openTime ? moment(values?.openTime, 'HH:mm').format('hh:mm A')
          : '',
        next_day: Number(values?.nextDay),
        shift_mode: Number(values?.shiftWorkingFor),
        super_admin_update_time: values?.superAdmin
          ? moment(values?.superAdmin, 'HH:mm').format('hh:mm A')
          : '',
        cash_agent_update_time: values?.cashAgent
          ? moment(values?.cashAgent, 'HH:mm').format('hh:mm A')
          : '',
        data_entry_operator_update_time: values?.dataEntryOperator
          ? moment(values?.dataEntryOperator, 'HH:mm').format('hh:mm A')
          : '',
        owner_update_time: values?.owner
          ? moment(values?.owner, 'HH:mm').format('hh:mm A')
          : '',
        fanter_update_time: values?.fanter
          ? moment(values?.fanter, 'HH:mm').format('hh:mm A')
          : '',
        admin_update_time: values?.admin
          ? moment(values?.admin, 'HH:mm').format('hh:mm A')
          : '',
      };

      const response = await APIService.UpdateShift(payload, selectedCompany?.id);
      console.log(response, "[][][][")
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
        getShift();
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
      handleUpdateShift(values);
    } else {
      resetForm();
      handleCreateShift(values);
    }
  };
  const handleToggleActive = async (item: any) => {
    try {
      const shiftId = item?.id;
      const isCurrentlyActive = item?.is_active;
      if (!shiftId) return;

      const response = isCurrentlyActive
        ? await APIService.ToggleShiftDeActive(shiftId)
        : await APIService.ToggleShiftActive(shiftId);

      if (response?.success) {
        getShift();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message || `Shift ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully`,
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
            title={'Shift'}
            navigation={navigation}
            hideBackButton={true} showDrawerButton={true}
          />
          <View style={style.container}>
            <View
              style={{
                marginVertical: scale(10),
                marginHorizontal: scale(15),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: scale(10),
              }}
            >
              <View style={{ flex: 1 }}>
                <CustomTextInput
                  placeholder="Search shift by name..."
                  value={query}
                  onChangeText={setQuery}
                  style={{ backgroundColor: COLORS.WHITE, minHeight: 40, borderRadius: 8, paddingHorizontal: 12 }}
                />
              </View>
              <View style={{ width: '45%' }}>
                <CustomButton
                  textColor={COLORS.WHITE}
                  title="+ Add Shift"
                  onPress={handleAddShift}
                />
              </View>
            </View>

            <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled">
              <DeclareStatusCard
                data={filteredItems}
                config={[
                  { key: 'shift_name', label: 'Shift Name' },
                  { key: 'open_date', label: 'Open Date' },
                  { key: 'updated_by', label: 'Updated By' },
                ]}
                actionOneLabel="Is Active"
                actionTwoLabel="Edit"
                onActionOne={handleToggleActive}
                onActionTwo={(item: any) => {
                  handleEditShift(item);
                }}
                useToggleOne={true}
                activeKey={'is_active'}
                refreshing={refreshing}
                onRefresh={getData && getData.length > 0 ? onRefresh : undefined}
              />
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
                  <View style={{ marginBottom: scale(10) }}>
                    <Text style={{
                      fontSize: scale(18),
                      fontWeight: 'bold',
                      color: COLORS.BLACK,
                      textAlign: 'center'
                    }}>
                      {isEditing ? 'Edit Shift' : 'Add New Shift'}
                    </Text>
                  </View>

                  {isEditing && (
                    <TabHeader
                      tabs={["Info", "Time", "Config"]}
                      activeTab={activeTab}
                      onTabPress={(idx) => setActiveTab(idx)}
                      containerStyle={{ marginHorizontal: 0, marginVertical: scale(10) }}
                      height={40}
                    />
                  )}

                  {/* Precompute defaults for form initial values */}
                  <Formik
                    key={selectedCompany?.id || 'new'} // Force re-render when selectedCompany changes
                    initialValues={{
                      name: selectedCompany?.shift_name || '',
                      nextDay: selectedCompany?.next_day?.name?.toLowerCase() === 'yes' ? '1' : '1',
                      openTime: formatTimeForForm(selectedCompany?.open_time) || '',
                      owner: formatTimeForForm(selectedCompany?.owner_update_time) || '',
                      superAdmin: formatTimeForForm(selectedCompany?.super_admin_update_time) || '',
                      fanter: formatTimeForForm(selectedCompany?.fanter_update_time) || '',
                      cashAgent: formatTimeForForm(selectedCompany?.cash_agent_update_time) || '',
                      admin: formatTimeForForm(selectedCompany?.admin_update_time) || '',
                      dataEntryOperator: formatTimeForForm(selectedCompany?.data_entry_operator_update_time) || '',
                      openDate: formatDateForForm(selectedCompany?.open_date) || moment().format('DD/MM/YYYY'),
                      shiftWorkingFor: (() => {
                        if (!selectedCompany) return '1'; // Both by default
                        const modeName = selectedCompany?.shift_mode?.name?.toLowerCase?.() || '';
                        if (modeName.includes('both')) return '1';
                        if (modeName.includes('web')) return '2';
                        if (modeName.includes('mobile')) return '3';
                        return '1';
                      })(),
                      roundOff: (selectedCompany as any)?.round_off?.toString?.() || '0',
                    }}
                    validationSchema={AddShiftSchema}
                    onSubmit={handleFormSubmit}
                  >
                    {({
                      handleChange,
                      handleSubmit,
                      values,
                      errors,
                      touched,
                      setFieldValue,
                      submitCount,
                    }) => (
                      <View>
                        {(!isEditing || activeTab === 0) && (
                          <View>
                            <CustomTextInput
                              label="Shift Name"
                              value={values.name}
                              onChangeText={handleChange('name')}
                              error={
                                touched.name && typeof errors.name === 'string'
                                  ? errors.name
                                  : undefined
                              }
                            />

                            {/* Open Date and Next Day (disabled when autoOpen) */}
                            <View style={{ opacity: autoOpen ? 0.6 : 1 }} pointerEvents={autoOpen ? 'none' : 'auto'}>
                              <CustomDropdown
                                label="Next Day"
                                open={openDropdown}
                                value={dropdownValue}
                                items={dropdownItems}
                                setOpen={autoOpen ? () => { } : setOpenDropdown}
                                setValue={(val: any) => {
                                  const selectedValue = typeof val === 'function' ? val() : val;
                                  setDropdownValue(selectedValue);
                                  setFieldValue('nextDay', selectedValue);
                                }}
                                setItems={setDropdownItems}
                                error={touched.nextDay && errors.nextDay}
                              />

                              <CustomDateTimePicker
                                label="Open Date"
                                value={values.openDate}
                                setFieldValue={setFieldValue}
                                fieldName="openDate"
                                mode="date"
                                error={
                                  touched.openDate &&
                                    typeof errors.openDate === 'string'
                                    ? errors.openDate
                                    : undefined
                                }
                              />
                            </View>

                            <CustomDropdown
                              label="Shift Working For"
                              open={openDropdown1}
                              value={dropdownValue1}
                              items={dropdownItems1}
                              setOpen={setOpenDropdown1}
                              setValue={(val: any) => {
                                const selectedValue = typeof val === 'function' ? val() : val;
                                setDropdownValue1(selectedValue);
                                setFieldValue('shiftWorkingFor', selectedValue);
                              }}
                              setItems={setDropdownItems1}
                              error={
                                touched.shiftWorkingFor && errors.shiftWorkingFor
                              }
                            />

                            <CustomDateTimePicker
                              label="Open Time"
                              value={values.openTime}
                              setFieldValue={setFieldValue}
                              fieldName="openTime"
                              mode="time"
                              error={
                                (submitCount > 0 || touched.openTime) && typeof errors.openTime === 'string'
                                  ? errors.openTime
                                  : undefined
                              }
                            />

                          </View>
                        )}

                        {(!isEditing || activeTab === 1) && (
                          <View style={{ marginVertical: scale(10) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <View style={style.flexSingleColumb}>
                                <CustomDateTimePicker
                                  label="Owner"
                                  value={values.owner}
                                  setFieldValue={setFieldValue}
                                  fieldName="owner"
                                  mode="time"
                                  error={
                                    touched.owner && typeof errors.owner === 'string' ? errors.owner : undefined
                                  }
                                />
                              </View>
                              <View style={style.flexSingleColumb}>
                                <CustomDateTimePicker
                                  label="Super Admin"
                                  value={values.superAdmin}
                                  setFieldValue={setFieldValue}
                                  fieldName="superAdmin"
                                  mode="time"
                                  error={
                                    touched.superAdmin && typeof errors.superAdmin === 'string' ? errors.superAdmin : undefined
                                  }
                                />
                              </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <View style={style.flexSingleColumb}>
                                <CustomDateTimePicker
                                  label="Fanter"
                                  value={values.fanter}
                                  setFieldValue={setFieldValue}
                                  fieldName="fanter"
                                  mode="time"
                                  error={
                                    touched.fanter && typeof errors.fanter === 'string' ? errors.fanter : undefined
                                  }
                                />
                              </View>
                              <View style={style.flexSingleColumb}>
                                <CustomDateTimePicker
                                  label="Cash Agent"
                                  value={values.cashAgent}
                                  setFieldValue={setFieldValue}
                                  fieldName="cashAgent"
                                  mode="time"
                                  error={
                                    touched.cashAgent && typeof errors.cashAgent === 'string' ? errors.cashAgent : undefined
                                  }
                                />
                              </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <View style={style.flexSingleColumb}>
                                <CustomDateTimePicker
                                  label="Admin"
                                  value={values.admin}
                                  setFieldValue={setFieldValue}
                                  fieldName="admin"
                                  mode="time"
                                  error={
                                    touched.admin && typeof errors.admin === 'string' ? errors.admin : undefined
                                  }
                                />
                              </View>
                              <View style={style.flexSingleColumb}>
                                <CustomDateTimePicker
                                  label="Data Entry Operator"
                                  value={values.dataEntryOperator}
                                  setFieldValue={setFieldValue}
                                  fieldName="dataEntryOperator"
                                  mode="time"
                                  error={
                                    touched.dataEntryOperator && typeof errors.dataEntryOperator === 'string' ? errors.dataEntryOperator : undefined
                                  }
                                />
                              </View>
                            </View>
                          </View>
                        )}

                        {isEditing && activeTab === 2 && (
                          <View style={{ marginTop: scale(10) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(10) }}>
                              <Switch value={false} onValueChange={() => { }} />
                              <Text style={{ marginLeft: 8, color: COLORS.BLACK }}>Transaction capping</Text>
                            </View>
                            <CustomTextInput
                              label="Round Off"
                              value={values.roundOff}
                              onChangeText={handleChange('roundOff')}
                              keyboardType="numeric"
                            />
                          </View>
                        )}

                        <View style={{ marginBottom: scale(20) }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: '48%' }}>
                              <CustomButton
                                title="Cancel"
                                onPress={handleClosePress}
                                textColor={COLORS.BLACK}
                                style={{ backgroundColor: COLORS.WHITE, borderWidth: 1, borderColor: COLORS.BLACK }}
                              />
                            </View>
                            <View style={{ width: '48%' }}>
                              <CustomButton
                                title={isEditing ? "Update" : "Save"}
                                onPress={handleSubmit}
                                textColor={COLORS.WHITE}
                              />
                            </View>
                          </View>
                        </View>
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
    width: '48%',
  },
  flexDoubleColumb: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: '#fef7e5',
  },
  autoOpenCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginTop: scale(10),
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  autoOpenTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  autoOpenDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  autoOpenActive: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 6,
  },
  autoOpenNote: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default Shift;