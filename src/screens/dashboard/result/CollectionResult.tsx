import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { COLORS } from '../../../assets/colors';
import { scale } from 'react-native-size-matters';
import ScreenHeader from '../../../components/ScreenHeader';
import CustomButton from '../../../components/CustomButton';
import CustomDropdown from '../../../components/CustomDropdown';
import CustomDateTimePicker from '../../../components/CustomDatePicker';
import JantriModal from '../Transaction/addTransaction/JantriModal';
import APIService from '../../services/APIService';

const { width: screenWidth } = Dimensions.get('window');

// Common Grid Table Component
const CollectionGridTable = ({ transactionData }: { transactionData: any[] }) => {
  const safeTransactionData = Array.isArray(transactionData) ? transactionData : [];
  return (
    <View style={styles.gridSection}>
      <Text style={styles.gridTitle}>
        Collection Data {transactionData.length > 0 ? `(${transactionData.length} transactions)` : ''}
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.tableScrollContainer}
        bounces={false}
      >
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.row}>
            <View style={styles.headerCell}>
              <Text style={styles.headerCellText}></Text>
            </View>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9 ].map((num) => (
              <View key={num} style={styles.headerCell}>
                <Text style={styles.headerCellText}>{num}</Text>
              </View>
            ))}
            <View style={styles.headerCell}>
              <Text style={styles.headerCellText}>Total</Text>
            </View>
          </View>

          {/* Data Rows */}
          {[ 0,1, 2, 3, 4, 5, 6, 7, 8, 9].map((rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {/* Row Header */}
               <View style={[styles.rowHeaderCell]}>
                <Text style={[styles.rowHeaderText]}>
                  {(rowIndex * 10 + 1).toString().padStart(2, '0')}
                </Text>
              </View>
              
              {/* Data Cells */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((colIndex) => {
                const number = (rowIndex * 10 + colIndex + 1).toString().padStart(2, '0');
                // Find transaction data for this number
                const transaction = safeTransactionData.find(t => t?.number === number);
                return (
                  <View key={colIndex} style={styles.dataCell}>
                    <Text style={styles.rowHeaderText}>
                      {transaction ? transaction.amount : number}
                    </Text>
                  </View>
                );
              })}
              
              {/* Row Total */}
              <View style={styles.totalCell}>
                <Text style={styles.totalCellText}>0</Text>
              </View>
            </View>
          ))}

          {/* Summary Row */}
          <View style={styles.row}>
            <View style={styles.summaryHeaderCell}>
              <Text style={styles.summaryHeaderText}>0</Text>
            </View>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <View key={num} style={styles.summaryCell}>
                <Text style={styles.summaryCellText}>0</Text>
              </View>
            ))}
            <View style={styles.summaryCell}>
              <Text style={styles.summaryCellText}>0</Text>
            </View>
          </View>

          {/* B Series Row */}
          <View style={styles.row}>
            {/* <View style={styles.rowHeaderCell}>
              <Text style={styles.rowHeaderText}>B1</Text>
            </View> */}
            {[1,2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <View key={num} style={styles.dataCell}>
                <Text style={styles.rowHeaderText}>B{num}</Text>
              </View>
            ))}
            <View style={styles.totalCell}>
              <Text style={styles.totalCellText}>0</Text>
            </View>
          </View>

          {/* A Series Row */}
          <View style={styles.row}>
            {/* <View style={styles.rowHeaderCell}>
              <Text style={styles.rowHeaderText}>A1</Text>
            </View> */}
            {[1,2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <View key={num} style={styles.dataCell}>
                <Text style={styles.rowHeaderText}>A{num}</Text>
              </View>
            ))}
            <View style={styles.totalCell}>
              <Text style={styles.totalCellText}>0</Text>
            </View>
          </View>

          {/* Grand Total Row */}
          <View style={styles.row}>
            <View style={styles.grandTotalHeaderCell}>
              <Text style={styles.grandTotalHeaderText}>-</Text>
            </View>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <View key={num} style={styles.grandTotalCell}>
                <Text style={styles.grandTotalCellText}>-</Text>
              </View>
            ))}
            <View style={styles.grandTotalLabelCell}>
              <Text style={styles.grandTotalLabelText}>Grand Total</Text>
            </View>
            <View style={styles.grandTotalValueCell}>
              <Text style={styles.grandTotalValueText}>0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const CollectionResult = ({ navigation }: any) => {
  // State for filter bottom sheet
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(false);
  const filterBottomSheetRef = useRef<any>(null);
  
  // State for JantriModal
  const [isJantriModalVisible, setIsJantriModalVisible] = useState(false);
  const [jantriData, setJantriData] = useState<any[]>([]);
  
  // State for transaction data
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [selectedCollectionType, setSelectedCollectionType] = useState('Collection');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategories, setSelectedCategories] = useState({
    commission: false,
    hissa: false,
    wapsi: false,
    akh: false,
  });
  const [amountLess, setAmountLess] = useState('0');
  const [lessPercentage, setLessPercentage] = useState('0');
  const [roundOff, setRoundOff] = useState('0');

  // Ledger states
  const [partyName, setPartyName] = useState('');
  const [ledgers, setLedgers] = useState<any[]>([]);

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
        cut_commission: selectedCategories.commission ? 1 : 0,
        cut_patti: selectedCategories.hissa ? 1 : 0,
        cut_wapsi: selectedCategories.wapsi ? 1 : 0,
        mix_akh: selectedCategories.akh ? 1 : 0,
        less_amt: parseFloat(amountLess) || 0,
        less_percentage: parseFloat(lessPercentage) || 0,
        round_off_value: parseFloat(roundOff) || 0,
      };

      console.log('Filter submitted:', apiData);

      // Call API
      const response: any = await APIService.collectionResult(apiData);
      
      // The response structure might be different, let's handle it safely
      if (response && response.success) {
        // Extract transaction data from response - check different possible structures
        const transactions = response?.data?.transaction ?? response?.transaction ?? [];
        setTransactionData(Array.isArray(transactions) ? transactions : []);
        console.log('Transaction data received:', transactions);
      } else {
        Alert.alert('Error', response?.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to fetch collection data');
    } finally {
      setIsLoading(false);
      // Close the bottom sheet
      handleFilterClosePress();
    }
  };

  // Handle add ledger
  const handleAddLedger = () => {
    if (!partyName.trim()) {
      Alert.alert('Error', 'Please enter a party name');
      return;
    }

    const newLedger = {
      id: Date.now().toString(),
      name: partyName.trim(),
      timestamp: new Date(),
    };

    setLedgers([...ledgers, newLedger]);
    setPartyName('');
  };

  // Handle clear ledgers
  const handleClearLedgers = () => {
    Alert.alert(
      'Clear Ledgers',
      'Are you sure you want to clear all ledgers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setLedgers([]),
        },
      ]
    );
  };

  // Handle category toggle
  const toggleCategory = (category: keyof typeof selectedCategories) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
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
        console.log(response.data, "response.dataresponse.data");
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

  // Handle JantriModal save
  const handleJantriSave = (transactions: any[]) => {
    console.log('Jantri data saved:', transactions);
    setIsJantriModalVisible(false);
    // Here you would typically save the data or make an API call
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
      {/* Header */}
      <ScreenHeader
      
       
        navigation={navigation}
        title="Collection Result"
       
        hideBackButton={true} showDrawerButton={true}
      >
        <TouchableOpacity onPress={() => setIsFilterBottomSheetOpen(true)}>
          <Ionicons name="filter" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </ScreenHeader>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Button */}
        {/* <View style={styles.filterBar}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setIsFilterBottomSheetOpen(true)}
          >
            <Ionicons name="filter" size={20} color={COLORS.WHITE} />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View> */}

        {/* Ledger Management Card */}
        <View style={styles.ledgerCard}>
          <View style={styles.ledgerHeader}>
            <View style={styles.ledgerTitleContainer}>
              <Ionicons name="list" size={24} color={COLORS.BUTTONBG} />
              <Text style={styles.ledgerTitle}>Ledgers</Text>
            </View>
            <View style={styles.ledgerInputContainer}>
              <TextInput
                style={styles.partyNameInput}
                placeholder="Party Name"
                value={partyName}
                onChangeText={setPartyName}
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddLedger}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {ledgers.length === 0 ? (
            <Text style={styles.noLedgersText}>No ledgers found.</Text>
          ) : (
            <View style={styles.ledgerList}>
              {ledgers.map((ledger) => (
                <View key={ledger.id} style={styles.ledgerItem}>
                  <Text style={styles.ledgerItemText}>{ledger.name}</Text>
                  <Text style={styles.ledgerItemDate}>
                    {ledger.timestamp.toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.clearButton} onPress={handleClearLedgers}>
            <Text style={styles.clearButtonText}>Clear Ledgers List</Text>
          </TouchableOpacity>
        </View>

        {/* Collection Data Grid */}
        <CollectionGridTable transactionData={transactionData} />
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
            <Text style={styles.bottomSheetTitle}>Collection Filters</Text>
            <TouchableOpacity onPress={handleFilterClosePress}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <BottomSheetScrollView style={styles.bottomSheetContent}>
            {/* Collection Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Collection</Text>
              <View style={styles.collectionTypeContainer}>
                <View style={styles.collectionTypeItem}>
                  <View style={styles.radioDot} />
                  <Text style={styles.collectionTypeText}>{selectedCollectionType}</Text>
                </View>
              </View>
            </View>

            {/* Shift Dropdown */}
            <View style={styles.filterSection}>
              <View style={[styles.shiftHeaderContainer,{top:10}]}>
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
            <View style={[styles.filterSection]}>
              <Text style={[styles.filterLabel,{top:20}]}>Date</Text>
              <CustomDateTimePicker
                value={selectedDate}
                setFieldValue={handleDateChange}
                fieldName="date"
                mode="date"
              />
            </View>

            {/* Categories */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel,{marginVertical:10}]}>Categories</Text>
              <View style={styles.categoriesContainer}>
                {Object.entries(selectedCategories).map(([key, value]) => (
                  <View key={key} style={styles.categoryItem}>
                    <TouchableOpacity
                      style={[styles.checkbox, value && styles.checkboxChecked]}
                      onPress={() => toggleCategory(key as keyof typeof selectedCategories)}
                    >
                      {value && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </TouchableOpacity>
                    <Text style={styles.categoryText}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Amount Less */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Amount Less</Text>
              <TextInput
                style={styles.filterInput}
                value={amountLess}
                onChangeText={setAmountLess}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>

            {/* Less Percentage */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Less %age</Text>
              <TextInput
                style={styles.filterInput}
                value={lessPercentage}
                onChangeText={setLessPercentage}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>

            {/* Round Off */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Round Off</Text>
              <TextInput
                style={styles.filterInput}
                value={roundOff}
                onChangeText={setRoundOff}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleFilterSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Loading...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </BottomSheetScrollView>
        </BottomSheet>
      )}

      {/* JantriModal */}
      <JantriModal
        visible={isJantriModalVisible}
        onClose={() => setIsJantriModalVisible(false)}
        onSave={handleJantriSave}
        title="Collection Results"
        externalTransactions={jantriData}
        isMainJantri={false}
      />
    </SafeAreaView>
  );
};

export default CollectionResult;

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
  ledgerCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ledgerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ledgerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ledgerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 16,
  },
  partyNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: COLORS.BUTTONBG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  noLedgersText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  ledgerList: {
    marginBottom: 16,
  },
  ledgerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ledgerItemText: {
    fontSize: 14,
    color: '#333',
  },
  ledgerItemDate: {
    fontSize: 12,
    color: '#666',
  },
  clearButton: {
    backgroundColor: COLORS.BUTTONBG,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  gridSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  table: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
    width: 550, // 11 columns * 50px
  },
  tableScrollContainer: {
    flexGrow: 0,
    width: 550,
  },
  row: {
    flexDirection: 'row',
    flexShrink: 0,
  },
  // Header cells (dark green background)
  headerCell: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    flexShrink: 0,
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Row header cells (light grey background)
  rowHeaderCell: {
    backgroundColor: '#fff',
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    flexShrink: 0,
  },
  rowHeaderText:{backgroundColor:'hsl(44,88%,84%)',padding:2,position:"absolute",top:1,left:2,fontWeight:"400",fontSize: 10,color:"black"},
  // Data cells (light grey background)
  dataCell: {
    backgroundColor: '#fff',
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    flexShrink: 0,
  },
  dataCellText: {
    fontSize: 10,
    color: '#FF8C00', // Yellow-orange color
    textAlign: 'center',
  },
  // Total cells (dark green background)
  totalCell: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    flexShrink: 0,
  },
  totalCellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Summary cells (dark green background)
  summaryCell: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    flexShrink: 0,
  },
  summaryCellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryHeaderCell: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    flexShrink: 0,
  },
  summaryHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Grand total cells
  grandTotalHeaderCell: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    flexShrink: 0,
  },
  grandTotalHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  grandTotalCell: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    flexShrink: 0,
  },
  grandTotalCellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  grandTotalLabelCell: {
    backgroundColor: '#4CAF50',
    width: 100,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    flexShrink: 0,
    paddingLeft: 8,
  },
  grandTotalLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  grandTotalValueCell: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    flexShrink: 0,
  },
  grandTotalValueText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
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
    marginBottom: 2,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    // marginBottom: 8,
  },
  collectionTypeContainer: {
    backgroundColor: '#E6E6FA',
    borderRadius: 8,
    padding: 12,
  },
  collectionTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8A2BE2',
  },
  collectionTypeText: {
    fontSize: 14,
    color: '#333',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#333',
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
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
    // marginBottom: 8,
  },
  refreshButton: {
    // padding: 4,
    borderRadius: 4,
  },
});