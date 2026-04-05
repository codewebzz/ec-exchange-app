import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { COLORS } from '../../../assets/colors';
import ScreenHeader from '../../../components/ScreenHeader';
import CustomDropdown from '../../../components/CustomDropdown';
import CustomDateTimePicker from '../../../components/CustomDatePicker';
import APIService from '../../services/APIService';
import GradientBackground from '../../../components/GradientBackground';

const { width: screenWidth } = Dimensions.get('window');

// Result 30 Days Section Component
const Result30DaysSection = () => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Result 30 Days</Text>
        <Text style={styles.sectionHeaderText}>Number</Text>
        <Text style={styles.sectionHeaderText}>Sale</Text>
        <Text style={styles.sectionHeaderText}>Amount</Text>
      </View>
      <View style={styles.sectionContent}>
        <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.noResultsText}>No results found.</Text>
          {/* Add more data items here when available */}
        </ScrollView>
      </View>
    </View>
  );
};

// P&L Result Section Component
const PnLResultSection = () => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderLight}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="trending-up" size={20} color={COLORS.BUTTONBG} />
          <Text style={styles.sectionTitleText}>P&L Result</Text>
        </View>
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionInfoText}>Number: | Profit:</Text>
        </View>
      </View>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Sr</Text>
        <Text style={styles.tableHeaderText}>Party</Text>
        <Text style={styles.tableHeaderText}>Sale</Text>
        <Text style={styles.tableHeaderText}>P&L</Text>
        <Text style={styles.tableHeaderText}>Last-Win</Text>
      </View>
      <View style={styles.sectionContent}>
        <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.noResultsText}>No results found.</Text>
          {/* Add more data items here when available */}
        </ScrollView>
      </View>
    </View>
  );
};

// Declare Result Section Component
const DeclareResultSection = () => {
  const [declareNumber, setDeclareNumber] = useState('');

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderLight}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.BUTTONBG} />
          <Text style={styles.sectionTitleText}>Declare Result</Text>
        </View>
        <View style={styles.declareInputContainer}>
          <TextInput
            style={styles.declareInput}
            placeholder="Enter number"
            value={declareNumber}
            onChangeText={setDeclareNumber}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.declareButton}>
            <Text style={styles.declareButtonText}>Declare</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Date</Text>
        <Text style={styles.tableHeaderText}>Result</Text>
        <Text style={styles.tableHeaderText}>Action</Text>
        <Text style={styles.tableHeaderText}>Action</Text>
      </View>
      <View style={styles.sectionContent}>
        <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.noResultsText}>No results found.</Text>
          {/* Add more data items here when available */}
        </ScrollView>
      </View>
    </View>
  );
};

