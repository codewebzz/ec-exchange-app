import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { COLORS } from '../../../assets/colors';
import ScreenHeader from '../../../components/ScreenHeader';
import CustomDropdown from '../../../components/CustomDropdown';
import CustomDateTimePicker from '../../../components/CustomDatePicker';
import APIService from '../../services/APIService';
import { scale } from 'react-native-size-matters';


import JantriTable from '../Transaction/addTransaction/JantriTable';
import JantariResultLandscapeModal from './JantariResultLandscapeModal';
import { PermissionGuard } from '../../../components/PermissionGuard';
import { PERMISSIONS } from '../../../helper/permissions';

const JantariResult = ({ navigation }: any) => {
  // State for filter bottom sheet
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(true);
  const filterBottomSheetRef = useRef<any>(null);

  // Filter states
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLandscapeModalOpen, setIsLandscapeModalOpen] = useState(false);

  // Dropdown states
  const [shiftOpen, setShiftOpen] = useState(false);
  const [shiftItems, setShiftItems] = useState<any[]>([]);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Bottom sheet snap points
  const snapPoints = React.useMemo(() => ['90%'], []);

  // Fetch shift data on mount
  useEffect(() => {
    fetchShiftData();
  }, []);

  // Fetch shift data from API (same flow as CollectionResult)
  const fetchShiftData = async () => {
    try {
      setShiftLoading(true);
      const response = await APIService.GetShiftDropDownDataData();
      if (response && response.success && response.data) {
        const transformedShifts = response.data.map((shift: any) => ({
          label: shift.shift_name || shift.name || 'Unknown Shift',
          value: shift.id?.toString() || shift.shift_id?.toString() || ''
        }));
        setShiftItems(transformedShifts);
      } else {
        setShiftItems([]);
      }
    } catch (error) {
      setShiftItems([]);
    } finally {
      setShiftLoading(false);
    }
  };

  // Render backdrop for bottom sheet
  const renderBackdrop = React.useCallback(
    (props: any) => (
      <View
        {...props}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    ),
    [],
  );

  // Handle filter close
  const handleFilterClosePress = () => {
    if (filterBottomSheetRef.current) {
      filterBottomSheetRef.current.close();
    }
    setIsFilterBottomSheetOpen(false);
  };

  const fetchJantriData = async () => {
    try {
      setIsLoading(true);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      const payload = {
        shift_id: selectedShift || undefined,
        is_declared: 'all',
        date: formattedDate,
      };

      const res = await APIService.GetMainJantri(payload);
      if (res && res.success) {
        let jantriData = res.data?.transaction || [];
        if (!Array.isArray(jantriData)) {
          jantriData = Object.keys(jantriData).map(key => ({
            number: key,
            amount: jantriData[key]
          }));
        }
        setTransactions(jantriData);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching jantri result:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSubmit = () => {
    fetchJantriData();
    handleFilterClosePress();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShiftData();
    await fetchJantriData();
    setRefreshing(false);
  };

  // Handle date change
  const handleDateChange = (fieldName: string, value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  return (
    <PermissionGuard permission={PERMISSIONS.RESULT_JANTRI_VIEW.value}>
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
      {/* Header */}
      <ScreenHeader
        navigation={navigation}
        title="Jantari Result"

        hideBackButton={true} showDrawerButton={true}
      >
        <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setIsLandscapeModalOpen(true)}>
            <Ionicons name="expand" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsFilterBottomSheetOpen(true)}>
            <Ionicons name="filter" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </ScreenHeader>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.BUTTONBG]} tintColor={COLORS.BUTTONBG} />}>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.BUTTONBG} style={{ marginTop: scale(50) }} />
        ) : (
          <View style={{ padding: scale(10), marginBottom: scale(20) }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}>
              <View style={{ width: 800 }}>
                <JantriTable externalTransactions={transactions} isEditable={false} />
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Filter Bottom Sheet */}
      {isFilterBottomSheetOpen && (
        <BottomSheet
          backgroundStyle={{ backgroundColor: '#F5F5DC' }}
          ref={filterBottomSheetRef}
          style={styles.bottomSheet}
          index={0}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          onChange={(index: number) => {
            if (index === -1) {
              setIsFilterBottomSheetOpen(false);
            } else {
              setIsFilterBottomSheetOpen(true);
            }
          }}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={true}
          onClose={() => {
            setIsFilterBottomSheetOpen(false);
          }}
        >
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Jantari Filters</Text>
            <TouchableOpacity onPress={handleFilterClosePress}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <BottomSheetScrollView style={styles.bottomSheetContent}>
            {/* Shift Dropdown */}
            <View style={styles.filterSection}>

              <View >

                 <CustomDropdown
                  label='Shift'
                  open={shiftOpen}
                  value={selectedShift}
                  items={shiftItems}
                  setOpen={setShiftOpen}
                  setValue={(val: any) => {
                    if (typeof val === 'function') {
                      setSelectedShift(val());
                    } else {
                      setSelectedShift(val);
                    }
                  }}
                  setItems={() => { }}
                  placeholder={shiftLoading ? "Loading shifts..." : "Select Shift"}
                />
              </View>
            </View>

            {/* Date Picker */}
            <View style={styles.filterSection}>

              <CustomDateTimePicker
                label={"Date"}
                value={selectedDate}
                setFieldValue={handleDateChange}
                fieldName="date"
                mode="date"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleFilterSubmit}>
              <Text style={styles.submitButtonText}>Search</Text>
            </TouchableOpacity>
          </BottomSheetScrollView>
        </BottomSheet>
      )}

      {/* Landscape Modal */}
      <JantariResultLandscapeModal
        visible={isLandscapeModalOpen}
        onClose={() => setIsLandscapeModalOpen(false)}
        title="Jantari Result"
        transactions={transactions}
      />
    </SafeAreaView>
    </PermissionGuard>
  );
};

export default JantariResult;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: COLORS.BGFILESCOLOR,
  },
  content: {
    flex: 1,
    padding: 1,
  },
  filterBar: {
    backgroundColor: COLORS.BUTTONBG,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridContainer: {
    marginBottom: 20,
  },
  gridScrollContainer: {
    flexGrow: 0,
  },
  gridSection: {
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2a37',
  },

  bottomSheet: {
    borderWidth: 1,
    borderRadius: 10,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bottomSheetContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: COLORS.BUTTONBG,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shiftHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 0,
  },
  refreshButton: {
    padding: 4,
    borderRadius: 4,
  },
});