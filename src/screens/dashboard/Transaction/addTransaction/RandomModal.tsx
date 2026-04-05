import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

interface NumberEntry {
  id: string;
  number: string;
}

interface RandomModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entries: any[]) => void;
  title?: string;
}

const RandomModal: React.FC<RandomModalProps> = ({
  visible,
  onClose,
  onSave,
  title = "Random"
}) => {
  const [numberEntries, setNumberEntries] = useState<NumberEntry[]>([
    { id: '1', number: '' }
  ]);
  const [amount, setAmount] = useState('');
  const [pltAmount, setPltAmount] = useState('');
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const newlyAddedId = useRef<string | null>(null);
  const currentFocusedInputId = useRef<string | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Calculate total amount (amount * number of valid entries)
  const validEntries = numberEntries.filter(entry => entry.number.trim());
  const amountValue = parseFloat(amount) || 0;
  const pltAmountValue = parseFloat(pltAmount) || 0;
  const totalAmount = pltAmountValue + amountValue;

  // Add new number entry
  const addNumberEntry = () => {
    const newEntry: NumberEntry = {
      id: generateId(),
      number: ''
    };
    newlyAddedId.current = newEntry.id;
    setNumberEntries([...numberEntries, newEntry]);
    // Immediately try to focus the new input
    setTimeout(() => {
      const inputRef = inputRefs.current[newEntry.id];
      if (inputRef) {
        inputRef.focus();
      }
    }, 50);
  };

  // Focus on newly added input after it's rendered
  useEffect(() => {
    if (newlyAddedId.current) {
      // Multiple attempts to ensure focus is set
      const attemptFocus = (attempts: number = 0) => {
        if (attempts > 5) {
          newlyAddedId.current = null;
          return;
        }
        const inputRef = inputRefs.current[newlyAddedId.current || ''];
        if (inputRef) {
          inputRef.focus();
          newlyAddedId.current = null;
        } else {
          setTimeout(() => attemptFocus(attempts + 1), 50);
        }
      };
      attemptFocus();
    }
  }, [numberEntries]);

  // Remove number entry
  const removeNumberEntry = (id: string) => {
    // Allow removal as long as it's not the last remaining entry
    if (numberEntries.length > 1) {
      // Clean up the ref
      delete inputRefs.current[id];
      setNumberEntries(numberEntries.filter(entry => entry.id !== id));
    }
  };

  const normalizeNumberInput = (value: string) => {
    const digitsOnly = (value || '').replace(/\D/g, '');
    if (!digitsOnly) {
      return '';
    }

    if (digitsOnly.startsWith('10')) {
      if (digitsOnly === '100') {
        return '00';
      }
      return digitsOnly.slice(0, 2);
    }

    return digitsOnly.slice(0, 2);
  };

  // Update number entry
  const updateNumberEntry = (id: string, value: string) => {
    const normalized = normalizeNumberInput(value);
    setNumberEntries(numberEntries.map(entry => 
      entry.id === id ? { ...entry, number: normalized } : entry
    ));
  };

  // Reverse a number string
  const reverseNumber = (numStr: string): string => {
    return numStr.split('').reverse().join('');
  };

  // Generate transactions for QuickEntry
  const generateTransactions = () => {
    const transactions: any[] = [];
    const amountValue = parseFloat(amount) || 0;
    const pltAmountValue = parseFloat(pltAmount) || 0;

    numberEntries.forEach(entry => {
      if (entry.number.trim()) {
        // Regular transaction with the common amount
        if (amountValue > 0) {
          transactions.push({
            id: generateId(),
            number: entry.number.trim(),
            amount: amountValue,
            type: 'regular',
            source: 'Random Modal',
            timestamp: new Date(),
          });
        }

        // PLT Amount transaction (for reversed number)
        if (pltAmountValue > 0) {
          const reversedNumber = reverseNumber(entry.number.trim());
          if (reversedNumber !== entry.number.trim()) { // Only if reverse is different
            transactions.push({
              id: generateId(),
              number: reversedNumber,
              amount: pltAmountValue,
              type: 'plt',
              source: 'Random Modal',
              timestamp: new Date(),
            });
          }
        }
      }
    });

    return transactions;
  };

  // Handle save
  const handleSave = () => {
    // Validate that at least one number is entered
    const validEntries = numberEntries.filter(entry => entry.number.trim());
    
    if (validEntries.length === 0) {
      Alert.alert('Error', 'Please enter at least one number');
      return;
    }

    const transactions = generateTransactions();
    onSave(transactions);
    handleClose();
  };

  // Handle close and reset
  const handleClose = () => {
    setNumberEntries([{ id: '1', number: '' }]);
    setAmount('');
    setPltAmount('');
    inputRefs.current = {};
    newlyAddedId.current = null;
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to cancel? All entered data will be lost.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: handleClose }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Number Entries */}
            {numberEntries.map((entry, index) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NUMBER</Text>
                  <View style={styles.inputWithButton}>
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current[entry.id] = ref;
                      }}
                      style={styles.input}
                      value={entry.number}
                      onChangeText={(value) => updateNumberEntry(entry.id, value)}
                      placeholder="Enter number"
                      keyboardType="numeric"
                      maxLength={entry.number.startsWith('10') ? 3 : 2}
                      blurOnSubmit={false}
                      pointerEvents="auto"
                      onFocus={() => {
                        currentFocusedInputId.current = entry.id;
                      }}
                      onBlur={() => {
                        // Don't clear if we're about to focus a new input
                        if (newlyAddedId.current === entry.id) {
                          return;
                        }
                      }}
                    />
                    {/* Show delete button on all entries except the newest/last one */}
                    {index !== numberEntries.length - 1 && (
                      <TouchableOpacity
                        onPress={() => removeNumberEntry(entry.id)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>🗑</Text>
                      </TouchableOpacity>
                    )}
                     {/* Add button (only show on the very last entry) */}
                {index === numberEntries.length - 1 && (
                  <Pressable 
                    onPress={(e) => {
                      // Only allow press if current input has a number
                      if (entry.number.trim()) {
                        e.stopPropagation();
                        addNumberEntry();
                      }
                    }}
                    disabled={!entry.number.trim()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={({ pressed }) => [
                      styles.addButton,
                      !entry.number.trim() && styles.addButtonDisabled,
                      pressed && entry.number.trim() && styles.addButtonPressed
                    ]}
                  >
                    <Text style={[
                      styles.addButtonText,
                      !entry.number.trim() && styles.addButtonTextDisabled
                    ]}>+</Text>
                  </Pressable>
                )}
                  </View>
                </View>

               
              </View>
            ))}

            {/* Single Amount Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>AMOUNT</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={(text) => setAmount((text || '').replace(/\D/g, ''))}
                placeholder="0"
                keyboardType="numeric"
              />
              <Text style={styles.helpText}>
                This amount will be applied to all entered numbers
              </Text>
            </View>

            {/* PLT Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PLT-AMOUNT</Text>
              <TextInput
                style={styles.input}
                value={pltAmount}
                onChangeText={(text) => setPltAmount((text || '').replace(/\D/g, ''))}
                placeholder="0"
                keyboardType="numeric"
              />
              <Text style={styles.helpText}>
                This amount will be assigned to reversed numbers
              </Text>
            </View>

            {/* Total Amount */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>TOTAL AMOUNT: {totalAmount}</Text>
             
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
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
    fontSize: 20,
    color: '#4A5568',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    maxHeight: 500,
    paddingBottom:100
  },
  entryRow: {
    marginBottom: 20,
    position: 'relative',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2D3748',
  },
  removeButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    backgroundColor: '#FED7D7',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
  },
  addButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    backgroundColor: '#48BB78',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
  addButtonDisabled: {
    backgroundColor: '#CBD5E0',
    opacity: 0.5,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  addButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  addButtonTextDisabled: {
    color: '#A0AEC0',
  },
  helpText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
    fontStyle: 'italic',
  },
  totalContainer: {
    backgroundColor: '#EDF2F7',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    marginBottom:50
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
  },
  totalSubText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2D3748',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RandomModal;