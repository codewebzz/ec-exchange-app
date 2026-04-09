import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');

const CrossModal = ({ visible, onClose, onSave, title = "Cross" }: any) => {
  const [number1, setNumber1] = useState('');
  const [number2, setNumber2] = useState('');
  const [amount, setAmount] = useState('');
  const [jodaEnabled, setJodaEnabled] = useState(true);
  const [crossResults, setCrossResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const num2Ref = useRef<TextInput>(null);
  const amountRef = useRef<TextInput>(null);

  // Generate cross combinations
  const generateCrossCombinations = (num1: any, num2: any, includeJoda: any) => {
    if (!num1 || !num2) return [];

    const digits1 = num1.toString().split('');
    const digits2 = num2.toString().split('');
    const combinations: any[] = [];

    digits1.forEach((digit1: any) => {
      digits2.forEach((digit2: any) => {
        const combination = digit1 + digit2;

        // If Joda is disabled, exclude same digit combinations
        if (!includeJoda && digit1 === digit2) {
          return;
        }

        combinations.push(parseInt(combination));
      });
    });

    return combinations.sort((a, b) => a - b);
  };

  // Calculate cross results whenever inputs change
  useEffect(() => {
    if (number1 && number2 && amount) {
      const combinations = generateCrossCombinations(number1, number2, jodaEnabled);
      setCrossResults(combinations);
      setTotalCount(combinations.length);
      setTotalAmount(combinations.length * parseFloat(amount || 0));
    } else {
      setCrossResults([]);
      setTotalCount(0);
      setTotalAmount(0);
    }
  }, [number1, number2, amount, jodaEnabled]);

  const handleSave = () => {
    if (!number1 || !number2 || !amount || crossResults.length === 0) {
      Alert.alert('Please fill all fields and ensure valid cross combinations are generated');
      return;
    }

    // Create transactions for each cross combination
    const transactions = crossResults.map(combination => ({
      id: Date.now() + Math.random(),
      number: combination.toString(),
      amount: parseFloat(amount),
      type: 'Cross',
      timestamp: new Date().toISOString(),
      originalInput: {
        number1,
        number2,
        jodaEnabled
      }
    }));

    onSave(transactions);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setNumber1('');
    setNumber2('');
    setAmount('');
    setJodaEnabled(true);
    setCrossResults([]);
    setTotalCount(0);
    setTotalAmount(0);
    onClose();
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
                  <Text style={styles.inputLabel}>Number 1</Text>
                  <TextInput
                    style={styles.input}
                    value={number1}
                    onChangeText={(text) => setNumber1(text.replace(/\D/g, ''))}
                    placeholder="Enter number 1"
                    keyboardType="numeric"
                    returnKeyType="next"
                    onSubmitEditing={() => num2Ref.current?.focus()}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Number 2</Text>
                  <TextInput
                    style={styles.input}
                    value={number2}
                    onChangeText={(text) => setNumber2(text.replace(/\D/g, ''))}
                    placeholder="Enter number 2"
                    keyboardType="numeric"
                    returnKeyType="next"
                    onSubmitEditing={() => amountRef.current?.focus()}
                    ref={num2Ref}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Amount</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={(text) => setAmount(text.replace(/\D/g, ''))}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                    ref={amountRef}
                  />
                </View>

                <View style={styles.switchGroup}>
                  <Text style={styles.inputLabel}>Joda</Text>
                  <View style={styles.switchContainer}>
                    <Switch
                      value={jodaEnabled}
                      onValueChange={setJodaEnabled}
                      trackColor={{ false: '#767577', true: '#4A90E2' }}
                      thumbColor={jodaEnabled ? '#FFFFFF' : '#f4f3f4'}
                    />
                    <Text style={styles.switchLabel}>
                      {jodaEnabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Summary Section */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>📊 SUMMARY</Text>
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Cross Count</Text>
                  <Text style={styles.summaryValue}>{totalCount}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={styles.summaryValue}>₹{totalAmount}</Text>
                </View>
              </View>
            </View>

            {/* Cross Results Preview */}
            {crossResults.length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>Generated Numbers</Text>
                <View style={styles.numbersGrid}>
                  {crossResults.map((number, index) => (
                    <View key={index} style={styles.numberChip}>
                      <Text style={styles.numberText}>{number}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Instructions */}
            <View style={styles.instructionSection}>
              <Text style={styles.sectionTitle}>📝 INSTRUCTIONS</Text>
              <Text style={styles.instructionText}>
                • गणि JODA "Y" है तो 00-99 JODA की ENTRY होगी
              </Text>
              <Text style={styles.instructionText}>
                • गणि BOTH NUMBER BLANK है और JODA "Y" है तो SINGLE 00-99 JODA की ENTRY होगी
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
    maxHeight: '90%',
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
    marginBottom: 15,
  },
  inputGroup: {
    flex: 1,
    marginRight: 10,
  },
  switchGroup: {
    flex: 1,
    marginLeft: 10,
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
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  summarySection: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BEE3F8',
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
  previewSection: {
    marginBottom: 20,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  numberChip: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionSection: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  instructionText: {
    fontSize: 12,
    color: '#856404',
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

export default CrossModal;