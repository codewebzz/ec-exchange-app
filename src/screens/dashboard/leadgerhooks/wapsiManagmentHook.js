import { useState } from "react";
import { Alert } from "react-native";

export const useTPWapsi = (values, setFieldValue, editingTPWapsiIndex, setEditingTPWapsiIndex) => {
  const [tpWapsiModalData, setTpWapsiModalData] = useState({ partyName: '', partyId: '', wapsiAmount: '' });
  const [isTPWapsiModalOpen, setIsTPWapsiModalOpen] = useState(false);

  const calculateRemainingWapsi = () => {
    const totalWapsi = parseFloat(values.wapsi) || 0;
    const usedWapsi = values?.tpWapsi?.reduce((sum, tp, idx) => {
      if (idx !== editingTPWapsiIndex) {
        return sum + (parseFloat(tp.wapsiAmount) || 0);
      }
      return sum;
    }, 0) || 0;
    return totalWapsi - usedWapsi;
  };

  const handleAddTPWapsi = () => {
    if (!tpWapsiModalData.partyName || !tpWapsiModalData.wapsiAmount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const totalWapsi = parseFloat(values.wapsi) || 0;
    const newWapsiAmount = parseFloat(tpWapsiModalData.wapsiAmount) || 0;
    const existingWapsiTotal = values?.tpWapsi?.reduce((sum, tpWapsi, index) => {
      if (index !== editingTPWapsiIndex) {
        return sum + (parseFloat(tpWapsi.wapsiAmount) || 0);
      }
      return sum;
    }, 0) || 0;

    const totalTPWapsi = existingWapsiTotal + newWapsiAmount;
    if (totalTPWapsi > totalWapsi) {
      Alert.alert('Error', `Total TP-Wapsi (${totalTPWapsi}) cannot exceed Wapsi amount (${totalWapsi})`);
      return;
    }

    const newTPWapsi = {
      partyName: tpWapsiModalData.partyName,
      partyId: tpWapsiModalData.partyId,
      wapsiAmount: tpWapsiModalData.wapsiAmount,
    };

    let updatedTPWapsi = [...(values?.tpWapsi || [])];

    if (editingTPWapsiIndex >= 0) {
      updatedTPWapsi[editingTPWapsiIndex] = newTPWapsi;
    } else {
      updatedTPWapsi.push(newTPWapsi);
    }

    setFieldValue('tpWapsi', updatedTPWapsi);
    closeModal();
  };

  const handleEditTPWapsi = (index, dropdownItemsWapsiParty, setDropdownValueWapsiParty) => {
    const tpWapsi = values.tpWapsi[index];
    setTpWapsiModalData({
      partyName: tpWapsi.partyName,
      partyId: tpWapsi.partyId,
      wapsiAmount: tpWapsi.wapsiAmount,
    });

    const partyItem = dropdownItemsWapsiParty.find(item => item.label === tpWapsi.partyName);
    if (partyItem) {
      setDropdownValueWapsiParty(partyItem.value);
    }

    setEditingTPWapsiIndex(index);
    setIsTPWapsiModalOpen(true);
  };

  const handleDeleteTPWapsi = (index) => {
    const updatedTPWapsi = values.tpWapsi.filter((_, i) => i !== index);
    setFieldValue('tpWapsi', updatedTPWapsi);
  };

  const closeModal = () => {
    setIsTPWapsiModalOpen(false);
    setTpWapsiModalData({ partyName: '', partyId: '', wapsiAmount: '' });
    setEditingTPWapsiIndex(-1);
  };

  return {
    tpWapsiModalData,
    setTpWapsiModalData,
    isTPWapsiModalOpen,
    setIsTPWapsiModalOpen,
    handleAddTPWapsi,
    handleEditTPWapsi,
    handleDeleteTPWapsi,
    calculateRemainingWapsi,
    closeModal,
  };
};
