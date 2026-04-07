import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Keyboard, Text } from 'react-native';
import { useSelector } from 'react-redux';
import DeclareStatusCard from '../../../components/DeclareStatusCard';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Formik } from 'formik';
import CustomDropdown from '../../../components/CustomDropdown';
import * as Yup from 'yup';
import CustomTextInput from '../../../components/CustomTextInput';
import CustomButton from '../../../components/CustomButton';
import { COLORS } from '../../../assets/colors';
import { scale } from 'react-native-size-matters';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../components/ScreenHeader';
import APIService from '../../services/APIService';
import Toast from 'react-native-toast-message';
import useSearchBar from '../../../hooks/useSearchBar';
import GradientBackground from '../../../components/GradientBackground';
const AddStaffSchema = Yup.object().shape({
  agent: Yup.string().required('Agent Name is required'),
  mainAgent: Yup.string().required('Main Agent is required'),
  parentAgent: Yup.string().required('Parent Agent is required'),
});

const EditAgentSchema = Yup.object().shape({
  agent: Yup.string().required('Agent Name is required'),
  // mainAgent and parentAgent optional on update
});
interface DropdownItem {
  label: string;
  value: string;
}
const Agent = ({ navigation }: any) => {
  const [open, setOpen] = useState(false);
  const shifts = useSelector((state: any) => state.shift);
  const [getData, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<any>(null);
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState<string | null>(null);
  const [dropdownItems, setDropdownItems] = React.useState([
    // { label: 'Bhasker-Ledger-Cash Agent', value: '1' },
    // { label: 'Vipin Kumar-Ledger-Cash Agent', value: '2' },
  ]);
  const [openDropdown2, setOpenDropdown2] = React.useState(false);
  const [dropdownValue2, setDropdownValue2] = React.useState<string | null>(
    null,
  );
   const [ledgerLoading, setLedgerLoading] = useState(false);
  const [dropdownItems2, setDropdownItems2] = React.useState([
    // { label: 'Vipin-Agent', value: '1' },
    // { label: 'Bhasker-Agent', value: '2' },
    // { label: 'Jitin-Agent', value: '3' },
  ]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const agentNameRef = React.useRef<any>(null);
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
  };
  const handleEditShift = (item: any) => {
    setSelectedCompany(item);
    setIsEditing(true);
    setIsOpenBottomSheet(true);
  };
  // Search hook for filtering agents by name
  const { query, setQuery, filteredItems } = useSearchBar<any>(getData, {
    selector: (item) => String(item?.agent_name ?? ''),
    debounceMs: 200,
  });
  React.useEffect(() => {
    getAgent();
    fetchAgentData();
    fetchParentAgentData();
  }, []);
  const getAgent = async () => {
    try {
      const response = await APIService.GetAgent();
      if (response?.success) {
        setData(response?.data);
      }
    } catch (error) {
      console.error('Shift fetch failed', error);
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
  const fetchParentAgentData = async () => {
    try {
      setLedgerLoading(true);
      const response = await APIService.GetAgentDropDownDataData();
      console.log('Ledger data response:', response);
      
      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format for ledgers
        const transformedLedgers = response.data.map((ledger: any) => ({
          label: ledger.real_name || ledger.name || 'Unknown Ledger',
          value: ledger.id?.toString() || ledger.ledger_id?.toString() || ''
        }));
        setDropdownItems2(transformedLedgers);
        console.log('Transformed ledger items:', transformedLedgers);
      } else {
        console.log('No ledger data found or API error');
        setDropdownItems2([]);
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setDropdownItems2([]);
    } finally {
      setLedgerLoading(false);
    }
  };
  const handleCreateAgent = async (values: any) => {
    try {
      const payload = {
        agent_name: values?.agent || '',
        username: values?.username || '',
        parent_agent_id: Number(values?.parentAgent) || 0,
        main_agent_id: Number(values?.mainAgent) || '',
        password: values?.password || '',
      };
      const response = await APIService.CreateAgent(payload);
      if (response?.success) {
        setIsOpenBottomSheet(false);
        setIsEditing(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message,
          position: 'bottom',
        });
        getAgent();
      }
    } catch (error) {
      console.error('Create shift failed', error);
    }
  };
  const handleUpdateAgent = async (values: any) => {
    try {
      const payload = {
        agent_name: values?.agent || '',
        username: values?.username || '',
        parent_agent_id: values?.parentAgent !== null && values?.parentAgent !== undefined && values?.parentAgent !== '' ? Number(values.parentAgent) : 0,
        main_agent_id: values?.mainAgent !== null && values?.mainAgent !== undefined && values?.mainAgent !== '' ? Number(values.mainAgent) : 0,
        password: values?.password || '',
      };
      const agentId = selectedCompany?.id ?? selectedCompany?.agent_id;
      if (!agentId) {
        console.log('Missing agent id on update', selectedCompany);
        return;
      }
      const response = await APIService.UpdateAgent(payload, agentId);
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
        getAgent();
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
      handleUpdateAgent(values);
    } else {
      resetForm();
      handleCreateAgent(values);
    }
  };
  const handleToggleActive = async (item: any) => {
    console.log(item);
    try {
      const userId = item?.id;
      const isCurrentlyActive = item?.active_status;

      if (!userId) return;

      const response = isCurrentlyActive
        ? await APIService.ToggleAgentDeActive(userId)
        : await APIService.ToggleAgentActive(userId);

      if (response?.success) {
        getAgent();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2:
            response?.message ||
            `User ${
              isCurrentlyActive ? 'deactivated' : 'activated'
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
  return (
    <GestureHandlerRootView style={{flex:1}}>
        <GradientBackground colors={[ "#fdf0d0","#e0efea"]} locations={[0,30]}>
      <SafeAreaView
        style={style.safeAreaContainer}
        edges={['top', 'left', 'right']}
      >
        <ScreenHeader
          title={'Agent'}
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
                placeholder="Search agent by name..."
                value={query}
                onChangeText={setQuery}
                style={{backgroundColor: COLORS.WHITE, minHeight: 40,borderRadius: 8,paddingHorizontal: 12,}}
              />
            </View>
            <View style={{ width: '45%' }}>
              <CustomButton
                textColor={COLORS.WHITE}
                title="+ Add Agent"
                onPress={handleAddShift}
              />
            </View>
          </View>
          <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <DeclareStatusCard
              data={filteredItems}
              config={[
                { key: 'agent_name', label: 'Agent Name' },
                { key: 'username', label: 'User Name' },
                { key: 'created_at', label: 'Created At' },
                { key: 'created_by', label: 'Added By' },
                { key: 'updated_at', label: 'Updated At' },
                { key: 'updated_by', label: 'Updated By' },
              ]}
              actionOneLabel="Is Active"
              actionTwoLabel="Action"
              isButtonOne={false}
              // statusKey="status"
              onActionOne={handleToggleActive}
              onActionTwo={(item: any) => {
                  handleEditShift(item);
              }}
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
              keyboardBehavior="extend"
              keyboardBlurBehavior="restore"
              onClose={() => {
                setIsOpenBottomSheet(false);
                setIsEditing(false);
              }}
            >
              <BottomSheetScrollView
                style={{
                  backgroundColor: COLORS.BGFILESCOLOR,
                  flex: 1,
                }}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: scale(250)
                }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={{alignItems:"center",justifyContent:"center",padding:10}}>
                  <Text style={{fontSize:scale(16),fontWeight:"bold"}}>{isEditing?"Update Agent":"Create Agent"}</Text>
                </View>
                <Formik
                  initialValues={{
                    agent: selectedCompany?.agent_name||'',
                    mainAgent: '',
                    parentAgent: '',
                  }}
                  validationSchema={isEditing ? EditAgentSchema : AddStaffSchema}
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
                      <CustomTextInput
                        ref={agentNameRef}
                        label="Agent Name"
                        value={values.agent}
                        onChangeText={handleChange('agent')}
                         error={
                          touched.agent &&
                          typeof errors.agent === 'string'
                            ? errors.agent
                            : undefined
                        }
                        onFocus={() => setFocusedField(null)}
                        onSubmitEditing={() => setFocusedField('mainAgentName')}
                      />

                       <CustomDropdown
                        label="Main Agent Name"
                        open={openDropdown}
                        value={dropdownValue}
                        items={dropdownItems}
                        setOpen={setOpenDropdown}
                        isFocused={focusedField === 'mainAgent'}
                        onOpen={() => setFocusedField('mainAgent')}
                        setValue={(val: any) => {
                          setDropdownValue(val());
                          setFieldValue('mainAgent', val());
                          setFocusedField(null);
                        }}
                        setItems={setDropdownItems}
                        error={errors.mainAgent}
                      />
                       <CustomDropdown
                        label="Parent Agent Name"
                        open={openDropdown2}
                        value={dropdownValue2}
                        items={dropdownItems2}
                        setOpen={setOpenDropdown2}
                        isFocused={focusedField === 'parentAgent'}
                        onOpen={() => setFocusedField('parentAgent')}
                        setValue={(val: any) => {
                          setDropdownValue2(val());
                          setFieldValue('parentAgent', val());
                          setFocusedField(null);
                        }}
                        setItems={setDropdownItems2}
                        error={errors.parentAgent}
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
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: '#fef7e5',
  },
  flexDoubleColumb: { flexDirection: 'row', justifyContent: 'space-between' },
  container: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
});
export default Agent;
