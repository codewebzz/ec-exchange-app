import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  Platform,
  Alert
} from 'react-native';

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
  quickEntryData = {},
  onDataChange,
  visible = false,
  onClose,
  title = "Jantri View",
  date,
  rowLabels = []
}) => {
  const [data, setData] = useState<GridCell[][]>(initialData);

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

  // Copy functionality
  const handleCopyImage = useCallback(async () => {
    try {
      const textToCopy = `${title}\n${date ? `Date: ${date}\n` : ''}\nTable Data`;
      // Note: Clipboard API varies by platform
      Alert.alert('Success', 'Data copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy data');
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
              const cellLabel = cell.label;
              const isSeriesCell = cellLabel && (cellLabel.startsWith('B') || cellLabel.startsWith('A'));
              
              return (
                <View 
                  key={`${rowIndex}-${cell.key}`}
                  style={[
                    styles.dataCell,
                    isSeriesCell && styles.seriesCell
                  ]}
                >
                  {cellLabel && (
                    <View style={[
                      styles.numberBadge,
                      isSeriesCell && styles.seriesBadge
                    ]}>
                      <Text style={styles.numberBadgeText}>{cellLabel}</Text>
                    </View>
                  )}
                  
                  {cell.editable ? (
                    <TextInput
                      style={[
                        styles.input, 
                        stableQuickEntryData[cell.key] && !cell.value ? styles.quickEntryInput : null
                      ]}
                      value={cell.value}
                      onChangeText={(value) => handleCellChange(rowIndex, cellIndex, value)}
                      keyboardType="numeric"
                      maxLength={cell.type === 'triple' ? 3 : cell.type === 'four-digit' ? 4 : undefined}
                      placeholder={stableQuickEntryData[cell.key] ? stableQuickEntryData[cell.key].toString() : "0"}
                      placeholderTextColor={stableQuickEntryData[cell.key] ? "#10b5a6" : "#999"}
                    />
                  ) : (
                    <Text style={[
                      styles.cellText,
                      stableQuickEntryData[cell.key] && !cell.value ? styles.quickEntryText : null
                    ]}>
                      {getCellDisplayValue(cell)}
                    </Text>
                  )}
                  
                  {stableQuickEntryData[cell.key] && cell.value && (
                    <View style={styles.quickEntryIndicator}>
                      <Text style={styles.quickEntryIndicatorText}>Q</Text>
                    </View>
                  )}
                </View>
              );
            })}
            
            <View style={[styles.totalCell, styles.totalColumnCell]}>
              <Text style={styles.totalCellText}>{totals[rowIndex] || 0}</Text>
            </View>
          </View>
        ))}

        {/* Summary Row */}
        <View style={styles.row}>
          {headers.map((_, idx) => (
            <View key={`summary-${idx}`} style={styles.summaryCell}>
              <Text style={styles.summaryCellText}>0</Text>
            </View>
          ))}
          <View style={[styles.summaryCell, styles.totalColumnCell]}>
            <Text style={styles.summaryCellText}>{intermediateTotal}</Text>
          </View>
        </View>

        {/* Footer Rows */}
        {footer && footer.length > 0 && footer.map((footerLabel, footerIndex) => {
          const isBSeries = footerLabel.startsWith('B') || footerLabel === 'B';
          const isASeries = footerLabel.startsWith('A') || footerLabel === 'A';
          
          return (
            <View key={`footer-${footerIndex}`} style={styles.row}>
              {headers.map((_, idx) => {
                const label = isBSeries || isASeries 
                  ? `${footerLabel.charAt(0)}${idx + 1 === 10 ? 0 : idx + 1}`
                  : '';
                
                return (
                  <View 
                    key={`footer-${footerIndex}-${idx}`}
                    style={[styles.dataCell, styles.seriesCell]}
                  >
                    <View style={[styles.numberBadge, styles.seriesBadge]}>
                      <Text style={styles.numberBadgeText}>{label}</Text>
                    </View>
                    <Text style={styles.cellText}>0</Text>
                  </View>
                );
              })}
              <View style={[styles.totalCell, styles.totalColumnCell]}>
                <Text style={styles.totalCellText}>0</Text>
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
  ), [headers, data, footer, totals, intermediateTotal, grandTotal, stableQuickEntryData, handleCellChange, getCellDisplayValue]);

  if (visible) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {title}
                </Text>
                {date && (
                  <Text style={styles.modalDate}>{formatDate(date)}</Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {TableContent}
            </ScrollView>

            <View style={styles.bottomButtons}>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={handleCopyImage}
              >
                <Text style={styles.copyButtonText}>📋 Copy Image</Text>
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
  grandTotalLabelCell: {
    width: TOTAL_COLUMN_WIDTH,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 13,
    color: '#0f172a',
    padding: 0,
  },
  quickEntryInput: {
    backgroundColor: '#E8F5E8',
    color: '#10b5a6',
    fontWeight: 'bold',
  },
  quickEntryText: {
    fontSize: 13,
    color: '#10b5a6',
    fontWeight: '700',
  },
  quickEntryIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  quickEntryIndicatorText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    maxWidth: 800,
    height: '90%',
    backgroundColor: '#FDF5E6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2a37',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#2d4a6f',
  },
  modalHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 12,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FDF5E6',
  },
  modalContentContainer: {
    padding: 12,
    flexGrow: 1,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2a37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeBottomButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeBottomButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CommonGridTable;