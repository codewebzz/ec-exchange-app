import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../assets/colors';

interface CustomMonthPickerProps {
  label: string;
  value: Date;
  onSelect: (date: Date) => void;
  error?: string;
}

const CustomMonthPicker = ({ label, value, onSelect, error }: CustomMonthPickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewYear, setViewYear] = useState(value.getFullYear());

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewYear, monthIndex, 1);
    onSelect(newDate);
    setModalVisible(false);
  };

  const handleYearChange = (delta: number) => {
    setViewYear(viewYear + delta);
  };

  const formatDisplay = () => {
    return `${months[value.getMonth()]} ${value.getFullYear()}`;
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => {
          setViewYear(value.getFullYear());
          setModalVisible(true);
        }}
        style={[
          styles.selector,
          error ? { borderColor: '#EF4444', borderWidth: 1 } : null,
        ]}
      >
        <Text style={styles.selectorText}>{formatDisplay()}</Text>
        <Icon name="calendar-today" size={20} color="#999" />
      </Pressable>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => handleYearChange(-1)}>
                <Icon name="chevron-left" size={30} color={COLORS.BLACK} />
              </TouchableOpacity>
              <Text style={styles.yearText}>{viewYear}</Text>
              <TouchableOpacity onPress={() => handleYearChange(1)}>
                <Icon name="chevron-right" size={30} color={COLORS.BLACK} />
              </TouchableOpacity>
            </View>

            <View style={styles.monthGrid}>
              {months.map((month, index) => {
                const isSelected = 
                  value.getMonth() === index && 
                  value.getFullYear() === viewYear;
                
                return (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthItem,
                      isSelected && styles.selectedMonthItem
                    ]}
                    onPress={() => handleMonthSelect(index)}
                  >
                    <Text style={[
                      styles.monthText,
                      isSelected && styles.selectedMonthText
                    ]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
    fontSize: scale(12),
    color: '#333',
    fontWeight: '800',
  },
  selector: {
    backgroundColor: COLORS.WHITE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(13),
    paddingHorizontal: scale(10),
    borderRadius: scale(6),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  selectorText: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  yearText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: '30%',
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  selectedMonthItem: {
    backgroundColor: COLORS.BUTTONBG,
  },
  monthText: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  selectedMonthText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    color: 'red',
    fontWeight: '600',
  }
});

export default CustomMonthPicker;
