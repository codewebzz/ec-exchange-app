import { useState } from "react";
import { Alert } from "react-native";

export const useTPCommission = (values, setFieldValue, editingTPIndex) => {
  const [tpModalData, setTpModalData] = useState({ partyName: '', partyId: '', dComm: '', hComm: '' });
  const [isTPModalOpen, setIsTPModalOpen] = useState(false);

  const handleAddTPCommission = () => {
    if (!tpModalData.partyName || !tpModalData.dComm ) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const dhaniRate = parseFloat(values.dhaniRate) || 0;
    const harupCommission = parseFloat(values.harupCommission) || 0;
    const dComm = parseFloat(tpModalData.dComm) || 0;
    const hComm = parseFloat(tpModalData.hComm) || 0;

    // Calculate existing totals
    let existingDCommTotal = 0;
    let existingHCommTotal = 0;

    values.tpCommissions.forEach((tpComm, index) => {
      if (index !== editingTPIndex) {
        existingDCommTotal += parseFloat(tpComm.dComm) || 0;
        existingHCommTotal += parseFloat(tpComm.hComm) || 0;
      }
    });

    // Validation
    const totalDComm = existingDCommTotal + dComm;
    if (totalDComm > dhaniRate) {
      Alert.alert('Error', `Total D-Comm (${totalDComm}) cannot exceed Dhani rate (${dhaniRate})`);
      return;
    }

    const totalHComm = existingHCommTotal + hComm;
    // if (totalHComm > harupCommission) {
    //   Alert.alert('Error', `Total H-Comm (${totalHComm}) cannot exceed Harup Commission (${harupCommission})`);
    //   return;
    // }

    const newTPCommission = {
      partyName: tpModalData.partyName,
      partyId: tpModalData.partyId,
      dComm: tpModalData.dComm,
      hComm: tpModalData.hComm,
    };

    let updatedTPCommissions = [...values.tpCommissions];

    if (editingTPIndex >= 0) {
      updatedTPCommissions[editingTPIndex] = newTPCommission;
    } else {
      updatedTPCommissions.push(newTPCommission);
    }

    setFieldValue('tpCommissions', updatedTPCommissions);
    closeModal();
  };

  const handleEditTPCommission = (index, dropdownItemsParty, setDropdownValueParty) => {
    const tpCommission = values.tpCommissions[index];
    setTpModalData({
      partyName: tpCommission.partyName,
      partyId: tpCommission.partyId,
      dComm: tpCommission.dComm,
      hComm: tpCommission.hComm,
    });

    const partyItem = dropdownItemsParty.find(item => item.label === tpCommission.partyName);
    if (partyItem) {
      setDropdownValueParty(partyItem.value);
    }

    setIsTPModalOpen(true);
  };

  const handleDeleteTPCommission = (index) => {
    const updatedTPCommissions = values.tpCommissions.filter((_, i) => i !== index);
    setFieldValue('tpCommissions', updatedTPCommissions);
  };

  const closeModal = () => {
    setIsTPModalOpen(false);
    setTpModalData({ partyName: '', partyId: '', dComm: '', hComm: '' });
  };

  return {
    tpModalData,
    setTpModalData,
    isTPModalOpen,
    setIsTPModalOpen,
    handleAddTPCommission,
    handleEditTPCommission,
    handleDeleteTPCommission,
    closeModal,
  };
};
