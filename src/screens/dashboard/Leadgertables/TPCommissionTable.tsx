import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../assets/colors";

export const TPCommissionTable = ({ tpCommissions, onEdit, onDelete }:any) => {
  return (
    <View style={{
      backgroundColor: COLORS.WHITE,
      borderRadius: 8,
      padding: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: COLORS.WHITE,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginBottom: 8,
      }}>
        <Text style={{ flex: 2, color: COLORS.BLACK, fontWeight: 'bold' }}>Party Name</Text>
        <Text style={{ flex: 1, color: COLORS.BLACK, fontWeight: 'bold', textAlign: 'center' }}>D-Comm</Text>
        <Text style={{ flex: 1, color: COLORS.BLACK, fontWeight: 'bold', textAlign: 'center' }}>H-Comm</Text>
        <Text style={{ flex: 1, color: COLORS.BLACK, fontWeight: 'bold', textAlign: 'center' }}>Action</Text>
      </View>

      {/* Data Rows */}
      {console.log(tpCommissions,"[rtbbndsbds]")}
      {tpCommissions.map((tpComm:any, index:any) => (
        
        <View key={index} style={{
          flexDirection: 'row',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderBottomWidth: index < tpCommissions.length - 1 ? 1 : 0,
          borderBottomColor: '#e0e0e0',
        }}>
         
          <Text style={{ flex: 2, color: COLORS.BLACK }}>{tpComm.partyName}</Text>
          <Text style={{ flex: 1, color: COLORS.BLACK, textAlign: 'center' }}>{tpComm.dComm}</Text>
          <Text style={{ flex: 1, color: COLORS.BLACK, textAlign: 'center' }}>{tpComm.hComm}</Text>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
            {/* <TouchableOpacity onPress={() => onEdit(index)} style={{ marginRight: 8 }}>
              <Text style={{ color: COLORS.WHITE }}>✏️</Text>
            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => onDelete(index)}>
              <Text style={{ color: 'red' }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};
