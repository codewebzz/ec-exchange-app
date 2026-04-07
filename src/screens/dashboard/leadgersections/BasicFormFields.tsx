import CustomDropdown from "../../../components/CustomDropdown";
import CustomTextInput from "../../../components/CustomTextInput";
import { Keyboard, Text, View } from "react-native";

export const BasicFormFields = ({ values, errors, touched, handleChange, dropdownProps, inputRefs, focusedField, setFocusedField }: any) => {
  const { setFieldValue } = dropdownProps;
  const { leadgerNameRef, realNameRef, cappingRef, dhaniRateRef, groupDropdownRef } = inputRefs;

  return (
    <>
      <CustomTextInput
        ref={leadgerNameRef}
        label="Leadger Name"
        value={values.leadgerName}
        onChangeText={handleChange('leadgerName')}
        error={touched.leadgerName && typeof errors.leadgerName === 'string' ? errors.leadgerName : undefined}
        returnKeyType="next"
        onSubmitEditing={() => realNameRef.current?.focus()}
        onFocus={() => setFocusedField(null)}
      />
      
      <CustomTextInput
        ref={realNameRef}
        label="Real Name"
        value={values.realName}
        onChangeText={handleChange('realName')}
        error={touched.realName && typeof errors.realName === 'string' ? errors.realName : undefined}
        returnKeyType="next"
        onSubmitEditing={() => cappingRef.current?.focus()}
        onFocus={() => setFocusedField(null)}
      />
      
      <CustomTextInput
        ref={cappingRef}
        label="Capping"
        value={values.capping}
        onChangeText={handleChange('capping')}
        keyboardType='number-pad'
        error={touched.capping && typeof errors.capping === 'string' ? errors.capping : undefined}
        returnKeyType="next"
        onSubmitEditing={() => {
          Keyboard.dismiss();
          setFocusedField('group');
        }}
        onFocus={() => setFocusedField(null)}
        onBlur={() => {
          // If we are not moving to group, clear it? Actually handled in onSubmitEditing
        }}
      />
      
      <CustomDropdown
        ref={groupDropdownRef}
        key={`group-dropdown-${dropdownProps.dropdownValue || 'empty'}`}
        label="Group"
        open={dropdownProps.openDropdown}
        value={dropdownProps.dropdownValue}
        items={dropdownProps.dropdownItems}
        setOpen={dropdownProps.setOpenDropdown}
        disabled={false}
        showClearButton={false}
        isFocused={focusedField === 'group'}
        onOpen={() => setFocusedField('group')}
        setValue={(val: any) => {
          console.log('Group dropdown setValue called with:', val);
          const selectedValue = typeof val === 'function' ? val() : val;
          dropdownProps.setDropdownValue(selectedValue);
          
          // Find the selected item to get both value and label
          const selectedItem = dropdownProps.dropdownItems.find((item: any) => item.value === selectedValue);
          
          // Store the VALUE (ID) in the form field
          if (typeof setFieldValue === 'function') {
            setFieldValue('group', selectedValue);
            console.log('Form field group set to:', selectedValue);
            
            // Also store the label if you want to use it elsewhere
            if (selectedItem) {
              setFieldValue('groupLabel', selectedItem.label);
              console.log('Form field groupLabel set to:', selectedItem.label);
            }
          }
        }}
        setItems={dropdownProps.setDropdownItems}
        error={errors.group}
        placeholder="Select Group"
        onChangeValue={(selectedValue: any) => {
          console.log('Group dropdown onChangeValue called with:', selectedValue);
          
          // Focus the next field after selection
          if (selectedValue) {
            setFocusedField(null); // Selection complete
            dhaniRateRef.current?.focus();
          }

          // Find the selected item to get the label
          const selectedItem = dropdownProps.dropdownItems.find((item: any) => item.value === selectedValue);
          
          if (selectedItem) {
            console.log('Selected group:', {
              value: selectedValue,
              label: selectedItem.label
            });
          }
        }}
      />

      {/* Display selected group information */}
   

    </>
  );
};