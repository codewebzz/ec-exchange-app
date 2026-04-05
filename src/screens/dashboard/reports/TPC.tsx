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
const TPC = ({ navigation }: any) => {
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
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
  const [getData, setData] = React.useState<any[]>([]);
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');
  
  React.useEffect(() => {
    fetchAgents();
    getTCPReport({});
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
        setDropdownItems2(items);
      } else {
        setDropdownItems2([]);
      }
    } catch (e) {
      console.error('Failed to fetch agents:', e);
      setDropdownItems2([]);
    }
  };

  // Search functionality
  const { query, setQuery, filteredItems } = useSearchBar<any>(getData, {
    selector: (item) => String(item?.name ?? item?.agent ?? item?.mobile ?? ''),
    debounceMs: 200,
  });

  // Fetch TCP Report data
  const getTCPReport = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        start_date: values?.opendate || formatDateForAPI(openDate) || formattedDate,
        end_date: values?.closedate || formatDateForAPI(closeDate) || formattedDate,
        agent: values?.agent || dropdownValue2 || undefined,
      };
      const response = await APIService.getTCPReport(payload);
      if (response?.success && response?.data) {
        // Extract ledger_list from response.data.ledger_list or use response.data directly
        const ledgerList = Array.isArray(response.data.ledger_list) 
          ? response.data.ledger_list 
          : Array.isArray(response.data) 
          ? response.data 
          : [];
        
        console.log('TCP report data loaded:', ledgerList.length, 'items');
        setData(ledgerList);
      } else {
        console.warn('No data in response:', response);
        setData([]);
      }
    } catch (error) {
      console.error('TCP report fetch failed', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <GradientBackground colors={[ "#fdf0d0","#e0efea"]} locations={[0,30]}>
      <SafeAreaView style={style.safeAreaContainer}>
        <ScreenHeader title={"TPC"} navigation={navigation} hideBackButton={true} showDrawerButton={true} >
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
                placeholder="Search by name, agent or mobile..."
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
                getTCPReport({});
              }}
            />
          }
        >
          <ReportTable
            data={filteredItems}
            columns={[
              { key: 'sno', label: 'S.No.', width: 50, align: 'center' },
              { key: 'name', label: 'name', width: 200, align: 'left' },
              { key: 'agent', label: 'Agent', width: 100, align: 'left' },
              { key: 'rate', label: 'Rate', width: 120, align: 'left' },
              { key: 'self_hissa', label: 'Self Hissa', width: 100, align: 'left' },
              { key: 'tphissa', label: 'TP-Hissa', width: 100, align: 'left' },
              { key: 'total_sale', label: 'Total-Sale', width: 100, align: 'right', numeric: true },
              { key: 'dhai_sale', label: 'Dara-Sale', width: 100, align: 'right', numeric: true },
              { key: 'hurp_sale', label: 'Akhar-Sale', width: 100, align: 'right', numeric: true },
              { key: 'commission', label: 'Comm', width: 100, align: 'right', numeric: true },
              { key: 'open_dhai', label: 'Open-Dhara', width: 100, align: 'right', numeric: true },
              { key: 'clam_value_dhai', label: 'Amt-Dhara', width: 100, align: 'right', numeric: true },
              { key: 'open_hurp', label: 'Open-Akhar', width: 100, align: 'right', numeric: true },
              { key: 'clam_value_hurp', label: 'Amt-Akhar', width: 100, align: 'right', numeric: true },
              { key: 'tpc', label: 'TCP', width: 80, align: 'right', numeric: true },
              { key: 'self_hissa_amount', label: 'S-Hissa-Amt', width: 120, align: 'right', numeric: true },
              { key: 'tpHissaAmt', label: 'TP-Hissa-Amt', width: 120, align: 'right', numeric: true },
              { key: 'lena', label: 'Lena', width: 100, align: 'right', numeric: true },
              { key: 'dena', label: 'Dena', width: 100, align: 'right', numeric: true },
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
                  agent: '',
                  opendate: openDate,
                  closedate: closeDate,
                 
                }}
                // validationSchema={AddCompanySchema}
                onSubmit={(values, { resetForm }) => {
                  console.log('Form Data:', values);
                  const formValues = {
                    ...values,
                    opendate: formatDateForAPI(openDate),
                    closedate: formatDateForAPI(closeDate),
                    agent: values.agent || dropdownValue2,
                  };
                  getTCPReport(formValues);
                  handleClosePress();
                  // resetForm();
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
                      open={openDropdown2}
                      value={dropdownValue2}
                      items={dropdownItems2}
                      setOpen={setOpenDropdown2}
                      setValue={(val: any) => {
                        setDropdownValue2(val());
                        setFieldValue('agent', val());
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

export default TPC

const style = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
})