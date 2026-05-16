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
import CustomMonthPicker from '../../../components/CustomMonthPicker'
import APIService from '../../services/APIService'
import GradientBackground from '../../../components/GradientBackground'
import useSearchBar from '../../../hooks/useSearchBar'
import TableGrid from '../../../components/TableGridView';

const ResultHistory = ({ navigation }: any) => {
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(true);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState(null);
  const [dropdownItems, setDropdownItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Date state (using it for month/year selection)
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const handleSheetChange = (index: number) => {
    Keyboard.dismiss();
    if (index === -1) {
      setIsOpenBottomSheet(false);
    } else {
      setIsOpenBottomSheet(true);
    }
  };

  const snapPoints = React.useMemo(() => ['60%'], []);
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

  React.useEffect(() => {
    fetchShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await APIService.GetShiftDropDownDataData();
      if (res && res.success && Array.isArray(res.data)) {
        const items = res.data.map((s: any) => ({
          label: s.name,
          value: s.id,
        }));
        setDropdownItems(items);
      }
    } catch (e) {
      console.error('Failed to fetch shifts:', e);
    }
  };

  const { query, setQuery, filteredItems } = useSearchBar<any>(getData, {
    selector: (item) => String(item?.date ?? item?.declared_number ?? ''),
    debounceMs: 200,
  });

  const getResultHistory = async (values: any) => {
    try {
      setLoading(true);
      const date = values.month || selectedDate;
      const payload = {
        shift_id: values.shift_id || dropdownValue,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      };

      if (!payload.shift_id) {
        setLoading(false);
        return;
      }

      const response = await APIService.GetResultHistoryReport(payload);
      if (response?.success && Array.isArray(response.data)) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Result History fetch failed', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GradientBackground colors={["#fdf0d0", "#e0efea"]} locations={[0, 30]}>
        <SafeAreaView style={style.safeAreaContainer}>
          <ScreenHeader title={"Result History"} navigation={navigation} hideBackButton={true} showDrawerButton={true} >
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
                  placeholder="Search by date or number..."
                  value={query}
                  onChangeText={setQuery}
                  style={{ backgroundColor: COLORS.WHITE, minHeight: 40, borderRadius: 8, paddingHorizontal: 12, elevation: 10 }}
                />
              </View>
            </View>
          ) : null}

          <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
            <TableGrid
              loading={loading}
              data={filteredItems}
              showTotal={false}
              onRefresh={() => {
                getResultHistory({});
              }}
              refreshing={loading && filteredItems.length > 0}
              style={{ maxHeight: scale(450) }}
              columns={[
                { key: 'sno', label: 'S.No.', width: 60, align: 'center' },
                { key: 'date', label: 'Date', width: 150, align: 'left' },
                { key: 'declared_number', label: 'Declared Number', width: 150, align: 'right' },
              ]}
            />
          </View>

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
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: scale(20),
                  paddingBottom: scale(4),
                  borderBottomWidth: scale(1)
                }}>
                <Text style={{ fontSize: scale(16), fontWeight: '600', color: COLORS.BLACK }}>
                  Filter
                </Text>
                <TouchableOpacity onPress={handleClosePress}>
                  <Icon name='cancel' size={scale(20)} />
                </TouchableOpacity>
              </View>
              <BottomSheetScrollView style={{ paddingHorizontal: scale(10), backgroundColor: COLORS.BGFILESCOLOR, flex: 1 }}>
                <Formik
                  initialValues={{
                    shift_id: dropdownValue,
                    month: selectedDate,
                  }}
                  onSubmit={(values) => {
                    getResultHistory(values);
                    handleClosePress();
                  }}
                >
                  {({ handleSubmit, setFieldValue }) => (
                    <View style={{ paddingVertical: scale(20) }}>
                      <CustomDropdown
                        label="Shift"
                        open={openDropdown}
                        value={dropdownValue}
                        items={dropdownItems}
                        setOpen={setOpenDropdown}
                        setValue={(val: any) => {
                          const value = val();
                          setDropdownValue(value);
                          setFieldValue('shift_id', value);
                        }}
                        setItems={setDropdownItems}
                      />

                      <CustomMonthPicker
                        label="Month"
                        value={selectedDate}
                        onSelect={(date: Date) => {
                          setSelectedDate(date);
                          setFieldValue('month', date);
                        }}
                      />

                      <View style={{ marginVertical: scale(10) }}>
                        <CustomButton title="Search" onPress={() => handleSubmit()} textColor={COLORS.WHITE} />
                      </View>
                    </View>
                  )}
                </Formik>
              </BottomSheetScrollView>
            </BottomSheet>
          )}
        </SafeAreaView>
      </GradientBackground>
    </GestureHandlerRootView>
  )
}

export default ResultHistory

const style = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
})
