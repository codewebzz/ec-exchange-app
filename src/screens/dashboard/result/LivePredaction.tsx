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
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../assets/colors';
import CustomDateTimePicker from '../../../components/CustomDatePicker';
import CustomDropdown from '../../../components/CustomDropdown';
import GradientBackground from '../../../components/GradientBackground';
import ScreenHeader from '../../../components/ScreenHeader';
import TableGrid from '../../../components/TableGridView';
import APIService from '../../services/APIService';
import Toast from 'react-native-toast-message';
import { PermissionGuard } from '../../../components/PermissionGuard';
import { PERMISSIONS } from '../../../helper/permissions';
import { usePermissions } from '../../../hooks/usePermissions';

const formatDateToDDMMYYYY = (dateStr: any) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getFormattedDate = (value: any) => {
  if (value instanceof Date) {
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return value;
};

// Result 30 Days Section Component
const Result30DaysSection = ({ data, onNumberClick, searchNumber }: { data: any[], onNumberClick: (num: string) => void, searchNumber?: string }) => {
  const columns: any = [
    { key: 'result_30_days', label: '30 Days', align: 'center', width: scale(100) },
    {
      key: 'number',
      label: 'Number',
      align: 'center',
      width: scale(70),
      renderAction: (item: any) => {
        const isExactMatch = searchNumber && item.number?.toString() === searchNumber.trim();
        return (
          <TouchableOpacity
            onPress={() => onNumberClick(item.number)}
            style={[styles.numberBadge, isExactMatch && styles.exactMatchBadge]}
          >
            <Text style={[styles.numberBadgeText, isExactMatch && styles.exactMatchText]}>
              {item.number}
            </Text>
          </TouchableOpacity>
        );
      },
    },
    { key: 'total', label: 'Sale', align: 'center', width: scale(80) },
    {
      key: 'amount',
      label: 'P & L',
      align: 'center',
      width: scale(80),
      renderAction: (item: any) => (
        <Text style={{ color: item.amount >= 0 ? '#4CAF50' : '#F44336', fontWeight: 'bold', fontSize: scale(13) }}>
          {item.amount}
        </Text>
      ),
    },
  ];

  return (
    <View style={styles.section}>
      <TableGrid columns={columns} data={data} style={{ height: scale(300) }} />
    </View>
  );
};

// P&L Result Section Component
const PnLResultSection = ({ data }: { data: any }) => {
  const ledgerList = data?.ledger_list || [];

  const columns: any = [
    { key: 'sr', label: 'Sr', align: 'center', width: scale(50) },
    { key: 'name', label: 'Party', align: 'left', width: scale(150) },
    { key: 'total_sale', label: 'Sale', align: 'center', width: scale(80) },
    {
      key: 'pl',
      label: 'P & L',
      align: 'center',
      width: scale(80),
      renderAction: (item: any) => (
        <Text style={{ color: item.pl >= 0 ? 'green' : 'red', fontWeight: 'bold', fontSize: scale(13) }}>
          {item.pl}
        </Text>
      ),
    },
    {
      key: 'total_clam',
      label: 'Last-Win',
      align: 'center',
      width: scale(80),
      renderAction: (item: any) => (
        <Text style={{ fontSize: scale(13), textAlign: 'center' }}>
          {item.lastWin ?? item.total_clam ?? 0}
        </Text>
      )
    },
  ];

  const tableData = ledgerList.map((item: any, index: number) => ({
    ...item,
    sr: index + 1,
  }));

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderLight}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="trending-up" size={20} color={COLORS.BUTTONBG} />
          <Text style={styles.sectionTitleText}>P&L Result</Text>
        </View>
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionInfoText}>Number: <Text style={{ color: 'blue' }}>{data?.number || '-'}</Text> | Profit: <Text style={{ color: 'green' }}>{data?.total || 0}</Text></Text>
        </View>
      </View>
      <TableGrid columns={columns} data={tableData} />
    </View>
  );
};

