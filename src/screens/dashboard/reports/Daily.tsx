import { Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import ScreenHeader from '../../../components/ScreenHeader'
import { COLORS } from '../../../assets/colors'
import Icon from 'react-native-vector-icons/MaterialIcons';
import { scale } from 'react-native-size-matters'
import ReportTable from '../../../components/ReportTable'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Formik } from 'formik'
import CustomButton from '../../../components/CustomButton'
import CustomDropdown from '../../../components/CustomDropdown'
import CustomDateTimePicker from '../../../components/CustomDatePicker'
import APIService from '../../services/APIService'
import GradientBackground from '../../../components/GradientBackground'
import useSearchBar from '../../../hooks/useSearchBar'
import CommonGridTable from '../../../components/CommonGridTable'
const Daily = ({ navigation }: any) => {
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState(null);
  const [dropdownItems, setDropdownItems] = React.useState<any[]>([]);
  const [openDropdown1, setOpenDropdown1] = React.useState(false);
  const [dropdownValue1, setDropdownValue1] = React.useState(null);
  const [dropdownItems1, setDropdownItems1] = React.useState<any[]>([]);
  const [showGridTable, setShowGridTable] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  // Date state
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [showSearch, setShowSearch] = useState(false);

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
            setSelectedDate(date);
            console.log('Setting date to:', date);
            return;
          }
        }
      }
    }
    
    // Fallback: if it's already a Date object
    if (value instanceof Date) {
      setSelectedDate(value);
      console.log('Setting date to:', value);
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
  const [getData, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  console.log(getData,"[getDatagetData]")
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  React.useEffect(()=>{
    fetchShifts();
    fetchAgents();
  },[])

// Search functionality
const { query, setQuery, filteredItems } = useSearchBar<any>(getData, {
  selector: (item) => String(item?.name ?? item?.agent ?? item?.shift_name ?? ''),
  debounceMs: 200,
});

  const fetchShifts = async () => {
    try {
      const res = await APIService.GetShiftDropDownDataData();
      if (res && res.success && Array.isArray(res.data)) {
        const items = res.data.map((s: any) => ({
          label: s.shift_name || s.name || `Shift ${s.id}`,
          value: s.id?.toString?.() || `${s.id}`,
        }));
        setDropdownItems(items);
      } else {
        setDropdownItems([]);
      }
    } catch (e) {
      setDropdownItems([]);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await APIService.getMasterLedgerAgent();
      if (res && res.success && Array.isArray(res.data)) {
        const items = res.data.map((a: any) => ({
          label: a.agent_name || a.name || `Agent ${a.id}`,
          value: a.id?.toString?.() || a.agent_id?.toString?.() || `${a.id}`,
        }));
        setDropdownItems1(items);
      } else {
        setDropdownItems1([]);
      }
    } catch (e) {
      setDropdownItems1([]);
    }
  };
  const convertRowToGridData = React.useMemo(() => {
    if (!selectedRow) return { headers: [], data: [], footer: [] };
    
    // Headers: 1-10
    const headers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    
    // Create 10 rows x 10 columns grid (01-100)
    const gridData: any[][] = [];
    
    for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
      const rowData: any[] = [];
      for (let colIndex = 0; colIndex < 10; colIndex++) {
        const number = (rowIndex * 10 + colIndex + 1).toString().padStart(2, '0');
        rowData.push({
          key: `cell_${rowIndex}_${colIndex}`,
          value: '0',
          label: number, // For number badge (01-100)
          editable: false,
          type: 'normal' as const
        });
      }
      gridData.push(rowData);
    }
    
    // Footer for B-Series and A-Series
    const footer = ['B', 'A'];
    
    return { headers, data: gridData, footer };
  }, [selectedRow]);

  // Format date and title for grid table
  const gridTableProps = React.useMemo(() => {
    if (!selectedRow) return { date: '', title: '' };
    
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    // Format title similar to image: "Details of {name} {details} for shift"
    const title = selectedRow.name 
      ? `Details of ${selectedRow.name}${selectedRow.rate ? ` ${selectedRow.rate}` : ''}${selectedRow.self_hissa ? ` ${selectedRow.self_hissa}` : ''}${selectedRow.tphissa ? ` ${selectedRow.tphissa}` : ''} for shift`
      : 'Details for shift';
    
    return { date: formattedDate, title };
  }, [selectedRow]);
    const getDailyReport = async (values:any) => {
      try {
        setLoading(true);
        
        // Format date to DD/MM/YYYY format
        const today = new Date();
        const defaultDay = String(today.getDate()).padStart(2, '0');
        const defaultMonth = String(today.getMonth() + 1).padStart(2, '0');
        const defaultYear = today.getFullYear();
        let dateValue: string = `${defaultDay}/${defaultMonth}/${defaultYear}`;
        
        // Use selectedDate from state or values.date, prioritizing selectedDate
        const dateToFormat = selectedDate || values?.date;
        
        if (dateToFormat) {
          if (dateToFormat instanceof Date) {
            const year = dateToFormat.getFullYear();
            const month = String(dateToFormat.getMonth() + 1).padStart(2, '0');
            const day = String(dateToFormat.getDate()).padStart(2, '0');
            dateValue = `${day}/${month}/${year}`;
          } else {
            // Handle string format
            const dateStr = String(dateToFormat);
            // Handle DD/MM/YYYY format - use as is
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              // Already in DD/MM/YYYY format
              dateValue = dateStr;
            } else if (dateStr.includes('-')) {
              // Convert YYYY-MM-DD to DD/MM/YYYY
              const dashParts = dateStr.split('-');
              if (dashParts.length === 3) {
                dateValue = `${dashParts[2]}/${dashParts[1]}/${dashParts[0]}`;
              } else {
                dateValue = dateStr;
              }
            } else {
              dateValue = dateStr;
            }
          }
        }
        
        const payload = {
          shift_id: values?.shift || dropdownValue || 1,
          date: dateValue // Use formatted string, not Date object
        };
        
        console.log('Fetching daily report with payload:', payload);
        const response = await APIService.GetDailyReport(payload);
        
        if (response?.success && response?.data) {
          // Extract ledger_list from response
          const ledgerList = Array.isArray(response.data.ledger_list) 
            ? response.data.ledger_list 
            : Array.isArray(response.data) 
            ? response.data 
            : [];
          
          console.log('Daily report data loaded:', ledgerList.length, 'items');
          setData(ledgerList);
        } else {
          console.warn('No data in response:', response);
          setData([]);
        }
      } catch (error) {
        console.error('Daily report fetch failed', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <GradientBackground colors={[ "#fdf0d0","#e0efea"]} locations={[0,30]}>
      <SafeAreaView style={style.safeAreaContainer}>
        <ScreenHeader title={"Daily"} navigation={navigation}  hideBackButton={true} showDrawerButton={true} >
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
                placeholder="Search by name or agent..."
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
                if (dropdownValue && selectedDate) {
                  getDailyReport({ shift: dropdownValue, date: selectedDate });
                }
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
            enableRowPress={true}
            onRowPress={(row) => {
              console.log("Second column clicked:", row);
              setSelectedRow(row);
              setShowGridTable(true);
            }}
            loading={loading}
            showTotal={true}
            totalRowLabel="Total"
          />
           {selectedRow && showGridTable && (
          <CommonGridTable
            headers={convertRowToGridData.headers}
            data={convertRowToGridData.data}
            footer={convertRowToGridData.footer}
            visible={showGridTable}
            onClose={() => {
              setShowGridTable(false);
              setSelectedRow(null);
            }}
            title={gridTableProps.title}
            date={gridTableProps.date}
          />
        )}
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
                  shift: dropdownValue || '',
                  date: selectedDate,
                  agent: dropdownValue1 || '',
                }}
                enableReinitialize
                // validationSchema={AddCompanySchema}
                onSubmit={(values, { resetForm }) => {
                  // Ensure date is passed correctly
                  const formValues = {
                    ...values,
                    date: selectedDate || values.date || new Date(),
                    shift: values.shift || dropdownValue,
                  };
                  getDailyReport(formValues);
                  handleClosePress();
                }}
              >
                {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => {
                  // Wrapper to update both selectedDate and Formik field
                  const handleDateChangeWrapper = (fieldName: string, value: any) => {
                    handleDateChange(fieldName, value);
                    // Also update Formik field
                    if (value instanceof Date) {
                      setFieldValue('date', value);
                    } else if (typeof value === 'string') {
                      const parts = value.split('/');
                      if (parts.length === 3) {
                        const day = parseInt(parts[0], 10);
                        const month = parseInt(parts[1], 10) - 1;
                        const year = parseInt(parts[2], 10);
                        const date = new Date(year, month, day);
                        if (!isNaN(date.getTime())) {
                          setFieldValue('date', date);
                        }
                      }
                    }
                  };

                  return (
                  <View style={{ paddingVertical: scale(20) }}>

                    <CustomDropdown
                      label="Shift"
                      open={openDropdown}
                      value={dropdownValue}
                      items={dropdownItems}
                      setOpen={setOpenDropdown}
                      setValue={(val: any) => {
                        setDropdownValue(val());
                        setFieldValue('shift', val());
                      }}
                      setItems={setDropdownItems}
                    // error={errors.crAnddr}
                    />

<CustomDateTimePicker
                      label="Date"
                      value={selectedDate}
                      setFieldValue={handleDateChangeWrapper}
                      fieldName="date"
                      mode={'date'}
                    />

                    <View style={{ marginBottom: scale(16) }}>
                      <Text style={{ fontSize: scale(12), color: COLORS.BLACK, marginBottom: scale(10) }}>
                        Selected Date: {selectedDate ? selectedDate.toLocaleDateString('en-GB') : 'Not set'}
                      </Text>
                    </View>

 <CustomDropdown
                      label="Agent"
                      open={openDropdown1}
                      value={dropdownValue1}
                      items={dropdownItems1}
                      setOpen={setOpenDropdown1}
                      setValue={(val: any) => {
                        setDropdownValue1(val());
                        setFieldValue('agent', val());
                      }}
                      setItems={setDropdownItems1}
                    // error={errors.crAnddr}
                    />




                    <View style={{ marginVertical: scale(10) }}>

                      <CustomButton title="Search" onPress={() => {
                        handleSubmit();
                      }} textColor={COLORS.WHITE} />
                    </View>
                  </View>
                  );
                }}
              </Formik>

            </BottomSheetScrollView>
          </BottomSheet>)}
      </SafeAreaView>
      </GradientBackground>
    </GestureHandlerRootView>
  )
}

export default Daily

const style = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
})