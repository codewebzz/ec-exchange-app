import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { scale } from 'react-native-size-matters';
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
  // display label shown inside the same cell (e.g., 01, B1, A1)
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

export interface JantriEmbeddedProps {
  title?: string;
  externalTransactions?: Array<{ number: string | number; amount: string | number }>;
  isMainJantri?: boolean;
  onSave?: (transactions: any[]) => void;
  onCancel?: () => void;
  key?: string | number; // Add key prop to force reload
}

const JantriEmbedded: React.FC<JantriEmbeddedProps> = ({
  title = 'Jantri',
  externalTransactions = [],
  isMainJantri = false,
  onSave,
  onCancel,
}) => {
  console.log('JantriEmbedded received externalTransactions:', externalTransactions);
  console.log('JantriEmbedded isMainJantri:', isMainJantri);

  const [gridData, setGridData] = useState<GridCell[][]>([]);
  const [quickEntryList, setQuickEntryList] = useState<QuickEntryItem[]>([]);
  const cellRefs = useRef<{ [key: string]: TextInput | null }>({});

  // Use ref to track if grid is initialized to prevent infinite loops
  const gridInitializedRef = useRef(false);
  const externalTransactionsProcessedRef = useRef(false);

  const convertDisplayToNumeric = (displayNumber: string): string => {
    try {
      // Validate input
      if (!displayNumber || typeof displayNumber !== 'string') {
        console.log('Invalid displayNumber input:', displayNumber);
        return '0';
      }

      console.log('Converting display number:', displayNumber);

      if (displayNumber.startsWith('B')) {
        const position = displayNumber.substring(1);
        if (position === '0') {
          const result = '1110'; // B0 = 1110
          console.log('B0 section conversion:', { display: displayNumber, result });
          return result;
        } else {
          const result = (parseInt(position) * 111).toString();
          console.log('B section conversion:', { display: displayNumber, position, result });
          return result;
        }
      } else if (displayNumber.startsWith('A')) {
        const position = displayNumber.substring(1);
        if (position === '0') {
          const result = '11110'; // A0 = 11110
          console.log('A0 section conversion:', { display: displayNumber, result });
          return result;
        } else {
          const result = (parseInt(position) * 1111).toString();
          console.log('A section conversion:', { display: displayNumber, position, result });
          return result;
        }
      } else {
        console.log('G section conversion (no change):', displayNumber);
        return displayNumber;
      }
    } catch (error) {
      console.error('Error in convertDisplayToNumeric:', error, { displayNumber });
      return '0';
    }
  };

  const convertNumericToDisplay = (
    numericNumber: string,
  ): { display: string; section: 'G' | 'B' | 'A'; position: number } => {
    try {
      // Validate input
      if (!numericNumber || typeof numericNumber !== 'string') {
        console.log('Invalid numericNumber input:', numericNumber);
        return { display: '0', section: 'G', position: 1 };
      }

      const num = parseInt(numericNumber);
      if (isNaN(num)) {
        console.log('Cannot parse numericNumber to integer:', numericNumber);
        return { display: '0', section: 'G', position: 1 };
      }

      console.log('Converting numeric number:', { input: numericNumber, parsed: num });

      // Handle A0 (11110)
      if (num === 11110) {
        const result = { display: 'A0', section: 'A' as const, position: 10 };
        console.log('A0 section result:', result);
        return result;
      }

      // Handle A1-A9 (1111, 2222, 3333, ..., 9999)
      if (num >= 1111 && num % 1111 === 0) {
        const position = num / 1111;
        if (position >= 1 && position <= 9) {
          const result = { display: `A${position}`, section: 'A' as const, position };
          console.log('A section result:', result);
          return result;
        }
      }

      // Handle B0 (1110)
      if (num === 1110) {
        const result = { display: 'B0', section: 'B' as const, position: 10 };
        console.log('B0 section result:', result);
        return result;
      }

      // Handle B1-B9 (111, 222, 333, ..., 999)
      if (num >= 111 && num % 111 === 0) {
        const position = num / 111;
        if (position >= 1 && position <= 9) {
          const result = { display: `B${position}`, section: 'B' as const, position };
          console.log('B section result:', result);
          return result;
        }
      }

      if (num >= 1 && num <= 100) {
        const position = ((num - 1) % 10) + 1;
        const result = { display: num.toString().padStart(2, '0'), section: 'G' as const, position };
        console.log('G section result:', result);
        return result;
      }

      // Default fallback
      console.log('No matching section found, using default G section');
      return { display: numericNumber, section: 'G' as const, position: 1 };
    } catch (error) {
      console.error('Error in convertNumericToDisplay:', error, { numericNumber });
      return { display: '0', section: 'G', position: 1 };
    }
  };

  useEffect(() => {
    initializeGridData();
  }, []);

  // Reset processing flag when component mounts (grid opens)
  useEffect(() => {
    console.log('JantriEmbedded component mounted, resetting processing flag');
    externalTransactionsProcessedRef.current = false;
  }, []);

  // Reset processing flag when external transactions change
  useEffect(() => {
    externalTransactionsProcessedRef.current = false;
  }, [externalTransactions]);

  useEffect(() => {
    // When grid is ready and external transactions exist, load them once per change
    if (
      gridData && Array.isArray(gridData) && gridData.length > 0 &&
      externalTransactions && Array.isArray(externalTransactions) && externalTransactions.length > 0
    ) {
      console.log('Grid ready: syncing external transactions');
      loadExternalTransactions();
    } else {
      console.log('No external transactions to sync or grid not ready yet');
    }
  }, [gridData, JSON.stringify(externalTransactions)]);

  const initializeGridData = () => {
    try {
      console.log('Starting initializeGridData...');
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
      console.log('Header row created:', headerRow.length, 'cells');

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
        console.log(`Row ${row} created:`, rowData.length, 'cells');
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
      console.log('G Total row created:', gTotalRow.length, 'cells');

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
      console.log('B row created:', bRow.length, 'cells');

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
      console.log('A row created:', aRow.length, 'cells');

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
      console.log('Grand Total row created:', grandTotalRow.length, 'cells');

      console.log('Final grid structure:', {
        totalRows: initialData.length,
        expectedRows: 15,
        firstRowCells: initialData[0]?.length,
        lastRowCells: initialData[initialData.length - 1]?.length
      });

      setGridData(initialData);
      gridInitializedRef.current = true;
      console.log('Grid data set successfully');

      // Load existing transaction data immediately after grid initialization
      if (externalTransactions && Array.isArray(externalTransactions) && externalTransactions.length > 0) {
        console.log('Loading external transactions during initialization:', externalTransactions);
        setTimeout(() => {
          loadExternalTransactions();
        }, 100);
      }
    } catch (error) {
      console.error('Error in initializeGridData:', error);
    }
  };

  const loadExternalTransactions = () => {
    try {
      console.log('=== LOAD EXTERNAL TRANSACTIONS START ===');
      console.log('External transactions received:', externalTransactions);
      console.log('External transactions type:', typeof externalTransactions);
      console.log('External transactions is array:', Array.isArray(externalTransactions));
      console.log('External transactions length:', externalTransactions?.length);

      if (!gridData || !Array.isArray(gridData) || gridData.length === 0) {
        console.log('Grid data is not properly initialized, skipping load');
        return;
      }

      const loadedEntries: QuickEntryItem[] = [];
      const newGridData = [...gridData];

      // Check if externalTransactions exists and is an array
      if (!externalTransactions || !Array.isArray(externalTransactions)) {
        console.log('No external transactions to load or invalid format');
        return;
      }

      console.log('Processing external transactions:', externalTransactions);

      externalTransactions.forEach((transaction: any, index: number) => {
        try {
          console.log(`Processing transaction ${index}:`, transaction);

          // Validate transaction object
          if (!transaction || typeof transaction !== 'object') {
            console.log(`Invalid transaction at index ${index}:`, transaction);
            return;
          }

          // Check if number and amount exist and are valid
          if (transaction.number === undefined || transaction.number === null || transaction.amount === undefined || transaction.amount === null) {
            console.log(`Missing number or amount at index ${index}:`, transaction);
            return;
          }

          // Convert to string and validate
          const rawNumberStr = transaction.number.toString();
          const amountStr = transaction.amount.toString();

          // Normalize number: accept both numeric (e.g., '20', '111') and display labels (e.g., 'B1', 'A0')
          const numberStr = /^\d+$/.test(rawNumberStr)
            ? rawNumberStr
            : convertDisplayToNumeric(rawNumberStr);

          if (!numberStr || numberStr.trim() === '') {
            console.log(`Invalid number at index ${index}:`, transaction.number);
            return;
          }

          const amount = parseFloat(amountStr);
          if (isNaN(amount) || amount <= 0) {
            console.log(`Invalid amount at index ${index}:`, transaction.amount);
            return;
          }

          console.log('Processing transaction:', {
            originalNumber: transaction.number,
            normalizedNumber: numberStr,
            originalAmount: transaction.amount,
            amount,
            index
          });

          const { display, section, position } = convertNumericToDisplay(numberStr);
          console.log('Converted to display:', { display, section, position });

          let targetRow = -1;
          if (section === 'A') {
            targetRow = newGridData.length - 2; // A row is second to last
          } else if (section === 'B') {
            targetRow = newGridData.length - 3; // B row is third to last
          } else if (section === 'G') {
            const numberValue = parseInt(numberStr);
            if (numberValue >= 1 && numberValue <= 100) {
              // Calculate row: 1-10 goes to row 1, 11-20 goes to row 2, etc.
              // +1 because first row (index 0) is header
              targetRow = Math.floor((numberValue - 1) / 10) + 1;
            }
          }

          console.log('Target row calculation:', { section, position, targetRow, gridLength: newGridData.length });

          if (targetRow >= 0 && targetRow < newGridData.length) {
            const cellIndex = position - 1;
            if (cellIndex >= 0 && cellIndex < newGridData[targetRow].length - 1) { // -1 to exclude total column
              const existingValue = parseFloat(newGridData[targetRow][cellIndex].value || '0');
              const totalVal = (existingValue + amount).toString();
              newGridData[targetRow][cellIndex] = {
                ...newGridData[targetRow][cellIndex],
                value: totalVal,
                amount: totalVal,
              };
              console.log('Updated grid cell:', { targetRow, cellIndex, value: totalVal });
            } else {
              console.log('Invalid cell index:', { cellIndex, rowLength: newGridData[targetRow]?.length });
            }
          } else {
            console.log('Invalid target row:', { targetRow, gridLength: newGridData.length });
          }

          const existingEntryIndex = loadedEntries.findIndex((entry) => entry.number === display);
          if (existingEntryIndex === -1) {
            loadedEntries.push({
              id: Date.now().toString() + '_' + index, // Unique ID like QuickEntry.tsx
              number: display,
              amount,
              section,
              position,
              timestamp: new Date(),
            });
            console.log('Added new entry:', { display, amount, section, position });
          } else {
            console.log('Entry already exists:', { display, existingIndex: existingEntryIndex });
            // Add to existing entry instead of replacing
            loadedEntries[existingEntryIndex] = {
              ...loadedEntries[existingEntryIndex],
              amount: loadedEntries[existingEntryIndex].amount + amount,
              timestamp: new Date(),
            };
          }
        } catch (error) {
          console.error(`Error processing transaction at index ${index}:`, error, transaction);
        }
      });

      console.log('Final loaded entries:', loadedEntries);
      console.log('Updated grid data:', newGridData);

      setQuickEntryList(loadedEntries);
      setGridData(newGridData);
      updateTotals(newGridData);
    } catch (error) {
      console.error('Error in loadExternalTransactions:', error);
    }
  };

  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    try {
      if (isMainJantri) return;

      console.log('handleCellChange called:', { rowIndex, cellIndex, value });

      const newData = [...gridData];
      const cell = newData[rowIndex][cellIndex];

      // Allow unlimited digits for all cells
      if (value && !/^\d*$/.test(value)) return;

      newData[rowIndex][cellIndex] = {
        ...cell,
        value,
        amount: value,
      };

      console.log('Cell updated:', newData[rowIndex][cellIndex]);

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
        console.log('Invalid updatedData in updateTotals:', updatedData);
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

      console.log('updateQuickEntryFromGrid called:', {
        rowIndex,
        cellIndex,
        cellValue: cell.value,
        amount,
        section: cell.section
      });

      if (cell.section && cell.section !== 'S' && cell.section !== 'H') {
        const position = cell.position || 1;

        let displayNumber = '';
        if (cell.section === 'G') {
          // Calculate the actual number: row 1 (index 1) = 01-10, row 2 (index 2) = 11-20, etc.
          const baseNumber = (rowIndex - 1) * 10 + position;
          displayNumber = baseNumber.toString().padStart(2, '0');
        } else if (cell.section === 'B') {
          displayNumber = position === 10 ? 'B0' : `B${position}`;
        } else if (cell.section === 'A') {
          displayNumber = position === 10 ? 'A0' : `A${position}`;
        }

        console.log('Display number calculated:', displayNumber);

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
            console.log('Updating existing entry:', {
              oldAmount: quickEntryList[existingItemIndex].amount,
              newAmount: amount,
              displayNumber
            });
            newQuickEntryList[existingItemIndex] = quickEntryItem;
          } else {
            console.log('Adding new entry:', {
              displayNumber,
              amount,
              section: cell.section
            });
            newQuickEntryList.push(quickEntryItem);
          }
        } else {
          if (existingItemIndex >= 0) {
            console.log('Removing entry with zero amount:', displayNumber);
            newQuickEntryList.splice(existingItemIndex, 1);
          }
        }

        console.log('Updated quick entry list:', newQuickEntryList);
        setQuickEntryList(newQuickEntryList);
      }
    } catch (error) {
      console.error('Error in updateQuickEntryFromGrid:', error);
    }
  };

  const removeQuickEntry = (id: string) => {
    try {
      if (!id) {
        console.log('Invalid id in removeQuickEntry:', id);
        return;
      }

      const itemToRemove = quickEntryList.find((item) => item && item.id === id);
      if (!itemToRemove) {
        console.log('Item not found for removal:', id);
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
          // Calculate row: 1-10 goes to row 1, 11-20 goes to row 2, etc.
          // +1 because first row (index 0) is header
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

  const calculateRowTotal = (row: GridCell[]): number => {
    return row.reduce((sum, cell, index) => {
      // Only count first 10 columns (excluding total column) and only if cell has a value
      if (index < 10 && cell.value && cell.value !== '') {
        const cellValue = parseFloat(cell.value) || 0;
        return sum + cellValue;
      }
      return sum;
    }, 0);
  };

  const getGrandTotal = (): number => {
    let total = 0;
    // Sum G section rows (rows 1-10, excluding header)
    for (let row = 1; row <= 10; row++) {
      if (gridData[row] && gridData[row][10]) {
        total += parseFloat(gridData[row][10].value || '0');
      }
    }
    // Add B and A row totals
    if (gridData[12] && gridData[12][10]) {
      total += parseFloat(gridData[12][10].value || '0');
    }
    if (gridData[13] && gridData[13][10]) {
      total += parseFloat(gridData[13][10].value || '0');
    }
    return total;
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
    if (cell.section === 'B') return '#fdf6f0';
    if (cell.section === 'A') return '#fdf6f0';
    return '#f9fafc';
  };

  // Add render logging
  console.log('JantriEmbedded rendering with:', {
    gridDataLength: gridData?.length,
    quickEntryListLength: quickEntryList?.length,
    externalTransactionsLength: externalTransactions?.length,
    isMainJantri
  });

  try {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.gridSection}>
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
                        console.log(`Row ${rowIndex} is invalid:`, row);
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
                                console.log(`Cell ${cellIndex} in row ${rowIndex} is invalid:`, cell);
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
                                      {cell.editable ? (
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
                                            if (onSave && quickEntryList.length > 0) {
                                              console.log('Auto-saving on keyboard close:', { rowIndex, cellIndex });
                                              const transactions = quickEntryList.map(item => {
                                                const numericNumber = convertDisplayToNumeric(item.number);
                                                return {
                                                  id: item.id,
                                                  number: numericNumber,
                                                  amount: item.amount,
                                                  timestamp: item.timestamp,
                                                  source: 'Jantri Grid'
                                                };
                                              });
                                              onSave(transactions);
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
                                          blurOnSubmit={false}
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
          </View>
        </ScrollView>
      </View>
    );
  } catch (error) {
    console.error('Error rendering JantriEmbedded:', error);
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>{title}</Text>
        <View style={styles.screenContainer}>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#E53E3E', marginBottom: 10 }}>
              Error Loading Jantri Grid
            </Text>
            <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 20 }}>
              There was an error loading the grid. Please try again.
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: '#E53E3E' }]}
              onPress={() => {
                console.log('Retrying grid initialization...');
                initializeGridData();
              }}
            >
              <Text style={styles.addButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f4ec',
    borderRadius: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2dfd5',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 8,
    marginBottom: 4,
  },
  screenContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 12,
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    padding: 14,
    backgroundColor: '#1f2a37',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fefae0',
  },
  scrollView: {
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
  grandTotalValueText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f4f6fd',
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
    top: 0,
    left: 0,
    backgroundColor: '#10b5a6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
  },
  numberBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fdfdfd',
  },
  cellText: {
    fontSize: 13,
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '600',
    left: scale(9)
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
  debugText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default JantriEmbedded;


