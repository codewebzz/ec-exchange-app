import { Text, TouchableOpacity, View } from "react-native";
import { Modal } from "react-native";
import { ModalHeader } from "../../../components/ModalHeader";
import CustomDropdown from "../../../components/CustomDropdown";
import CustomTextInput from "../../../components/CustomTextInput";
import { PattiInModalTable } from "./PattiInModalTable";
import CustomButton from "../../../components/CustomButton";
import { COLORS } from "../../../assets/colors";
import { scale } from "react-native-size-matters";

export const PattiModal = ({ 
  isOpen, 
  modalData, 
  setModalData, 
  onClose, 
  onAdd, 
  values, 
  editingPattiIndex,
  calculateRemainingPercentage,
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
          backgroundColor: '#f4e4bc', // Cream color matching your design
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
            title="Add Patti"
            onClose={onClose}
          />

          {/* Party Name Dropdown */}
          <View style={{ }}>
           
            <CustomDropdown
              label=" Party Name"
              open={dropdownProps.openDropdownPattiParty}
              value={dropdownProps.dropdownValuePattiParty}
              items={dropdownProps.dropdownItemsPattiParty}
              setOpen={dropdownProps.setOpenDropdownPattiParty}
              setValue={(val:any) => {
                const selectedValue = typeof val === 'function' ? val() : val;
                dropdownProps.setDropdownValuePattiParty(selectedValue);

                // Find the label for the selected value
                const selectedItem = dropdownProps.dropdownItemsPattiParty.find(
                  (item:any) => item.value === selectedValue
                );
                const selectedLabel = selectedItem ? selectedItem.label : '';

                setModalData((prev:any) => ({
                  ...prev,
                  partyName: selectedLabel, // Store the name for display
                  partyId: selectedValue,   // Store the ID for API
                }));
              }}
              setItems={dropdownProps.setDropdownItemsPattiParty}
              placeholder={dropdownProps.ledgerLoading ? "Loading ledgers..." : "Select Party"}
            />
          </View>

          {/* Percentage Input */}
          <View style={{ marginTop: 12 }}>
            
            <CustomTextInput
              label=" Percentage"
              value={modalData.percentage}
              onChangeText={value => setModalData((prev:any) => ({
                ...prev,
                percentage: value,
              }))}
              keyboardType="numeric"
              placeholder={`Available: ${calculateRemainingPercentage()}%`}
            />
          </View>

          {/* Add Button */}
          <View style={{ width: '100%', marginTop: scale(8) }}>
            <CustomButton
              title="Add"
              onPress={onAdd}
              textColor={COLORS.WHITE}
            />
          </View>

          {/* Display existing entries in modal */}
          {values?.tpPatti?.length > 0 && (
            <PattiInModalTable
              tpPatti={values.tpPatti}
              onDelete={(index:any) => {
                const updatedPatti = values.tpPatti.filter((_:any, i:any) => i !== index);
                // This would need to be passed as a prop or handled differently
                // setFieldValue('tpPatti', updatedPatti);
              }}
            />
          )}

          {/* Summary Footer */}
       
        </View>
      </View>
    </Modal>
  );
};
