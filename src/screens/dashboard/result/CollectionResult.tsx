import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../assets/colors';
import CustomDateTimePicker from '../../../components/CustomDatePicker';
import CustomDropdown from '../../../components/CustomDropdown';
import ScreenHeader from '../../../components/ScreenHeader';
import APIService from '../../services/APIService';
import JantriViewModal from '../Transaction/addTransaction/JantriViewModal';
import JantriTable from '../Transaction/addTransaction/JantriTable';
import { PermissionGuard } from '../../../components/PermissionGuard';
import { PERMISSIONS } from '../../../helper/permissions';


const CollectionResult = ({ navigation }: any) => {
  // State for filter bottom sheet
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(true);
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
  const [ledgerList, setLedgerList] = useState<any[]>([]);
  const [ledgerDropdownOpen, setLedgerDropdownOpen] = useState(false);
  const [selectedLedgerValue, setSelectedLedgerValue] = useState<any>(null);

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

  // Centralized function to fetch collection data (params + payload)
  const fetchCollectionData = async (currentLedgers = ledgerList) => {
    if (!selectedShift) {
      return;
    }

    try {
      setIsLoading(true);

      const queryData = {
        cut_commission: selectedCategories.commission,
        cut_patti: selectedCategories.hissa,
        cut_wapsi: selectedCategories.wapsi,
        mix_akh: selectedCategories.akh,
        less_amt: parseFloat(amountLess) || 0,
        less_percentage: parseFloat(lessPercentage) || 0,
        round_off_value: parseFloat(roundOff) || 0,
      };

      const queryParams = '?' + Object.entries(queryData)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const payload = {
        shift_id: Number(selectedShift),
        is_declared: false,
        date: formattedDate,
        ledger_list: currentLedgers.filter(l => l.selected).map(l => l.id),
      };

      console.log('Sending collection result request:', { queryParams, payload });

      const response: any = await APIService.collectionResult(queryParams, payload);

      if (response && response.success) {
        const data = response?.data;
        const transaction = data?.transaction ?? {};
        const returnedLedgerList = data?.ledger_list_to_return ?? [];

        // Format the transactions dict into array expected by JantriTable
        const transactions = Object.entries(transaction).map(([key, amount]) => ({
          number: key,
          amount,
        }));

        setTransactionData(transactions);
        setLedgerList(returnedLedgerList);
        console.log('Fetched transactions successfully:', transactions);
      } else {
        Alert.alert('Error', response?.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to fetch collection data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter submit
  const handleFilterSubmit = async () => {
    if (!selectedShift) {
      Alert.alert('Error', 'Please select a shift');
      return;
    }
    await fetchCollectionData();
    handleFilterClosePress();
  };

  // Handle selecting a ledger from the dropdown
  const handleSelectLedger = async (ledgerId: any) => {
    if (!ledgerId) return;
    const updatedLedgers = ledgerList.map((item) =>
      item.id === ledgerId ? { ...item, selected: true } : item
    );
    setLedgerList(updatedLedgers);
    setSelectedLedgerValue(null);
    await fetchCollectionData(updatedLedgers);
  };

  // Handle removing a ledger badge
  const handleRemoveLedger = async (ledger: any) => {
    const updatedLedgers = ledgerList.map((item) =>
      item.id === ledger.id ? { ...item, selected: false } : item
    );
    setLedgerList(updatedLedgers);
    await fetchCollectionData(updatedLedgers);
  };

  // Handle clear all selected ledgers
  const handleClearLedgers = async () => {
    const updatedLedgers = ledgerList.map((item) => ({ ...item, selected: false }));
    setLedgerList(updatedLedgers);
    await fetchCollectionData(updatedLedgers);
  };

  // Handle add all ledgers
  const handleAddAllLedgers = async () => {
    const updatedLedgers = ledgerList.map((item) => ({ ...item, selected: true }));
    setLedgerList(updatedLedgers);
    await fetchCollectionData(updatedLedgers);
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
        const transformedShifts = response.data.map((shift: any) => ({
          label: shift.shift_name || shift.name || 'Unknown Shift',
          value: shift.id?.toString() || shift.shift_id?.toString() || ''
        }));
        setShiftItems(transformedShifts);
        console.log('Transformed shift items:', transformedShifts);

        // Auto-select first shift if none selected
        if (transformedShifts.length > 0 && !selectedShift) {
          setSelectedShift(transformedShifts[0].value);
        }
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
  };

  return (
    <PermissionGuard permission={PERMISSIONS.RESULT_COLLECTION_VIEW.value}>
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
          </View>

          {/* Select Ledger Dropdown */}
          <View style={styles.dropdownSection}>
            <CustomDropdown
              open={ledgerDropdownOpen}
              value={selectedLedgerValue}
              items={ledgerList
                .filter((l) => !l.selected)
                .map((l) => ({ label: l.name, value: l.id }))
              }
              setOpen={setLedgerDropdownOpen}
              setValue={(val: any) => {
                if (typeof val === 'function') {
                  setSelectedLedgerValue(val());
                } else {
                  setSelectedLedgerValue(val);
                }
              }}
              onChangeValue={handleSelectLedger}
              placeholder="Select ledger"
              zIndex={5000}
            />
          </View>

          {/* Selected Ledgers Badges */}
          <View style={styles.ledgerListContainer}>
            {ledgerList.filter((item) => item.selected).length === 0 ? (
              <Text style={styles.noLedgersText}>No ledgers selected.</Text>
            ) : (
              <View style={styles.selectedLedgersGrid}>
                {ledgerList
                  .filter((item) => item.selected)
                  .map((item) => (
                    <View key={item.id} style={styles.ledgerItemBadge}>
                      <Text style={styles.ledgerItemText} numberOfLines={1} ellipsizeMode="tail">
                        {item.name}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeLedgerButton}
                        onPress={() => handleRemoveLedger(item)}
                      >
                        <Ionicons name="close" size={14} color="#E53E3E" />
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            )}
          </View>

          {/* Footer Buttons */}
          <View style={styles.ledgerCardFooter}>
            <TouchableOpacity style={styles.clearLedgersButton} onPress={handleClearLedgers}>
              <Text style={styles.clearLedgersButtonText}>Clear Ledgers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addAllButton} onPress={handleAddAllLedgers}>
              <Text style={styles.addAllButtonText}>Add All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Collection Data Grid */}
        <View style={styles.gridSection}>
          <Text style={styles.gridTitle}>
            Collection Data {transactionData.length > 0 ? `(${transactionData.length} transactions)` : ''}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            bounces={false}
          >
            <View style={{ width: 650 }}>
              <JantriTable
                externalTransactions={transactionData}
                isEditable={false}
              />
            </View>
          </ScrollView>
        </View>
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

          <BottomSheetScrollView style={styles.bottomSheetContent} contentContainerStyle={{ paddingBottom: 60 }}>
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
              <View style={[styles.shiftHeaderContainer, { top: 10 }]}>
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

            {/* Date Picker */}
            <View style={[styles.filterSection]}>
              <Text style={[styles.filterLabel, { top: 20 }]}>Date</Text>
              <CustomDateTimePicker
                value={selectedDate}
                setFieldValue={handleDateChange}
                fieldName="date"
                mode="date"
              />
            </View>

            {/* Categories */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { marginVertical: 10 }]}>Categories</Text>
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

      {/* JantriViewModal */}
      <JantriViewModal
        visible={isJantriModalVisible}
        onClose={() => setIsJantriModalVisible(false)}
        title="Collection Results"
        externalTransactions={jantriData}
      />
    </SafeAreaView>
    </PermissionGuard>
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
  dropdownSection: {
    marginBottom: 12,
    zIndex: 5000,
  },
  ledgerListContainer: {
    minHeight: 50,
    justifyContent: 'center',
    marginBottom: 16,
  },
  selectedLedgersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ledgerItemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    borderColor: '#BEE3F8',
    borderWidth: 1,
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    maxWidth: '48%',
  },
  ledgerItemText: {
    fontSize: 12,
    color: '#2B6CB0',
    fontWeight: '500',
    marginRight: 4,
    flexShrink: 1,
  },
  removeLedgerButton: {
    padding: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
  },
  ledgerCardFooter: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  clearLedgersButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#CBD5E0',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearLedgersButtonText: {
    color: '#4A5568',
    fontWeight: '600',
    fontSize: 14,
  },
  addAllButton: {
    flex: 1,
    backgroundColor: COLORS.BUTTONBG,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addAllButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  noLedgersText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
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
  rowHeaderText: { backgroundColor: 'hsl(44,88%,84%)', padding: 2, position: "absolute", top: 1, left: 2, fontWeight: "400", fontSize: 10, color: "black" },
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