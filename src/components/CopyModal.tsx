import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, ActivityIndicator } from 'react-native';
import { ModalHeader } from './ModalHeader';
import CustomDropdown from './CustomDropdown';
import { ModalActions } from './ModalAction';
import { COLORS } from '../assets/colors';
import APIService from '../screens/services/APIService';

const CopyModal = ({ visible, onClose, onSave, loading }:any) => {
  const [selectedShift, setSelectedShift] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shiftItems, setShiftItems] = useState<any[]>([]);
  const [shiftLoading, setShiftLoading] = useState(false);

  // Fetch shift dropdown data
  const fetchShiftData = async () => {
    try {
      setShiftLoading(true);
      const response = await APIService.GetUndeclearedDropDownData();
      console.log('Shift data response:', response);
      
      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format
        console.log(response.data,"response.dataresponse.data")
        const transformedShifts = response.data.map((shift: any) => ({
          label: shift.shift_name || shift.name || 'Unknown Shift',
          value: shift.id?.toString() || shift.shift_id?.toString() || ''
        }));
        setShiftItems(transformedShifts);
        console.log('Transformed shift items:', transformedShifts);
      } else {
        console.log('No shift data found or API error');
        setShiftItems([]);
      }
    } catch (error) {
      console.error('Error fetching shift data:', error);
      setShiftItems([]);
    } finally {
      setShiftLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchShiftData();
    }
  }, [visible]);

  const handleSave = () => {
    if (selectedShift) {
      onSave(selectedShift);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ModalHeader title="Select shift data" onClose={onClose} />
          <CustomDropdown
            label={undefined}
            open={dropdownOpen}
            value={selectedShift}
            items={shiftItems}
            setOpen={setDropdownOpen}
            setValue={setSelectedShift}
            setItems={() => {}}
            placeholder={shiftLoading ? "Loading shifts..." : "Select a shift"}
          />
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.BUTTONBG} style={{ marginVertical: 20 }} />
          ) : (
            <ModalActions
              onClose={onClose}
              onAdd={handleSave}
              editingIndex={-1}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FBE7A2',
    borderRadius: 10,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
  },
});

export default CopyModal;