import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

const AddNumbersForm = ({ onNumbersAdd, onTransactionAdd }: any) => {
  const [inputText, setInputText] = useState('');
  const [amount, setAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [parsedNumbers, setParsedNumbers] = useState([]);
  const [count, setCount] = useState(0);

  // Validation function for allowed numbers
  const isValidNumber = (num: any) => {
    const numInt = parseInt(num);

    // Dara Numbers: 1-100
    if (numInt >= 1 && numInt <= 100) {
      return true;
    }

    // Andar Akhar Numbers: 0000-9999
    if (numInt >= 0 && numInt <= 9999) {
      const numStr = num.toString().padStart(4, '0');
      return numStr.length === 4;
    }

    // Behar Akhar Numbers: 000-999
    if (numInt >= 0 && numInt <= 999) {
      return true;
    }

    return false;
  };

  // Parse input text and extract valid numbers
  const parseNumbers = (text: any) => {
    if (!text.trim()) {
      setParsedNumbers([]);
      setCount(0);
      return;
    }

    // Split by various delimiters (comma, dash, space, etc.)
    const numbers = text
      .split(/[,\-\s]+/)
      .map((num: any) => num.trim())
      .filter((num: any) => num !== '')
      .map((num: any) => parseInt(num))
      .filter((num: any) => !isNaN(num) && isValidNumber(num));

    setParsedNumbers(numbers);
    setCount(numbers.length);
  };

  // Format input text with dashes after every 2 digits
  const formatInputText = (text: any) => {
    // Remove all non-digit characters except dashes
    let cleaned = text.replace(/[^\d\-]/g, '');

    // Add dashes after every 2 digits
    let formatted = '';
    let digitCount = 0;

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (char === '-') {
        formatted += char;
        digitCount = 0;
      } else {
        formatted += char;
        digitCount++;

        // Add dash after every 2 digits (but not at the end)
        if (digitCount === 2 && i < cleaned.length - 1 && cleaned[i + 1] !== '-') {
          formatted += '-';
          digitCount = 0;
        }
      }
    }

    return formatted;
  };

  const handleInputChange = (text: any) => {
    const formattedText = formatInputText(text);
    setInputText(formattedText);
    parseNumbers(formattedText);
  };

  const handleAmountChange = (value: any) => {
    const sanitized = (value || '').toString().replace(/\D/g, '');
    setAmount(sanitized);
    const amountFloat = parseFloat(sanitized) || 0;
    setTotalAmount(amountFloat * count);
  };

  useEffect(() => {
    const amountFloat = parseFloat(amount) || 0;
    setTotalAmount(amountFloat * count);
  }, [count, amount]);

  const handleSaveNumbers = () => {
    if (parsedNumbers.length === 0) {
      Alert.alert('Error', 'Please enter at least one valid number');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountPerNumber = parseFloat(amount);
    const transactions = parsedNumbers.map((number, index) => ({
      id: `${Date.now()}-${index}`,
      number: number,
      amount: amountPerNumber,
      timestamp: new Date().toLocaleString(),
      source: 'Add Numbers',
    }));

    // Call parent callbacks
    if (onNumbersAdd) {
      onNumbersAdd({
        numbers: parsedNumbers,
        amount: amountPerNumber,
        totalAmount: totalAmount,
        count: count,
      });
    }

    if (onTransactionAdd) {
      transactions.forEach(transaction => {
        onTransactionAdd(transaction);
      });
    }

    // Clear form
    setInputText('');
    setAmount('');
    setParsedNumbers([]);
    setCount(0);
    setTotalAmount(0);

    Alert.alert('Success', `${count} numbers saved successfully!`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>⊕</Text>
          <Text style={styles.headerTitle}>Add Numbers</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Dara Numbers</Text>
          <TextInput
            style={styles.numberInput}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Enter numbers (e.g., 23-45-67)"
            multiline
            textAlignVertical="top"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.amountSection}>
          <View style={styles.amountInputContainer}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{totalAmount}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveNumbers}>
          <Text style={styles.saveButtonText}>Save Numbers</Text>
        </TouchableOpacity>

        {/* Preview of parsed numbers */}
        {parsedNumbers.length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview ({count} numbers):</Text>
            <Text style={styles.previewNumbers}>
              {parsedNumbers.join(', ')}
            </Text>
          </View>
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    fontSize: 18,
    color: '#4A90E2',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 8,
    fontWeight: '500',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: 'white',
  },
  amountSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  amountInputContainer: {
    flex: 1,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  totalContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  saveButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  previewNumbers: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  instructionsContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionsIcon: {
    fontSize: 18,
    color: '#FF9500',
    marginRight: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#FF9500',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    backgroundColor: '#E8F4FD',
    color: '#4A90E2',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default AddNumbersForm;