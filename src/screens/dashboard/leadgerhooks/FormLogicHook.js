import { useState } from 'react';
import { Alert } from 'react-native';

export const useFormLogic = (values, setFieldValue) => {
  const [editingTPIndex, setEditingTPIndex] = useState(-1);
  const [editingTPWapsiIndex, setEditingTPWapsiIndex] = useState(-1);
  const [editingPattiIndex, setEditingPattiIndex] = useState(-1);

  const handleDhaniRateChange = (value, handleChange) => {
    handleChange('dhaniRate')(value);
    
    const dhaniRateNum = parseFloat(value);
    if (!isNaN(dhaniRateNum) && dhaniRateNum >= 0 && dhaniRateNum <= 100) {
      const calculatedCommission = 100 - dhaniRateNum;
      setFieldValue('commission', calculatedCommission.toString());
    } else if (value === '') {
      setFieldValue('commission', '');
    }
  };

  const handleHarupRateChange = (value) => {
    setFieldValue('harupRate', value);
    
    if (value.trim() === '') {
      setFieldValue('harupCommission', '');
      return;
    }

    const harupRateNum = parseFloat(value);
    if (!isNaN(harupRateNum) && harupRateNum >= 0) {
      const calculatedCommission = 100 - harupRateNum * 10;
      const finalCommission = Math.max(0, calculatedCommission);
      setFieldValue('harupCommission', finalCommission.toString());
    }
  };

  const validateTPCommissionAccess = () => {
    const dhaniRate = parseFloat(values.dhaniRate) || 0;
    const harupRate = parseFloat(values.harupRate) || 0;

    if (!values.dhaniRate || dhaniRate <= 0) {
      Alert.alert('Error', 'Please enter Dhani rate first before adding TP Commission');
      return false;
    }

    // if (!values.harupRate || harupRate <= 0) {
    //   Alert.alert('Error', 'Please enter Harup rate first before adding TP Commission');
    //   return false;
    // }

    return true;
  };

  const validateWapsiAccess = () => {
    const wapsiAmount = parseFloat(values.wapsi) || 0;

    if (!values.wapsi || wapsiAmount <= 0) {
      Alert.alert('Error', 'Please enter Wapsi amount first before adding TP-Wapsi');
      return false;
    }

    return true;
  };

  return {
    editingTPIndex,
    setEditingTPIndex,
    editingTPWapsiIndex,
    setEditingTPWapsiIndex,
    editingPattiIndex,
    setEditingPattiIndex,
    handleDhaniRateChange,
    handleHarupRateChange,
    validateTPCommissionAccess,
    validateWapsiAccess,
  };
};