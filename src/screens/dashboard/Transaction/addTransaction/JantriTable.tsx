import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const ROW_HEIGHT = 40;

export interface GridCell {
  key: string;
  value: string;
  number?: string;
}

export interface JantriTableRef {
  getTransactions: () => any[];
}

interface JantriTableProps {
  externalTransactions?: any[];
  isEditable?: boolean;
}

const getCellBackgroundColor = (rowIndex: number, cellIndex: number, cell: GridCell): string => {
  // Header, Totals, Row Totals, Grand Total rows use dark background
  if (rowIndex === 0 || rowIndex === 11 || rowIndex === 14 || cellIndex === 10) return '#1f2a37';
  if (rowIndex === 12) return '#e1fbf5'; // B section
  if (rowIndex === 13) return '#fdf6f0'; // A section
  return '#f9fafc';
};

const JantriTable = forwardRef<JantriTableRef, JantriTableProps>(({
  externalTransactions = [],
  isEditable = false,
}, ref) => {
  const [gridData, setGridData] = useState<GridCell[][]>([]);

  useImperativeHandle(ref, () => ({
    getTransactions: () => {
      const transactions: any[] = [];

      for (let rowIndex = 0; rowIndex < gridData.length; rowIndex++) {
        const row = gridData[rowIndex];
        for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
          const cell = row[cellIndex];
          // Check if it's an editable cell (not header, not total columns/rows)
          const isEditableCell = (rowIndex >= 1 && rowIndex <= 10 && cellIndex < 10) ||
            (rowIndex === 12 && cellIndex < 10) ||
            (rowIndex === 13 && cellIndex < 10);

          if (cell.number && isEditableCell && cell.value && parseFloat(cell.value) > 0) {
            transactions.push({
              number: cell.number,
              amount: parseFloat(cell.value),
            });
          }
        }
      }
      return transactions;
    }
  }));

  useEffect(() => {
    initializeGridData();
  }, []); // Initialize once on mount

  useEffect(() => {
    // We only load external transactions when gridData has been initialized
    if (gridData.length > 0) {
      loadExternalTransactions();
    }
  }, [externalTransactions, gridData.length]);

  const initializeGridData = () => {
    try {
      const initialData: GridCell[][] = [];

      const headerRow: GridCell[] = [];
      for (let col = 1; col <= 10; col++) {
        headerRow.push({
          key: `header_${col}`, value: col.toString(),
        });
      }
      headerRow.push({ key: 'header_total', value: 'Total' });
      initialData.push(headerRow);

      for (let row = 1; row <= 10; row++) {
        const rowData: GridCell[] = [];
        for (let col = 1; col <= 10; col++) {
          const number = ((row - 1) * 10 + col).toString().padStart(2, '0');
          rowData.push({
            key: `G_${row}_${col}`, number, value: '',
          });
        }
        rowData.push({ key: `G_total_${row}`, value: '0' });
        initialData.push(rowData);
      }

      const gTotalRow: GridCell[] = [];
      for (let col = 1; col <= 10; col++) {
        gTotalRow.push({ key: `G_total_${col}`, value: '0' });
      }
      gTotalRow.push({ key: 'G_total_total', value: '0' });
      initialData.push(gTotalRow);

      const bRow: GridCell[] = [];
      for (let col = 1; col <= 10; col++) {
        const num = col === 10 ? '000' : (col * 111).toString();
        bRow.push({
          key: `B_1_${col}`, number: num, value: '',
        });
      }
      bRow.push({ key: 'B_total', value: '0' });
      initialData.push(bRow);

      const aRow: GridCell[] = [];
      for (let col = 1; col <= 10; col++) {
        const num = col === 10 ? '0000' : (col * 1111).toString();
        aRow.push({
          key: `A_1_${col}`, number: num, value: '',
        });
      }
      aRow.push({ key: 'A_total', value: '0' });
      initialData.push(aRow);

      const grandTotalRow: GridCell[] = [];
      for (let col = 1; col <= 9; col++) {
        grandTotalRow.push({ key: `grand_total_${col}`, value: '-' });
      }
      grandTotalRow.push({ key: 'grand_total_label', value: 'Grand Total' });
      grandTotalRow.push({ key: 'grand_total_value', value: '0' });
      initialData.push(grandTotalRow);

      setGridData(initialData);
    } catch (error) {
      console.error('Error in initializeGridData:', error);
    }
  };

  const loadExternalTransactions = () => {
    try {
      if (!gridData || gridData.length === 0) return;

      const newGridData = gridData.map((row, rIdx) => row.map((cell, cIdx) => {
        const isEditableCell = (rIdx >= 1 && rIdx <= 10 && cIdx < 10) ||
          (rIdx === 12 && cIdx < 10) ||
          (rIdx === 13 && cIdx < 10);
        if (isEditableCell) return { ...cell, value: '' };
        return { ...cell };
      }));

      if (!externalTransactions || !Array.isArray(externalTransactions)) {
        updateTotals(newGridData); // Re-calculate totals as 0
        return;
      }

      externalTransactions.forEach((transaction: any) => {
        try {
          if (!transaction || typeof transaction !== 'object') return;

          const rawNumberStr = transaction.number?.toString() || '';
          const amountStr = transaction.amount?.toString() || '0';
          const amount = parseInt(amountStr);
          if (isNaN(amount) || amount <= 0) return;

          let r = -1;
          let c = -1;

          let n = parseInt(rawNumberStr);
          if (rawNumberStr === '00' || rawNumberStr === '0') {
            n = 100;
          }

          if (rawNumberStr.length <= 3 && n >= 1 && n <= 100) {
            // 1-100
            r = Math.floor((n - 1) / 10) + 1;
            c = (n - 1) % 10;
          } else if (rawNumberStr.length === 3) {
            // B series (111, 222... 000)
            r = 12;
            c = rawNumberStr === '000' ? 9 : (parseInt(rawNumberStr) / 111) - 1;
          } else if (rawNumberStr.length === 4) {
            // A series (1111, 2222... 0000)
            r = 13;
            c = rawNumberStr === '0000' ? 9 : (parseInt(rawNumberStr) / 1111) - 1;
          }

          if (r !== -1 && c !== -1 && newGridData[r] && newGridData[r][c]) {
            const currentVal = parseInt(newGridData[r][c].value || '0');
            newGridData[r][c].value = (currentVal + amount).toString();
          }
        } catch (error) {
          console.error('Error processing transaction:', error);
        }
      });

      updateTotals(newGridData);
    } catch (error) {
      console.error('Error in loadExternalTransactions:', error);
    }
  };

  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    try {
      if (!isEditable) return;

      const newData = [...gridData];
      const cell = newData[rowIndex][cellIndex];

      if (value && !/^\d*$/.test(value)) return;

      newData[rowIndex][cellIndex] = {
        ...cell,
        value,
      };

      updateTotals(newData);
    } catch (error) {
      console.error('Error in handleCellChange:', error);
    }
  };

  const updateTotals = (updatedData: GridCell[][]) => {
    try {
      const newData = [...updatedData];

      // Update row totals
      for (let row = 1; row <= 10; row++) {
        let rowTotal = 0;
        for (let col = 0; col < 10; col++) {
          rowTotal += parseInt(newData[row][col].value || '0');
        }
        newData[row][10].value = rowTotal.toString();
      }

      // Update column totals
      for (let col = 0; col < 10; col++) {
        let columnTotal = 0;
        for (let row = 1; row <= 10; row++) {
          columnTotal += parseInt(newData[row][col].value || '0');
        }
        newData[11][col].value = columnTotal.toString();
      }

      // Update B row total
      let bTotal = 0;
      for (let col = 0; col < 10; col++) bTotal += parseInt(newData[12][col].value || '0');
      newData[12][10].value = bTotal.toString();

      // Update A row total
      let aTotal = 0;
      for (let col = 0; col < 10; col++) aTotal += parseInt(newData[13][col].value || '0');
      newData[13][10].value = aTotal.toString();

      // Update Grand Total
      let grandTotal = 0;
      for (let row = 1; row <= 10; row++) grandTotal += parseInt(newData[row][10].value || '0');
      grandTotal += bTotal + aTotal;
      newData[14][10].value = grandTotal.toString();

      setGridData(newData);
    } catch (error) {
      console.error('Error in updateTotals:', error);
    }
  };

  return (
    <View style={styles.table}>
      {gridData.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((cell, cellIndex) => (
            <View
              key={cell.key || `cell-${rowIndex}-${cellIndex}`}
              style={[
                styles.cell,
                { backgroundColor: getCellBackgroundColor(rowIndex, cellIndex, cell) },
                (rowIndex === 0 || rowIndex === 11 || rowIndex === 14 || cellIndex === 10) && styles.headerCell,
                (cellIndex === 10 || (rowIndex === 14 && cell.value === 'Grand Total')) && styles.totalColumnCell,
              ]}
            >
              {(rowIndex === 0 || rowIndex === 11 || rowIndex === 14 || cellIndex === 10) ? (
                <Text style={styles.headerCellText}>
                  {(rowIndex !== 0 && cell.value && cell.value !== '0' && !isNaN(parseInt(cell.value))) ? parseInt(cell.value).toString() : cell.value || ''}
                </Text>
              ) : (
                <>
                  {!!cell.number && (
                    <View style={styles.numberBadge}>
                      <Text style={styles.numberBadgeText}>
                        {rowIndex === 12 ? (cell.number === '000' ? 'B0' : `B${parseInt(cell.number!) / 111}`) :
                          rowIndex === 13 ? (cell.number === '0000' ? 'A0' : `A${parseInt(cell.number!) / 1111}`) :
                            cell.number}
                      </Text>
                    </View>
                  )}
                  {isEditable && ((rowIndex >= 1 && rowIndex <= 10 && cellIndex < 10) ||
                    (rowIndex === 12 && cellIndex < 10) ||
                    (rowIndex === 13 && cellIndex < 10)) ? (
                    <TextInput
                      style={[styles.cellInput, cell.number && styles.cellInputWithLabel]}
                      value={cell.value && cell.value !== '0' ? parseInt(cell.value).toString() : ''}
                      onChangeText={(val) => handleCellChange(rowIndex, cellIndex, val)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#999"
                    />
                  ) : (
                    <Text style={[styles.cellText, cell.number && styles.cellTextWithLabel]}>
                      {cell.value && cell.value !== '0' ? parseInt(cell.value).toString() : ''}
                    </Text>
                  )}
                </>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  table: { borderWidth: 1, borderColor: '#d8dce8', width: '100%' },
  row: { flexDirection: 'row' },
  cell: { flex: 1, height: ROW_HEIGHT, borderWidth: 0.5, borderColor: '#e3e6f0', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  headerCell: { backgroundColor: '#1f2a37' },
  headerCellText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  totalColumnCell: { flex: 1.5 },
  numberBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: '#10b5a6', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  numberBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#fff' },
  cellText: { fontSize: 13, fontWeight: '600' },
  cellTextWithLabel: { paddingTop: 15 },
  cellInput: { width: '100%', height: '100%', textAlign: 'center', fontSize: 13 },
  cellInputWithLabel: { paddingTop: 15 },
});

export default JantriTable;