const LivePredaction = ({ navigation }: any) => {
  // State for filter bottom sheet
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(false);
  const filterBottomSheetRef = useRef<any>(null);

  // Filter states
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLivePrediction, setIsLivePrediction] = useState(true);
  
  // Search and API states
  const [searchNumber, setSearchNumber] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [liveResultData, setLiveResultData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown states
  const [shiftOpen, setShiftOpen] = useState(false);
  const [shiftItems, setShiftItems] = useState<any[]>([]);
  const [shiftLoading, setShiftLoading] = useState(false);

  // Bottom sheet snap points
  const snapPoints = React.useMemo(() => ['90%'], []);

  // Fetch shift data on component mount
  useEffect(() => {
    fetchShiftData();
  }, []);

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

  // Handle search number API call
  const handleSearchNumber = async (number: string) => {
    if (!number.trim()) {
      setLiveResultData(null);
      return;
    }

    try {
      setSearchLoading(true);
      const response: any = await APIService.liveResultByNumber({}, number);
      
      if (response && response.success) {
        setLiveResultData(response.data || response);
        console.log('Live result by number:', response.data || response);
      } else {
        setLiveResultData(null);
        console.log('No data found for number:', number);
      }
    } catch (error) {
      console.error('Search API Error:', error);
      setLiveResultData(null);
      Alert.alert('Error', 'Failed to fetch data for this number');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle filter submit
  const handleFilterSubmit = async () => {
    // Validate required fields
    if (!selectedShift) {
      Alert.alert('Error', 'Please select a shift');
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare API data
      const apiData = {
        shift_id: selectedShift,
        date: selectedDate.toLocaleDateString('en-GB'), // Format: dd/mm/yyyy
      };

      console.log('Filter submitted:', apiData);

      // Call LiveResult API
      const response: any = await APIService.LiveResult(apiData, '');
      
      if (response && response.success) {
        setLiveResultData(response.data || response);
        console.log('Live result data received:', response.data || response);
        Alert.alert('Success', 'Data fetched successfully');
      } else {
        Alert.alert('Error', response?.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to fetch live prediction data');
    } finally {
      setIsLoading(false);
      // Close the bottom sheet
      handleFilterClosePress();
    }
  };

  // Handle date change
  const handleDateChange = (fieldName: string, value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  // Fetch shift data from API
  const fetchShiftData = async () => {
    try {
      setShiftLoading(true);
      const response = await APIService.GetShiftDropDownDataData();
      console.log('Shift data response:', response);
      
      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format
        const transformedShifts = response.data.map((shift: any) => ({
          label: shift.shift_name || shift.name || 'Unknown Shift',
          value: shift.id?.toString() || shift.shift_id?.toString() || ''
        }));
        setShiftItems(transformedShifts);
        console.log('Transformed shift items:', transformedShifts);
      } else {
        console.log('No shift data found or API error');
        setShiftItems([]);
      }
    } catch (error) {
      console.error('Error fetching shift data:', error);
      setShiftItems([]);
    } finally {
      setShiftLoading(false);
    }
  };

  return (
    <GradientBackground colors={[ "#fdf0d0","#e0efea"]} locations={[0,30]}>
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
      {/* Header */}
      <ScreenHeader
        navigation={navigation}
        title="Live Predaction"
       
        hideBackButton={true} showDrawerButton={true}
      
      >
        <TouchableOpacity onPress={() => setIsFilterBottomSheetOpen(true)}>
          <Ionicons name="filter" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </ScreenHeader>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Button */}
        

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={searchLoading ? "Searching..." : "Search number..."}
            placeholderTextColor="#999"
            value={searchNumber}
            onChangeText={(text) => {
              setSearchNumber(text);
              // Debounce the API call
              if (text.trim()) {
                setTimeout(() => handleSearchNumber(text), 500);
              } else {
                setLiveResultData(null);
              }
            }}
            editable={!searchLoading}
          />
          {searchLoading && (
            <View style={styles.searchLoadingIndicator}>
              <Ionicons name="search" size={20} color="#999" />
            </View>
          )}
          {liveResultData && (
            <View style={styles.searchResultIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.searchResultText}>Data found</Text>
            </View>
          )}
        </View>

        {/* Result 30 Days Section */}
        <Result30DaysSection />

        {/* P&L Result Section */}
        <PnLResultSection />

        {/* Declare Result Section */}
        <DeclareResultSection />
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
            <Text style={styles.bottomSheetTitle}>Filter</Text>
            <TouchableOpacity onPress={handleFilterClosePress}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <BottomSheetScrollView style={styles.bottomSheetContent}>
            {/* Live Prediction Toggle */}
            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={[styles.livePredictionToggle, isLivePrediction && styles.livePredictionToggleActive]}
                onPress={() => setIsLivePrediction(!isLivePrediction)}
              >
                <View style={[styles.toggleDot, isLivePrediction && styles.toggleDotActive]} />
                <Text style={[styles.livePredictionText, isLivePrediction && styles.livePredictionTextActive]}>
                  Live Prediction
                </Text>
              </TouchableOpacity>
            </View>

            {/* Shift Dropdown */}
            <View style={styles.filterSection}>
              <View style={[styles.shiftHeaderContainer,{top:30}]}>
                <Text style={styles.filterLabel}>Shift</Text>
                {/* <TouchableOpacity 
                  style={styles.refreshButton} 
                  onPress={fetchShiftData}
                  disabled={shiftLoading}
                >
                  <Ionicons 
                    name="refresh" 
                    size={16} 
                    color={shiftLoading ? "#999" : COLORS.BUTTONBG} 
                  />
                </TouchableOpacity> */}
              </View>
              <CustomDropdown
                open={shiftOpen}
                value={selectedShift}
                items={shiftItems}
                setOpen={setShiftOpen}
                setValue={setSelectedShift}
                setItems={() => {}}
                placeholder={shiftLoading ? "Loading shifts..." : "Select Shift"}
              />
            </View>

            {/* Date Picker */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel,{top:30}]}>Date</Text>
              <CustomDateTimePicker
                value={selectedDate}
                setFieldValue={handleDateChange}
                fieldName="date"
                mode="date"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleFilterSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Loading...' : 'Search'}
              </Text>
            </TouchableOpacity>
          </BottomSheetScrollView>
        </BottomSheet>
      )}
    </SafeAreaView>
    </GradientBackground>
  );
};

export default LivePredaction;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: '#F0F8FF', // Light blue background
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
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: COLORS.WHITE,
    // borderWidth: 1,
    // borderColor: '#87CEEB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  searchLoadingIndicator: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  searchResultIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  searchResultText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    backgroundColor: COLORS.BUTTONBG,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sectionHeaderText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  sectionHeaderLight: {
    backgroundColor: '#E6F3FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleText: {
    color: COLORS.BUTTONBG,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  sectionInfoText: {
    color: COLORS.BUTTONBG,
    fontSize: 14,
    fontWeight: '600',
  },
  declareInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  declareInput: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: '#87CEEB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    width: 120,
  },
  declareButton: {
    backgroundColor: COLORS.BUTTONBG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  declareButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableHeader: {
    backgroundColor: COLORS.BUTTONBG,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tableHeaderText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  sectionContent: {
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    minHeight: 100,
  },
  scrollableContent: {
    padding: 16,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
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
    // marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  livePredictionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  livePredictionToggleActive: {
    backgroundColor: '#90EE90',
  },
  toggleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
  },
  toggleDotActive: {
    backgroundColor: '#4CAF50',
  },
  livePredictionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  livePredictionTextActive: {
    color: '#333',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: COLORS.BUTTONBG,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
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
    marginBottom: 8,
  },
  refreshButton: {
    padding: 4,
    borderRadius: 4,
  },
});