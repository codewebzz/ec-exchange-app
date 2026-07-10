import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { scale } from 'react-native-size-matters';
import { ScrollView, FlatList } from 'react-native-gesture-handler';
import { COLORS } from '../assets/colors';
import Icons from 'react-native-vector-icons/Ionicons';


interface TableProps {
    columns: {
        key: string;
        label: string;
        align?: 'left' | 'center' | 'right';
        width?: number;
        renderCell?: (item: any) => React.ReactNode;
        renderAction?: (item: any) => React.ReactNode;
        sortable?: boolean;
        numeric?: boolean;
    }[];
    data?: any[];
    headerBgColor?: string;
    headerTextColor?: string;
    reverse?: boolean;
    showTotal?: boolean;
    totalRowLabel?: string;
    loading?: boolean;
    enableRowPress?: boolean;
    onRowPress?: (item: any) => void;
    style?: any;
    onRefresh?: () => void;
    refreshing?: boolean;
}

const TableGrid: React.FC<TableProps> = ({
    columns,
    data,
    headerBgColor = COLORS.BUTTONBG,
    headerTextColor = COLORS.WHITE,
    reverse = false,
    showTotal = false,
    totalRowLabel = 'Total',
    loading = false,
    enableRowPress = false,
    onRowPress,
    style,
    onRefresh,
    refreshing = false,
}) => {
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null;
        }
        setSortConfig({ key, direction });
    };

    const getSortedData = () => {
        if (!data) return [];
        let sortedData = [...data];
        if (sortConfig.direction !== null) {
            sortedData.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                // Handle numeric strings
                if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
                    valA = Number(valA);
                    valB = Number(valB);
                } else {
                    valA = valA?.toString().toLowerCase() || '';
                    valB = valB?.toString().toLowerCase() || '';
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return reverse ? sortedData.reverse() : sortedData;
    };

    const calculateTotals = () => {
        const totals: Record<string, number> = {};
        columns.forEach((col) => {
            if (col.numeric) {
                totals[col.key] = (data || []).reduce((sum, row) => {
                    const value = row[col.key];
                    const cleanedValue = typeof value === 'string'
                        ? value.replace(/[₹\s,]/g, '')
                        : value;
                    const num = typeof cleanedValue === 'number' ? cleanedValue : parseFloat(cleanedValue) || 0;
                    return sum + num;
                }, 0);
            }
        });
        return totals;
    };

    const totals = showTotal ? calculateTotals() : {};

    if (loading && (!data || data.length === 0)) {
        return (
            <View style={{ padding: scale(40), alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.BUTTONBG} />
            </View>
        );
    }

    const renderHeader = () => (
        <View style={[styles.headerRow, { backgroundColor: headerBgColor }]}>
            {columns.map((column) => {
                const isSortable = column.sortable !== false;
                const isCurrentSort = sortConfig.key === column.key;

                return (
                    <TouchableOpacity
                        key={column.key}
                        activeOpacity={isSortable ? 0.7 : 1}
                        onPress={() => isSortable && handleSort(column.key)}
                        disabled={!isSortable}
                        style={[
                            { width: column.width || 100 },
                            {
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: scale(8),
                            },
                            column.align === 'right'
                                ? { justifyContent: 'flex-end', paddingEnd: scale(10) }
                                : column.align === 'center'
                                    ? { justifyContent: 'center', paddingHorizontal: scale(5) }
                                    : { justifyContent: 'flex-start', paddingStart: scale(10) },
                        ]}
                    >
                        <Text
                            style={[
                                styles.headerText,
                                { color: headerTextColor },
                                column.align === 'right'
                                    ? { textAlign: 'right' }
                                    : column.align === 'center'
                                        ? { textAlign: 'center' }
                                        : { textAlign: 'left' },
                                { fontSize: scale(11) }
                            ]}
                        >
                            {column.label}
                        </Text>
                        {isSortable && (
                            <Icons
                                name={isCurrentSort ? (sortConfig.direction === 'asc' ? 'arrow-up' : 'arrow-down') : 'swap-vertical'}
                                size={scale(12)}
                                color={isCurrentSort ? headerTextColor : 'rgba(255,255,255,0.5)'}
                                style={{ marginLeft: scale(4) }}
                            />
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderRow = ({ item, index }: { item: any, index: number }) => (
        <TouchableOpacity
            activeOpacity={enableRowPress ? 0.7 : 1}
            onPress={() => enableRowPress && onRowPress?.(item)}
            style={styles.row}
        >
            {columns.map((column) => (
                <View key={column.key}>
                    {column.renderCell || column.renderAction ? (
                        <View
                            style={[
                                { width: column.width || 100 },
                                column.align === 'right'
                                    ? {
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        paddingEnd: scale(10),
                                    }
                                    : column.align === 'center'
                                        ? { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: scale(5) }
                                        : {
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start',
                                            paddingStart: scale(10),
                                        },
                            ]}
                        >
                            {column.renderCell ? column.renderCell(item) : column.renderAction?.(item)}
                        </View>
                    ) : (
                        <Text
                            style={[
                                { color: COLORS.BLACK },
                                { width: column.width || 100 },
                                column.align === 'right'
                                    ? { textAlign: 'right', paddingEnd: scale(10) }
                                    : column.align === 'center'
                                        ? { textAlign: 'center', paddingHorizontal: scale(5) }
                                        : { textAlign: 'left', paddingStart: scale(10) },
                                { fontSize: scale(10) }
                            ]}
                        >
                            {/* {typeof (item[column.key]) === 'boolean' ? `${item[column.key] ? 'Yes' : 'No'}` : item[column.key]} */}

                            {column.key === 'sno' && (item[column.key] === undefined || item[column.key] === null)
                                ? index + 1
                                : (item[column.key] ?? '-')}
                        </Text>
                    )}
                </View>
            ))}
        </TouchableOpacity>
    );

    const renderTotalRow = () => (
        <View style={styles.totalRow}>
            {columns.map((column, colIndex) => {
                const hasCurrency = (data || []).some(row => typeof row[column.key] === 'string' && row[column.key].includes('₹'));
                const formattedVal = column.numeric
                    ? (hasCurrency
                        ? '₹ ' + (totals[column.key] || 0).toLocaleString('en-IN')
                        : (totals[column.key] || 0).toLocaleString('en-IN'))
                    : '-';

                return (
                    <View
                        key={column.key}
                        style={[
                            { width: column.width || 100 },
                            column.align === 'right'
                                ? { paddingEnd: scale(10) }
                                : column.align === 'center'
                                    ? { alignItems: 'center', paddingHorizontal: scale(5) }
                                    : { paddingStart: scale(10) },
                        ]}
                    >
                        <Text style={[styles.totalText, { textAlign: column.align }]}>
                            {colIndex === 0
                                ? totalRowLabel
                                : formattedVal}
                        </Text>
                    </View>
                );
            })}
        </View>
    );

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={true} persistentScrollbar={true} contentContainerStyle={{ paddingHorizontal: scale(2) }} nestedScrollEnabled={true}>
            <View
                style={[
                    styles.container,
                    columns.length === 3 ? { maxWidth: '100%' } : {},
                    style
                ]}
            >
                {renderHeader()}
                <FlatList
                    data={getSortedData()}
                    renderItem={renderRow}
                    keyExtractor={(item, index) => index.toString()}
                    style={{ flex: 1 }}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: scale(10) }}
                    refreshControl={
                        onRefresh ? (
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[COLORS.BUTTONBG]}
                                tintColor={COLORS.BUTTONBG}
                            />
                        ) : undefined
                    }
                />
                {!data?.length && (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            paddingVertical: scale(10),
                            paddingHorizontal: scale(100),
                        }}
                    >
                        <Text style={{ color: 'gray', fontWeight: '500' }}>
                            No Records found!
                        </Text>
                    </View>
                )}
                {showTotal && (data?.length ?? 0) > 0 && renderTotalRow()}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // Grid table
    container: {
        borderWidth: 1,
        borderColor: COLORS.BUTTONBG,
        borderRadius: 8,
        overflow: 'hidden',
        margin: 1, // Add margin to prevent border clipping
        minWidth: '100%',
        backgroundColor: COLORS.WHITE,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.BUTTONBG, // Header background color
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BUTTONBG,
        paddingVertical: scale(8),
    },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderTopWidth: 2,
        borderTopColor: COLORS.BUTTONBG,
        paddingVertical: scale(10),
    },
    cell: {
        flex: 1,
        paddingVertical: 8,
    },
    headerText: {
        fontWeight: 'bold',
        color: COLORS.WHITE, // Header text color
    },
    totalText: {
        fontWeight: 'bold',
        color: COLORS.BLACK,
        fontSize: scale(12),
    },
});

export default TableGrid;

