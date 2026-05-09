import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  NativeModules
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Lazy load native modules to prevent crash if not yet linked in the binary
const getViewShotModule = () => {
  // Check if RNViewShot exists in NativeModules first to avoid internal library crashes
  if (!NativeModules.RNViewShot) return null;
  try {
    return require('react-native-view-shot');
  } catch (e) {
    return null;
  }
};

const getShareModule = () => {
  // Check if RNShare exists in NativeModules first to avoid internal library crashes
  // react-native-share often calls getEnforcing on require, which crashes if missing
  if (!NativeModules.RNShare) return null;
  try {
    return require('react-native-share');
  } catch (e) {
    return null;
  }
};

interface GridCell {
  key: string;
  value: string;
  editable?: boolean;
  type?: 'triple' | 'four-digit' | 'normal';
  label?: string;
}

interface QuickEntryData {
  [key: string]: number;
}

interface CommonGridTableProps {
  headers: string[];
  data: GridCell[][];
  footer?: string[];
  footerData?: GridCell[][];
  highlightNumbers?: string[];
  quickEntryData?: QuickEntryData;
  onDataChange?: (updatedData: GridCell[][]) => void;
  visible?: boolean;
  onClose?: () => void;
  title?: string;
  date?: string;
  rowLabels?: string[];
}

const CELL_WIDTH = 70;
const TOTAL_COLUMN_WIDTH = 96;
const ROW_HEIGHT = 48;
const TABLE_WIDTH = CELL_WIDTH * 10 + TOTAL_COLUMN_WIDTH;

