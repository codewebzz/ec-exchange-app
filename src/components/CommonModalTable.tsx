import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { scale } from 'react-native-size-matters';

const { width: screenWidth } = Dimensions.get('window');

interface ColumnConfig {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  numeric?: boolean;
}

interface SummaryCard {
  label: string;
  value: number | string;
  borderColor: string;
}

interface CommonModalTableProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  dateFrom?: string;
  dateTo?: string;
  data: any[];
  columns: ColumnConfig[];
  summaryCards?: SummaryCard[];
  loading?: boolean;
  showTotal?: boolean;
  totalRowLabel?: string;
  onCopyImage?: () => void;
  onExport?: () => void;
}

const CommonModalTable: React.FC<CommonModalTableProps> = ({
  visible,
  onClose,
  title,
  dateFrom,
  dateTo,
  data = [],
  columns,
  summaryCards = [],
  loading = false,
  showTotal = true,
  totalRowLabel = 'Total',
  onCopyImage,
  onExport,
}) => {
  const getColumnWidth = (column: ColumnConfig): number => {
    if (column.width) {
      return Math.max(scale(column.width), scale(60));
    }
    return scale(80);
  };

  const calculateTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    columns.forEach((col) => {
      if (col.numeric) {
        totals[col.key] = data.reduce((sum, row) => {
          const value = row[col.key];
          const num = typeof value === 'number' ? value : parseFloat(value) || 0;
          return sum + num;
        }, 0);
      }
    });
    return totals;
  }, [data, columns]);

  const totals = showTotal ? calculateTotals : {};

  const formatValue = (value: any, isNumeric?: boolean): string => {
    if (value === null || value === undefined || value === '') return '0';
    if (isNumeric) {
      const num = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(num) ? '0' : num.toString();
    }
    return String(value);
  };

  const formatDateRange = () => {
    if (dateFrom && dateTo) {
      return `From: ${dateFrom} | To: ${dateTo}`;
    }
    if (dateFrom) {
      return `Date: ${dateFrom}`;
    }
    return '';
  };

  const handleCopyImage = () => {
    if (onCopyImage) {
      onCopyImage();
    } else {
      // Default copy behavior
      console.log('Copy image functionality');
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Default export behavior
      console.log('Export functionality');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {title}
              </Text>
              {formatDateRange() && (
                <Text style={styles.modalDate}>{formatDateRange()}</Text>
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

          {/* Content */}
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {/* Table Card */}
            <View style={styles.tableCard}>
              {/* Table Header with Export Icon */}
              <View style={styles.tableCardHeader}>
                <View style={styles.tableHeaderLeft} />
                <TouchableOpacity
                  onPress={handleExport}
                  style={styles.exportButton}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Icon name="content-copy" size={scale(20)} color="#57607a" />
                </TouchableOpacity>
              </View>

              {/* Table */}
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.table}>
                  {/* Table Header Row */}
                  <View style={styles.tableHeaderRow}>
                    {columns.map((column) => (
                      <View
                        key={column.key}
                        style={[
                          styles.tableHeaderCell,
                          { width: getColumnWidth(column) },
                        ]}
                      >
                        <Text style={styles.tableHeaderText}>
                          {column.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Data Rows or No Results */}
                  {loading ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>Loading...</Text>
                    </View>
                  ) : !data || data.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No results found.</Text>
                    </View>
                  ) : (
                    data.map((row, rowIndex) => (
                      <View key={rowIndex} style={styles.tableDataRow}>
                        {columns.map((column, colIndex) => (
                          <View
                            key={column.key}
                            style={[
                              styles.tableDataCell,
                              { width: getColumnWidth(column) },
                            ]}
                          >
                            <Text
                              style={[
                                styles.tableDataText,
                                column.align === 'right' && styles.textRight,
                                column.align === 'center' && styles.textCenter,
                              ]}
                            >
                              {column.key === 'sno' || colIndex === 0
                                ? (rowIndex + 1).toString()
                                : formatValue(row[column.key], column.numeric)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))
                  )}

                  {/* Total Row */}
                  {showTotal && data && data.length > 0 && (
                    <View style={styles.tableTotalRow}>
                      {columns.map((column, colIndex) => (
                        <View
                          key={column.key}
                          style={[
                            styles.tableTotalCell,
                            { width: getColumnWidth(column) },
                          ]}
                        >
                          <Text style={styles.tableTotalText}>
                            {column.key === 'sno' || colIndex === 0
                              ? totalRowLabel
                              : column.numeric
                              ? formatValue(totals[column.key], true)
                              : '-'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Summary Cards */}
            {summaryCards && summaryCards.length > 0 && (
              <View style={styles.summaryCardsContainer}>
                {summaryCards.map((card, index) => (
                  <View
                    key={index}
                    style={[
                      styles.summaryCard,
                      { borderColor: card.borderColor },
                    ]}
                  >
                    <Text style={styles.summaryCardLabel}>{card.label}</Text>
                    <Text style={styles.summaryCardValue}>
                      {typeof card.value === 'number'
                        ? card.value.toString()
                        : card.value}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyImage}
            >
              <Icon name="image" size={scale(18)} color="#57607a" />
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
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    maxWidth: screenWidth * 0.95,
    height: '90%',
    backgroundColor: '#F8F6EF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8F6EF',
  },
  modalHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#1d2238',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: scale(12),
    color: '#57607a',
    fontWeight: '500',
  },
  closeButton: {
    width: scale(32),
    height: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(16),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButtonText: {
    fontSize: scale(20),
    color: '#1d2238',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F8F6EF',
  },
  modalContentContainer: {
    padding: scale(12),
    flexGrow: 1,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: scale(12),
    marginBottom: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  tableHeaderLeft: {
    flex: 1,
  },
  exportButton: {
    padding: scale(4),
  },
  table: {
    minWidth: scale(1200),
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeaderCell: {
    padding: scale(10),
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: scale(10),
    fontWeight: '500',
    color: '#1d2238',
    textAlign: 'center',
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  tableDataCell: {
    padding: scale(8),
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    justifyContent: 'center',
    minHeight: scale(40),
  },
  tableDataText: {
    fontSize: scale(10),
    color: '#1d2238',
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  textCenter: {
    textAlign: 'center',
  },
  emptyState: {
    padding: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(200),
  },
  emptyStateText: {
    fontSize: scale(14),
    color: '#57607a',
    fontWeight: '500',
  },
  tableTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F5',
    borderTopWidth: 2,
    borderTopColor: '#D0D0D0',
  },
  tableTotalCell: {
    padding: scale(10),
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    justifyContent: 'center',
  },
  tableTotalText: {
    fontSize: scale(10),
    fontWeight: '700',
    color: '#1d2238',
    textAlign: 'center',
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
    marginTop: scale(8),
    marginBottom: scale(8),
  },
  summaryCard: {
    flex: 1,
    minWidth: scale(100),
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: scale(12),
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryCardLabel: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#57607a',
    marginBottom: scale(6),
    textTransform: 'uppercase',
  },
  summaryCardValue: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#1d2238',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  copyButtonText: {
    color: '#57607a',
    fontSize: scale(14),
    fontWeight: '600',
  },
  closeBottomButton: {
    backgroundColor: '#1d2238',
    paddingHorizontal: scale(24),
    paddingVertical: scale(10),
    borderRadius: 8,
  },
  closeBottomButtonText: {
    color: '#FFFFFF',
    fontSize: scale(14),
    fontWeight: '600',
  },
});

export default CommonModalTable;
