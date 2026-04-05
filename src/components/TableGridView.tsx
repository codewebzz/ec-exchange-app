import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { scale } from 'react-native-size-matters';
import { ScrollView } from 'react-native-gesture-handler';
import { COLORS } from '../assets/colors';


interface TableProps {
    columns: {
        key: string;
        label: string;
        align?: 'left' | 'center' | 'right';
        width?: number;
        renderAction?: (item: any) => React.ReactNode;
    }[];
    data?: any[];
    headerBgColor?: string;
    headerTextColor?: string;
    reverse?: boolean;
}

const TableGrid: React.FC<TableProps> = ({
    columns,
    data,
    headerBgColor = COLORS.BUTTONBG,
    headerTextColor = COLORS.WHITE,
    reverse = false,
}) => {
    const renderHeader = () => (
        <View style={[styles.headerRow, { backgroundColor: headerBgColor }]}>
            {columns.map((column) => (
                <Text
                    key={column.key}
                    style={[
                        styles.headerText,
                        { width: column.width || 100, color: headerTextColor },
                        column.align === 'right'
                            ? { textAlign: 'right', paddingEnd: 20 }
                            : column.align === 'center'
                                ? { textAlign: 'center' }
                                : { textAlign: 'left', paddingStart: 20 },
                    ]}
                >
                    {column.label}
                </Text>
            ))}
        </View>
    );

    const renderRow = ({ item }: { item: any }) => (
        <View style={styles.row}>
            {columns.map((column) => (
                <View key={column.key}>
                    {column.renderAction ? (
                        <View
                            style={[
                                { width: column.width || 100 },
                                column.align === 'right'
                                    ? {
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        paddingEnd: 20,
                                    }
                                    : column.align === 'center'
                                        ? { flexDirection: 'row', justifyContent: 'center' }
                                        : {
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start',
                                            paddingStart: 20,
                                        },
                            ]}
                        >
                            {column.renderAction(item)}
                        </View>
                    ) : (
                        <Text
                            style={[
                                { color: COLORS.BLACK },
                                { width: column.width || 100 },
                                column.align === 'right'
                                    ? { textAlign: 'right', paddingEnd: 20 }
                                    : column.align === 'center'
                                        ? { textAlign: 'center' }
                                        : { textAlign: 'left', paddingStart: 20 },
                            ]}
                        >
                            {/* {typeof (item[column.key]) === 'boolean' ? `${item[column.key] ? 'Yes' : 'No'}` : item[column.key]} */}

                            {item[column.key] || '-'}
                        </Text>
                    )}
                </View>
            ))}
        </View>
    );

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator>
            <View
                style={[
                    styles.container,
                    columns.length === 3 ? { maxWidth: '100%' } : {},
                ]}
            >
                {renderHeader()}
                <FlatList
                    data={reverse ? [...data?? []]?.reverse() : data} // ✅ Reverse data if reverse prop is true
                    renderItem={renderRow}
                    keyExtractor={(item, index) => index.toString()}
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
        minWidth: '100%',
        flex:1
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor:COLORS.BUTTONBG, // Header background color
        paddingVertical: scale(4),
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BUTTONBG,
        paddingVertical: scale(8),
    },
    cell: {
        flex: 1,
        paddingVertical: 8,
    },
    headerText: {
        flex: 1,
        paddingVertical: 8,
        fontWeight: 'bold',
        color:COLORS.WHITE, // Header text color
    },
});

export default TableGrid;
