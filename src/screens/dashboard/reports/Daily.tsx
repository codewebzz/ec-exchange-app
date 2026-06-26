import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Formik } from 'formik'
import React, { useState } from 'react'
import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { scale } from 'react-native-size-matters'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { COLORS } from '../../../assets/colors'
import CommonGridTable from '../../../components/CommonGridTable'
import CustomButton from '../../../components/CustomButton'
import CustomDateTimePicker from '../../../components/CustomDatePicker'
import CustomDropdown from '../../../components/CustomDropdown'
import GradientBackground from '../../../components/GradientBackground'
import ScreenHeader from '../../../components/ScreenHeader'
import TableGrid from '../../../components/TableGridView'
import useSearchBar from '../../../hooks/useSearchBar'
import APIService from '../../services/APIService'
import { PermissionGuard } from '../../../components/PermissionGuard';
import { PERMISSIONS } from '../../../helper/permissions';

const Daily = ({ navigation }: any) => {
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(true);
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
  const [totalProfitLoss, setTotalProfitLoss] = useState<number>(0);
  const [hasFetched, setHasFetched] = useState(false);

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
  console.log(getData, "[getDatagetData]")
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  React.useEffect(() => {
    fetchShifts();
    fetchAgents();
  }, [])

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
      const res = await APIService.GetAgentDropDownDataData();
      if (res && res.success && Array.isArray(res.data)) {
        const items = res.data.map((a: any) => ({
          label: a.name || a.real_name || `Agent ${a.id}`,
          value: a.id?.toString() || a.agent_id?.toString() || `${a.id}`,
        }));
        setDropdownItems1(items);
      } else {
        setDropdownItems1([]);
      }
    } catch {
      setDropdownItems1([]);
    }
  };
  const [jantriTransactions, setJantriTransactions] = useState<any[]>([]);
  const [loadingJantri, setLoadingJantri] = useState(false);
  const [declaredNumber, setDeclaredNumber] = useState<string | null>(null);

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

  // Helper for highlights (matching web logic in commonFunctions.ts)
  const getHighlightNumbers = (declaredNum: string | null | undefined): string[] => {
    if (!declaredNum || typeof declaredNum !== 'string' || declaredNum.length !== 2) {
      return [];
    }
    const first = declaredNum.charAt(0);
    const second = declaredNum.charAt(1);
    const ander = first + first + first + first; // A series (4 digits)
    const bahar = second + second + second;    // B series (3 digits)

    // Web version converts "100" to "00" for highlighting
    const normalize = (n: string) => (n === "100" ? "00" : n);

    return [ander, bahar, declaredNum].map(normalize);
  };

  const highlightNumbers = React.useMemo(() => getHighlightNumbers(declaredNumber), [declaredNumber]);

  const convertRowToGridData = React.useMemo(() => {
    if (!selectedRow) return { headers: [], data: [], footer: [], footerData: [] };

    // Create a map for quick lookup from fetched transactions
    const jantriMap: Record<string, string> = {};
    jantriTransactions.forEach(item => {
      if (item.number) {
        // Normalize "100" to "00" to match our grid keys
        const key = item.number.toString() === "100" ? "00" : item.number.toString();
        jantriMap[key.padStart(2, '0')] = item.amount?.toString() || '0';
        jantriMap[key] = item.amount?.toString() || '0';
      }
    });

    // Headers: 1-10
    const headers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    // Create 10 rows x 10 columns grid (01-100)
    const gridData: any[][] = [];

    for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
      const rowData: any[] = [];
      for (let colIndex = 0; colIndex < 10; colIndex++) {
        const number = (rowIndex * 10 + colIndex + 1).toString().padStart(2, '0');
        // Normalize "100" to "00" for matching logic
        const normalizedNumber = number === "100" ? "00" : number;

        // Get value from jantriMap
        const value = jantriMap[normalizedNumber] || jantriMap[parseInt(normalizedNumber, 10).toString()] || '0';

        rowData.push({
          key: normalizedNumber, // Use normalized number as the primary key
          value: value.toString(),
          label: number, // For number badge (01-100)
          editable: false,
          type: 'normal' as const
        });
      }
      gridData.push(rowData);
    }

    // Footer for B-Series and A-Series
    const footer = ['B', 'A'];
    const footerData: any[][] = [];

    footer.forEach(series => {
      const row: any[] = [];
      for (let i = 1; i <= 10; i++) {
        const num = i === 10 ? 0 : i;
        let key = "";
        if (series === "B") {
          key = num === 0 ? "000" : num.toString().repeat(3);
        } else {
          key = num === 0 ? "0000" : num.toString().repeat(4);
        }

        const value = jantriMap[key] || '0';
        row.push({
          key,
          value: value.toString(),
        });
      }
      footerData.push(row);
    });

    return { headers, data: gridData, footer, footerData };
  }, [selectedRow, jantriTransactions]);

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
  const getDailyReport = async (values: any) => {
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
        date: dateValue, // Use formatted string, not Date object
        agent_id: values?.agent || dropdownValue1 || undefined
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
        setTotalProfitLoss(response.data.total ?? 0);
        setHasFetched(true);
      } else {
        console.warn('No data in response:', response);
        setData([]);
        setTotalProfitLoss(0);
        setHasFetched(true);
      }
    } catch (error) {
      console.error('Daily report fetch failed', error);
      setData([]);
      setTotalProfitLoss(0);
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <PermissionGuard permission={PERMISSIONS.REPORTS_DAILY_VIEW.value}>
    <GestureHandlerRootView style={{ flex: 1 }}>

      <GradientBackground colors={["#fdf0d0", "#e0efea"]} locations={[0, 30]}>
        <SafeAreaView style={style.safeAreaContainer}>
          <ScreenHeader title={"Daily"} navigation={navigation} hideBackButton={true} showDrawerButton={true} >
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
          {hasFetched && !loading && (
            <View style={style.profitLossContainer}>
              <View style={[
                style.profitLossBadge,
                totalProfitLoss >= 0 ? style.profitBadge : style.lossBadge
              ]}>
                <View style={[
                  style.bullet,
                  totalProfitLoss >= 0 ? style.profitBullet : style.lossBullet
                ]} />
                <Text style={[
                  style.profitLossText,
                  totalProfitLoss >= 0 ? style.profitText : style.lossText
                ]}>
                  {totalProfitLoss >= 0 ? "Profit: " : "Loss: "}
                  <Text style={style.boldText}>
                    ₹{Math.abs(totalProfitLoss).toLocaleString("en-IN")}
                  </Text>
                </Text>
              </View>
            </View>
          )}
          <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
            <TableGrid
              loading={loading}
              data={filteredItems}
              showTotal={true}
              style={{ maxHeight: scale(450) }}
              onRefresh={() => {
                if (dropdownValue && selectedDate) {
                  getDailyReport({ shift: dropdownValue, date: selectedDate });
                }
              }}
              refreshing={loading && filteredItems.length > 0}
              columns={[
                { key: 'sno', label: 'S.No.', width: 50, align: 'center' },
                { key: 'name', label: 'Name', width: 200, align: 'left' },
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
                { key: 'net_balance', label: 'Balance', width: 100, align: 'right', numeric: true },
                { key: 'self_hissa_amount', label: 'S-Hissa-Amt', width: 120, align: 'right', numeric: true },
                { key: 'tpHissaAmt', label: 'TP-Hissa-Amt', width: 120, align: 'right', numeric: true },
                { key: 'lena', label: 'Lena', width: 100, align: 'right', numeric: true },
                { key: 'dena', label: 'Dena', width: 100, align: 'right', numeric: true },
              ]}
              enableRowPress={true}
              onRowPress={async (row) => {
                console.log("Row clicked:", row);
                setSelectedRow(row);
                setLoadingJantri(true);
                try {
                  // Use 'date' and 'shift_id' as params to match web version expectations
                  const dateParam = formatDateForAPI(selectedDate);
                  const shiftIdParam = dropdownValue!;

                  const [res, resDeclared] = await Promise.all([
                    APIService.GetConsolidatedJantri(row.id, {
                      shift_id: shiftIdParam,
                      is_declared: true,
                      open_date: dateParam, // Keep open_date for consolidated jantri as per web dialog
                    }),
                    APIService.GetDeclaredNumber({
                      date: dateParam,
                      shift_id: shiftIdParam
                    })
                  ]);

                  if (res?.success && res.data) {
                    let transactions = [];
                    if (Array.isArray(res.data.transaction)) {
                      transactions = res.data.transaction;
                    } else if (res.data.transaction) {
                      transactions = Object.keys(res.data.transaction).map(key => ({
                        number: String(key),
                        amount: res.data.transaction[key]
                      }));
                    }
                    setJantriTransactions(transactions);
                  } else {
                    setJantriTransactions([]);
                  }

                  if (resDeclared?.success && resDeclared.data?.declared_number) {
                    setDeclaredNumber(resDeclared.data.declared_number.toString());
                  } else {
                    setDeclaredNumber(null);
                  }
                } catch (error) {
                  console.error('Error fetching data:', error?.response);
                  setJantriTransactions([]);
                  setDeclaredNumber(null);
                } finally {
                  setLoadingJantri(false);
                  setShowGridTable(true);
                }
              }}
              totalRowLabel="Total"
            />
            {selectedRow && showGridTable && (
              <CommonGridTable
                headers={convertRowToGridData.headers}
                data={convertRowToGridData.data}
                footer={convertRowToGridData.footer}
                footerData={convertRowToGridData.footerData}
                highlightNumbers={highlightNumbers}
                visible={showGridTable}
                onClose={() => {
                  setShowGridTable(false);
                  setSelectedRow(null);
                }}
                title={gridTableProps.title}
                date={gridTableProps.date}
              />
            )}
          </View>
          {loadingJantri && (
            <View style={style.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.BUTTONBG} />
              <Text style={style.loadingText}>Loading Jantri View...</Text>
            </View>
          )}
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
                  borderBottomWidth: scale(1)
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
              <BottomSheetScrollView style={{ paddingHorizontal: scale(10), backgroundColor: COLORS.BGFILESCOLOR, flex: 1 }}>


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
    </PermissionGuard>
  )
}


export default Daily

const style = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.BUTTONBG,
    fontWeight: '600',
  },
  profitLossContainer: {
    marginHorizontal: scale(16),
    marginTop: scale(12),
    alignItems: 'center',
  },
  profitLossBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    borderWidth: 1,
    width: '100%',
    justifyContent: 'center',
  },
  profitBadge: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  lossBadge: {
    backgroundColor: '#FFEBEE',
    borderColor: '#E57373',
  },
  bullet: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: scale(8),
  },
  profitBullet: {
    backgroundColor: '#34A853',
  },
  lossBullet: {
    backgroundColor: '#EA4335',
  },
  profitLossText: {
    fontSize: scale(13),
    fontWeight: '500',
  },
  profitText: {
    color: '#2E7D32',
  },
  lossText: {
    color: '#C62828',
  },
  boldText: {
    fontWeight: '700',
  },
})