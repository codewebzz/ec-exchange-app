import { Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import ScreenHeader from '../../../components/ScreenHeader'
import { COLORS } from '../../../assets/colors'
import Icon from 'react-native-vector-icons/MaterialIcons';
import { scale } from 'react-native-size-matters'
import DeclareStatusCard from '../../../components/DeclareStatusCard'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Formik } from 'formik'
import CustomButton from '../../../components/CustomButton'
import CustomDropdown from '../../../components/CustomDropdown'
import CustomDateTimePicker from '../../../components/CustomDatePicker'
import APIService from '../../services/APIService'
import GradientBackground from '../../../components/GradientBackground'
import useSearchBar from '../../../hooks/useSearchBar'
import ReportTable from '../../../components/ReportTable'
const LimitBalance = ({ navigation }: any) => {
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState(null);
  const [dropdownItems, setDropdownItems] = React.useState([
    { label: 'Faridabad', value: 'Faridabad' },
    { label: 'Delhi', value: 'Delhi' },
  ]);
  const [openDropdown1, setOpenDropdown1] = React.useState(false);
  const [dropdownValue1, setDropdownValue1] = React.useState(null);
  const [dropdownItems1, setDropdownItems1] = React.useState([
    { label: 'Deal1', value: 'Deal1' },
    { label: 'Deal2', value: 'Deal2' },
  ]);
  const [openDropdown2, setOpenDropdown2] = React.useState(false);
  const [dropdownValue2, setDropdownValue2] = React.useState(null);
  const [dropdownItems2, setDropdownItems2] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Date states
  const [openDate, setOpenDate] = React.useState(new Date());
  const [closeDate, setCloseDate] = React.useState(new Date());

  // Handle date selection
  const handleDateChange = (fieldName: string, value: any) => {
    console.log('Date selected:', value, typeof value);
    
    // The CustomDateTimePicker returns a formatted string (DD/MM/YYYY)
    if (typeof value === 'string') {
      // Parse the DD/MM/YYYY format to Date object
      const parts = value.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            // Update the appropriate date field
            if (fieldName === 'opendate') {
              setOpenDate(date);
              console.log('Setting open date to:', date);
            } else if (fieldName === 'closedate') {
              setCloseDate(date);
              console.log('Setting close date to:', date);
            }
            return;
          }
        }
      }
    }
    
    // Fallback: if it's already a Date object
    if (value instanceof Date) {
      if (fieldName === 'opendate') {
        setOpenDate(value);
        console.log('Setting open date to:', value);
      } else if (fieldName === 'closedate') {
        setCloseDate(value);
        console.log('Setting close date to:', value);
      }
    }
  };

  const formatDateForAPI = (date: Date | undefined) => {
    if (!date || !(date instanceof Date)) {
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [getData, setData] = React.useState<any[]>([]);
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');
  
  React.useEffect(() => {
    fetchAgents();
    fetchParties();
    getLimitBalanceReport({});
  }, []);

  // Fetch agents for dropdown
  const fetchAgents = async () => {
    try {
      const res = await APIService.getMasterLedgerAgent();
      if (res && res.success && Array.isArray(res.data)) {
        const items = res.data.map((a: any) => ({
          label: a.agent_name || a.name || `Agent ${a.id}`,
          value: a.id?.toString?.() || a.agent_id?.toString?.() || `${a.id}`,
        }));
        setDropdownItems(items);
      } else {
        setDropdownItems([]);
      }
    } catch (e) {
      console.error('Failed to fetch agents:', e);
      setDropdownItems([]);
    }
  };

  // Fetch parties for dropdown
  const fetchParties = async () => {
    try {
      const res = await APIService.getRecentUser();
      if (res && res.success && Array.isArray(res.data)) {
        const items = res.data.map((user: any) => ({
          label: user.real_name || user.name || user.mobile || `User ${user.id}`,
          value: user.id?.toString?.() || user.user_id?.toString?.() || `${user.id}`,
        }));
        setDropdownItems2(items);
      } else {
        setDropdownItems2([]);
      }
    } catch (e) {
      console.error('Failed to fetch parties:', e);
      setDropdownItems2([]);
    }
  };

  // Search functionality
  const { query, setQuery, filteredItems } = useSearchBar<any>(getData, {
    selector: (item) => String(item?.Party ?? item?.party ?? item?.name ?? ''),
    debounceMs: 200,
  });

  // Fetch Limit Balance Report data
  const getLimitBalanceReport = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        start_date: values?.opendate || formatDateForAPI(openDate) || formattedDate,
        end_date: values?.closedate || formatDateForAPI(closeDate) || formattedDate,
        agent: values?.agent || dropdownValue || undefined,
        deal: values?.deal || dropdownValue1 || undefined,
        party: values?.party || dropdownValue2 || undefined,
      };
      const response = await APIService.GetLimitBalanceReport(payload);
      if (response?.success && response?.data) {
        // Extract data from response - handle different response structures
        const reportData = Array.isArray(response.data.ledger_list) 
          ? response.data.ledger_list 
          : Array.isArray(response.data?.ledger_list) 
          ? response.data.ledger_list
          : [];
        
        console.log('Limit Balance report data loaded:', reportData.length, 'items');
        setData(reportData);
      } else {
        console.warn('No data in response:', response);
        setData([]);
      }
    } catch (error) {
      console.error('Limit Balance report fetch failed', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  const handleSheetChange = (index: number) => {
    Keyboard.dismiss();
    if (index === -1) {
      setIsOpenBottomSheet(false);
    } else {
      setIsOpenBottomSheet(true);
    }
  };
  const snapPoints = React.useMemo(() => ['80%'], []);
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
  };
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <GradientBackground colors={[ "#fdf0d0","#e0efea"]} locations={[0,30]}>
      <SafeAreaView style={style.safeAreaContainer}>
        <ScreenHeader title={"Limit Balance"} navigation={navigation}  hideBackButton={true} showDrawerButton={true} >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10) }}>
            <TouchableOpacity onPress={() => {
              setShowSearch(!showSearch);
              if (showSearch) {
                setQuery('');
              }
            }}>
              <Icon name={showSearch ? 'close' : 'search'} color={COLORS.WHITE} size={scale(20)} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setIsOpenBottomSheet(true);
            }}>
              <Icon name={'filter-list-alt'} color={COLORS.WHITE} size={scale(20)} />
            </TouchableOpacity>
          </View>
        </ScreenHeader>
        {showSearch ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10), marginHorizontal: scale(15), marginVertical: scale(10) }}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Search by party..."
                value={query}
                onChangeText={setQuery}
                style={{ backgroundColor: COLORS.WHITE, minHeight: 40, borderRadius: 8, paddingHorizontal: 12, elevation: 10 }}
              />
            </View>
            {/* <TouchableOpacity onPress={() => { setQuery(''); setShowSearch(false); }}>
              <Icon name={'close-circle'} size={22} color={"red"} />
            </TouchableOpacity> */}
          </View>
        ) : null}
        <ScrollView 
          style={{ padding: 16 }} 
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                getLimitBalanceReport({});
              }}
            />
          }
        >
          <ReportTable
            data={filteredItems}
            columns={[
              { key: 'sno', label: 'S.No.', width: 50, align: 'center' },
              { key: 'name', label: 'Party', width: 200, align: 'left' },
              { key: 'openning', label: 'Opening', width: 120, align: 'right', numeric: true },
              { key: 'limit', label: 'Limit', width: 120, align: 'right', numeric: true },
              { key: 'tr_consume', label: 'Trans Consume', width: 140, align: 'right', numeric: true },
              { key: 'tp_amount', label: 'T-Profit', width: 120, align: 'right', numeric: true },
              { key: 'Payment', label: 'Payment', width: 120, align: 'right', numeric: true },
              { key: 'final_limit', label: 'Final Limit', width: 130, align: 'right', numeric: true },
            ]}
            loading={loading}
            showTotal={true}
            totalRowLabel="Total"
          />
        </ScrollView>
        {
          isOpenBottomSheet && (<BottomSheet
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: scale(20),
                paddingBottom: scale(4),
                borderBottomWidth:scale(1)
              }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: scale(16), fontWeight: '600', color: COLORS.BLACK, marginEnd: scale(5) }}>
                  Filter
                </Text>
              </View>
              <TouchableOpacity onPress={handleClosePress}>
                <Icon name='cancel' size={scale(20)} />
              </TouchableOpacity>
            </View>
            <BottomSheetScrollView style={{ paddingHorizontal:scale(10), backgroundColor: COLORS.BGFILESCOLOR, flex: 1 }}>


              <Formik
                initialValues={{
                  party: '',
                  opendate: openDate,
                  closedate: closeDate,
                  agent: '',
                  deal: '',
                }}
                enableReinitialize
                onSubmit={(values, { resetForm }) => {
                  console.log('Form Data:', values);
                  const formValues = {
                    ...values,
                    opendate: formatDateForAPI(openDate),
                    closedate: formatDateForAPI(closeDate),
                    agent: values.agent || dropdownValue,
                    deal: values.deal || dropdownValue1,
                    party: values.party || dropdownValue2,
                  };
                  getLimitBalanceReport(formValues);
                  handleClosePress();
                }}
              >
                {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
                  <View style={{ paddingVertical: scale(20) }}>
                    <CustomDateTimePicker
                      label="Open Date"
                      value={openDate}
                      setFieldValue={handleDateChange}
                      fieldName="opendate"
                      mode={'date'}
                    />
                    <CustomDateTimePicker
                      label="Close Date"
                      value={closeDate}
                      setFieldValue={handleDateChange}
                      fieldName="closedate"
                      mode={'date'}
                    />
                  
  <CustomDropdown
    label="Agent"
    open={openDropdown}
    value={dropdownValue}
    items={dropdownItems}
    setOpen={setOpenDropdown}
    setValue={(val: any) => {
      setDropdownValue(val());
      setFieldValue('agent', val());
    }}
    bottomOffset={30}
    setItems={setDropdownItems}
  />



  <CustomDropdown
    label="Deal"
    open={openDropdown1}
    value={dropdownValue1}
    items={dropdownItems1}
    setOpen={setOpenDropdown1}
    setValue={(val: any) => {
      setDropdownValue1(val());
      setFieldValue('deal', val());
    }}
      bottomOffset={30}
    setItems={setDropdownItems1}
  />


 <CustomDropdown
                      label="Party"
                      open={openDropdown2}
                      value={dropdownValue2}
                      items={dropdownItems2}
                      setOpen={setOpenDropdown2}
                      setValue={(val: any) => {
                        setDropdownValue2(val());
                        setFieldValue('party', val());
                      }}
                      setItems={setDropdownItems2}
                    // error={errors.crAnddr}
                    />



                    <View style={{ marginVertical: scale(10) }}>

                      <CustomButton title="Search" onPress={() => {
                        handleSubmit();
                      }} textColor={COLORS.WHITE} />
                    </View>
                  </View>
                )}
              </Formik>

            </BottomSheetScrollView>
          </BottomSheet>)}
      </SafeAreaView>
      </GradientBackground>
    </GestureHandlerRootView>
  )
}

export default LimitBalance

const style = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
})