const CommonGridTable: React.FC<CommonGridTableProps> = ({
  headers,
  data: initialData,
  footer,
  footerData,
  highlightNumbers = [],
  quickEntryData = {},
  onDataChange,
  visible = false,
  onClose,
  title = "Jantri View",
  date,
  rowLabels = []
}) => {
  const [data, setData] = useState<GridCell[][]>(initialData);
  const viewShotRef = useRef<any>(null);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    if (highlightNumbers.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [highlightNumbers]);

  // Only update when initialData reference actually changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Memoize quick entry data to prevent reference changes
  const stableQuickEntryData = useMemo(() => quickEntryData, [JSON.stringify(quickEntryData)]);

  // Calculate row total - fully memoized
  const calculateRowTotal = useCallback((row: GridCell[]): number => {
    return row.reduce((sum, cell) => {
      const cellValue = parseFloat(cell.value) || 0;
      const quickEntryValue = stableQuickEntryData?.[cell.key] || 0;
      const effectiveValue = cellValue > 0 ? cellValue : quickEntryValue;
      return sum + effectiveValue;
    }, 0);
  }, [stableQuickEntryData]);

  // Calculate column totals
  const columnTotals = useMemo(() => {
    if (!data || data.length === 0) return Array(10).fill(0);
    const totals = Array(10).fill(0);
    data.forEach(row => {
      row.forEach((cell, idx) => {
        if (idx < 10) {
          totals[idx] += parseFloat(cell.value) || stableQuickEntryData[cell.key] || 0;
        }
      });
    });
    return totals;
  }, [data, stableQuickEntryData]);

  // Calculate all totals in one useMemo to prevent cascading updates
  const { totals, intermediateTotal, grandTotal } = useMemo(() => {
    if (!data || data.length === 0) {
      return { totals: [], intermediateTotal: 0, grandTotal: 0 };
    }

    const newTotals = data.map(row => calculateRowTotal(row));
    const sumTotal = newTotals.reduce((sum, total) => sum + total, 0);

    return {
      totals: newTotals,
      intermediateTotal: sumTotal,
      grandTotal: sumTotal
    };
  }, [data, calculateRowTotal]);

  // Handle cell value change
  const handleCellChange = useCallback((rowIndex: number, cellIndex: number, value: string) => {
    setData(prevData => {
      const newData = [...prevData];
      const cell = newData[rowIndex][cellIndex];

      // Validate input based on cell type
      if (cell.type === 'triple' && value.length > 3) return prevData;
      if (cell.type === 'four-digit' && value.length > 4) return prevData;

      // Only allow numbers
      if (value && !/^\d*$/.test(value)) return prevData;

      newData[rowIndex][cellIndex] = { ...cell, value };

      // Call onDataChange outside of setState
      if (onDataChange) {
        setTimeout(() => onDataChange(newData), 0);
      }

      return newData;
    });
  }, [onDataChange]);

  // Get cell display value
  const getCellDisplayValue = useCallback((cell: GridCell): string => {
    const baseValue = parseFloat(cell.value) || 0;
    const quickEntryValue = stableQuickEntryData[cell.key] || 0;

    if (baseValue > 0) {
      return cell.value;
    }

    if (quickEntryValue > 0) {
      return quickEntryValue.toString();
    }

    return '0';
  }, [stableQuickEntryData]);

  // Image Copy/Share functionality
  const handleCopyImage = useCallback(async () => {
    try {
      const viewShotModule = getViewShotModule();
      const shareModule = getShareModule();

      if (!viewShotModule || !shareModule) {
        Alert.alert(
          'Rebuild Required',
          'To use this feature, please restart your app build (npm run android/ios) so the new native modules can be linked.'
        );
        return;
      }

      if (!viewShotRef.current) {
        Alert.alert('Error', 'Image capture not initialized');
        return;
      }

      // captureRef is a named export or on the module object
      const captureRef = viewShotModule.captureRef;

      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
        result: 'base64'
      });

      const shareOptions = {
        title: 'Jantri Details',
        message: `${title} - ${date}`,
        url: `data:image/png;base64,${uri}`,
        type: 'image/png',
      };

      await shareModule.default.open(shareOptions);
    } catch (error) {
      console.log('Capture/Share error:', error);
      Alert.alert('Error', 'Failed to generate image. Ensure you have rebuilt the app after installation.');
    }
  }, [title, date]);

  // Format date
  const formatDate = useCallback((dateStr?: string): string => {
    if (!dateStr) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  }, []);

  const TableContent = useMemo(() => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={true}
      contentContainerStyle={styles.tableScrollContainer}
      bounces={false}
      nestedScrollEnabled={true}
    >
      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.row}>
          {headers.map((header, idx) => (
            <View key={`header-${idx}`} style={styles.headerCell}>
              <Text style={styles.headerCellText}>{header}</Text>
            </View>
          ))}
          <View style={[styles.headerCell, styles.totalColumnCell]}>
            <Text style={styles.headerCellText}>Total</Text>
          </View>
        </View>

        {/* Data Rows */}
        {data.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, cellIndex) => {
              const cellValue = parseFloat(getCellDisplayValue(cell)) || 0;
              const hasValue = cellValue > 0;
              const cellLabel = cell.label;
              const isSeriesCell = cellLabel && (cellLabel.startsWith('B') || cellLabel.startsWith('A'));

              // Highlight check - strictly based on key matching
              const isHighlighted = highlightNumbers.includes(cell.key);

              return (
                <View
                  key={`${rowIndex}-${cell.key}`}
                  style={[
                    styles.dataCell,
                    isSeriesCell && styles.seriesCell,
                    isHighlighted && styles.highlightedCell
                  ]}
                >
                  {cellLabel && (
                    <View style={[
                      styles.numberBadge,
                      isSeriesCell && styles.seriesBadge,
                      isHighlighted && styles.highlightedBadge
                    ]}>
                      <Text style={styles.numberBadgeText}>{cellLabel}</Text>
                    </View>
                  )}

                  {isHighlighted && (
                    <LinearGradient
                      colors={['rgba(255,140,0,0.3)', 'rgba(255,69,0,0.3)']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}

                  {hasValue && (
                    <LinearGradient
                      colors={['#FFF9C4', '#FBC02D']}
                      style={styles.peeledCorner}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}

                  {cell.editable ? (
                    <TextInput
                      style={[
                        styles.input,
                        stableQuickEntryData[cell.key] && !cell.value ? styles.quickEntryInput : null,
                        isHighlighted && styles.highlightedText
                      ]}
                      value={cell.value}
                      onChangeText={(value) => handleCellChange(rowIndex, cellIndex, value)}
                      keyboardType="numeric"
                      maxLength={cell.type === 'triple' ? 3 : cell.type === 'four-digit' ? 4 : undefined}
                      placeholder={stableQuickEntryData[cell.key] ? stableQuickEntryData[cell.key].toString() : "0"}
                      placeholderTextColor={stableQuickEntryData[cell.key] ? "#ffffff" : "#999"}
                    />
                  ) : (
                    <Text style={[
                      styles.cellText,
                      stableQuickEntryData[cell.key] && !cell.value ? styles.quickEntryText : null,
                      isHighlighted && styles.highlightedText
                    ]}>
                      {getCellDisplayValue(cell)}
                    </Text>
                  )}

                  {isHighlighted && (
                    <Animated.View style={[
                      styles.highlightDot,
                      { transform: [{ scale: pulseAnim }] }
                    ]} />
                  )}
                </View>
              );
            })}

            <View style={[styles.totalCellData, styles.totalColumnCell]}>
              <Text style={styles.totalCellDataText}>{totals[rowIndex] || 0}</Text>
            </View>
          </View>
        ))}

        {/* Summary Row (Column Totals) */}
        <View style={styles.row}>
          {columnTotals.map((total, idx) => (
            <View key={`summary-${idx}`} style={styles.summaryCell}>
              <Text style={styles.summaryCellText}>{total}</Text>
            </View>
          ))}
          <View style={[styles.summaryCell, styles.totalColumnCell]}>
            <Text style={styles.summaryCellText}>{intermediateTotal}</Text>
          </View>
        </View>

        {/* Footer Rows (B/A Series) */}
        {footer && footer.length > 0 && footer.map((footerLabel, footerIndex) => {
          const isBSeries = footerLabel.startsWith('B') || footerLabel === 'B';
          const isASeries = footerLabel.startsWith('A') || footerLabel === 'A';
          const footerRowData = footerData?.[footerIndex];

          return (
            <View key={`footer-${footerIndex}`} style={styles.row}>
              {headers.map((_, idx) => {
                const label = isBSeries || isASeries
                  ? `${footerLabel.charAt(0)}${idx + 1 === 10 ? 0 : idx + 1}`
                  : '';

                const cell = footerRowData?.[idx];
                const cellValue = cell ? (parseFloat(cell.value) || 0) : 0;
                const hasValue = cellValue > 0;

                // Highlight check for series
                const isHighlighted = cell ? highlightNumbers.includes(cell.key) : false;

                return (
                  <View
                    key={`footer-${footerIndex}-${idx}`}
                    style={[
                      styles.dataCell,
                      styles.seriesCell,
                      isHighlighted && styles.highlightedCell
                    ]}
                  >
                    <View style={[
                      styles.numberBadge,
                      styles.seriesBadge,
                      isHighlighted && styles.highlightedBadge
                    ]}>
                      <Text style={styles.numberBadgeText}>{label}</Text>
                    </View>

                    {isHighlighted && (
                      <LinearGradient
                        colors={['rgba(255,140,0,0.3)', 'rgba(255,69,0,0.3)']}
                        style={StyleSheet.absoluteFill}
                      />
                    )}

                    {hasValue && (
                      <LinearGradient
                        colors={['#FFF9C4', '#FBC02D']}
                        style={styles.peeledCorner}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    )}
                    <Text style={[
                      styles.cellText,
                      isHighlighted && styles.highlightedText
                    ]}>
                      {cell ? cell.value : '0'}
                    </Text>

                    {isHighlighted && (
                      <Animated.View style={[
                        styles.highlightDot,
                        { transform: [{ scale: pulseAnim }] }
                      ]} />
                    )}
                  </View>
                );
              })}
              <View style={[styles.totalCellData, styles.totalColumnCell]}>
                <Text style={styles.totalCellDataText}>
                  {footerRowData ? footerRowData.reduce((sum, c) => sum + (parseFloat(c.value) || 0), 0) : 0}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Grand Total Row */}
        <View style={styles.row}>
          {headers.map((_, idx) => {
            if (idx === 8) {
              return (
                <View
                  key={`grand-${idx}`}
                  style={[styles.grandTotalCell, styles.grandTotalLabelCell]}
                >
                  <Text style={styles.grandTotalLabelText}>Grand Total</Text>
                </View>
              );
            }
            if (idx === 9) {
              return null;
            }
            return (
              <View
                key={`grand-${idx}`}
                style={styles.grandTotalCell}
              >
                <Text style={styles.grandTotalCellText}>-</Text>
              </View>
            );
          })}
          <View style={[styles.grandTotalValueCell, styles.totalColumnCell]}>
            <Text style={styles.grandTotalValueText}>{grandTotal}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  ), [headers, data, footer, footerData, totals, intermediateTotal, grandTotal, columnTotals, stableQuickEntryData, handleCellChange, getCellDisplayValue, highlightNumbers, pulseAnim]);

  if (visible) {
    const viewShotModule = getViewShotModule();
    // Resolve the actual component from the module
    const ViewShotComp = viewShotModule ? (viewShotModule.default || viewShotModule) : null;

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 
              Conditionally render ViewShot if available, otherwise fallback to normal View.
              This prevents the app from crashing if the native module hasn't been built yet.
            */}
            {ViewShotComp && typeof ViewShotComp !== 'object' ? (
              <ViewShotComp ref={viewShotRef} options={{ format: "png", quality: 1.0 }}>
                <View style={styles.captureWrapper}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderContent}>
                      <Text style={styles.modalTitle} numberOfLines={2}>
                        {title}
                      </Text>
                      {date && (
                        <Text style={styles.modalDate}>Date: {formatDate(date)}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={onClose}
                      style={styles.closeIcon}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.closeIconText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={styles.modalContent}
                    contentContainerStyle={styles.modalContentContainer}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {TableContent}
                  </ScrollView>
                </View>
              </ViewShotComp>
            ) : (
              <View style={styles.captureWrapper}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderContent}>
                    <Text style={styles.modalTitle} numberOfLines={2}>
                      {title}
                    </Text>
                    {date && (
                      <Text style={styles.modalDate}>Date: {formatDate(date)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeIcon}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.closeIconText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalContent}
                  contentContainerStyle={styles.modalContentContainer}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {TableContent}
                </ScrollView>
              </View>
            )}

            <View style={styles.bottomButtons}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyImage}
              >
                <Text style={styles.copyButtonIcon}>📋</Text>
                <Text style={styles.copyButtonText}>Copy Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBottomButton}
                onPress={onClose}
              >
                <Text style={styles.closeBottomButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return TableContent;
};