// Declare Result Section Component
const DeclareResultSection = ({
  selectedShift,
  selectedDate,
  data,
  onAction,
  canRedeclare,
  canUndeclare,
  onDeclareSuccess
}: {
  selectedShift: string;
  selectedDate: Date;
  data: any[];
  onAction?: (type: 'undeclare' | 'redeclare', date: string) => void;
  canRedeclare: boolean;
  canUndeclare: boolean;
  onDeclareSuccess?: () => void;
}) => {
  const [declareNumber, setDeclareNumber] = useState('');
  const [isDeclaring, setIsDeclaring] = useState(false);

  const handleNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      setDeclareNumber('');
      return;
    }
    const num = parseInt(cleaned, 10);
    if (num <= 99) {
      setDeclareNumber(cleaned);
    }
  };

  const handleDeclare = async () => {
    try {
      setIsDeclaring(true);
      const queryParams = {
        shift_id: selectedShift,
        date: getFormattedDate(selectedDate),
        number: declareNumber
      };

      console.log('Declaring shift with:', queryParams);
      const response: any = await APIService.DeclareShift(queryParams);

      if (response && response.success) {
        Toast.show({
          type: 'success',
          text1: 'Result declared successfully',
        });
        setDeclareNumber('');
        onDeclareSuccess?.();
      } else {
        Alert.alert('Error', response?.message || 'Failed to declare result');
      }
    } catch (error) {
      console.error('Declare API Error:', error?.response);
      Alert.alert('Error', 'An error occurred while declaring the result');
    } finally {
      setIsDeclaring(false);
    }
  };

  const columns: any = [
    {
      key: 'date',
      label: 'Date',
      align: 'center',
      width: scale(100),
      renderAction: (item: any) => (
        <Text style={[{ fontSize: scale(11), color: '#333', textAlign: 'center' }, item.is_altered && { color: '#B91C1C', fontWeight: 'bold' }]}>
          {formatDateToDDMMYYYY(item.date)}
        </Text>
      )
    },
    {
      key: 'number',
      label: 'Result',
      align: 'center',
      width: scale(80),
      renderAction: (item: any) => (
        <Text style={[{ fontSize: scale(11), color: '#333', textAlign: 'center' }, item.is_altered && { color: '#B91C1C', fontWeight: 'bold' }]}>
          {item.number}
        </Text>
      )
    },
  ];

  if (canRedeclare) {
    columns.push({
      key: 'action_redeclare',
      label: 'Redeclare',
      align: 'center',
      width: scale(90),
      renderAction: (item: any) => (
        <TouchableOpacity
          style={[styles.smallActionButton, { borderColor: COLORS.BUTTONBG }]}
          onPress={() => onAction?.('redeclare', formatDateToDDMMYYYY(item.date))}
        >
          <Text style={[styles.smallActionButtonText, { color: COLORS.BUTTONBG }]}>ReDeclare</Text>
        </TouchableOpacity>
      )
    });
  }

  if (canUndeclare) {
    columns.push({
      key: 'action_undeclare',
      label: 'UnDeclare',
      align: 'center',
      width: scale(90),
      renderAction: (item: any) => (
        <TouchableOpacity
          style={[styles.smallActionButton, { borderColor: '#EF4444' }]}
          onPress={() => onAction?.('undeclare', formatDateToDDMMYYYY(item.date))}
        >
          <Text style={[styles.smallActionButtonText, { color: '#EF4444' }]}>UnDeclare</Text>
        </TouchableOpacity>
      )
    });
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderLight}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="flame" size={20} color={COLORS.BUTTONBG} />
          <Text style={styles.sectionTitleText}>Declare</Text>
        </View>
        <PermissionGuard permission={PERMISSIONS.RESULT_LIVE_PREDICTION_DECLARE.value}>
          <View style={styles.declareInputContainer}>
            <TextInput
              style={styles.declareInput}
              placeholder="0-99"
              value={declareNumber}
              onChangeText={handleNumberChange}
              keyboardType="numeric"
              maxLength={2}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.declareButton, (isDeclaring || !selectedShift || !declareNumber) && { backgroundColor: '#ccc', opacity: 0.7 }]}
              onPress={handleDeclare}
              disabled={isDeclaring || !selectedShift || !declareNumber}
            >
              <Text style={styles.declareButtonText}>
                {isDeclaring ? '...' : 'Declare'}
              </Text>
            </TouchableOpacity>
          </View>
        </PermissionGuard>
      </View>
      <TableGrid columns={columns} data={data} style={{ height: scale(300) }} />
    </View>
  );
};

