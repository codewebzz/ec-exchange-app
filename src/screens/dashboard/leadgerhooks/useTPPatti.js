import { useState } from "react";
import { Alert } from "react-native";

export const useTPPatti = (values, setFieldValue, editingPattiIndex, setEditingPattiIndex) => {
  const [pattiModalData, setPattiModalData] = useState({ partyName: '', partyId: '', percentage: '' });
  const [isPattiModalOpen, setIsPattiModalOpen] = useState(false);

  const calculateRemainingPercentage = () => {
    const usedPercentage = values?.tpPatti?.reduce((sum, patti, idx) => {
      if (idx !== editingPattiIndex) {
        return sum + (parseFloat(patti.percentage) || 0);
      }
      return sum;
    }, 0) || 0;
    return 80 - usedPercentage;
  };

const handleAddPatti = () => {
  if (!pattiModalData.partyName || !pattiModalData.percentage) {
    Alert.alert('Error', 'Please fill all fields');
    return;
  }

  const newPercentage = parseFloat(pattiModalData.percentage);
  if (isNaN(newPercentage)) {
    Alert.alert('Error', 'Please enter a valid number for percentage');
    return;
  }

  const existingPercentageTotal = values?.tpPatti?.reduce((sum, patti, index) => {
    if (index !== editingPattiIndex) {
      return sum + (parseFloat(patti.percentage) || 0);
    }
    return sum;
  }, 0) || 0;

  const totalPercentage = existingPercentageTotal + newPercentage;
  if (totalPercentage > 80) {
    Alert.alert('Error', `Total percentage (${totalPercentage}%) cannot exceed 80%`);
    return;
  }

  const newPatti = {
    partyName: pattiModalData.partyName,
    partyId: pattiModalData.partyId,
    percentage: pattiModalData.percentage,
  };

  let updatedPatti = [...(values?.tpPatti || [])];

  if (editingPattiIndex >= 0) {
    updatedPatti[editingPattiIndex] = newPatti;
  } else {
    updatedPatti.push(newPatti);
  }

  setFieldValue('tpPatti', updatedPatti);
  closeModal();
};

  const handleEditPatti = (index, dropdownItemsPattiParty, setDropdownValuePattiParty) => {
    const patti = values.tpPatti[index];
    setPattiModalData({
      partyName: patti.partyName,
      partyId: patti.partyId,
      percentage: patti.percentage,
    });

    const partyItem = dropdownItemsPattiParty.find(item => item.label === patti.partyName);
    if (partyItem) {
      setDropdownValuePattiParty(partyItem.value);
    }

    setEditingPattiIndex(index);
    setIsPattiModalOpen(true);
  };

  const handleDeletePatti = (index) => {
    const updatedPatti = values.tpPatti.filter((_, i) => i !== index);
    setFieldValue('tpPatti', updatedPatti);
  };

  const closeModal = () => {
    setIsPattiModalOpen(false);
    setPattiModalData({ partyName: '', partyId: '', percentage: '' });
    setEditingPattiIndex(-1);
  };

  return {
    pattiModalData,
    setPattiModalData,
    isPattiModalOpen,
    setIsPattiModalOpen,
    handleAddPatti,
    handleEditPatti,
    handleDeletePatti,
    calculateRemainingPercentage,
    closeModal,
  };
};