// addTransaction/JantriModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../../assets/colors';

const { width: screenWidth } = Dimensions.get('window');
const CELL_WIDTH = 70;
const TOTAL_COLUMN_WIDTH = 96;
const ROW_HEIGHT = 48;
const TABLE_WIDTH = CELL_WIDTH * 10 + TOTAL_COLUMN_WIDTH;

interface GridCell {
  key: string;
  value: string;
  amount?: string;
  editable?: boolean;
  type?: 'triple' | 'four-digit' | 'normal' | 'number' | 'amount';
  section?: 'G' | 'B' | 'A' | 'S' | 'H';
  position?: number;
  isNumberCell?: boolean;
  isAmountCell?: boolean;
  rowType?: 'data' | 'total' | 'section' | 'rowTotal' | 'grandTotal' | 'header';
  label?: string;
}

interface QuickEntryItem {
  id: string;
  number: string;
  amount: number;
  section: 'G' | 'B' | 'A';
  position: number;
  timestamp: Date;
}

interface JantriModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transactions: any[]) => void;
  title: string;
  externalTransactions?: any[];
  isMainJantri?: boolean;
}

const JantriModal: React.FC<JantriModalProps> = ({
  visible,
  onClose,
  onSave,
  title,
  externalTransactions = [],
  isMainJantri = false,
}) => {
  const [gridData, setGridData] = useState<GridCell[][]>([]);
  const [quickEntryList, setQuickEntryList] = useState<QuickEntryItem[]>([]);
  const [manualNumber, setManualNumber] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [amountLess, setAmountLess] = useState('30');
  const cellRefs = React.useRef<{ [key: string]: TextInput | null }>({});
  const [lessPercentage, setLessPercentage] = useState('10');
  const [extraKhabar, setExtraKhabar] = useState<'NonConsolidate' | 'Consolidate' | 'CutConsolidate' | 'HPL'>('NonConsolidate');

  const renderRadio = (label: string, value: 'NonConsolidate' | 'Consolidate' | 'CutConsolidate' | 'HPL') => (
    <TouchableOpacity style={styles.radioOption} onPress={() => setExtraKhabar(value)}>
      <View style={[styles.radioOuter, extraKhabar === value && styles.radioOuterSelected]}>
        {extraKhabar === value && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Helper functions for number conversion
  const convertDisplayToNumeric = (displayNumber: string): string => {
    try {
      if (!displayNumber || typeof displayNumber !== 'string') {
        return '0';
      }

      if (displayNumber.startsWith('B')) {
        const position = displayNumber.substring(1);
        if (position === '0') {
          return '1110'; // B0 = 1110
        } else {
          return (parseInt(position) * 111).toString();
        }
      } else if (displayNumber.startsWith('A')) {
        const position = displayNumber.substring(1);
        if (position === '0') {
          return '11110'; // A0 = 11110
        } else {
          return (parseInt(position) * 1111).toString();
        }
      } else {
        return displayNumber;
      }
    } catch (error) {
      console.error('Error in convertDisplayToNumeric:', error, { displayNumber });
      return '0';
    }
  };

  const convertNumericToDisplay = (numericNumber: string): { display: string, section: 'G' | 'B' | 'A', position: number } => {
    try {
      if (!numericNumber || typeof numericNumber !== 'string') {
        return { display: '0', section: 'G', position: 1 };
      }

      const num = parseInt(numericNumber);
      if (isNaN(num)) {
        return { display: '0', section: 'G', position: 1 };
      }

      // Handle A0 (11110)
      if (num === 11110) {
        return { display: 'A0', section: 'A', position: 10 };
      }

      // Handle A1-A9 (1111, 2222, 3333, ..., 9999)
      if (num >= 1111 && num % 1111 === 0) {
        const position = num / 1111;
        if (position >= 1 && position <= 9) {
          return { display: `A${position}`, section: 'A', position };
        }
      }

      // Handle B0 (1110)
      if (num === 1110) {
        return { display: 'B0', section: 'B', position: 10 };
      }

      // Handle B1-B9 (111, 222, 333, ..., 999)
      if (num >= 111 && num % 111 === 0) {
        const position = num / 111;
        if (position >= 1 && position <= 9) {
          return { display: `B${position}`, section: 'B', position };
        }
      }

      if (num >= 1 && num <= 100) {
        const position = ((num - 1) % 10) + 1;
        return { display: num.toString().padStart(2, '0'), section: 'G', position };
      }

      return { display: numericNumber, section: 'G', position: 1 };
    } catch (error) {
      console.error('Error in convertNumericToDisplay:', error, { numericNumber });
      return { display: '0', section: 'G', position: 1 };
    }
  };

  // Initialize grid data with JantriEmbedded structure
  useEffect(() => {
    initializeGridData();
  }, [visible]);

  // Load existing transactions into grid when modal opens
  useEffect(() => {
    if (visible && externalTransactions.length > 0) {
      loadExternalTransactions();
    }
  }, [visible, externalTransactions]);

  const initializeGridData = () => {
    try {
      const initialData: GridCell[][] = [];

      // Header row (Row 1) - Column numbers 1-10 + Total
      const headerRow: GridCell[] = [];
      for (let col = 1; col <= 10; col++) {
        headerRow.push({
          key: `header_${col}`,
          value: col.toString(),
          editable: false,
          type: 'normal',
          section: 'H',
          rowType: 'header',
        });
      }
      headerRow.push({
        key: 'header_total',
        value: 'Total',
        editable: false,
        type: 'normal',
        section: 'H',
        rowType: 'header',
      });
      initialData.push(headerRow);

      // Data rows (Rows 2-11) - Numbers 01-100
      for (let row = 1; row <= 10; row++) {
        const rowData: GridCell[] = [];
        for (let col = 1; col <= 10; col++) {
          const number = ((row - 1) * 10 + col).toString().padStart(2, '0');
          rowData.push({
            key: `G_${row}_${col}`,
            label: number,
            value: '',
            amount: '',
            editable: true,
            type: 'normal',
            section: 'G',
            position: col,
            isAmountCell: true,
            rowType: 'data',
          });
        }
        // Add row total cell
        rowData.push({
          key: `G_total_${row}`,
          value: '0',
          editable: false,
          type: 'normal',
          section: 'S',
          rowType: 'rowTotal',
        });
        initialData.push(rowData);
      }

      // G Section Total Row (Row 12) - All columns show 0
      const gTotalRow: GridCell[] = [];
      for (let col = 1; col <= 10; col++) {
        gTotalRow.push({
          key: `G_total_${col}`,
          value: '0',
          editable: false,
          type: 'normal',
          section: 'S',
          rowType: 'total',
        });
      }
      gTotalRow.push({
        key: 'G_total_total',
        value: '0',
        editable: false,
        type: 'normal',
        section: 'S',
        rowType: 'total',
      });
      initialData.push(gTotalRow);

      // B Series Row (Row 13) - B1, B2, ..., B0
      const bRow: GridCell[] = [];
      for (let col = 1; col <= 10; col++) {
        const label = col === 10 ? 'B0' : `B${col}`;
        bRow.push({
          key: `B_1_${col}`,
          label: label,
          value: '',
          amount: '',
          editable: true,
          type: 'triple',
          section: 'B',
          position: col,
          isAmountCell: true,
          rowType: 'section',
        });
      }
      bRow.push({
        key: 'B_total',
        value: '0',
        editable: false,
        type: 'normal',
        section: 'S',
        rowType: 'rowTotal',
      });
      initialData.push(bRow);

      // A Series Row (Row 14) - A1, A2, ..., A0
      const aRow: GridCell[] = [];
      for (let col = 1; col <= 10; col++) {
        const label = col === 10 ? 'A0' : `A${col}`;
        aRow.push({
          key: `A_1_${col}`,
          label: label,
          value: '',
          amount: '',
          editable: true,
          type: 'four-digit',
          section: 'A',
          position: col,
          isAmountCell: true,
          rowType: 'section',
        });
      }
      aRow.push({
        key: 'A_total',
        value: '0',
        editable: false,
        type: 'normal',
        section: 'S',
        rowType: 'rowTotal',
      });
      initialData.push(aRow);

      // Grand Total Row (Row 15) - Dashes + "Grand Total"
      const grandTotalRow: GridCell[] = [];
      for (let col = 1; col <= 9; col++) {
        grandTotalRow.push({
          key: `grand_total_${col}`,
          value: '-',
          editable: false,
          type: 'normal',
          section: 'S',
          rowType: 'grandTotal',
        });
      }
      grandTotalRow.push({
        key: 'grand_total_label',
        value: 'Grand Total',
        editable: false,
        type: 'normal',
        section: 'S',
        rowType: 'grandTotal',
      });
      grandTotalRow.push({
        key: 'grand_total_value',
        value: '0',
        editable: false,
        type: 'normal',
        section: 'S',
        rowType: 'grandTotal',
      });
      initialData.push(grandTotalRow);

      setGridData(initialData);
    } catch (error) {
      console.error('Error in initializeGridData:', error);
    }
  };

  const loadExternalTransactions = () => {
    try {
      if (!gridData || !Array.isArray(gridData) || gridData.length === 0) {
        return;
      }

      const loadedEntries: QuickEntryItem[] = [];
      const newGridData = [...gridData];

      if (!externalTransactions || !Array.isArray(externalTransactions)) {
        return;
      }

      externalTransactions.forEach((transaction: any, index: number) => {
        try {
          if (!transaction || typeof transaction !== 'object') {
            return;
          }

          if (transaction.number === undefined || transaction.number === null || transaction.amount === undefined || transaction.amount === null) {
            return;
          }

          const rawNumberStr = transaction.number.toString();
          const amountStr = transaction.amount.toString();

          const numberStr = /^\d+$/.test(rawNumberStr)
            ? rawNumberStr
            : convertDisplayToNumeric(rawNumberStr);
          
          if (!numberStr || numberStr.trim() === '') {
            return;
          }

          const amount = parseFloat(amountStr);
          if (isNaN(amount) || amount <= 0) {
            return;
          }

          const { display, section, position } = convertNumericToDisplay(numberStr);

          let targetRow = -1;
          if (section === 'A') {
            targetRow = newGridData.length - 2; // A row is second to last
          } else if (section === 'B') {
            targetRow = newGridData.length - 3; // B row is third to last
          } else if (section === 'G') {
            const numberValue = parseInt(numberStr);
            if (numberValue >= 1 && numberValue <= 100) {
              targetRow = Math.floor((numberValue - 1) / 10) + 1;
            }
          }

          if (targetRow >= 0 && targetRow < newGridData.length) {
            const cellIndex = position - 1;
            if (cellIndex >= 0 && cellIndex < newGridData[targetRow].length - 1) {
              newGridData[targetRow][cellIndex] = {
                ...newGridData[targetRow][cellIndex],
                value: amountStr,
                amount: amountStr,
              };
            }
          }

          const existingEntryIndex = loadedEntries.findIndex((entry) => entry.number === display);
          if (existingEntryIndex === -1) {
            loadedEntries.push({
              id: Date.now().toString() + '_' + index,
              number: display,
              amount,
              section,
              position,
              timestamp: new Date(),
            });
          } else {
            loadedEntries[existingEntryIndex] = {
              ...loadedEntries[existingEntryIndex],
              amount,
              timestamp: new Date(),
            };
          }
        } catch (error) {
          console.error(`Error processing transaction at index ${index}:`, error, transaction);
        }
      });

      setQuickEntryList(loadedEntries);
      setGridData(newGridData);
      updateTotals(newGridData);
    } catch (error) {
      console.error('Error in loadExternalTransactions:', error);
    }
  };

  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    try {
      // If it's Main Jantri mode, don't allow editing
      if (isMainJantri) return;
      
      const newData = [...gridData];
      const cell = newData[rowIndex][cellIndex];

      // Allow unlimited digits for all cells
      if (value && !/^\d*$/.test(value)) return;

      newData[rowIndex][cellIndex] = {
        ...cell,
        value,
        amount: value,
      };

      setGridData(newData);
      updateTotals(newData);
      updateQuickEntryFromGrid(newData, rowIndex, cellIndex);
    } catch (error) {
      console.error('Error in handleCellChange:', error);
    }
  };

  const updateTotals = (updatedData: GridCell[][]) => {
    try {
      if (!updatedData || !Array.isArray(updatedData) || updatedData.length === 0) {
        return;
      }

      const newData = [...updatedData];
      
      // Update row totals for data rows (rows 1-10, excluding header)
      for (let row = 1; row <= 10; row++) {
        if (newData[row] && Array.isArray(newData[row])) {
          let rowTotal = 0;
          for (let col = 0; col < 10; col++) {
            if (newData[row][col]) {
              const amountValue = parseFloat(newData[row][col].value || '0');
              rowTotal += amountValue;
            }
          }
          // Set row total in the last column
          if (newData[row] && newData[row][10]) {
            newData[row][10] = {
              ...newData[row][10],
              value: rowTotal.toString(),
            };
          }
        }
      }

      // Update column totals (row 11 - G section total)
      const totalRowIndex = 11;
      if (newData[totalRowIndex] && Array.isArray(newData[totalRowIndex])) {
        for (let col = 0; col < 10; col++) {
          let columnTotal = 0;
          for (let row = 1; row <= 10; row++) { // Skip header row
            if (newData[row] && newData[row][col]) {
              const amountValue = parseFloat(newData[row][col].value || '0');
              columnTotal += amountValue;
            }
          }
          if (newData[totalRowIndex][col]) {
            newData[totalRowIndex][col] = {
              ...newData[totalRowIndex][col],
              value: columnTotal.toString(),
            };
          }
        }
      }

      // Update B row total (row 12)
      if (newData[12] && Array.isArray(newData[12])) {
        let bRowTotal = 0;
        for (let col = 0; col < 10; col++) {
          if (newData[12][col]) {
            const amountValue = parseFloat(newData[12][col].value || '0');
            bRowTotal += amountValue;
          }
        }
        if (newData[12][10]) {
          newData[12][10] = {
            ...newData[12][10],
            value: bRowTotal.toString(),
          };
        }
      }

      // Update A row total (row 13)
      if (newData[13] && Array.isArray(newData[13])) {
        let aRowTotal = 0;
        for (let col = 0; col < 10; col++) {
          if (newData[13][col]) {
            const amountValue = parseFloat(newData[13][col].value || '0');
            aRowTotal += amountValue;
          }
        }
        if (newData[13][10]) {
          newData[13][10] = {
            ...newData[13][10],
            value: aRowTotal.toString(),
          };
        }
      }

      // Calculate grand total
      let grandTotal = 0;
      for (let row = 1; row <= 10; row++) {
        if (newData[row] && newData[row][10]) {
          const rowTotal = parseFloat(newData[row][10].value || '0');
          grandTotal += rowTotal;
        }
      }
      // Add B and A row totals
      if (newData[12] && newData[12][10]) { // B row total
        const bTotal = parseFloat(newData[12][10].value || '0');
        grandTotal += bTotal;
      }
      if (newData[13] && newData[13][10]) { // A row total
        const aTotal = parseFloat(newData[13][10].value || '0');
        grandTotal += aTotal;
      }

      // Set grand total
      if (newData[14] && newData[14][10]) {
        newData[14][10] = {
          ...newData[14][10],
          value: grandTotal.toString(),
        };
      }

      setGridData(newData);
    } catch (error) {
      console.error('Error in updateTotals:', error, { updatedData });
    }
  };

  const updateQuickEntryFromGrid = (
    updatedData: GridCell[][],
    rowIndex: number,
    cellIndex: number,
  ) => {
    try {
      const cell = updatedData[rowIndex][cellIndex];
      const amount = parseFloat(cell.value || '0');

      if (cell.section && cell.section !== 'S' && cell.section !== 'H') {
        const position = cell.position || 1;

        let displayNumber = '';
        if (cell.section === 'G') {
          const baseNumber = (rowIndex - 1) * 10 + position;
          displayNumber = baseNumber.toString().padStart(2, '0');
        } else if (cell.section === 'B') {
          displayNumber = position === 10 ? 'B0' : `B${position}`;
        } else if (cell.section === 'A') {
          displayNumber = position === 10 ? 'A0' : `A${position}`;
        }

        const existingItemIndex = quickEntryList.findIndex((item) => item.number === displayNumber);

        const newQuickEntryList = [...quickEntryList];

        if (amount > 0) {
          const quickEntryItem: QuickEntryItem = {
            id: existingItemIndex >= 0 ? quickEntryList[existingItemIndex].id : Date.now().toString(),
            number: displayNumber,
            amount,
            section: cell.section as 'G' | 'B' | 'A',
            position,
            timestamp: new Date(),
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
    } catch (error) {
      console.error('Error in updateQuickEntryFromGrid:', error);
    }
  };

  const removeQuickEntry = (id: string) => {
    try {
      if (!id) {
        return;
      }

      const itemToRemove = quickEntryList.find((item) => item && item.id === id);
      if (!itemToRemove) {
        return;
      }

      const updatedList = quickEntryList.filter((item) => item && item.id !== id);
      setQuickEntryList(updatedList);

      const newGridData = [...gridData];
      let targetRow = -1;

      if (itemToRemove.section === 'A') {
        targetRow = newGridData.length - 2; // A row is second to last
      } else if (itemToRemove.section === 'B') {
        targetRow = newGridData.length - 3; // B row is third to last
      } else if (itemToRemove.section === 'G') {
        const numberValue = parseInt(itemToRemove.number);
        if (numberValue >= 1 && numberValue <= 100) {
          targetRow = Math.floor((numberValue - 1) / 10) + 1;
        }
      }

      if (targetRow >= 0 && targetRow < newGridData.length) {
        const cellIndex = (itemToRemove.position - 1);
        if (cellIndex >= 0 && cellIndex < newGridData[targetRow].length - 1) {
          newGridData[targetRow][cellIndex] = {
            ...newGridData[targetRow][cellIndex],
            value: '',
            amount: '',
          };
        }
      }

      setGridData(newGridData);
      updateTotals(newGridData);
    } catch (error) {
      console.error('Error in removeQuickEntry:', error, { id, quickEntryList });
    }
  };

  const getTotalAmount = () => {
    try {
      return quickEntryList.reduce((sum, item) => {
        const amount = parseFloat(item.amount?.toString() || '0');
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    } catch (error) {
      console.error('Error in getTotalAmount:', error);
      return 0;
    }
  };

  const getCellBackgroundColor = (cell: GridCell): string => {
    if (cell.rowType === 'header') return '#1f2a37';
    if (cell.rowType === 'total') return '#1f2a37';
    if (cell.rowType === 'grandTotal') return '#1f2a37';
    if (cell.section === 'B') return '#e1fbf5';
    if (cell.section === 'A') return '#fdf6f0';
    return '#f9fafc';
  };

  const handleSave = () => {
    const transactions = quickEntryList.map(item => ({
      id: item.id,
      number: parseInt(convertDisplayToNumeric(item.number)), // Convert to integer for consistency
      amount: item.amount,
      section: item.section,
      position: item.position,
      timestamp: item.timestamp,
      type: 'jantri',
      source: 'Jantri', // Add source for consistency
    }));

    onSave(transactions);
    onClose();
    
    // Reset state
    setQuickEntryList([]);
    setManualNumber('');
    setManualAmount('');
    initializeGridData();
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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
                <View>
                  <Text style={styles.extraKhabarTitle}>EXTRA KHABAR 10/90 10/10</Text>
                  <View style={styles.radioRow}>
                    {renderRadio('Non Consolidate', 'NonConsolidate')}
                    {renderRadio('Consolidate', 'Consolidate')}
                    {renderRadio('Cut Consolidate', 'CutConsolidate')}
                  </View>
                  <View style={styles.radioRow}>
                    {renderRadio('HPL', 'HPL')}
                  </View>
                </View>
              )}
            </View>

            {/* Grid Section - Updated to match JantriEmbedded */}
            <View style={styles.gridSection}>
              <Text style={styles.sectionTitle}>Jantri Grid</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.tableScrollContainer}
                bounces={false}
              >
                <View style={styles.table}>
                  {gridData && Array.isArray(gridData) && gridData.length > 0 ? (
                    gridData.map((row, rowIndex) => {
                      if (!row || !Array.isArray(row)) {
                        return (
                          <View key={`invalid-row-${rowIndex}`} style={styles.row}>
                            <Text style={styles.debugText}>Invalid row {rowIndex}</Text>
                          </View>
                        );
                      }
                      
                      return (
                        <View key={`row-${rowIndex}`} style={styles.row}>
                          {row.length > 0 ? (
                            row.map((cell, cellIndex) => {
                              if (!cell || typeof cell !== 'object') {
                                return (
                                  <View key={`invalid-cell-${rowIndex}-${cellIndex}`} style={styles.cell}>
                                    <Text style={styles.debugText}>?</Text>
                                  </View>
                                );
                              }
                              
                              return (
                                <View
                                  key={cell.key || `cell-${rowIndex}-${cellIndex}`}
                                  style={[
                                    styles.cell,
                                    { backgroundColor: getCellBackgroundColor(cell) },
                                    cell.rowType === 'header' && styles.headerCell,
                                    cell.rowType === 'total' && styles.totalCell,
                                    cell.rowType === 'grandTotal' && styles.grandTotalCell,
                                    cellIndex === 10 && styles.totalColumnCell, // Total column styling
                                    cell.key === 'grand_total_label' && styles.grandTotalLabelCell, // Grand Total label cell
                                  ]}
                                >
                                  {cell.rowType === 'header' ? (
                                    <Text style={styles.headerCellText}>{cell.value || ''}</Text>
                                  ) : cell.rowType === 'total' || cell.rowType === 'grandTotal' ? (
                                    <Text style={styles.totalCellText}>{cell.value || ''}</Text>
                                  ) : (
                                    <>
                                      {!!cell.label && (
                                        <View style={styles.numberBadge}>
                                          <Text style={styles.numberBadgeText}>{cell.label}</Text>
                                        </View>
                                      )}
                                      {cell.editable && !isMainJantri ? (
                                          <TextInput
                                            ref={(ref) => {
                                              const key = `${rowIndex}_${cellIndex}`;
                                              cellRefs.current[key] = ref;
                                            }}
                                            style={[
                                              styles.cellInput,
                                              cell.label && styles.cellInputWithLabel,
                                            ]}
                                            value={cell.value || ''}
                                            onChangeText={(value) => {
                                              handleCellChange(rowIndex, cellIndex, value);
                                            }}
                                            onBlur={() => {
                                              // Auto-save when keyboard closes (onBlur)
                                              if (quickEntryList.length > 0) {
                                                console.log('Auto-saving on keyboard close:', { rowIndex, cellIndex });
                                              }
                                            }}
                                            keyboardType="numeric"
                                            maxLength={undefined} // Allow unlimited digits
                                            placeholder="0"
                                            placeholderTextColor="#999"
                                            returnKeyType="next"
                                            onSubmitEditing={() => {
                                              // Try to focus next cell in the same row
                                              let nextCol = cellIndex + 1;
                                              let nextRow = rowIndex;
                                              
                                              if (nextCol >= 10) {
                                                nextCol = 0;
                                                nextRow = rowIndex + 1;
                                              }
                                              
                                              const nextKey = `${nextRow}_${nextCol}`;
                                              if (cellRefs.current[nextKey]) {
                                                cellRefs.current[nextKey]?.focus();
                                              }
                                            }}
                                          />
                                      ) : (
                                        <Text
                                          style={[
                                            styles.cellText,
                                            cell.label && styles.cellTextWithLabel,
                                          ]}
                                        >
                                          {cell.value || ''}
                                        </Text>
                                      )}
                                    </>
                                  )}
                                </View>
                              );
                            })
                          ) : (
                            <Text style={styles.debugText}>Row {rowIndex} has no cells</Text>
                          )}
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.debugText}>No grid data available</Text>
                  )}
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
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth * 0.98,
    height: '90%',
    backgroundColor: '#f7f4ec',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2dfd5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2a37',
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fefae0',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 18,
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
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
  tableScrollContainer: {
    flexGrow: 0,
    width: TABLE_WIDTH,
  },
  row: {
    flexDirection: 'row',
    flexShrink: 0,
  },
  cell: {
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    borderWidth: 1,
    borderColor: '#e3e6f0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafc',
    flexShrink: 0,
    position: 'relative',
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#f4f6fd',
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
  grandTotalLabelCell: {
    width: TOTAL_COLUMN_WIDTH,
    flexShrink: 0,
  },
  totalColumnCell: {
    width: TOTAL_COLUMN_WIDTH,
    flexShrink: 0,
  },
  numberBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#10b5a6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
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
  cellInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
  cellInputWithLabel: {
    paddingTop: 18,
  },
  cellTextWithLabel: {
    paddingTop: 18,
  },
  extraKhabarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#F8E7B3',
  },
  radioOuterSelected: {
    borderColor: '#111827',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111827',
  },
  radioLabel: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
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
  cancelButton: {
    flex: 1,
    backgroundColor: '#718096',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default JantriModal;