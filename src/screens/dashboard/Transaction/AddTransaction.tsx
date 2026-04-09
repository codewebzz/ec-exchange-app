import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuickEntryForm from './addTransaction/QuickEntry';
import AddNumbersForm from './addTransaction/AddNumberForm';
import CustomHeader from '../../../components/CustomHeader';
import RandomModal from './addTransaction/RandomModal';
import CrossModal from './addTransaction/CrossModal';
import FromToModal from './addTransaction/FromToModal';
import ABModal from './addTransaction/ABModal';
import AAModal from './addTransaction/AAModal';
// import JantriModal from './addTransaction/JantriModal';
import JantriEmbedded from './addTransaction/JantriEmbedded';
import ScreenHeader from '../../../components/ScreenHeader';
import CustomDropdown from '../../../components/CustomDropdown';
import APIService from '../../services/APIService';
import { COLORS } from '../../../assets/colors';
import { scale, moderateScale } from 'react-native-size-matters';
import CountdownHeaderTitle from './addTransaction/CountdownHeaderTitle';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import GradientBackground from '../../../components/GradientBackground';
const { width } = Dimensions.get('window');

const AddTransaction = ({ navigation, route }: any) => {
  const { items, shiftId, editMode, transactionData, externalTransactions } = route.params || {};

  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [shiftData, setShiftData] = useState<any>(null);
  const [randomModalVisible, setRandomModalVisible] = useState(false);
  const [crossModalVisible, setCrossModalVisible] = useState(false);
  const [fromToModalVisible, setFromToModalVisible] = useState(false);
  const [abModalVisible, setAbModalVisible] = useState(false);
  const [aaModalVisible, setAaModalVisible] = useState(false);
  // const [jantriModalVisible, setJantriModalVisible] = useState(false);
  const [showJantri, setShowJantri] = useState(false);

  // Filter states
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  // Filter info rows (read-only placeholders for now)
  const [rate, setRate] = useState<string>('');
  const [limit, setLimit] = useState<string>('');
  const [cap, setCap] = useState<string>('');
  const [selectedLedgerPatti, setSelectedLedgerPatti] = useState<string>("");

  // Bottom sheet refs
  const filterBottomSheetRef = React.useRef<BottomSheet>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const quickEntryRef = React.useRef<any>(null);

  // Dropdown data
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const [modeData, setModeData] = useState<any[]>([]);
  const [modeLoading, setModeLoading] = useState(false);

  // Fetch ledger data on component mount
  useEffect(() => {
    fetchLedgerData();
  }, []);

  // Fetch shift details by ID
  useEffect(() => {
    if (shiftId) {
      APIService.GetShiftById(shiftId)
        .then(res => {
          if (res?.success && res?.data) {
            setShiftData(res.data);
          }
        })
        .catch(err => console.log('Error fetching shift details:', err));
    }
  }, [shiftId]);

  // Fetch ledger dropdown data
  const fetchLedgerData = async () => {
    try {
      setLedgerLoading(true);
      const response = await APIService.GetLedgerDropDownDataData();
      console.log('Ledger data response:', response);

      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format for ledgers, preserve meta
        const transformedLedgers = response.data.map((ledger: any) => ({
          label: ledger.real_name || ledger.name || 'Unknown Ledger',
          value: ledger.id?.toString() || ledger.ledger_id?.toString() || '',
          meta: ledger,
        }));
        setLedgerData(transformedLedgers);
        console.log('Transformed ledger items:', transformedLedgers);
      } else {
        console.log('No ledger data found or API error');
        setLedgerData([]);
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setLedgerData([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  // Fetch mode dropdown data
  const fetchModeData = async (ledgerId: string) => {
    try {
      setModeLoading(true);
      const response = await APIService.GetLedgerTransactionModes(ledgerId);
      console.log('Mode data response:', response);

      if (response && response.success && response.data && response.data.length > 0) {
        const transformedModes = response.data.map((item: any) => ({
          label: item.mode,
          value: item.id.toString(),
        }));
        setModeData(transformedModes);
        setSelectedMode(response.data[0].id.toString());
        console.log('Transformed mode items:', transformedModes);
      } else {
        console.log('No mode data found or API error');
        setModeData([]);
        setSelectedMode('');
      }
    } catch (error) {
      console.error('Error fetching mode data:', error);
      setModeData([]);
    } finally {
      setModeLoading(false);
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

  const handleFilterClosePress = () => {
    if (filterBottomSheetRef.current) {
      filterBottomSheetRef.current.close();
    }
    setIsFilterBottomSheetOpen(false);
  };

  // Helper function to update or add transaction without duplicates
  const updateOrAddTransaction = (newTransaction: any) => {
    setAllTransactions((prev: any[]) => {
      // Just add the new transaction with a timestamp
      const newTransactionWithTimestamp = {
        ...newTransaction,
        timestamp: new Date().toLocaleString()
      };
      console.log('Added new transaction (duplicates allowed):', newTransactionWithTimestamp);
      return [newTransactionWithTimestamp, ...prev];
    });
  };

  const handleTransactionAdd = (transaction: any) => {
    updateOrAddTransaction(transaction);
    console.log('New transaction added:', transaction);
  };

  const handleNumbersAdd = (data: any) => {
    console.log('Numbers batch added:', data);
  };

  // Handle Random modal transactions
  const handleRandomModalSave = (transactions: any[]) => {
    // Add all transactions from the modal to the list with deduplication
    transactions.forEach(transaction => {
      updateOrAddTransaction(transaction);
    });
    console.log('Random modal transactions added:', transactions);
  };

  const handleCrossModalSave = (transactions: any[]) => {
    transactions.forEach(transaction => {
      updateOrAddTransaction(transaction);
    });
    console.log('Cross modal transactions added:', transactions);
  };

  const handleFromToModalSave = (transactions: any[]) => {
    transactions.forEach(transaction => {
      updateOrAddTransaction(transaction);
    });
    console.log('From-To modal transactions added:', transactions);
  };

  const handleABModalSave = (transactions: any[]) => {
    transactions.forEach(transaction => {
      updateOrAddTransaction(transaction);
    });
    console.log('AB modal transactions added:', transactions);
  };

  const handleAAModalSave = (transactions: any[]) => {
    transactions.forEach(transaction => {
      updateOrAddTransaction(transaction);
    });
    console.log('AA modal transactions added:', transactions);
  };

  const handleJantriModalSave = (transactions: any[]) => {
    transactions.forEach(transaction => {
      updateOrAddTransaction(transaction);
    });
    console.log('Jantri modal transactions added:', transactions);
  };

  // Button handlers
  const handleJamEnt = () => {
    console.log('JamEnt button pressed, current showJantri:', showJantri);
    console.log('Current allTransactions when switching to Jantri:', allTransactions);
    setShowJantri((prev) => !prev);
    console.log('JamEnt button pressed, new showJantri will be:', !showJantri);
  };

  const handleRandom = () => {
    console.log('Random (F4) pressed');
    setRandomModalVisible(true);
  };

  const handleCross = () => {
    console.log('Cross (F6) pressed');
    setCrossModalVisible(true);
  };

  const handleFromTo = () => {
    console.log('From-To (F7) pressed');
    setFromToModalVisible(true);
  };

  const handleAB = () => {
    console.log('All (F9) pressed');
    setAbModalVisible(true);
  };

  const handleAA = () => {
    console.log('AA (F10) pressed');
    setAaModalVisible(true);
  };

  useEffect(() => {
    const incoming = Array.isArray(externalTransactions)
      ? externalTransactions
      : (Array.isArray(items) ? items : []);

    if (incoming.length > 0) {
      // Accept both {number, amount} and table rows with number/amount
      const normalized = incoming.map((t: any, idx: number) => ({
        id: (t.id ?? Date.now() + idx).toString(),
        number: t.number?.toString?.() || '',
        amount: (typeof t.amount === 'string' || typeof t.amount === 'number')
          ? t.amount.toString()
          : (t.amount?.value?.toString?.() || '0'),
        timestamp: t.timestamp || new Date().toLocaleString(),
        source: t.source || 'From List',
      }));
      setAllTransactions(normalized);
    }

    if (editMode && transactionData) {
      // Prefill ledger, mode, shift, and transactions
      setSelectedLedger(transactionData.ledger_id?.toString() || '');
      setSelectedMode(transactionData.mode?.toString() || '');

      if (transactionData.transaction_data) {
        setAllTransactions(transactionData.transaction_data.map((t: any) => ({
          ...t,
          number: t.number?.toString() || '',
          amount: t.amount?.toString() || '',
        })));
      }
    }
  }, [externalTransactions, items, editMode, transactionData]);

  // Debug useEffect for showJantri state
  useEffect(() => {
    console.log('AddTransaction - showJantri state changed to:', showJantri);
    console.log('AddTransaction - allTransactions length:', allTransactions?.length);
  }, [showJantri, allTransactions]);

  const handleSaveNow = async () => {
    if (!selectedLedger || !selectedMode) {
      Alert.alert('Missing Fields', 'Please select both Ledger and Mode before saving.');
      return;
    }
    if (allTransactions.length === 0) {
      Alert.alert('No Transactions', 'Please add at least one transaction before saving.');
      return;
    }
    console.log('Save Now (F2) pressed');

    // Prepare transaction data
    const transactionDataArr = allTransactions.map(transaction => ({
      number: transaction.number?.toString() || '',
      amount: parseFloat(transaction.amount) || 0
    }));

    // Prepare API payload
    const payload = {
      shift_id: shiftId || (transactionData?.shift_id) || 0,
      ledger_id: parseInt(selectedLedger) || 0,
      mode: parseInt(selectedMode) || 1,
      limit: 0,
      capping: 0,
      data_entry_mode: "C",
      is_active: true,
      transaction_data: transactionDataArr
    };

    console.log('Creating transaction with payload:', payload);

    try {
      let response;
      if (editMode && transactionData && transactionData.id) {
        // Update existing transaction
        response = await APIService.UpdateTransactionData(transactionData.id, payload);
        console.log('Transaction updated successfully:', response);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message,
          position: 'bottom',
        });
      } else {
        // Create new transaction
        response = await APIService.createTransaction(payload);
        console.log('Transaction created successfully:', response);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message,
          position: 'bottom',
        });
      }
      setAllTransactions([]);
      setSelectedLedger('');
      setSelectedMode('');
      setModeData([]);
      setRate('');
      setLimit('');
      setCap('');
      setLedgerOpen(false);
      setModeOpen(false);
      setShowJantri(false);

      // Scroll to top after save
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      // You might want to show an error message here
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear All?',
      'Are you sure you want to clear all transactions?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setAllTransactions([]) },
      ]
    );
  };

  const bottomButtons = [
    { title: 'JamEnt', onPress: handleJamEnt, color: '#4A5568' },
    { title: 'Random', onPress: handleRandom, color: '#4A5568' },
    { title: 'Cross', onPress: handleCross, color: '#4A5568' },
    { title: 'From-To', onPress: handleFromTo, color: '#4A5568' },
    { title: 'AB', onPress: handleAB, color: '#4A5568' },
    { title: 'AA', onPress: handleAA, color: '#4A5568' },
    { title: 'Save Now', onPress: handleSaveNow, color: '#48BB78' },
    { title: 'Clear', onPress: handleClear, color: '#E53E3E' },
  ];

  // Add delete handler for QuickEntry
  const handleTransactionDelete = (id: string) => {
    setAllTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GradientBackground colors={["#fdf0d0", "#e0efea"]} locations={[0, 30]}>
        <SafeAreaView style={styles.container}>
          <ScreenHeader
            title={<CountdownHeaderTitle timeLimit={shiftData?.last_update_time} />}
            navigation={navigation}
            hideBackButton={false} showDrawerButton={false}
          >
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setIsFilterBottomSheetOpen(true)}
            >
              <Ionicons name="ellipsis-horizontal-circle-outline" color={COLORS.WHITE} size={scale(20)} />
            </TouchableOpacity>
          </ScreenHeader>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {showJantri ? (
              <View style={styles.formSection}>
                <JantriEmbedded
                  key={`jantri-${showJantri ? 'open' : 'closed'}`} // Force reload when grid opens
                  title="Jantri - Game Results Grid"
                  externalTransactions={allTransactions}
                  onSave={(transactions: any[]) => {
                    console.log('JantriEmbedded onSave called with:', transactions);
                    handleJantriModalSave(transactions);
                    // Don't close the grid - let user close it manually with JmtEnt button
                  }}
                  onCancel={() => {
                    console.log('JantriEmbedded onCancel called');
                    setShowJantri(false);
                  }}
                />
              </View>
            ) : (
              <>


                <View style={styles.selectionSection}>
                  <View style={{ flex: 1.5, zIndex: 3000 }}>
                    <CustomDropdown
                      label="Select Ledger"
                      open={ledgerOpen}
                      value={selectedLedger}
                      items={ledgerData}
                      setOpen={setLedgerOpen}
                      setValue={(val: any) => {
                        const selectedVal = typeof val === 'function' ? val() : val;
                        setSelectedLedger(selectedVal);
                        const found = (ledgerData as any[]).find((it: any) => it.value === selectedVal);
                        const meta = found?.meta || null;
                        if (meta) {
                          setRate(String(meta?.rate ?? ''));
                          setLimit(String(meta?.limit ?? ''));
                          setCap(String(meta?.capping ?? ''));
                          setSelectedLedgerPatti(meta?.patti);
                        } else {
                          setRate('');
                          setLimit('');
                          setCap('');
                          setSelectedLedgerPatti("");
                        }

                        // Fetch modes for the selected ledger
                        if (selectedVal) {
                          fetchModeData(selectedVal);
                        } else {
                          setModeData([]);
                          setSelectedMode('');
                        }

                        // Auto-open mode dropdown after selecting ledger
                        setTimeout(() => setModeOpen(true), 200);
                      }}
                      setItems={() => { }}
                      placeholder={ledgerLoading ? "Loading..." : "Select Ledger"}
                      zIndex={3000}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: scale(10), zIndex: 2000 }}>
                    <CustomDropdown
                      label="Select Mode"
                      open={modeOpen}
                      value={selectedMode}
                      items={modeData}
                      setOpen={setModeOpen}
                      setValue={(val: any) => {
                        const selectedVal = typeof val === 'function' ? val() : val;
                        setSelectedMode(selectedVal);
                        // Auto-focus QuickEntry number field after selecting mode
                        if (selectedVal) {
                          setTimeout(() => {
                            quickEntryRef.current?.focus();
                          }, 300);
                        }
                      }}
                      setItems={() => { }}
                      placeholder={modeLoading ? "Loading..." : "Select Mode"}
                      zIndex={2000}
                    />
                  </View>
                </View>

                {selectedLedgerPatti && (
                  <View style={styles.pattiContainer}>
                    <Icon name="info-outline" size={scale(14)} color={COLORS.BUTTONBG} />
                    <Text style={styles.pattiLabel}>Patti: </Text>
                    <Text style={styles.pattiValue}>{selectedLedgerPatti}</Text>
                  </View>
                )}

                <View style={styles.formSection}>
                  <QuickEntryForm
                    ref={quickEntryRef}
                    externalTransactions={allTransactions}
                    onTransactionAdd={handleTransactionAdd}
                    onTransactionDelete={handleTransactionDelete}
                  />
                </View>

                <View style={styles.formSection}>
                  <AddNumbersForm
                    onNumbersAdd={handleNumbersAdd}
                    onTransactionAdd={handleTransactionAdd}
                  />
                </View>
              </>
            )}

            <View style={styles.bottomButtonsContainer}>
              <Text style={styles.bottomButtonsTitle}>Quick Actions</Text>
              <View style={styles.buttonGrid}>
                {bottomButtons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      { backgroundColor: button.color }
                    ]}
                    onPress={button.onPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonTitle}>{button.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                    Ledger Details |
                    <Text
                      style={{
                        fontSize: scale(10),
                        fontWeight: '500',
                        color: COLORS.BLACK,
                        marginEnd: scale(5),
                      }}
                    >
                      {' '}
                      View Rate, Limit, and Cap
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={handleFilterClosePress}>
                  <Icon name="cancel" size={scale(20)} />
                </TouchableOpacity>
              </View>
              <BottomSheetScrollView
                style={{
                  padding: 16,
                  backgroundColor: COLORS.BGFILESCOLOR,
                  flex: 1,
                }}
              >
                <View style={{ paddingVertical: scale(20) }}>

                  {/* Bottom content rows (read-only display) */}
                  <View style={styles.filterInfoList}>
                    <View style={styles.infoRow}>
                      <View style={[styles.infoIconBox, { backgroundColor: '#34D399' }]}>
                        <Icon name="attach-money" size={scale(14)} color={COLORS.WHITE} />
                      </View>
                      <Text style={styles.infoLabel}>Rate:</Text>
                      <Text style={[styles.infoValue, { color: '#059669' }]}>{rate || '--'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={[styles.infoIconBox, { backgroundColor: '#F59E0B' }]}>
                        <Icon name="speed" size={scale(14)} color={COLORS.WHITE} />
                      </View>
                      <Text style={styles.infoLabel}>Limit:</Text>
                      <Text style={[styles.infoValue, { color: '#B45309' }]}>{limit || '--'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={[styles.infoIconBox, { backgroundColor: '#EF4444' }]}>
                        <Icon name="bolt" size={scale(14)} color={COLORS.WHITE} />
                      </View>
                      <Text style={styles.infoLabel}>Cap:</Text>
                      <Text style={[styles.infoValue, { color: '#7F1D1D' }]}>{cap || '--'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={[styles.infoIconBox, { backgroundColor: '#60A5FA' }]}>
                        <Icon name="calendar-today" size={scale(14)} color={COLORS.WHITE} />
                      </View>
                      <Text style={styles.infoLabel}>Open Date:</Text>
                      <Text style={[styles.infoValue, { color: '#1D4ED8' }]}>{shiftData?.open_date || '--'}</Text>
                    </View>


                  </View>

                </View>
              </BottomSheetScrollView>
            </BottomSheet>
          )}

          <RandomModal
            visible={randomModalVisible}
            onClose={() => setRandomModalVisible(false)}
            onSave={handleRandomModalSave}
            title="Random"
          />
          <CrossModal
            visible={crossModalVisible}
            onClose={() => setCrossModalVisible(false)}
            onSave={handleCrossModalSave}
            title="Cross"
          />
          <FromToModal
            visible={fromToModalVisible}
            onClose={() => setFromToModalVisible(false)}
            onSave={handleFromToModalSave}
            title="From-To"
          />
          <ABModal
            visible={abModalVisible}
            onClose={() => setAbModalVisible(false)}
            onSave={handleABModalSave}
            title="AB"
          />
          <AAModal
            visible={aaModalVisible}
            onClose={() => setAaModalVisible(false)}
            onSave={handleAAModalSave}
            title="AA"
          />
          {/* Embedded Jantri replaces modal/screen navigation */}
        </SafeAreaView>
      </GradientBackground>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FFF8E7',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formSection: {
    marginBottom: 0,
  },
  selectionSection: {
    marginHorizontal: 16,
    marginTop: 10,
    zIndex: 3000,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pattiContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  pattiLabel: {
    fontSize: scale(12),
    fontWeight: '700',
    color: COLORS.BLACK,
    marginLeft: 4,
  },
  pattiValue: {
    fontSize: scale(12),
    fontWeight: '500',
    color: '#065F46',
    flex: 1,
  },
  filterButton: {
    backgroundColor: COLORS.BUTTONBG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bottomButtonsContainer: {
    backgroundColor: '#2D3748',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomButtonsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    width: (width - 64) / 2 - 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    minHeight: 60,
  },
  buttonTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Inline info card for selected ledger
  infoCard: {
    backgroundColor: '#FDEFB9',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 6,
  },
  infoRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoRowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  infoRowValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  buttonShortcut: {
    color: '#FFFFFF',
    fontSize: 11,
    opacity: 0.8,
    marginTop: 2,
  },
  // Filter bottom content styles
  filterInfoList: {
    backgroundColor: '#FDEFB9',
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  infoIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '700',
  },
});

export default AddTransaction;