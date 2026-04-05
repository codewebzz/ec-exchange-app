import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const FromToModal = ({ visible, onClose, onSave, title = "From-To" }: any) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [pltAmount, setPltAmount] = useState('');
  const [totalNumbers, setTotalNumbers] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Function to reverse digits of a number
  const reverseNumber = (num: number): number => {
    const str = num.toString();
    const reversed = str.split('').reverse().join('');
    return parseInt(reversed);
  };

  // Calculate summary when inputs change
  useEffect(() => {
    if (from && to && amount) {
      const fromNum = parseInt(from);
      const toNum = parseInt(to);
      const amountNum = parseFloat(amount);

      if (!isNaN(fromNum) && !isNaN(toNum) && !isNaN(amountNum) && fromNum <= toNum) {
        const count = toNum - fromNum + 1;
        setTotalNumbers(count);
        setTotalAmount(count * amountNum);
      } else {
        setTotalNumbers(0);
        setTotalAmount(0);
      }
    } else {
      setTotalNumbers(0);
      setTotalAmount(0);
    }
  }, [from, to, amount]);

  const validateInputs = () => {
    if (!from || !to || !amount) {
      Alert.alert('Error', 'Please fill in From, To, and Amount fields');
      return false;
    }

    const fromNum = parseInt(from);
    const toNum = parseInt(to);
    const amountNum = parseFloat(amount);

    if (isNaN(fromNum) || isNaN(toNum) || isNaN(amountNum)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return false;
    }

    if (fromNum > toNum) {
      Alert.alert('Error', 'From number should be less than or equal to To number');
      return false;
    }

    if (fromNum < 0 || toNum < 0) {
      Alert.alert('Error', 'Numbers should be greater than or equal to 0');
      return false;
    }

    return true;
  };

  const generateTransactions = () => {
    const fromNum = parseInt(from);
    const toNum = parseInt(to);
    const amountNum = parseFloat(amount);
    const pltAmountNum = pltAmount ? parseFloat(pltAmount) : 0;

    const transactions = [];

    for (let i = fromNum; i <= toNum; i++) {
      // Main transaction with the specified amount
      transactions.push({
        id: `fromto_${Date.now()}_${i}_${Math.random()}`,
        number: i.toString(),
        amount: amountNum,
        type: 'From-To',
        timestamp: new Date().toISOString(),
        source: 'From-To Modal',
        originalInput: {
          from: fromNum,
          to: toNum,
          amount: amountNum,
          pltAmount: pltAmountNum
        }
      });

      // If PLT amount is specified, add transaction for reversed number
      if (pltAmountNum > 0) {
        const reversedNumber = reverseNumber(i);
        transactions.push({
          id: `fromto_plt_${Date.now()}_${i}_${Math.random()}`,
          number: reversedNumber.toString(),
          amount: pltAmountNum,
          type: 'From-To PLT',
          timestamp: new Date().toISOString(),
          source: 'From-To Modal (PLT)',
          originalNumber: i,
          reversedFrom: i,
          originalInput: {
            from: fromNum,
            to: toNum,
            amount: amountNum,
            pltAmount: pltAmountNum
          }
        });
      }
    }

    return transactions;
  };

  // Generate preview of what numbers will be created
  const getPreviewNumbers = () => {
    if (!from || !to) return { main: [], plt: [] };

    const fromNum = parseInt(from);
    const toNum = parseInt(to);

    if (isNaN(fromNum) || isNaN(toNum) || fromNum > toNum) {
      return { main: [], plt: [] };
    }

    const mainNumbers = [];
    const pltNumbers = [];

    for (let i = fromNum; i <= toNum; i++) {
      mainNumbers.push(i);
      if (pltAmount) {
        pltNumbers.push(reverseNumber(i));
      }
    }

    return { main: mainNumbers, plt: pltNumbers };
  };

  const previewNumbers = getPreviewNumbers();

  const handleSave = () => {
    if (!validateInputs()) return;

    const transactions = generateTransactions();
    onSave(transactions);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setFrom('');
    setTo('');
    setAmount('');
    setPltAmount('');
    setTotalNumbers(0);
    setTotalAmount(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Input Fields */}
            <View style={styles.inputContainer}>
              {/* From and To Row */}
              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>From</Text>
                  <TextInput
                    style={styles.input}
                    value={from}
                    onChangeText={(text) => setFrom(text.replace(/\D/g, ''))}
                    placeholder="From"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>To</Text>
                  <TextInput
                    style={styles.input}
                    value={to}
                    onChangeText={(text) => setTo(text.replace(/\D/g, ''))}
                    placeholder="To"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Amount</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={(text) => setAmount(text.replace(/\D/g, ''))}
                    placeholder="Amount"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* PLT Amount Row */}
              <View style={styles.fullWidthInputGroup}>
                <Text style={styles.label}>PLT Amount</Text>
                <TextInput
                  style={styles.fullWidthInput}
                  value={pltAmount}
                  onChangeText={(text) => setPltAmount(text.replace(/\D/g, ''))}
                  placeholder="PLT Amount (for reversed numbers)"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Summary Section */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>📊 SUMMARY</Text>
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Numbers</Text>
                  <Text style={styles.summaryValue}>{totalNumbers}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
                </View>
                {pltAmount && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total PLT Amount</Text>
                    <Text style={styles.summaryValue}>₹{(totalNumbers * parseFloat(pltAmount || 0)).toFixed(2)}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Preview Section */}
            {(previewNumbers.main.length > 0 || previewNumbers.plt.length > 0) && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>📋 PREVIEW</Text>
                
                {/* Main Numbers */}
                {previewNumbers.main.length > 0 && (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>
                      Main Numbers (Amount: ₹{amount || 0})
                    </Text>
                    <View style={styles.numbersGrid}>
                      {previewNumbers.main.slice(0, 20).map((number, index) => (
                        <View key={`main-${index}`} style={[styles.numberChip, styles.mainNumberChip]}>
                          <Text style={styles.numberText}>{number}</Text>
                        </View>
                      ))}
                      {previewNumbers.main.length > 20 && (
                        <View style={styles.moreIndicator}>
                          <Text style={styles.moreText}>+{previewNumbers.main.length - 20} more</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* PLT Numbers */}
                {previewNumbers.plt.length > 0 && (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>
                      PLT Numbers (Reversed, Amount: ₹{pltAmount || 0})
                    </Text>
                    <View style={styles.numbersGrid}>
                      {previewNumbers.plt.slice(0, 20).map((number, index) => (
                        <View key={`plt-${index}`} style={[styles.numberChip, styles.pltNumberChip]}>
                          <Text style={styles.numberText}>{number}</Text>
                        </View>
                      ))}
                      {previewNumbers.plt.length > 20 && (
                        <View style={styles.moreIndicator}>
                          <Text style={styles.moreText}>+{previewNumbers.plt.length - 20} more</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Instructions */}
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionTitle}>📝 INSTRUCTIONS</Text>
              <Text style={styles.instructionText}>
                • Enter range from minimum to maximum number
              </Text>
              <Text style={styles.instructionText}>
                • PLT Amount creates additional transactions for reversed numbers
              </Text>
              <Text style={styles.instructionText}>
                • Example: From 12 to 14 with PLT creates: 12, 13, 14 + 21, 31, 41 (reversed)
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.closeActionButton]}
              onPress={handleClose}
            >
              <Text style={[styles.closeButtonText, styles.closeActionText]}>Close</Text>
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
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF8E7',
    borderRadius: 16,
    padding: 0,
    width: width - 40,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  inputContainer: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  fullWidthInputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2D3748',
  },
  fullWidthInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2D3748',
    width: '100%',
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3182CE',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B6CB0',
    marginBottom: 12,
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
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: 'bold',
  },
  previewContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  previewSection: {
    marginBottom: 16,
  },
  previewSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  numberChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 35,
    alignItems: 'center',
    marginBottom: 4,
  },
  mainNumberChip: {
    backgroundColor: '#4A90E2',
  },
  pltNumberChip: {
    backgroundColor: '#48BB78',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  moreIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  moreText: {
    color: '#4A5568',
    fontSize: 12,
    fontStyle: 'italic',
  },
  instructionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F6C23E',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#2D3748',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeActionButton: {
    backgroundColor: '#E2E8F0',
  },
  closeActionText: {
    color: '#4A5568',
  },
});

export default FromToModal;