import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../assets/colors";
import { PattiTable } from "../Leadgertables/PattiTable";

export const PattiSection = ({ 
  values, 
  tpPatti, 
  formLogic,
  allLedgers = []
}:any) => {
  const handlePattiClick = () => {
    tpPatti.setIsPattiModalOpen(true);
    tpPatti.setPattiModalData({ partyName: '', percentage: '' });
    formLogic.setEditingPattiIndex(-1);
  };

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: COLORS.BLACK,
      }}>
        Patti
      </Text>
      
      <TouchableOpacity
        style={{
          backgroundColor: COLORS.BLACK,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 12,
        }}
        onPress={handlePattiClick}
      >
        <Text style={{
          color: COLORS.WHITE,
          fontWeight: 'bold',
        }}>
          Add Patti
        </Text>
      </TouchableOpacity>

      {/* Display existing Patti entries */}
      {values?.tpPatti?.length > 0 && (
        <PattiTable
          tpPatti={values.tpPatti}
          onEdit={tpPatti.handleEditPatti}
          onDelete={tpPatti.handleDeletePatti}
          calculateRemainingPercentage={tpPatti.calculateRemainingPercentage}
          allLedgers={allLedgers}
        />
      )}
    </View>
  );
};
