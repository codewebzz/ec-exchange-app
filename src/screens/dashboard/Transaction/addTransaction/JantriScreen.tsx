import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenHeader from '../../../../components/ScreenHeader';

const { width: screenWidth } = Dimensions.get('window');

interface GridCell {
  key: string;
  value: string;
  amount?: string;
  editable?: boolean;
  type?: 'triple' | 'four-digit' | 'normal' | 'number' | 'amount';
  section?: 'G' | 'B' | 'A' | 'S';
  position?: number;
  isNumberCell?: boolean;
  isAmountCell?: boolean;
  rowType?: 'data' | 'total' | 'section';
}

interface QuickEntryItem {
  id: string;
  number: string;
  amount: number;
  section: 'G' | 'B' | 'A';
  position: number;
  timestamp: Date;
}

const JantriScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  // Get params from navigation
  const {
    title = 'Jantri',
    externalTransactions = [],
    isMainJantri = false,
    onSave: onSaveParam,
  } = route.params || {};

  const [gridData, setGridData] = useState<GridCell[][]>([]);
  const [quickEntryList, setQuickEntryList] = useState<QuickEntryItem[]>([]);
  const [manualNumber, setManualNumber] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [amountLess, setAmountLess] = useState('30');
  const [lessPercentage, setLessPercentage] = useState('10');

  // Helper functions for number conversion
  const convertDisplayToNumeric = (displayNumber: string): string => {
    if (displayNumber.startsWith('B')) {
      const position = displayNumber.substring(1);
      return (parseInt(position) * 111).toString();
    } else if (displayNumber.startsWith('A')) {
      const position = displayNumber.substring(1);
      return (parseInt(position) * 1111).toString();
    }
    return displayNumber;
  };

  const convertNumericToDisplay = (numericNumber: string): { display: string, section: 'G' | 'B' | 'A', position: number } => {
    const num = parseInt(numericNumber);

    if (num >= 1111 && num % 1111 === 0) {
      const position = num / 1111;
      if (position >= 1 && position <= 10) {
        return { display: `A${position}`, section: 'A', position };
      }
    }

    if (num >= 111 && num % 111 === 0) {
      const position = num / 111;
      if (position >= 1 && position <= 10) {
        return { display: `B${position}`, section: 'B', position };
      }
    }

    if (num >= 1 && num <= 100) {
      return { display: numericNumber, section: 'G', position: ((num - 1) % 10) + 1 };
    }

    return { display: numericNumber, section: 'G', position: 1 };
  };

  // Initialize grid data
  useEffect(() => {
    initializeGridData();
  }, []);

  // Load existing transactions into grid when screen opens
  useEffect(() => {
    if (externalTransactions.length > 0) {
      loadExternalTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalTransactions]);

  const initializeGridData = () => {
    const initialData: GridCell[][] = [];

    // G section - 10 rows (G1 to G10)
    for (let row = 1; row <= 10; row++) {
      const rowData: GridCell[] = [];
      for (let col = 1; col <= 10; col++) {
        rowData.push({
          key: `G_${row}_${col}_number`,
          value: ((row - 1) * 10 + col).toString().padStart(2, '0'),
          editable: false,
          type: 'number',
          section: 'G',
          position: col,
          isNumberCell: true,
          rowType: 'data'
        });
        rowData.push({
          key: `G_${row}_${col}_amount`,
          value: '',
          amount: '',
          editable: true,
          type: 'amount',
          section: 'G',
          position: col,
          isAmountCell: true,
          rowType: 'data'
        });
      }
      initialData.push(rowData);
    }

    // Total row for G section
    const gTotalRow: GridCell[] = [];
    for (let col = 1; col <= 10; col++) {
      gTotalRow.push({
        key: `G_total_${col}_number`,
        value: '',
        editable: false,
        type: 'normal',
        section: 'S',
        rowType: 'total'
      });
      gTotalRow.push({
        key: `G_total_${col}_amount`,
        value: '0',
        editable: false,
        type: 'normal',
        section: 'S',
        rowType: 'total'
      });
    }
    initialData.push(gTotalRow);

    // B section - Triple digit numbers (B1, B2, B3...)
    const bRow: GridCell[] = [];
    for (let col = 1; col <= 10; col++) {
      bRow.push({
        key: `B_1_${col}_number`,
        value: `B${col}`,
        editable: false,
        type: 'number',
        section: 'B',
        position: col,
        isNumberCell: true,
        rowType: 'section'
      });
      bRow.push({
        key: `B_1_${col}_amount`,
        value: '',
        amount: '',
        editable: true,
        type: 'triple',
        section: 'B',
        position: col,
        isAmountCell: true,
        rowType: 'section'
      });
    }
    initialData.push(bRow);

    // A section - Four digit numbers (A1, A2, A3...)
    const aRow: GridCell[] = [];
    for (let col = 1; col <= 10; col++) {
      aRow.push({
        key: `A_1_${col}_number`,
        value: `A${col}`,
        editable: false,
        type: 'number',
        section: 'A',
        position: col,
        isNumberCell: true,
        rowType: 'section'
      });
      aRow.push({
        key: `A_1_${col}_amount`,
        value: '',
        amount: '',
        editable: true,
        type: 'four-digit',
        section: 'A',
        position: col,
        isAmountCell: true,
        rowType: 'section'
      });
    }
    initialData.push(aRow);

    setGridData(initialData);
  };

  const loadExternalTransactions = () => {
    const loadedEntries: QuickEntryItem[] = [];
    const newGridData = [...gridData];

    externalTransactions.forEach((transaction: any) => {
      if (transaction.number && transaction.amount) {
        const amount = parseFloat(transaction.amount);
        const numberStr = transaction.number.toString();

        const { display, section, position } = convertNumericToDisplay(numberStr);

        let targetRow = -1;
        if (section === 'A') {
          targetRow = newGridData.length - 1;
        } else if (section === 'B') {
          targetRow = newGridData.length - 2;
        } else if (section === 'G') {
          const numberValue = parseInt(numberStr);
          if (numberValue >= 1 && numberValue <= 100) {
            targetRow = Math.floor((numberValue - 1) / 10);
          }
        }

        if (targetRow >= 0) {
          const cellIndex = ((position - 1) * 2) + 1;
          if (cellIndex < newGridData[targetRow].length) {
            newGridData[targetRow][cellIndex] = {
              ...newGridData[targetRow][cellIndex],
              value: transaction.amount.toString(),
              amount: transaction.amount.toString(),
            };
          }
        }

        const existingEntryIndex = loadedEntries.findIndex(entry => entry.number === display);
        if (existingEntryIndex === -1) {
          loadedEntries.push({
            id: display,
            number: display,
            amount,
            section,
            position,
            timestamp: new Date(),
          });
        }
      }
    });

    setQuickEntryList(loadedEntries);
    setGridData(newGridData);
    updateTotals(newGridData);
  };

  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    if (isMainJantri) return;

    const newData = [...gridData];
    const cell = newData[rowIndex][cellIndex];

    if (cell.type === 'triple' && value.length > 3) return;
    if (cell.type === 'four-digit' && value.length > 4) return;
    if (value && !/^\d*$/.test(value)) return;

    newData[rowIndex][cellIndex] = {
      ...cell,
      value,
      amount: value
    };

    setGridData(newData);
    updateTotals(newData);
    updateQuickEntryFromGrid(newData, rowIndex, cellIndex);
  };

  const updateTotals = (updatedData: GridCell[][]) => {
    const newData = [...updatedData];
    const totalRowIndex = 10;
    for (let col = 0; col < 10; col++) {
      let columnTotal = 0;
      for (let row = 0; row < 10; row++) {
        const amountCellIndex = (col * 2) + 1;
        const amountValue = parseFloat(newData[row][amountCellIndex]?.value || '0');
        columnTotal += amountValue;
      }
      const totalCellIndex = (col * 2) + 1;
      if (newData[totalRowIndex] && newData[totalRowIndex][totalCellIndex]) {
        newData[totalRowIndex][totalCellIndex] = {
          ...newData[totalRowIndex][totalCellIndex],
          value: columnTotal.toString()
        };
      }
    }
    setGridData(newData);
  };

  const updateQuickEntryFromGrid = (updatedData: GridCell[][], rowIndex: number, cellIndex: number) => {
    const cell = updatedData[rowIndex][cellIndex];
    const amount = parseFloat(cell.value || '0');

    if (cell.section && cell.section !== 'S') {
      const position = cell.position || 1;

      let displayNumber = '';
      if (cell.section === 'G') {
        displayNumber = ((rowIndex) * 10 + position).toString();
      } else if (cell.section === 'B') {
        displayNumber = `B${position}`;
      } else if (cell.section === 'A') {
        displayNumber = `A${position}`;
      }

      const existingItemIndex = quickEntryList.findIndex(
        item => item.number === displayNumber
      );

      const newQuickEntryList = [...quickEntryList];

      if (amount > 0) {
        const quickEntryItem: QuickEntryItem = {
          id: existingItemIndex >= 0 ? quickEntryList[existingItemIndex].id : displayNumber,
          number: displayNumber,
          amount,
          section: cell.section as 'G' | 'B' | 'A',
          position,
          timestamp: existingItemIndex >= 0 ? quickEntryList[existingItemIndex].timestamp : new Date(),
        };

        if (existingItemIndex >= 0) {
          newQuickEntryList[existingItemIndex] = quickEntryItem;
        } else {
          newQuickEntryList.push(quickEntryItem);
        }
      } else {
        if (existingItemIndex >= 0) {
          newQuickEntryList.splice(existingItemIndex, 1);
        }
      }

      setQuickEntryList(newQuickEntryList);
    }
  };

  const addManualEntry = () => {
    if (!manualNumber || !manualAmount) {
      Alert.alert('Error', 'Please enter both number and amount');
      return;
    }

    const amount = parseFloat(manualAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const { display, section, position } = convertNumericToDisplay(manualNumber);

    let targetRow = -1;
    if (section === 'A') {
      targetRow = gridData.length - 1;
    } else if (section === 'B') {
      targetRow = gridData.length - 2;
    } else if (section === 'G') {
      const numberValue = parseInt(manualNumber);
      if (numberValue >= 1 && numberValue <= 100) {
        targetRow = Math.floor((numberValue - 1) / 10);
      }
    }

    if (targetRow >= 0) {
      const newData = [...gridData];
      const cellIndex = ((position - 1) * 2) + 1;

      if (cellIndex < newData[targetRow].length) {
        newData[targetRow][cellIndex] = {
          ...newData[targetRow][cellIndex],
          value: manualAmount,
          amount: manualAmount,
        };

        setGridData(newData);
        updateTotals(newData);
        updateQuickEntryFromGrid(newData, targetRow, cellIndex);
      }
    }

    setManualNumber('');
    setManualAmount('');
  };

  const removeQuickEntry = (id: string) => {
    const itemToRemove = quickEntryList.find(item => item.id === id);
    const updatedList = quickEntryList.filter(item => item.id !== id);
    setQuickEntryList(updatedList);

    if (itemToRemove) {
      const newGridData = [...gridData];
      let targetRow = -1;

      if (itemToRemove.section === 'A') {
        targetRow = newGridData.length - 1;
      } else if (itemToRemove.section === 'B') {
        targetRow = newGridData.length - 2;
      } else if (itemToRemove.section === 'G') {
        const numberValue = parseInt(itemToRemove.number);
        targetRow = Math.floor((numberValue - 1) / 10);
      }

      if (targetRow >= 0) {
        const cellIndex = ((itemToRemove.position - 1) * 2) + 1;
        if (cellIndex < newGridData[targetRow].length) {
          newGridData[targetRow][cellIndex] = {
            ...newGridData[targetRow][cellIndex],
            value: '',
            amount: '',
          };
        }
      }

      setGridData(newGridData);
      updateTotals(newGridData);
    }
  };

  const calculateRowTotal = (row: GridCell[]): number => {
    return row.reduce((sum, cell) => {
      if (cell.isAmountCell) {
        const cellValue = parseFloat(cell.value) || 0;
        return sum + cellValue;
      }
      return sum;
    }, 0);
  };

  const getGrandTotal = (): number => {
    let total = 0;
    gridData.forEach((row, index) => {
      if (index < 10) {
        total += calculateRowTotal(row);
      } else if (index === 11) {
        total += calculateRowTotal(row);
      } else if (index === 12) {
        total += calculateRowTotal(row);
      }
    });
    return total;
  };

  const getTotalAmount = () => {
    return quickEntryList.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSave = () => {
    const transactions = quickEntryList.map(item => ({
      id: item.id,
      number: parseInt(convertDisplayToNumeric(item.number)),
      amount: item.amount,
      section: item.section,
      position: item.position,
      timestamp: item.timestamp,
      type: 'jantri',
      source: 'Jantri',
    }));

    if (typeof onSaveParam === 'function') {
      onSaveParam(transactions);
    }
    navigation.goBack();

    setQuickEntryList([]);
    setManualNumber('');
    setManualAmount('');
    initializeGridData();
  };

  const getCellBackgroundColor = (cell: GridCell, rowIndex: number): string => {
    if (cell.isNumberCell) {
      if (cell.section === 'G') return '#FFE082';
      if (cell.section === 'B' || cell.section === 'A') return '#FFE082';
    }
    if (cell.rowType === 'total') return '#4CAF50';
    if (cell.section === 'B') return '#E1F5FE';
    if (cell.section === 'A') return '#FFF3E0';
    return '#FFFFFF';
  };

  const renderQuickEntryItem = ({ item }: { item: QuickEntryItem }) => (
    <View style={styles.quickEntryItem}>
      <View style={styles.quickEntryInfo}>
        <Text style={styles.quickEntryNumber}>#{item.number}</Text>
        <Text style={styles.quickEntryAmount}>₹{item.amount}</Text>
        <Text style={styles.quickEntrySectionText}>Section: {item.section}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeQuickEntry(item.id)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screenOverlay}>
      <ScreenHeader 
        title={title}
        navigation={navigation}
        hideBackButton={false}
        showDrawerButton={false}
      />
      <View style={styles.screenContainer}>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Manual Entry Section */}
          <View style={styles.manualEntrySection}>
            <Text style={styles.sectionTitle}>
              {isMainJantri ? 'Main Jantri Controls' : 'Quick Entry'}
            </Text>
            {isMainJantri ? (
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Amount Less</Text>
                  <TextInput
                    style={styles.input}
                    value={amountLess}
                    onChangeText={setAmountLess}
                    keyboardType="numeric"
                    editable={false}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Less %age</Text>
                  <TextInput
                    style={styles.input}
                    value={lessPercentage}
                    onChangeText={setLessPercentage}
                    keyboardType="numeric"
                    editable={false}
                  />
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => console.log('Submit pressed')}>
                  <Text style={styles.addButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Number"
                  value={manualNumber}
                  onChangeText={setManualNumber}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  value={manualAmount}
                  onChangeText={setManualAmount}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.addButton} onPress={addManualEntry}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Grid Section */}
          <View style={styles.gridSection}>
            <Text style={styles.sectionTitle}>Jantri Grid</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                {/* Data Rows */}
                {gridData.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.row}>
                    {row.map((cell, cellIndex) => (
                      <View
                        key={cell.key}
                        style={[
                          styles.cell,
                          { backgroundColor: getCellBackgroundColor(cell, rowIndex) },
                          cell.isNumberCell && styles.numberCell,
                          cell.rowType === 'total' && styles.totalCell,
                        ]}
                      >
                        {cell.editable && !isMainJantri ? (
                          <TextInput
                            style={[
                              styles.cellInput,
                              cell.rowType === 'total' && styles.totalCellInput
                            ]}
                            value={cell.value}
                            onChangeText={(value) => handleCellChange(rowIndex, cellIndex, value)}
                            keyboardType="numeric"
                            maxLength={cell.type === 'triple' ? 3 : cell.type === 'four-digit' ? 4 : undefined}
                            placeholder="0"
                            placeholderTextColor="#999"
                          />
                        ) : (
                          <Text style={[
                            styles.cellText,
                            cell.isNumberCell && styles.numberCellText,
                            cell.rowType === 'total' && styles.totalCellText
                          ]}>
                            {cell.value}
                          </Text>
                        )}
                      </View>
                    ))}
                    <View style={[styles.cell, styles.rowTotalCell]}>
                      <Text style={styles.rowTotalText}>{calculateRowTotal(row)}</Text>
                    </View>
                  </View>
                ))}

                {/* Grand Total Row */}
                <View style={styles.grandTotalRow}>
                  <View style={styles.grandTotalLabelCell}>
                    <Text style={styles.grandTotalLabelText}>Grand Total</Text>
                  </View>
                  <View style={styles.grandTotalValueCell}>
                    <Text style={styles.grandTotalValueText}>{getGrandTotal()}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Quick Entry List - Only show in regular mode */}
          {!isMainJantri && (
            <>
              <View style={styles.quickEntrySection}>
                <Text style={styles.sectionTitle}>
                  Entries ({quickEntryList.length} items)
                </Text>
                {quickEntryList.length > 0 ? (
                  <FlatList
                    data={quickEntryList}
                    renderItem={renderQuickEntryItem}
                    keyExtractor={(item) => item.id}
                    style={styles.quickEntryList}
                    nestedScrollEnabled={true}
                  />
                ) : (
                  <Text style={styles.emptyText}>No entries yet</Text>
                )}
              </View>

              {/* Total Amount */}
              {quickEntryList.length > 0 && (
                <View style={styles.totalSection}>
                  <Text style={styles.totalAmountText}>
                    Total Amount: ₹{getTotalAmount()}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenOverlay: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  screenContainer: {
    backgroundColor: 'white',
    flex: 1,
    margin: 16,
    borderRadius: 12,
    padding: 8,
  },

  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth * 0.98,
    height: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

 
  modalContent: {
    flex: 1,
    padding: 15,
  },
  manualEntrySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  inputGroup: {
    alignItems: 'center',
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  gridSection: {
    marginBottom: 20,
  },
  table: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 40,
    height: 35,
    borderWidth: 0.5,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerCell: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
  },
  headerCellText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  numberCell: {
    backgroundColor: '#FFE082',
  },
  totalCell: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
  },
  grandTotalCell: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
  },
  rowTotalCell: {
    backgroundColor: '#4CAF50',
    width: 60,
  },
  totalColumnCell: {
    width: 60, // Adjust as needed for the total column width
  },
  numberBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  numberBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  numberCellText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  cellText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
  },
  totalCellText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  grandTotalValueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  rowTotalText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  cellInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 10,
    color: '#333',
    padding: 2,
  },
  totalCellInput: {
    color: '#fff',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
  },
  grandTotalLabelCell: {
    flex: 1,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
  },
  grandTotalValueCell: {
    width: 60,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
  },
  grandTotalLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickEntrySection: {
    marginBottom: 20,
  },
  quickEntryList: {
    maxHeight: 200,
  },
  quickEntryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  quickEntryInfo: {
    flex: 1,
  },
  quickEntryNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  quickEntryAmount: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  quickEntrySectionText: {
    fontSize: 10,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  totalSection: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  totalAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f8f8',
    gap: 10,
  },


});


export default JantriScreen;