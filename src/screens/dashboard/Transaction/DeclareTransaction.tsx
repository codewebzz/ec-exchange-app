import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  FlatList,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../assets/colors';
import { scale, moderateScale } from 'react-native-size-matters';
import ScreenHeader from '../../../components/ScreenHeader';
import CustomButton from '../../../components/CustomButton';
import APIService from '../../services/APIService';
import JantriModal from './addTransaction/JantriModal';
import CopyModal from '../../../components/CopyModal';
import TableGridView from '../../../components/TableGridView';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import CustomDateTimePicker from '../../../components/CustomDatePicker';
import CustomDropdown from '../../../components/CustomDropdown';
import { TextInput } from 'react-native';
import { ActivityIndicator } from 'react-native';
import GradientBackground from '../../../components/GradientBackground';
import useSearchBar from '../../../hooks/useSearchBar';

const { width, height } = Dimensions.get('window');

const DeclareTransaction = ({ navigation }: any) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchParty, setSearchParty] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [isAddButtonActive, setIsAddButtonActive] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [summaryTableData, setSummaryTableData] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isCopyModalVisible, setIsCopyModalVisible] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyItem, setCopyItem] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Bottom sheet states
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(false);
  const filterBottomSheetRef = React.useRef<any>(null);

  // Main Jantri Modal state
  const [isMainJantriModalVisible, setIsMainJantriModalVisible] = useState(false);
  const [jantriTransactions, setJantriTransactions] = useState<any[]>([]);

  // Jantri View Modal state
  const [isJantriViewModalVisible, setIsJantriViewModalVisible] = useState(false);
  const [jantriViewTransactions, setJantriViewTransactions] = useState<any[]>([]);

  // Dropdown states
  const [shiftOpen, setShiftOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [shiftItems, setShiftItems] = useState<any[]>([]);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [staffItems, setStaffItems] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
const [activeDeleteOpen, setactiveDeleteOpen] = useState(false);
 const [activeDeleteShift, setactiveDeleteShift] = useState('active');
  // Sample data
  // const staffItems = [
  //   { label: 'Rahul-Staff', value: '1' },
  //   { label: 'Karan-Staff', value: '2' },
  // ];

  // Check if Jantri View button should be enabled
  const isJantriViewButtonActive = summaryTableData.length > 0;

  // Client-side search using common hook over tableData
  const { query, setQuery, filteredItems } = useSearchBar<any>(tableData, {
    selector: (item: any) =>
      String(
        item?.party ?? ''
      ) + ' ' + String(item?.amount ?? '') + ' ' + String(item?.rate ?? '') + ' ' + String(item?.groupType ?? ''),
    debounceMs: 200,
  });

  // Handle Jantri View button click
  const handleJantriView = () => {
    console.log('Jantri View button clicked');
    console.log('Summary table data:', summaryTableData);
    
    // Transform summary table data to match JantriModal expected format
    const transformedData = summaryTableData.map(item => ({
      number: item.number,
      amount: parseFloat(item.amount) || 0,
      timestamp: new Date().toLocaleString()
    }));
    
    setJantriViewTransactions(transformedData);
    setIsJantriViewModalVisible(true);
  };

  // Handle shift selection
  const handleShiftChange = (value: string) => {
    console.log('Shift selected:', value);
    setSelectedShift(value);
    setIsAddButtonActive(value !== '');
    console.log('Add button active:', value !== '');
  };
 const handleActiveDeleteChange = (value: string) => {
    console.log('Shift selected:', value);
    setactiveDeleteShift(value);
    // setIsAddButtonActive(value !== '');
    console.log('Add button active:', value !== '');
  };
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
            return;
          }
        }
      }
    }
    
    // Fallback: if it's already a Date object
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  // Bottom sheet handlers
  const snapPoints = React.useMemo(() => ['80%'], []);
  
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

  const handleFilterClosePress = () => {
    // Keyboard.dismiss(); // Removed as per new_code
    if (filterBottomSheetRef.current) {
      filterBottomSheetRef.current.close();
    }
    setIsFilterBottomSheetOpen(false);
    getTransaction();
  };

  // Summary table columns configuration
  const summaryTableColumns = [
    { key: 'number', label: 'Number', width: 100, align: 'center' as const },
    { key: 'amount', label: 'Amount', width: 100, align: 'center' as const },
  ];

  // Table columns configuration
  const tableColumns = [
    { key: 'serialNo', label: 'S.No.', width: 60, align: 'center' as const },
    { key: 'cj', label: 'C/J', width: 50, align: 'center' as const },
    { key: 'party', label: 'Party', width: 150, align: 'left' as const },
    { key: 'rate', label: 'Rate', width: 120, align: 'center' as const },
    { key: 'amount', label: 'Amount', width: 100, align: 'right' as const },
    { key: 'groupType', label: 'G. Type', width: 80, align: 'center' as const },
    { 
      key: 'addedBy', 
      label: 'Added By', 
      width: 120, 
      align: 'left' as const,
      renderAction: (item: any) => (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{item.addedBy}</Text>
          <Text style={styles.userDate}>{item.addedDate}</Text>
        </View>
      )
    },
    { 
      key: 'updatedBy', 
      label: 'Updated By', 
      width: 120, 
      align: 'left' as const,
      renderAction: (item: any) => (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{item.updatedBy}</Text>
          <Text style={styles.userDate}>{item.updatedDate}</Text>
        </View>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      width: 160,
      align: 'center' as const,
      renderAction: (item: any) => (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.copyButton]}
            onPress={() => handleCopyTransaction(item)}
          >
            <Ionicons name="copy-outline" size={16} color="#FF8C00" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewTransaction(item)}
          >
            <Ionicons name="eye-outline" size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditTransaction(item)}
          >
            <Ionicons name="pencil-outline" size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteTransaction(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  // Handle Copy Transaction
  const handleCopyTransaction = (item: any) => {
    setCopyItem(item);
    setIsCopyModalVisible(true);
  };

  // Handle Copy Modal Save
  const handleCopyModalSave = async (selectedShift: string) => {
    if (!copyItem) return;
    setCopyLoading(true);
    try {
      await APIService.CopyTransactionData(copyItem.id, selectedShift);
      setIsCopyModalVisible(false);
      setCopyItem(null);
      getTransaction(); // Refresh list
    } catch (error) {
      console.error('CopyTransactionData error:', error);
      // Optionally show error toast
    } finally {
      setCopyLoading(false);
    }
  };

  // Handle View Transaction
  const handleViewTransaction = async (item: any) => {
    console.log('View transaction:', item);
    try {
      setLoadingDetails(true);
      setSelectedTransaction(item);
      setIsViewingDetails(true);
      
      // Call GetTransactionData API with the transaction ID
      const response = await APIService.GetTransactionData({}, item.id);
      console.log('Transaction Data Response:', response);
      
      if (response && response.success && response.data && response.data.transactions) {
        // Process the detailed transaction data for the second table
        // The transactions array contains the detailed data
        const transactions = response.data.transactions;
        
        if (transactions.length > 0) {
          const detailedData = transactions.map((transaction: any) => ({
            id: transaction.id,
            number: transaction.number || '00',
            amount: transaction.amount?.toString() || '0',
          }));
          
          setSummaryTableData(detailedData);
          console.log('Updated summary table with detailed data:', detailedData);
        } else {
          console.log('Transactions array is empty');
          setSummaryTableData([]);
        }
      } else {
        console.log('No detailed data found for transaction:', item.id);
        console.log('API Response:', response);
        // Clear the table when no data
        setSummaryTableData([]);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      Alert.alert('Error', 'Failed to fetch transaction details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle Edit Transaction
  const handleEditTransaction = (item: any) => {
    navigation.navigate('AddTransaction', {
      editMode: true,
      transactionData: item
    });
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (item: any) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete transaction ${item.serialNo}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await APIService.DeleteTransaction({ transaction_id: item.id });
              getTransaction();
            } catch (error) {
              console.error('DeleteTransaction error:', error);
            }
          },
        },
      ]
    );
  };

  const resetToOriginalSummary = () => {
    setIsViewingDetails(false);
    setSelectedTransaction(null);
    // Clear the second table when resetting
    setSummaryTableData([]);
  };
  
  const getTransaction = async () => {
    try {
      setLoadingList(true);
      // const data={
      //   declared:0,
      //   shift_id:selectedShift,
      //   date:formatDateForAPI(selectedDate),
      //   ledger_name:searchParty,
      //   staff:selectedStaff,
      //   deleted: activeDeleteShift === 'deleted' ? 1 : 0,
      // }
      const data = {
              // declared: 1, // This indicates declared transactions
              shift_id: selectedShift || 0,
              // date: formatDateForAPI(selectedDate),
              // ledger_name: searchParty,
              // staff_name: selectedStaff,
            };
      const res = await APIService.GetDecelearedTransaction(data);
      console.log('API Response:', res);
      
      if (res && res.success && res.data && res.data.length > 0) {
        // Process main table data
        const processedTableData = res.data.map((item: any, index: number) => ({
          id: item.id,
          serialNo: (index + 1).toString(),
          cj: item.data_entry_mode || 'C',
          party: item.ledger_info?.real_name || '',
          rate: item.ledger_info?.rate || '',
          amount: `₹ ${item.transactions_total?.toLocaleString() || '0'}`,
          groupType: item.mode?.name || '',
          addedBy: item.created_by || '',
          addedDate: new Date(item.created_at).toLocaleString('en-GB'),
          updatedBy: item.updated_by || '',
          updatedDate: new Date(item.updated_at).toLocaleString('en-GB'),
        }));
        
        setTableData(processedTableData);
        
                 // Don't set summary data from main API - only show data when viewing details
         // The second table should be blank by default
         if (!isViewingDetails) {
           setSummaryTableData([]);
         }
      } else {
        setTableData([]);
        // Only clear summary if not viewing details
        if (!isViewingDetails) {
          setSummaryTableData([]);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTableData([]);
      // Only clear summary if not viewing details
      if (!isViewingDetails) {
        setSummaryTableData([]);
      }
    } finally {
      setLoadingList(false);
    }
  };
useEffect(()=>{
  if(activeDeleteShift){

    getTransaction();
  }
},[activeDeleteShift]);

  // Fetch shift data on component mount
  useEffect(() => {
    fetchShiftData();
    fetchStaffData();
  }, []);

  // Fetch shift dropdown data
  const fetchShiftData = async () => {
    try {
      setShiftLoading(true);
      const response = await APIService.GetShiftDropDownDataData();
      console.log('Shift data response:', response);
      
      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format
        console.log(response.data,"response.dataresponse.data")
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
  const fetchStaffData = async () => {
    try {
      setStaffLoading(true);
      const response = await APIService.GetStaffDropDownDataData();
      console.log('Staff data response:', response);
      
      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format for staff
        const transformedStaff = response.data.map((staff: any) => ({
          label: staff.staff_name || staff.name || 'Unknown Staff',
          value: staff.id?.toString() || staff.staff_id?.toString() || ''
        }));
        setStaffItems(transformedStaff);
        console.log('Transformed staff items:', transformedStaff);
      } else {
        console.log('No staff data found or API error');
        setStaffItems([]);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
      setStaffItems([]);
    } finally {
      setStaffLoading(false);
    }
  };

  return (
    <GradientBackground colors={[ "#fdf0d0","#e0efea"]} locations={[0,30]}>
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
      <ScreenHeader
        navigation={navigation}
        title="Declear Transaction"
        hideBackButton={true} showDrawerButton={true}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: scale(12) }}>
          <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)}>
            <Ionicons name={showSearch ? 'close' : 'search'} size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsFilterBottomSheetOpen(true)}>
            <Ionicons name="filter" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </ScreenHeader>

      {showSearch ? (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.BLACK} />
          <TextInput
            style={styles.searchText}
            placeholder="Search by party, amount, rate, type..."
            placeholderTextColor={COLORS.BLACK}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      ) : null}

             <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                  {/* Main Table */}
         <View style={styles.tableWrapper}>
            {loadingList ? (
             <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color={COLORS.BUTTONBG} />
               <Text style={styles.loadingText}>Loading transactions...</Text>
             </View>
           ) : (
            <TableGridView
              columns={tableColumns}
              data={filteredItems}
               headerBgColor={COLORS.BUTTONBG}
               headerTextColor={COLORS.WHITE}
             />
            //  <></>
           )}
         </View>

                                       {/* Summary Table */}
           <View style={styles.tableWrapper}>
             {/* Table Header with Title and Reset Button */}
           
             
              {loadingDetails ? (
              <View style={styles.loadingContainer}>
                {/* <ActivityIndicator size="large" color={COLORS.BUTTONBG} /> */}
                <Text style={styles.loadingText}>
                  {isViewingDetails ? 'Loading transaction details...' : 'Loading summary...'}
                </Text>
              </View>
             ) : summaryTableData.length > 0 ? (
               <>
                 {isViewingDetails && (
                   <View style={styles.tableHeaderContainer}>
                     <Text style={styles.tableHeaderTitle}>Transaction Details</Text>
                     <TouchableOpacity style={styles.resetButton} onPress={resetToOriginalSummary}>
                       <Ionicons name="refresh" size={16} color={COLORS.WHITE} />
                       <Text style={styles.resetButtonText}>Reset</Text>
                     </TouchableOpacity>
                   </View>
                 )}
              <TableGridView
                columns={summaryTableColumns}
                data={summaryTableData}
                headerBgColor={COLORS.BUTTONBG}
                headerTextColor={COLORS.WHITE}
              />
               </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  {isViewingDetails ? 'No transaction details found' : 'No summary data available'}
                </Text>
              </View>
            )}
          </View>

                   {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Debug info */}
          
            
            <CustomButton
              title="Add"
              onPress={() => {
                console.log('Navigating to AddTransaction screen...');
                navigation.navigate('AddTransaction', {
                  items: tableData,
                  shiftId: selectedShift,
                  externalTransactions: summaryTableData, // pass numbers if available
                });
              }}
              backgroundColor={isAddButtonActive ? COLORS.BUTTONBG : '#ccc'}
              textColor={COLORS.WHITE}
              disabled={!isAddButtonActive}
              style={{ opacity: isAddButtonActive ? 1 : 0.6 }}
            />
           <CustomButton
             title="Jantri View"
             onPress={handleJantriView}
             backgroundColor={isJantriViewButtonActive ? COLORS.BUTTONBG : '#ccc'}
             textColor={COLORS.WHITE}
             disabled={!isJantriViewButtonActive}
            //  style={styles.actionButton}
            style={{ opacity: isJantriViewButtonActive ? 1 : 0.6 }}
           />
           <CustomButton
             title="Main Jantri"
             onPress={() => setIsMainJantriModalVisible(true)}
             backgroundColor={COLORS.BUTTONBG}
             textColor={COLORS.WHITE}
             style={styles.actionButton}
           />
         </View>

         {/* Dropdown */}
         <View style={styles.dropdownContainer}>
           <CustomDropdown
             open={activeDeleteOpen}
             value={activeDeleteShift}
             items={[{ label: 'Active', value: 'active' },
              { label: 'Deleted', value: 'deleted' }
             ]}
             setOpen={setactiveDeleteOpen}
             setValue={(val: any) => {
                    console.log('Dropdown setValue called with:', val);
                    if (typeof val === 'function') {
                      const value = val();
                      console.log('Extracted value:', value);
                      handleActiveDeleteChange(value);
                    } else {
                      handleActiveDeleteChange(val);
                    }
                  }}
             setItems={() => {}}
             placeholder="Active"
           />
                     
         </View>
       </ScrollView>

       {/* Filter Bottom Sheet */}
       {isFilterBottomSheetOpen && (
         <BottomSheet
           backgroundStyle={{ backgroundColor: COLORS.BGFILESCOLOR }}
           ref={filterBottomSheetRef}
           style={{ borderWidth: 1, borderRadius: scale(10) }}
           index={0}
           snapPoints={snapPoints}
           enableDynamicSizing={false}
           onChange={(index: number) => {
             Keyboard.dismiss();
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
           <View
             style={{
               flexDirection: 'row',
               alignItems: 'center',
               justifyContent: 'space-between',
               paddingHorizontal: scale(20),
               paddingBottom: scale(10),
             }}
           >
             <View
               style={{
                 flexDirection: 'row',
                 alignItems: 'center',
               }}
             >
               <Text
                 style={{
                   fontSize: scale(14),
                   fontWeight: '600',
                   color: COLORS.BLACK,
                   marginEnd: scale(5),
                 }}
               >
                 Search & Filter |
                 <Text
                   style={{
                     fontSize: scale(10),
                     fontWeight: '500',
                     color: COLORS.BLACK,
                     marginEnd: scale(5),
                   }}
                 >
                   {' '}
                   Filter your transactions
                 </Text>
               </Text>
             </View>
             <TouchableOpacity onPress={handleFilterClosePress}>
               <Ionicons name="close" size={scale(20)} color={COLORS.BLACK} />
             </TouchableOpacity>
           </View>
           <BottomSheetScrollView
             style={{
               padding: 16,
               backgroundColor: COLORS.BGFILESCOLOR,
               flex: 1,
             }}
              keyboardShouldPersistTaps="handled"
           >
             <View style={{ paddingVertical: scale(20) }}>
               <View style={styles.liveTransactionBar}>
                 <View style={styles.liveIndicator} />
                 <Text style={styles.liveText}>Live Transaction</Text>
               </View>

                               <CustomDropdown
                  label="Shift"
                  open={shiftOpen}
                  value={selectedShift}
                  items={shiftItems}
                  setOpen={setShiftOpen}
                  setValue={(val: any) => {
                    console.log('Dropdown setValue called with:', val);
                    if (typeof val === 'function') {
                      const value = val();
                      console.log('Extracted value:', value);
                      handleShiftChange(value);
                    } else {
                      handleShiftChange(val);
                    }
                  }}
                  setItems={() => {}}
                  placeholder={shiftLoading ? "Loading shifts..." : "Select Shift"}
                />

               <CustomDateTimePicker
                 label="Date"
                 value={selectedDate}
                 setFieldValue={handleDateChange}
                 fieldName="date"
                 mode={'date'}
               />

               <View style={styles.inputContainer}>
                 <Text style={styles.inputLabel}>Search Party</Text>
                 <TextInput
                   style={styles.textInput}
                   placeholder="SEARCH PARTY..."
                   value={searchParty}
                   onChangeText={setSearchParty}
                   placeholderTextColor="#999"
                 />
               </View>

               <CustomDropdown
                 label="Staff"
                 open={staffOpen}
                 value={selectedStaff}
                 items={staffItems}
                 setOpen={setStaffOpen}
                 setValue={setSelectedStaff}
                 setItems={() => {}}
                 placeholder={staffLoading ? "Loading staff..." : "--STAFF--"}
               />

               <View style={{ marginVertical: scale(10) }}>
                 <CustomButton
                   title="Search"
                   onPress={handleFilterClosePress}
                   backgroundColor={COLORS.BUTTONBG}
                   textColor={COLORS.WHITE}
                 />
               </View>
             </View>
           </BottomSheetScrollView>
         </BottomSheet>
       )}


               {/* Main Jantri Modal */}
        <JantriModal
          visible={isMainJantriModalVisible}
          onClose={() => setIsMainJantriModalVisible(false)}
          onSave={(transactions: any[]) => {
            console.log('Main Jantri transactions saved:', transactions);
            setJantriTransactions(transactions);
            setIsMainJantriModalVisible(false);
          }}
          title="MAIN JANTRI"
          externalTransactions={jantriTransactions}
          isMainJantri={true}
        />

        {/* Jantri View Modal */}
        <JantriModal
          visible={isJantriViewModalVisible}
          onClose={() => setIsJantriViewModalVisible(false)}
          onSave={(transactions: any[]) => {
            console.log('Jantri View transactions saved:', transactions);
            setJantriViewTransactions(transactions);
            setIsJantriViewModalVisible(false);
          }}
          title="JANTRI VIEW"
          externalTransactions={jantriViewTransactions}
          isMainJantri={false}
        />
        <CopyModal
  visible={isCopyModalVisible}
  onClose={() => { setIsCopyModalVisible(false); setCopyItem(null); }}
  onSave={handleCopyModalSave}
  loading={copyLoading}
/>
   </SafeAreaView>
   </GradientBackground>
   );
 };

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
  container: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
  searchBar: {
    backgroundColor: COLORS.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    marginHorizontal: scale(16),
    marginTop: scale(16),
    borderRadius: scale(8),
  },
  searchText: {
    color: COLORS.BLACK,
    marginLeft: scale(8),
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  buttonContainer: {
    marginTop: scale(16),
    gap: scale(8),
  },
  dropdownContainer: {
    marginTop: scale(16),
    marginBottom: scale(20),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    width: width * 0.8,
    maxHeight: height * 0.7,
    borderRadius: scale(12),
    padding: scale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  liveTransactionBar: {
    backgroundColor: '#e3f2fd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(6),
    marginBottom: scale(16),
  },
  liveIndicator: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: COLORS.SUCCESSGREEN,
    marginRight: scale(8),
  },
  liveText: {
    color: COLORS.BLACK,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: scale(16),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: scale(4),
  },
  textInput: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scale(6),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    fontSize: moderateScale(14),
  },

  searchButton: {
    marginTop: scale(8),
  },
  tableWrapper: {
    marginTop: scale(16),
    backgroundColor: COLORS.WHITE,
    borderRadius: scale(8),
    overflow: 'hidden',
  },
  userInfoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: moderateScale(12),
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  userDate: {
    fontSize: moderateScale(10),
    color: '#FF8C00',
    fontWeight: '400',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    columnGap: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(2),
    flexWrap: 'nowrap',
  },
     actionButton: {
    borderRadius: scale(6),
    borderWidth: 1,
    elevation: 1,
    shadowColor: 'transparent',
    paddingVertical: scale(4),
    paddingHorizontal: scale(6),
    marginHorizontal: scale(1),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(28),
  },
  copyButton: {
    borderColor: '#FF8C00',
    backgroundColor: '#FFF8F0',
  },
  viewButton: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  editButton: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  deleteButton: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF0F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(40),
  },
  loadingText: {
    marginTop: scale(10),
    fontSize: moderateScale(14),
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  tableHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: COLORS.BUTTONBG,
    borderTopLeftRadius: scale(8),
    borderTopRightRadius: scale(8),
  },
  tableHeaderTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(4),
  },
  resetButtonText: {
    fontSize: moderateScale(12),
    color: COLORS.WHITE,
    fontWeight: '500',
    marginLeft: scale(4),
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(40),
    backgroundColor: COLORS.WHITE,
  },
  noDataText: {
    fontSize: moderateScale(14),
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  jantriOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  jantriContainer: {
    backgroundColor: COLORS.WHITE,
    width: width * 0.8,
    maxHeight: height * 0.7,
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  jantriHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: COLORS.BUTTONBG,
    borderTopLeftRadius: scale(8),
    borderTopRightRadius: scale(8),
  },
  jantriTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  closeButton: {
    padding: scale(8),
  },
  closeButtonText: {
    fontSize: moderateScale(20),
    color: COLORS.WHITE,
  },
});   
export default DeclareTransaction;