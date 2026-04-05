import { Text, TouchableOpacity, View } from "react-native";
import { Modal } from "react-native";
import { ModalHeader } from "../../../components/ModalHeader";
import CustomDropdown from "../../../components/CustomDropdown";
import CustomTextInput from "../../../components/CustomTextInput";
import { WapsiInModalTable } from "./WapsiInModalTable";
import CustomButton from "../../../components/CustomButton";
import { COLORS } from "../../../assets/colors";
import { scale } from "react-native-size-matters";

export const WapsiModal = ({ 
  isOpen, 
  modalData, 
  setModalData, 
  onClose, 
  onAdd, 
  values, 
  editingTPWapsiIndex,
  calculateRemainingWapsi,
  dropdownProps,
  onDelete
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
          backgroundColor: '#f4e4bc', // Cream color matching the image
          borderRadius: 12,
          padding: 20,
          width: '100%',
          maxWidth: 400,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          // height:"50%"
        }}>
          <ModalHeader
            title="Add third party wapsi"
            onClose={onClose}
          />

        
            {/* Party Name Dropdown */}
            <View style={{ }}>
           
              <CustomDropdown
                label="Party Name"
                open={dropdownProps.openDropdownWapsiParty}
                value={dropdownProps.dropdownValueWapsiParty}
                items={dropdownProps.dropdownItemsWapsiParty}
                setOpen={dropdownProps.setOpenDropdownWapsiParty}
                setValue={(val:any) => {
                  const selectedValue = typeof val === 'function' ? val() : val;
                  dropdownProps.setDropdownValueWapsiParty(selectedValue);

                  // Find the label for the selected value
                  const selectedItem = dropdownProps.dropdownItemsWapsiParty.find(
                    (item:any) => item.value === selectedValue
                  );
                  const selectedLabel = selectedItem ? selectedItem.label : '';

                  setModalData((prev:any) => ({
                    ...prev,
                    partyName: selectedLabel, // Store the name for display
                    partyId: selectedValue,   // Store the ID for API
                  }));
                }}
                setItems={dropdownProps.setDropdownItemsWapsiParty}
                placeholder={dropdownProps.ledgerLoading ? "Loading ledgers..." : "Select Party"}
              />
            </View>

            {/* Wapsi Amount Input */}
            <View style={{  }}>
              <Text style={{
                marginBottom: 4,
                fontWeight: '500',
                color: '#333',
                fontSize: 14
              }}>
                Wapsi Amount
              </Text>
              <CustomTextInput
                label=""
                value={modalData.wapsiAmount}
                onChangeText={value => setModalData((prev:any) => ({
                  ...prev,
                  wapsiAmount: value,
                }))}
                keyboardType="numeric"
                placeholder={`Available: ${calculateRemainingWapsi()}`}
              />
            </View>

            {/* Add Button */}
            <View style={{ width: '100%',marginVertical:scale(5)}}>
              <CustomButton
                title="Add"
                onPress={onAdd}
                textColor={COLORS.WHITE}
              />
            </View>
           
          </View>

          {/* Display existing entries in modal */}
          {values?.tpWapsi?.length > 0 && (
            <WapsiInModalTable 
              tpWapsi={values.tpWapsi}
              onDelete={onDelete}
            />
          )}

          {/* Summary Footer */}
       
        </View>
    
    </Modal>
  );
};