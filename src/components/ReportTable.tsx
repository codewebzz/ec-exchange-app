import LottieView from 'lottie-react-native';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { scale } from 'react-native-size-matters';

interface ColumnConfig {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  numeric?: boolean;
}

interface ReportTableProps {
  data: any[];
  columns: ColumnConfig[];
  loading?: boolean;
  showTotal?: boolean;
  totalRowLabel?: string;
  enableRowPress?: boolean;
  onRowPress?: (row: any) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({
  data,
  columns,
  loading = false,
  showTotal = true,
  totalRowLabel = 'Total',
  enableRowPress = false,
  onRowPress,
}) => {
  const noDataAnimation = require('../assets/gif/NoDataAnimation.json');

  const getColumnWidth = (column: ColumnConfig): number => {
    if (column.width) {
      return Math.max(scale(column.width), scale(50));
    }
    return scale(90);
  };

  const calculateTotals = () => {
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
  };

  const totals = showTotal ? calculateTotals() : {};

  const formatValue = (value: any, isNumeric?: boolean): string => {
    if (value === null || value === undefined || value === '') return '-';
    if (isNumeric) {
      const num = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(num) ? '-' : num.toString();
    }
    return String(value);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LottieView
          source={noDataAnimation}
          autoPlay
          loop
          style={styles.emptyAnimation}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>

          {/* HEADER */}
          <View style={styles.headerRow}>
            {columns.map((column) => (
              <View
                key={column.key}
                style={[styles.headerCell, { width: getColumnWidth(column) }]}
              >
                <Text style={styles.headerText}>{column.label}</Text>
              </View>
            ))}
          </View>

          {/* DATA ROWS */}
          {data.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.dataRow}>
              {columns.map((column, colIndex) => (
                <View
                  key={column.key}
                  style={[
                    styles.dataCell,
                    { width: getColumnWidth(column) },
                  ]}
                >
                  {colIndex === 1 && enableRowPress ? (
                    <TouchableOpacity
                      onPress={() => onRowPress?.(row)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dataText}>
                        {formatValue(row[column.key], column.numeric)}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.dataText}>
                      {column.key === 'sno' || colIndex === 0
                        ? (rowIndex + 1).toString()
                        : formatValue(row[column.key], column.numeric)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}

          {/* TOTAL ROW */}
          {showTotal && (
            <View style={styles.totalRow}>
              {columns.map((column, colIndex) => (
                <View
                  key={column.key}
                  style={[
                    styles.totalCell,
                    { width: getColumnWidth(column) },
                  ]}
                >
                  <Text style={styles.totalText}>
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
  );
};

export default ReportTable;

const styles = StyleSheet.create({
  container: { flex: 1 },
  table: { minWidth: scale(900) },

  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#2e3849',
  },
  headerCell: {
    padding: scale(10),
    borderRightWidth: 1,
    borderRightColor: '#5e636b',
  },
  headerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: scale(10),
  },

  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  dataCell: {
    padding: scale(8),
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  dataText: {
    fontSize: scale(10),
    color: '#111827',
    textDecorationLine:'underline'
  },

  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderTopWidth: 2,
    borderTopColor: '#d1d5db',
  },
  totalCell: {
    padding: scale(10),
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  totalText: {
    fontSize: scale(10),
    fontWeight: '700',
  },

  loadingContainer: {
    padding: scale(40),
    alignItems: 'center',
  },
  emptyContainer: {
    padding: scale(40),
    alignItems: 'center',
  },
  emptyAnimation: {
    width: scale(200),
    height: scale(200),
  },
});
