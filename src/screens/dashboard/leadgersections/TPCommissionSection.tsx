import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../assets/colors";
import { TPCommissionTable } from "../Leadgertables/TPCommissionTable";

export const TPCommissionSection = ({ 
  values, 
  tpCommission, 
  formLogic, 
  dropdownItemsParty, 
  setDropdownValueParty 
}:any) => {
  const handleTPCommissionClick = () => {
    if (!formLogic.validateTPCommissionAccess()) return;
    
    tpCommission.setIsTPModalOpen(true);
    tpCommission.setTpModalData({ third_party_commission_userid: '', third_party_commission_dhai: '', third_party_commission_harup: '' });
    setDropdownValueParty(null);
    formLogic.setEditingTPIndex(-1);
  };
console.log(values,"values.tpCommissionsvalues.tpCommissions")
  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: COLORS.BLACK }}>
        TP Commission
      </Text>
 
      <TouchableOpacity
        style={{
          backgroundColor: COLORS.BLACK,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 8,
          alignItems: 'center',
          marginVertical: 12,
        }}
        onPress={handleTPCommissionClick}
      >
        
        <Text style={{ color: COLORS.WHITE, fontWeight: 'bold' }}>
          Add TP-Commission
        </Text>
      </TouchableOpacity>

      {values.tpCommissions.length > 0 && (
        <TPCommissionTable 
          tpCommissions={values.tpCommissions}
          onEdit={(index:any) => tpCommission.handleEditTPCommission(index, dropdownItemsParty, setDropdownValueParty)}
          onDelete={tpCommission.handleDeleteTPCommission}
        />
      )}
    </View>
  );
};