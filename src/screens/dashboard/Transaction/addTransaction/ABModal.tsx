import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');

const ABModal = ({ visible, onClose, onSave, title = "Random" }:any) => {
  const [akharBahar, setAkharBahar] = useState('');
  const [amount, setAmount] = useState('');
  const [totalNumbers, setTotalNumbers] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const amountRef = React.useRef<TextInput>(null);

  // Generate triple digit numbers based on input digits
  const generateTripleNumbers = (digits:any, amountValue:any) => {
    if (!digits || !amountValue) return [];
    
    const uniqueDigits = [...new Set(digits.split(''))].filter((digit:any) => 
      digit >= '0' && digit <= '9'
    );
    
    const numbers = uniqueDigits.map((digit:any) => {
      const tripleNumber = digit + digit + digit; // e.g., '0' becomes '000'
      return {
        number: tripleNumber,
        amount: parseFloat(amountValue),
        digit: digit
      };
    });
    
    return numbers;
  };

  // Update calculations when inputs change
  useEffect(() => {
    const numbers = generateTripleNumbers(akharBahar, amount);
    setGeneratedNumbers(numbers);
    setTotalNumbers(numbers.length);
    setTotalAmount(numbers.length * parseFloat(amount || 0));
  }, [akharBahar, amount]);

  const handleSave = () => {
    if (!akharBahar || !amount) {
      Alert.alert('Please enter both Akhar Bahar digits and Amount');
      return;
    }

    if (generatedNumbers.length === 0) {
        Alert.alert('No valid digits found. Please enter digits from 0-9');
      return;
    }

    // Create transactions for each generated number
    const transactions = generatedNumbers.map(item => ({
      id: Date.now() + Math.random(),
      number: item.number,
      amount: item.amount,
      type: 'All',
      timestamp: new Date().toISOString(),
      originalDigit: item.digit,
      source: 'All Modal'
    }));

    onSave(transactions);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setAkharBahar('');
    setAmount('');
    setTotalNumbers(0);
    setTotalAmount(0);
    setGeneratedNumbers([]);
    onClose();
  };

  const handleAkharBaharChange = (text) => {
    // Only allow digits 0-9, remove duplicates and non-digits
    const validDigits = text.split('').filter(char => 
      char >= '0' && char <= '9'
    );
    const uniqueDigits = [...new Set(validDigits)];
    setAkharBahar(uniqueDigits.join(''));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Input Fields */}
            <View style={styles.inputSection}>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Akhar Bahar</Text>
                  <TextInput
                    style={styles.input}
                    value={akharBahar}
                    onChangeText={handleAkharBaharChange}
                    placeholder="Enter digits"
                    keyboardType="numeric"
                    maxLength={10} // Max 10 unique digits (0-9)
                    returnKeyType="next"
                    onSubmitEditing={() => amountRef.current?.focus()}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Amount</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={(text) => setAmount(text.replace(/\D/g, ''))}
                    placeholder="AMOUNT"
                    keyboardType="numeric"
                    ref={amountRef}
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                  />
                </View>
              </View>
            </View>

            {/* Note Section */}
            <View style={styles.noteSection}>
              <Text style={styles.noteTitle}>📝 NOTE</Text>
              <Text style={styles.noteText}>
                Akhar number should be 1 digit without any separator.
              </Text>
            </View>

       

            {/* Summary Section */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>📊 SUMMARY</Text>
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Numbers</Text>
                  <Text style={styles.summaryValue}>{totalNumbers}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={styles.summaryValue}>₹{totalAmount}</Text>
                </View>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionSection}>
              <Text style={styles.sectionTitle}>💡 HOW IT WORKS</Text>
              <Text style={styles.instructionText}>
                • Enter digits from 0-9 in Akhar Bahar field
              </Text>
              <Text style={styles.instructionText}>
                • Each digit will create a triple number (e.g., 1 → 111)
              </Text>
              <Text style={styles.instructionText}>
                • Example: Input "012" creates 000, 111, 222 with your amount
              </Text>
              <Text style={styles.instructionText}>
                • Duplicate digits are automatically removed
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Close</Text>
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
  modalContent: {
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#E2E8F0',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#4A5568',
    fontWeight: 'bold',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#2D3748',
  },
  noteSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  numberCard: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  amountText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  summarySection: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3182CE',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2B6CB0',
    marginBottom: 10,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4A5568',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  instructionSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  instructionText: {
    fontSize: 12,
    color: '#065F46',
    marginBottom: 5,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#2C5AA0',
  },
  cancelButton: {
    backgroundColor: '#E2E8F0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#4A5568',
  },
});

export default ABModal;