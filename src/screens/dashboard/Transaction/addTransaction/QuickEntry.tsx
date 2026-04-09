import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
interface Transaction {
  id: string;
  number: number;
  amount: number;
  timestamp: string;
  source: string;
}

const QuickEntryForm = React.forwardRef(({ externalTransactions = [], onTransactionAdd, onTransactionDelete }: any, ref) => {
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [maxLen, setMaxLen] = useState<number>(2);
  const numberRef = React.useRef<TextInput>(null);
  const amountRef = React.useRef<TextInput>(null);

  React.useImperativeHandle(ref, () => ({
    focus: () => numberRef.current?.focus()
  }));
  console.log(externalTransactions, 'externalTransactions');

  // Use only external transactions (internal ones are handled by parent)
  const allTransactions = useMemo(() => {
    // Avoid mutating props; sort a shallow copy
    const copy = Array.isArray(externalTransactions) ? [...externalTransactions] : [];
    return copy.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }, [externalTransactions]);


  const handleNumberChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');

    if (cleaned === '' || cleaned === '') {
      setNumber('');
      return;
    }

    const length = cleaned.length;
    // Max length control:
    // - same first two digits → allow up to 4 (for 111, 2222 etc.)
    // - exactly "10" → allow 3 chars so user can type 100
    // - otherwise keep at 2
    if (length >= 2 && cleaned[0] === cleaned[1]) {
      setMaxLen(4);
    } else if (cleaned.startsWith('10')) {
      setMaxLen(3);
    } else {
      setMaxLen(2);
    }

    if (length === 1) {
      const digit = parseInt(cleaned);
      // Allow 0–9 as a single digit
      if (digit >= 0 && digit <= 9) {
        setNumber(cleaned);
      }
    } else if (length === 2) {
      // Two digits: allow 0-99
      const number = parseInt(cleaned);
      if (number >= 0 && number <= 99) {
        setNumber(cleaned);
      }
    } else if (length === 3) {
      const numVal = parseInt(cleaned, 10);
      // Explicitly allow 100
      if (numVal === 100) {
        setNumber(cleaned);
        return;
      }

      const firstDigit = cleaned[0];
      const isValidTriple = cleaned === firstDigit + firstDigit + firstDigit && firstDigit !== '0';

      if (isValidTriple) {
        setNumber(cleaned);
      } else {
        if (cleaned[0] === cleaned[1] && cleaned[0] !== '0') {
          setNumber(cleaned);
        }
      }
    } else if (length === 4) {
      const firstDigit = cleaned[0];
      const isValidQuadruple = cleaned === firstDigit + firstDigit + firstDigit + firstDigit && firstDigit !== '0';

      if (isValidQuadruple) {
        setNumber(cleaned);
      } else {
        if (cleaned[0] === cleaned[1] && cleaned[1] === cleaned[2] && cleaned[0] !== '0') {
          setNumber(cleaned);
        }
      }
    } else if (length > 4) {
      return;
    }
  };

  const isValidNumber = (num: string) => {
    if (!num) return false;
    if (!/^[0-9]+$/.test(num)) return false;
    const numInt = parseInt(num);

    // One or two digit numbers: 0-99
    if (num.length <= 2 && numInt >= 0 && numInt <= 99) {
      return true;
    }

    // Explicitly allow 100
    if (num === '100') {
      return true;
    }

    // Three digit numbers: 111, 222, 333, ..., 999 (same digits)
    if (num.length === 3 && numInt >= 111 && numInt <= 999) {
      const firstDigit = num[0];
      return num[1] === firstDigit && num[2] === firstDigit;
    }

    // Four digit numbers: 1111, 2222, 3333, ..., 9999 (same digits)
    if (num.length === 4 && numInt >= 1111 && numInt <= 9999) {
      const firstDigit = num[0];
      return num[1] === firstDigit && num[2] === firstDigit && num[3] === firstDigit;
    }

    return false;
  };

  const handleAddTransaction = () => {
    // Validate inputs
    if (!number || !amount) {
      Alert.alert('Error', 'Please fill in both number and amount fields');
      return;
    }

    if (!isValidNumber(number)) {
      Alert.alert(
        'Invalid Number',
        'Number must be:\n• 0-100 (one to three digits)\n• 111, 222, 333... 999 (three same digits)\n• 1111, 2222, 3333... 9999 (four same digits)'
      );
      return;
    }

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount');
      return;
    }

    // Create new transaction
    const newTransaction = {
      id: Date.now().toString(),
      number: parseInt(number), // Ensure it's an integer
      amount: amountFloat,
      timestamp: new Date().toLocaleString(),
      source: 'Quick Entry',
    };

    // Call parent callback if provided (parent will handle deduplication)
    if (onTransactionAdd) {
      onTransactionAdd(newTransaction);
    }

    // Clear form and refocus
    setNumber('');
    setAmount('');
    setTimeout(() => {
      numberRef.current?.focus();
    }, 100);
  };

  // Add delete button for each transaction
  const handleDeleteTransaction = (id: string) => {
    if (onTransactionDelete) {
      onTransactionDelete(id);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.numberContainer}>
          <Text style={styles.transactionNumber}>{item.number}</Text>
        </View>
        <Text style={styles.transactionAmount}>{item.amount}</Text>
        <TouchableOpacity
          style={{ marginLeft: 12, backgroundColor: '#FF3B30', borderRadius: 6, padding: 4 }}
          onPress={() => handleDeleteTransaction(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getTotalAmount = () => {
    return allTransactions.reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
  };

  return (
    <View style={styles.container}>
      {/* Quick Entry Form */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>📝 Quick Entry</Text>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Number</Text>
            <TextInput
              ref={numberRef}
              style={styles.input}
              value={number}
              onChangeText={handleNumberChange}
              placeholder="Enter number"
              keyboardType="numeric"
              maxLength={maxLen}
              returnKeyType="next"
              onSubmitEditing={() => amountRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="decimal-pad"
              ref={amountRef}
              returnKeyType="done"
              onSubmitEditing={handleAddTransaction}
              blurOnSubmit={false}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction} disabled={!isValidNumber(number)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>📋 Transaction List</Text>
          {allTransactions.length > 0 && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                {allTransactions.length} entries • {getTotalAmount()}
              </Text>
            </View>
          )}
        </View>

        {allTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add numbers using Quick Entry or Add Numbers form
            </Text>
          </View>
        ) : (
          <View style={styles.transactionListContainer}>
            <FlatList
              data={allTransactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              style={styles.transactionList}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8E7',
    padding: 16,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#2C3E50',
    width: 47,
    height: 47,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  summaryContainer: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    color: '#CCC',
    fontSize: 14,
    textAlign: 'center',
  },
  transactionListContainer: {
    flex: 1,
  },
  transactionList: {
    maxHeight: 400,
  },
  transactionItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  sourceTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '600',
  },
  sourceTagBatch: {
    backgroundColor: '#FF9500',
    color: 'white',
  },
  sourceTagSingle: {
    backgroundColor: '#4A90E2',
    color: 'white',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
  },
  transactionTime: {
    fontSize: 12,
    color: '#666',
  },
});

export default QuickEntryForm;