const styles = StyleSheet.create({
  tableScrollContainer: {
    minWidth: TABLE_WIDTH,
    padding: 1,
  },
  captureWrapper: {
    backgroundColor: '#fdf0d0', // Match background in image for the whole capture
    paddingBottom: 10,
  },
  table: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2d3e50',
    borderRadius: 8,
    overflow: 'hidden',
    width: TABLE_WIDTH,
  },
  row: {
    flexDirection: 'row',
    flexShrink: 0,
  },
  headerCell: {
    backgroundColor: '#2d3e50',
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    flexShrink: 0,
  },
  headerCellText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  dataCell: {
    backgroundColor: '#f8fafc',
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    flexShrink: 0,
    position: 'relative',
  },
  highlightedCell: {
    backgroundColor: '#ffe4e1', // Light rose background for highlights
    borderColor: '#ff4500',
    borderWidth: 2,
    zIndex: 5,
  },
  highlightedBadge: {
    backgroundColor: '#ff4500', // Orange-red
    transform: [{ scale: 1.1 }],
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  highlightedText: {
    color: '#8b0000', // Dark red for text in highlighted cells
    fontWeight: '900',
  },
  highlightDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  numberBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#1abc9c', // Teal
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomRightRadius: 4,
    zIndex: 2,
  },
  numberBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  peeledCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomLeftRadius: 10,
    zIndex: 1,
  },
  cellText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
    zIndex: 0,
  },
  summaryCell: {
    backgroundColor: '#2d3e50',
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    flexShrink: 0,
  },
  summaryCellText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalCellData: {
    backgroundColor: '#f8fafc',
    width: TOTAL_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
  },
  totalCellDataText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalColumnCell: {
    width: TOTAL_COLUMN_WIDTH,
  },
  seriesCell: {
    backgroundColor: '#f8fafc',
  },
  seriesBadge: {
    backgroundColor: '#1abc9c',
  },
  grandTotalCell: {
    backgroundColor: '#2d3e50',
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    flexShrink: 0,
  },
  grandTotalCellText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  grandTotalLabelCell: {
    width: TOTAL_COLUMN_WIDTH,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 12,
  },
  grandTotalLabelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  grandTotalValueCell: {
    backgroundColor: '#2d3e50',
    width: TOTAL_COLUMN_WIDTH,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    flexShrink: 0,
  },
  grandTotalValueText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 14,
    color: '#0f172a',
    padding: 0,
  },
  quickEntryInput: {
    backgroundColor: '#E8F5E8',
    color: '#1abc9c',
    fontWeight: 'bold',
  },
  quickEntryText: {
    fontSize: 14,
    color: '#1abc9c',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    maxWidth: 900,
    maxHeight: '90%',
    backgroundColor: '#fdf0d0', // Match background in image
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#fdf0d0', // Light background as in image
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2d3e50',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: '#2d3e50',
    fontWeight: '600',
  },
  closeIcon: {
    padding: 4,
  },
  closeIconText: {
    fontSize: 24,
    color: '#2d3e50',
    fontWeight: '300',
  },
  modalContent: {
    maxHeight: 500, // Limit height to ensure it fits in capture
  },
  modalContentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  copyButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  copyButtonText: {
    color: '#2d3e50',
    fontSize: 14,
    fontWeight: '700',
  },
  closeBottomButton: {
    backgroundColor: '#2d3e50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  closeBottomButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default CommonGridTable;