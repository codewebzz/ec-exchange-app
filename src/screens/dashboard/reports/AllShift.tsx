import { Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import ScreenHeader from '../../../components/ScreenHeader'
import { COLORS } from '../../../assets/colors'
import Icon from 'react-native-vector-icons/MaterialIcons';
import { scale } from 'react-native-size-matters'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Formik } from 'formik'
import CustomButton from '../../../components/CustomButton'
import CustomDropdown from '../../../components/CustomDropdown'
import CustomDateTimePicker from '../../../components/CustomDatePicker'
import APIService from '../../services/APIService'
import GradientBackground from '../../../components/GradientBackground'
import useSearchBar from '../../../hooks/useSearchBar'
import TableGrid from '../../../components/TableGridView';
import CommonModalTable from '../../../components/CommonModalTable'
import DeclaredNumber from '../../../components/DeclaredNumber';
const AllShift = ({ navigation }: any) => {
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(true);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState<any>(null);
  const [dropdownItems, setDropdownItems] = React.useState<any[]>([]);
  const [openDropdown1, setOpenDropdown1] = React.useState(false);
  const [dropdownValue1, setDropdownValue1] = React.useState(null);
  const [dropdownItems1, setDropdownItems1] = React.useState([
    { label: 'Deal1', value: 'Deal1' },
    { label: 'Deal2', value: 'Deal2' },
  ]);
  const [loading, setLoading] = React.useState(false);
  const [openDropdown2, setOpenDropdown2] = React.useState(false);
  const [dropdownValue2, setDropdownValue2] = React.useState<any>(null);
  const [dropdownItems2, setDropdownItems2] = React.useState<any[]>([
    { label: 'All', value: 'all' },
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ]);
  const [showSearch, setShowSearch] = useState(false);
  const [showModalTable, setShowModalTable] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [modalTableData, setModalTableData] = React.useState<any[]>([]);
  const [modalLoading, setModalLoading] = React.useState(false);

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
  }, []);

  // Search functionality
  const { query, setQuery, filteredItems } = useSearchBar<any>(getData, {
    selector: (item) => String(item?.name ?? item?.agent ?? item?.mobile ?? ''),
    debounceMs: 200,
  });

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
      setDropdownItems([]);
    }
  };

  // Convert row data to grid format (10x10 grid matching JantariResult design)

  const getAllShiftReport = async (values: any) => {
    try {
      setLoading(true);
      const start_date = openDate ? openDate.toLocaleDateString('en-GB') : formattedDate;
      const end_date = closeDate ? closeDate.toLocaleDateString('en-GB') : formattedDate;
      const payload = {
        start_date,
        end_date,
        agent: values?.agent || undefined,
        deal: values?.deal || undefined,
        all: values?.all || undefined,
      }
      const response = await APIService.GetAllShiftReport(payload);
      if (response?.success && response?.data) {
        // Extract ledger_list from response.data.ledger_list
        const ledgerList = Array.isArray(response.data.ledger_list)
          ? response.data.ledger_list
          : Array.isArray(response.data)
            ? response.data
            : [];

        console.log('All Shift report data loaded:', ledgerList.length, 'items');
        setData(ledgerList);
      } else {
        console.warn('No data in response:', response);
        setData([]);
      }
    } catch (error) {
      console.error('Shift fetch failed', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Format props for modal table
  const modalTableProps = React.useMemo(() => {
    if (!selectedRow) return { title: '', dateFrom: '', dateTo: '', columns: [], data: [], summaryCards: [] };

    // Format dates to DD/MM/YYYY format
    const startDate = openDate ? openDate.toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
    const endDate = closeDate ? closeDate.toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

    // Format title like "345 45/55 3/70" from row data
    const title = selectedRow.name
      ? `${selectedRow.name}${selectedRow.rate ? ` ${selectedRow.rate}` : ''}${selectedRow.self_hissa ? `/${selectedRow.self_hissa}` : ''}${selectedRow.tphissa ? ` ${selectedRow.tphissa}` : ''}`
      : 'Report';

    // Columns matching the image description
    const columns = [
      { key: 'sno', label: 'S.No.', width: 50, align: 'center' as const },
      { key: 'shift', label: 'Shift', width: 100, align: 'left' as const },
      {
        key: 'declared_number',
        label: 'Declared Number',
        width: 120,
        align: 'center' as const,
        renderCell: (row: any) => {
          if (startDate === endDate && row.shift_id) {
            return <DeclaredNumber date={startDate} shiftId={row.shift_id} />;
          }
          return <Text style={{ color: '#1d2238', fontSize: scale(10) }}>-</Text>;
        }
      },
      { key: 'rate', label: 'Rate', width: 80, align: 'right' as const, numeric: true },
      { key: 'sh_percent', label: 'SH%', width: 70, align: 'right' as const, numeric: true },
      { key: 'tph_percent', label: 'TPH%', width: 70, align: 'right' as const, numeric: true },
      { key: 't_sale', label: 'T-Sale', width: 90, align: 'right' as const, numeric: true },
      { key: 'd_sale', label: 'D-Sale', width: 90, align: 'right' as const, numeric: true },
      { key: 'a_sale', label: 'A-Sale', width: 90, align: 'right' as const, numeric: true },
      { key: 'comm', label: 'Comm', width: 80, align: 'right' as const, numeric: true },
      { key: 'o_dara', label: 'O-Dara', width: 90, align: 'right' as const, numeric: true },
      { key: 'amt_d', label: 'Amt-D', width: 90, align: 'right' as const, numeric: true },
      { key: 'o_akhar', label: 'O-Akhar', width: 90, align: 'right' as const, numeric: true },
      { key: 'amt_a', label: 'Amt-A', width: 90, align: 'right' as const, numeric: true },
      { key: 'tpc', label: 'TPC', width: 80, align: 'right' as const, numeric: true },
      { key: 's_hissa', label: 'S-Hissa', width: 90, align: 'right' as const, numeric: true },
      { key: 'tph_amt', label: 'TPH Amt', width: 100, align: 'right' as const, numeric: true },
      { key: 'lena', label: 'Lena', width: 90, align: 'right' as const, numeric: true },
      { key: 'dena', label: 'Dena', width: 90, align: 'right' as const, numeric: true },
    ];

    // Map API data to match column keys
    const rowData = modalTableData.map((item: any, index: number) => ({
      sno: index + 1,
      shift_id: item.shift_id || 0,
      shift: item.shift_name || item.shift || '-',
      declared_number: item.declared_number || '-',
      rate: item.rate || 0,
      sh_percent: item.self_hissa || 0,
      tph_percent: item.tphissa || 0,
      t_sale: item.total_sale || 0,
      d_sale: item.dhai_sale || 0,
      a_sale: item.hurp_sale || 0,
      comm: item.commission || 0,
      o_dara: item.open_dhai || 0,
      amt_d: item.clam_value_dhai || 0,
      o_akhar: item.open_hurp || 0,
      amt_a: item.clam_value_hurp || 0,
      tpc: item.tpc || 0,
      s_hissa: item.self_hissa_amount || 0,
      tph_amt: item.tpHissaAmt || 0,
      lena: item.lena || 0,
      dena: item.dena || 0,
    }));

    // Summary cards with values matching web app logic
    const summaryCards = [
      { label: 'OPENING', value: selectedRow.openning || 0, borderColor: '#3B82F6' }, // Blue
      { label: 'Dena&Lena', value: selectedRow.pl || 0, borderColor: '#9333EA' }, // Purple
      { label: 'Wapsi', value: selectedRow.rebate || 0, borderColor: '#F97316' }, // Red/Orange
      { label: 'TPC', value: selectedRow.tpc || 0, borderColor: '#3B82F6' }, // Blue
      { label: 'PAYMENT', value: selectedRow.payment || 0, borderColor: '#10B981' }, // Green
      { label: 'CLOSING', value: selectedRow.closing || 0, borderColor: '#10B981' }, // Green
    ];

    return {
      title,
      dateFrom: startDate,
      dateTo: endDate,
      columns,
      data: rowData,
      summaryCards
    };
  }, [selectedRow, openDate, closeDate, modalTableData]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GradientBackground colors={["#fdf0d0", "#e0efea"]} locations={[0, 30]}>
        <SafeAreaView style={style.safeAreaContainer}>
          <ScreenHeader title={"All Shift"} navigation={navigation} hideBackButton={true} showDrawerButton={true} >
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
                  placeholder="Search by party, agent or mobile..."
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

          <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
            <TableGrid
              loading={loading}
              data={filteredItems}
              showTotal={true}
              style={{ maxHeight: scale(450) }}
              onRefresh={() => {
                getAllShiftReport({});
              }}
              refreshing={loading && filteredItems.length > 0}
              columns={[
                { key: 'sno', label: 'S.No.', width: 50, align: 'center' },
                { key: 'name', label: 'Party', width: 200, align: 'left' },
                { key: 'mobile', label: 'Mobile', width: 120, align: 'left' },
                { key: 'agent', label: 'Agent', width: 120, align: 'left' },
                { key: 'limit', label: 'Limit', width: 100, align: 'right', numeric: true },
                { key: 'openning', label: 'Opening', width: 100, align: 'right', numeric: true },
                { key: 'total_sale', label: 'Total-Sale', width: 100, align: 'right', numeric: true },
                { key: 'dhai_sale', label: 'Dara-Sale', width: 100, align: 'right', numeric: true },
                { key: 'hurp_sale', label: 'Akhar-Sale', width: 100, align: 'right', numeric: true },
                { key: 'commission', label: 'Comm', width: 100, align: 'right', numeric: true },
                { key: 'open_dhai', label: 'Dara-Open', width: 100, align: 'right', numeric: true },
                { key: 'open_hurp', label: 'Akhar-Open', width: 100, align: 'right', numeric: true },
                { key: 'tpc', label: 'TPC', width: 80, align: 'right', numeric: true },
                { key: 'tpHissaAmt', label: 'TPH-amt', width: 100, align: 'right', numeric: true },
                { key: 'self_hissa_amount', label: 'Hissa', width: 100, align: 'right', numeric: true },
                { key: 'pl', label: 'T-Profit', width: 100, align: 'right', numeric: true },
                { key: 'rebate', label: 'Rebate', width: 100, align: 'right', numeric: true },
                { key: 'tp_amount', label: 'TP-amt', width: 100, align: 'right', numeric: true },
                { key: 'payment', label: 'Payment', width: 100, align: 'right', numeric: true },
                { key: 'closing', label: 'Closing', width: 100, align: 'right', numeric: true },
              ]}
              enableRowPress={true}
              onRowPress={async (row) => {
                console.log("Row clicked:", row);
                setSelectedRow(row);
                setShowModalTable(true);
                setModalLoading(true);
                try {
                  const start_date = openDate ? openDate.toLocaleDateString('en-GB') : formattedDate;
                  const end_date = closeDate ? closeDate.toLocaleDateString('en-GB') : formattedDate;
                  const payload = { start_date, end_date };
                  const res = await APIService.GetAllShiftReportById(row.id, payload);
                  if (res?.success && res?.data?.ledger_list) {
                    setModalTableData(res.data.ledger_list);
                  } else {
                    setModalTableData([]);
                  }
                } catch (e) {
                  console.error("Failed to fetch modal details", e);
                  setModalTableData([]);
                } finally {
                  setModalLoading(false);
                }
              }}
              totalRowLabel="Total"
            />
            {selectedRow && showModalTable && (
              <CommonModalTable
                visible={showModalTable}
                onClose={() => {
                  setShowModalTable(false);
                  setSelectedRow(null);
                }}
                title={modalTableProps.title}
                dateFrom={modalTableProps.dateFrom}
                dateTo={modalTableProps.dateTo}
                data={modalTableProps.data}
                columns={modalTableProps.columns}
                summaryCards={modalTableProps.summaryCards}
                loading={modalLoading}
                showTotal={true}
                totalRowLabel="Total"
              />
            )}
          </View>



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
                    opendate: openDate,
                    closedate: closeDate,
                    agent: '',
                    deal: '',
                    all: 'all',
                  }}
                  // validationSchema={AddCompanySchema}
                  onSubmit={(values, { resetForm }) => {
                    getAllShiftReport(values)
                    //  const serializedValues = {
                    //                         ...values,
                    //                         date: typeof values.date === 'string' ? values.date : values.date.toString()
                    //                     };
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
                        label="All"
                        open={openDropdown2}
                        value={dropdownValue2}
                        items={dropdownItems2}
                        setOpen={setOpenDropdown2}
                        setValue={(val: any) => {
                          setDropdownValue2(val());
                          setFieldValue('all', val());
                        }}
                        setItems={setDropdownItems2}
                      />



                      <View style={{ marginVertical: scale(10), flexDirection: 'row', alignItems: 'center' }}>
                        <CustomButton title="Search" onPress={() => {
                          handleSubmit();
                        }} textColor={COLORS.WHITE} />
                        <View style={{ width: scale(8) }} />
                        <CustomButton title="Excel" onPress={() => {
                          console.log('Export to Excel');
                        }} textColor={COLORS.WHITE} />
                        <View style={{ width: scale(8) }} />
                        <CustomButton title="Wapsi" onPress={() => {
                          console.log('Wapsi action');
                        }} textColor={COLORS.WHITE} />
                        <View style={{ width: scale(8) }} />
                        <CustomButton title="Send SMS" onPress={() => {
                          console.log('Send SMS');
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

export default AllShift

const style = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
})