import { StyleSheet, View } from "react-native";
import CustomDropdown from "../../../components/CustomDropdown";
import CustomTextInput from "../../../components/CustomTextInput";
import { COLORS } from "../../../assets/colors";
import { scale } from "react-native-size-matters";

export const ContactAndAdditionalFields = ({ values, errors, touched, handleChange, dropdownStates, setFieldValue }:any) => (
  <>
    <View >
      <View style={style.flexSingleColumb}>
        <CustomDropdown
          label="Distributor"
          open={dropdownStates.openDropdownDistributor}
          value={dropdownStates.dropdownValueDistributor}
          items={dropdownStates.dropdownItemsDistributor}
          setOpen={dropdownStates.setOpenDropdownDistributor}
          setValue={(val:any) => {
            const selectedValue = typeof val === 'function' ? val() : val;
            dropdownStates.setDropdownValueDistributor(selectedValue);
            setFieldValue('distributor', selectedValue);
          }}
          setItems={dropdownStates.setDropdownItemsDistributor}
          error={errors.distributor}
          placeholder={dropdownStates.distributorLoading ? "Loading distributors..." : "Select Distributor"}
        />
      </View>
      <View style={style.flexSingleColumb}>
        <CustomDropdown
          label="Agent"
          open={dropdownStates.openDropdown3}
          value={dropdownStates.dropdownValue3}
          items={dropdownStates.dropdownItems3}
          setOpen={dropdownStates.setOpenDropdown3}
          setValue={(val:any) => {
            const selectedValue = typeof val === 'function' ? val() : val;
            console.log('Agent dropdown selected value:', selectedValue);
            console.log('Agent dropdown selected value type:', typeof selectedValue);
            
            dropdownStates.setDropdownValue3(selectedValue);
            
            // Store the VALUE (ID) in the form field, not the label
            setFieldValue('agent', selectedValue);
            console.log('Agent field set to:', selectedValue);
          }}
          setItems={dropdownStates.setDropdownItems3}
          error={errors.agent}
          placeholder={dropdownStates.agentLoading ? "Loading agents..." : "Select Agent"}
        />
      </View>
    </View>

    <CustomDropdown
      label="Limit Type"
      open={dropdownStates.openDropdownLimit}
      value={dropdownStates.dropdownValueLimit}
      items={dropdownStates.dropdownItemsLimit}
      setOpen={dropdownStates.setOpenDropdownLimit}
      setValue={(val:any) => {
        dropdownStates.setDropdownValueLimit(val());
        setFieldValue('limit', val());
      }}
      setItems={dropdownStates.setDropdownItemsLimit}
      error={errors.limit}
    />

    <CustomTextInput
      label="Garantor Name"
      value={values.grantorName}
      onChangeText={handleChange('grantorName')}
      error={touched.grantorName && typeof errors.grantorName === 'string' ? errors.grantorName : undefined}
    />

    <CustomTextInput
      label="Mobile"
      value={values.mobile}
      onChangeText={handleChange('mobile')}
      error={touched.mobile && typeof errors.mobile === 'string' ? errors.mobile : undefined}
      keyboardType="numeric"
      maxLength={10}
    />
<View style={{marginBottom:15}}>

    <CustomTextInput
      label="Address"
      value={values.address}
      onChangeText={handleChange('address')}
      error={touched.address && typeof errors.address === 'string' ? errors.address : undefined}
    />
</View>
  </>
);

const style = StyleSheet.create({
  flexSingleColumb: {
    width: '100%',
    paddingVertical:scale(4)
  },
  flexDoubleColumb: { flexDirection: 'row', justifyContent: 'space-between' },
  container: {
    flex: 1,
    backgroundColor: COLORS.BGFILESCOLOR,
  },
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fef7e5',
  },
});