const LivePredaction = ({ navigation }: any) => {
  const { hasPermission } = usePermissions();
  const canRedeclare = hasPermission(PERMISSIONS.RESULT_LIVE_PREDICTION_REDECLARE.value);
  const canUndeclare = hasPermission(PERMISSIONS.RESULT_LIVE_PREDICTION_UNDECLARE.value);

  // State for filter bottom sheet
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(true);
  const filterBottomSheetRef = useRef<any>(null);

  // State for detail bottom sheet
  const [isDetailBottomSheetOpen, setIsDetailBottomSheetOpen] = useState(false);
  const detailBottomSheetRef = useRef<any>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Filter states
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLivePrediction, setIsLivePrediction] = useState(true);

  // Search and API states
  const [searchNumber, setSearchNumber] = useState('');
  const [predictionList, setPredictionList] = useState<any[]>([]);
  const [filteredPredictionList, setFilteredPredictionList] = useState<any[]>([]);
  const [declaredData, setDeclaredData] = useState<any[]>([]);

  const [liveResultData, setLiveResultData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // Parse and sort live prediction data descending by amount
  const getFormattedPredictionList = (data: any) => {
    const resultData = data?.data || {};
    return Object.keys(resultData).map((key) => ({
      number: key,
      ...resultData[key],
    })).sort((a, b) => (b.amount || 0) - (a.amount || 0));
  };

  // Sync formatted predictionList when liveResultData changes
  useEffect(() => {
    const formatted = getFormattedPredictionList(liveResultData);
    setPredictionList(formatted);

    // Apply active search if exists
    if (searchNumber.trim()) {
      const exactMatches = formatted.filter(item =>
        item.number?.toString() === searchNumber.trim()
      );
      const otherItems = formatted.filter(item =>
        item.number?.toString() !== searchNumber.trim()
      );
      setFilteredPredictionList([...exactMatches, ...otherItems]);
    } else {
      setFilteredPredictionList(formatted);
    }
  }, [liveResultData]);

  // Handle local search (exact match at top, keep all others)
  const handleSearchLocal = (text: string) => {
    setSearchNumber(text);
    const cleanedText = text.trim();
    if (!cleanedText) {
      setFilteredPredictionList(predictionList);
    } else {
      const exactMatches = predictionList.filter(item =>
        item.number?.toString() === cleanedText
      );
      const otherItems = predictionList.filter(item =>
        item.number?.toString() !== cleanedText
      );
      setFilteredPredictionList([...exactMatches, ...otherItems]);
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

  // Handle number click to show details
  const handleNumberClick = async (number: string) => {
    try {
      setIsDetailLoading(true);

      const filters = {
        shift_id: selectedShift,
        date: getFormattedDate(selectedDate),
      };

      const response: any = await APIService.liveResultByNumber(filters, number);

      if (response?.data?.ledger_list) {
        setDetailData(response?.data);
        setIsDetailBottomSheetOpen(true);
      } else {
        Alert.alert('No Data', 'No ledger details found for this number.');
      }
    } catch (error) {
      console.error('Detail API Error:', error?.response);
      Alert.alert('Error', 'Failed to fetch prediction details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Handle redeclare / undeclare result actions
  const handleRedeclareOrUndeclare = (type: 'redeclare' | 'undeclare', dateStr: string) => {
    Alert.alert(
      `${type === 'redeclare' ? 'Re-declare' : 'Un-declare'} Result`,
      `Are you sure you want to ${type === 'redeclare' ? 're-declare' : 'un-declare'} this result?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: type === 'redeclare' ? 'Re-declare' : 'Un-declare',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const queryParams = {
                shift_id: selectedShift,
                date: dateStr,
              };

              const response: any = type === 'redeclare'
                ? await APIService.ReDeclareShift(queryParams)
                : await APIService.UnDeclareShift(queryParams);

              if (response && response.success) {
                Toast.show({
                  type: 'success',
                  text1: response.message || `${type === 'redeclare' ? 'Re-declared' : 'Un-declared'} successfully`,
                });

                // Refresh data
                if (selectedShift) {
                  const apiData = {
                    shift_id: selectedShift,
                    date: getFormattedDate(selectedDate),
                  };
                  const [liveRes, declaredRes] = await Promise.allSettled([
                    APIService.LiveResult(apiData, ''),
                    APIService.GetDecelearedTransaction({ shift_id: selectedShift })
                  ]);
                  if (liveRes.status === 'fulfilled' && liveRes.value?.success) {
                    setLiveResultData(liveRes.value.data || liveRes.value);
                  }
                  if (declaredRes.status === 'fulfilled' && declaredRes.value?.success) {
                    setDeclaredData(declaredRes.value.data || []);
                  }
                }
              } else {
                Alert.alert('Error', response?.message || `Failed to ${type}`);
              }
            } catch (error) {
              console.error(`Error during ${type}:`, error);
              Alert.alert('Error', `An error occurred during ${type}`);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
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
        date: getFormattedDate(selectedDate),
      };

      console.log('Filter submitted:', apiData);

      // Call LiveResult API & declared transactions API concurrently
      const [liveRes, declaredRes] = await Promise.allSettled([
        APIService.LiveResult(apiData, ''),
        APIService.GetDecelearedTransaction({ shift_id: selectedShift })
      ]);

      if (liveRes.status === 'fulfilled' && liveRes.value?.success) {
        setLiveResultData(liveRes.value.data || liveRes.value);
        console.log('Live result data received:', liveRes.value.data || liveRes.value);
      } else {
        Alert.alert('Error', 'Failed to fetch live prediction data');
      }

      if (declaredRes.status === 'fulfilled' && declaredRes.value?.success) {
        setDeclaredData(declaredRes.value.data || []);
        console.log('Declared transactions received:', declaredRes.value.data);
      } else {
        setDeclaredData([]);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShiftData();
    if (selectedShift) {
      const apiData = {
        shift_id: selectedShift,
        date: getFormattedDate(selectedDate),
      };

      await Promise.allSettled([
        APIService.LiveResult(apiData, '').then(res => {
          if (res?.success) setLiveResultData(res.data || res);
        }),
        APIService.GetDecelearedTransaction({ shift_id: selectedShift }).then(res => {
          if (res?.success) setDeclaredData(res.data || []);
        })
      ]);
    }
    setRefreshing(false);
  };

  console.log(liveResultData, "liveResultData")

  return (
    <PermissionGuard permission={PERMISSIONS.RESULT_LIVE_PREDICTION_VIEW.value}>
      <GradientBackground colors={["#fdf0d0", "#e0efea"]} locations={[0, 30]}>

        <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
          {/* Header */}
          <ScreenHeader
            navigation={navigation}
            title="Live Predication"
            hideBackButton={true} showDrawerButton={true}
          >
            <TouchableOpacity onPress={() => setIsFilterBottomSheetOpen(true)}>
              <Ionicons name="filter" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
          </ScreenHeader>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} nestedScrollEnabled={true} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.BUTTONBG]} tintColor={COLORS.BUTTONBG} />}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search number..."
                placeholderTextColor="#999"
                value={searchNumber}
                onChangeText={handleSearchLocal}
              />
            </View>

            {/* Result 30 Days Section */}
            <Result30DaysSection data={filteredPredictionList} onNumberClick={handleNumberClick} searchNumber={searchNumber} />

            {/* Declare Result Section */}
            <DeclareResultSection
              selectedShift={selectedShift}
              selectedDate={selectedDate}
              data={declaredData}
              canRedeclare={canRedeclare}
              canUndeclare={canUndeclare}
              onAction={handleRedeclareOrUndeclare}
              onDeclareSuccess={async () => {
                // Refresh data on successful declaration
                if (selectedShift) {
                  const apiData = {
                    shift_id: selectedShift,
                    date: getFormattedDate(selectedDate),
                  };
                  const [liveRes, declaredRes] = await Promise.allSettled([
                    APIService.LiveResult(apiData, ''),
                    APIService.GetDecelearedTransaction({ shift_id: selectedShift })
                  ]);
                  if (liveRes.status === 'fulfilled' && liveRes.value?.success) {
                    setLiveResultData(liveRes.value.data || liveRes.value);
                  }
                  if (declaredRes.status === 'fulfilled' && declaredRes.value?.success) {
                    setDeclaredData(declaredRes.value.data || []);
                  }
                }
              }}
            />
          </ScrollView>

          {/* Filter Bottom Sheet */}
          {isFilterBottomSheetOpen && (
            <BottomSheet
              backgroundStyle={{ backgroundColor: '#F5F5DC' }}
              ref={filterBottomSheetRef}
              style={styles.bottomSheet}
              index={0}
              snapPoints={snapPoints} keyboardBehavior="fillParent" keyboardBlurBehavior="restore"
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
                  <View style={[styles.shiftHeaderContainer, { top: 30 }]}>
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
                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { top: 30 }]}>Date</Text>
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

          {/* Detail Bottom Sheet */}
          {isDetailBottomSheetOpen && (
            <BottomSheet
              backgroundStyle={{ backgroundColor: '#F5F5DC' }}
              ref={detailBottomSheetRef}
              style={styles.bottomSheet}
              index={0}
              snapPoints={snapPoints} keyboardBehavior="fillParent" keyboardBlurBehavior="restore"
              enableDynamicSizing={false}
              onChange={(index: number) => {
                if (index === -1) {
                  setIsDetailBottomSheetOpen(false);
                }
              }}
              backdropComponent={renderBackdrop}
              enablePanDownToClose={true}
              onClose={() => {
                setIsDetailBottomSheetOpen(false);
              }}
            >
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>Prediction Details</Text>
                <TouchableOpacity onPress={() => setIsDetailBottomSheetOpen(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <BottomSheetScrollView style={styles.bottomSheetContent}>
                <PnLResultSection data={detailData} />
              </BottomSheetScrollView>
            </BottomSheet>
          )}
        </SafeAreaView>
      </GradientBackground>
    </PermissionGuard>
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
  numberBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: scale(4),
    paddingHorizontal: scale(8),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: '#C7D2FE',
    minWidth: scale(45),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  numberBadgeText: {
    color: COLORS.BUTTONBG,
    fontWeight: 'bold',
    fontSize: scale(13),
  },
  exactMatchBadge: {
    backgroundColor: '#F59E0B', // Yellow-500/orange
    borderColor: '#D97706',
  },
  exactMatchText: {
    color: '#000',
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
  smallActionButton: {
    borderWidth: 1,
    paddingVertical: scale(2),
    paddingHorizontal: scale(6),
    borderRadius: scale(6),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(65),
    backgroundColor: '#FFF',
  },
  smallActionButtonText: {
    fontSize: scale(10),
    fontWeight: 'bold',
  },
});