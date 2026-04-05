import { Modal, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../assets/colors";
import CustomDropdown from "../../../components/CustomDropdown";
import CustomTextInput from "../../../components/CustomTextInput";
import { ModalActions } from "../../../components/ModalAction";
import { ModalHeader } from "../../../components/ModalHeader";

export const TPWapssiModal = ({ 
  isOpen, 
  modalData, 
  setModalData, 
  onClose, 
  onAdd, 
  values, 
  editingTPIndex,
  dropdownProps 
}:any) => {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{
          backgroundColor: COLORS.BGFILESCOLOR,
          borderRadius: 12,
          padding: 20,
          width: '100%',
          maxWidth: 400,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}>
          <ModalHeader 
            title={`${editingTPIndex >= 0 ? 'Edit' : 'Add'} Third Party Commission`}
            onClose={onClose}
          />

          <CustomDropdown
            label="Party Name"
            open={dropdownProps.openDropdownParty}
            value={dropdownProps.dropdownValueParty}
            items={dropdownProps.dropdownItemsParty}
            setOpen={dropdownProps.setOpenDropdownParty}
            setValue={(val:any) => {
              const selectedValue = typeof val === 'function' ? val() : val;
              dropdownProps.setDropdownValueParty(selectedValue);
              
              // Add safety check for dropdownItemsParty
              const selectedItem = dropdownProps.dropdownItemsParty && Array.isArray(dropdownProps.dropdownItemsParty) 
                ? dropdownProps.dropdownItemsParty.find((item:any) => item.value === selectedValue)
                : null;
              const selectedLabel = selectedItem ? selectedItem.label : '';
              
              setModalData((prev:any) => ({
                ...prev,
                partyName: selectedLabel, // Store the name for display
                partyId: selectedValue,   // Store the ID for API
              }));
            }}
            setItems={dropdownProps.setDropdownItemsParty}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginVertical: 12 }}>
            <View style={{ flex: 1 }}>
              <CustomTextInput
                label="D-Comm"
                value={modalData.dComm}
                onChangeText={value => setModalData((prev:any) => ({ ...prev, dComm: value }))}
                keyboardType="numeric"
                placeholder={`Available: ${
                  (parseFloat(values.dhaniRate) || 0) -
                  values.tpCommissions.reduce((sum:any, tp:any, idx:any) =>
                    idx !== editingTPIndex ? sum + (parseFloat(tp.dComm) || 0) : sum, 0
                  )
                }`}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomTextInput
                label="H-Comm"
                value={modalData.hComm}
                onChangeText={value => setModalData((prev:any) => ({ ...prev, hComm: value }))}
                keyboardType="numeric"
                placeholder={`Available: ${
                  (parseFloat(values.harupCommission) || 0) -
                  values.tpCommissions.reduce((sum:any, tp:any, idx:any) =>
                    idx !== editingTPIndex ? sum + (parseFloat(tp.hComm) || 0) : sum, 0
                  )
                }`}
              />
            </View>
          </View>

          <ModalActions onClose={onClose} onAdd={onAdd} editingIndex={editingTPIndex} />
        </View>
      </View>
    </Modal>
  );
};





