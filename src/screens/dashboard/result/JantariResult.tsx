import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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

const { width: screenWidth } = Dimensions.get('window');

// Jantari Grid Table Component
const CELL_WIDTH = 70;
const TOTAL_COLUMN_WIDTH = 96;
const ROW_HEIGHT = 48;
const TABLE_WIDTH = CELL_WIDTH * 10 + TOTAL_COLUMN_WIDTH;

const JantariGridTable = () => {
  return (
    <View style={styles.gridSection}>
      <Text style={styles.gridTitle}>Jantari Data</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.tableScrollContainer}
        bounces={false}
      >
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.row}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <View key={num} style={styles.headerCell}>
                <Text style={styles.headerCellText}>{num}</Text>
              </View>
            ))}
            <View style={[styles.headerCell, styles.totalColumnCell]}>
              <Text style={styles.headerCellText}>Total</Text>
            </View>
          </View>

          {/* Data Rows */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((colIndex) => {
                const number = ((rowIndex - 1) * 10 + colIndex).toString().padStart(2, '0');
                return (
                  <View key={colIndex} style={styles.dataCell}>
                    <View style={styles.numberBadge}>
                      <Text style={styles.numberBadgeText}>{number}</Text>
                    </View>
                    <Text style={styles.cellText}>0</Text>
                  </View>
                );
              })}

              {/* Row Total */}
              <View style={[styles.totalCell, styles.totalColumnCell]}>
                <Text style={styles.totalCellText}>0</Text>
              </View>
            </View>
          ))}

          {/* Summary Row */}
          <View style={styles.row}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <View key={num} style={styles.summaryCell}>
                <Text style={styles.summaryCellText}>0</Text>
              </View>
            ))}
            <View style={[styles.summaryCell, styles.totalColumnCell]}>
              <Text style={styles.summaryCellText}>0</Text>
            </View>
          </View>

          {/* B Series Row */}
          <View style={styles.row}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num, index) => (
              <View key={index} style={[styles.dataCell, styles.seriesCell]}>
                <View style={[styles.numberBadge, styles.seriesBadge]}>
                  <Text style={styles.numberBadgeText}>B{num}</Text>
                </View>
                <Text style={styles.cellText}>0</Text>
              </View>
            ))}
            <View style={[styles.totalCell, styles.totalColumnCell]}>
              <Text style={styles.totalCellText}>0</Text>
            </View>
          </View>

          {/* A Series Row */}
          <View style={styles.row}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num, index) => (
              <View key={index} style={[styles.dataCell, styles.seriesCell]}>
                <View style={[styles.numberBadge, styles.seriesBadge]}>
                  <Text style={styles.numberBadgeText}>A{num}</Text>
                </View>
                <Text style={styles.cellText}>0</Text>
              </View>
            ))}
            <View style={[styles.totalCell, styles.totalColumnCell]}>
              <Text style={styles.totalCellText}>0</Text>
            </View>
          </View>

          {/* Grand Total Row */}
          <View style={styles.row}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <View key={num} style={styles.grandTotalCell}>
                <Text style={styles.grandTotalCellText}>-</Text>
              </View>
            ))}
            <View style={styles.grandTotalLabelCell}>
              <Text style={styles.grandTotalLabelText}>Grand Total</Text>
            </View>
            <View style={[styles.grandTotalValueCell, styles.totalColumnCell]}>
              <Text style={styles.grandTotalValueText}>0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const JantariResult = ({ navigation }: any) => {
  // State for filter bottom sheet
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(false);
  const filterBottomSheetRef = useRef<any>(null);

  // Filter states
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dropdown states
  const [shiftOpen, setShiftOpen] = useState(false);
  const [shiftItems, setShiftItems] = useState<any[]>([]);
  const [shiftLoading, setShiftLoading] = useState(false);

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

  // Handle filter submit
  const handleFilterSubmit = () => {
    // Here you would typically make an API call with the filter parameters
    console.log('Filter submitted:', {
      selectedShift,
      selectedDate,
    });

    // Close the bottom sheet
    handleFilterClosePress();
  };

  // Handle date change
  const handleDateChange = (fieldName: string, value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
      {/* Header */}
      <ScreenHeader
          navigation={navigation}
          title="Jantari Result"
         
          hideBackButton={true} showDrawerButton={true}
      >
        <TouchableOpacity onPress={() => setIsFilterBottomSheetOpen(true)}>
          <Ionicons name="filter" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </ScreenHeader>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

       
        
            <JantariGridTable />
       
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
                setValue={setSelectedShift}
                setItems={() => {}}
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
    </SafeAreaView>
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
    padding: 16,
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
  table: {
    flexDirection: 'column',
    backgroundColor: '#fdfdfd',
    borderWidth: 1,
    borderColor: '#d8dce8',
    borderRadius: 12,
    overflow: 'hidden',
    width: TABLE_WIDTH,
  },
  tableScrollContainer: {
    flexGrow: 0,
    width: TABLE_WIDTH,
  },
  row: {
    flexDirection: 'row',
    flexShrink: 0,
  },
  headerCell: {
    backgroundColor: '#1f2a37',
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2a37',
    flexShrink: 0,
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f4f6fd',
  },
  dataCell: {
    backgroundColor: '#f9fafc',
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3e6f0',
    flexShrink: 0,
    position: 'relative',
  },
  numberBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#10b5a6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
  },
  numberBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fdfdfd',
  },
  cellText: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
    left:scale(5)
  },
  summaryCell: {
    backgroundColor: '#1f2a37',
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2a37',
    flexShrink: 0,
  },
  summaryCellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f4f6fd',
  },
  totalCell: {
    backgroundColor: '#1f2a37',
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2a37',
    flexShrink: 0,
  },
  totalCellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f4f6fd',
  },
  totalColumnCell: {
    width: TOTAL_COLUMN_WIDTH,
  },
  seriesCell: {
    backgroundColor: '#fdf6f0',
  },
  seriesBadge: {
    backgroundColor: '#10b5a6',
  },
  grandTotalCell: {
    backgroundColor: '#1f2a37',
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2a37',
    flexShrink: 0,
  },
  grandTotalCellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f4f6fd',
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
  grandTotalLabelCell: {
    backgroundColor: '#1f2a37',
    width: TOTAL_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#1f2a37',
    flexShrink: 0,
    paddingLeft: 12,
  },
  grandTotalLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f4f6fd',
  },
  grandTotalValueCell: {
    backgroundColor: '#1f2a37',
    width: TOTAL_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2a37',
    flexShrink: 0,
  },
  grandTotalValueText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f4f6fd',
  },
});