import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../assets/colors";

export const PattiTable = ({ 
  tpPatti, 
  onEdit, 
  onDelete, 
  calculateRemainingPercentage,
  allLedgers = [] // Pass all ledgers to find real names
}:any) => {
  // Function to get real name from patti_userid
  const getRealNameFromUserId = (userId: number) => {
    const ledger = allLedgers.find((ledger: any) => ledger.id === userId);
    return ledger ? ledger.real_name : `User ${userId}`;
  };

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
      backgroundColor: '#2c3e50',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      marginBottom: 8,
    }}>
      <Text style={{
        flex: 2,
        color: COLORS.WHITE,
        fontWeight: 'bold',
      }}>
        Party Name
      </Text>
      <Text style={{
        flex: 1,
        color: COLORS.WHITE,
        fontWeight: 'bold',
        textAlign: 'center',
      }}>
        Percentage
      </Text>
      <Text style={{
        flex: 1,
        color: COLORS.WHITE,
        fontWeight: 'bold',
        textAlign: 'center',
      }}>
        Action
      </Text>
    </View>

    {/* Data Rows */}
    {console.log(tpPatti,"[tpPatti][tpPatti][tpPatti][][][][]")}
    {tpPatti.map((patti:any, index:any) => (
      <View key={index} style={{
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: index < tpPatti.length - 1 ? 1 : 0,
        borderBottomColor: '#e0e0e0',
      }}>
        <Text style={{ flex: 2, color: COLORS.BLACK }}>
          {patti.partyName || getRealNameFromUserId(patti.patti_userid)}
        </Text>
        <Text style={{
          flex: 1,
          color: COLORS.BLACK,
          textAlign: 'center',
        }}>
          {patti.percentage || patti.patti_percentage}%
        </Text>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          {/* <TouchableOpacity
            onPress={() => onEdit(index)}
            style={{ marginRight: 8 }}
          >
            <Text style={{ color: '#007bff' }}>✏️</Text>
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => onDelete(index)}>
            <Text style={{ color: 'red' }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))}

    {/* Summary Row */}
    <View style={{
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: '#f8f9fa',
      borderRadius: 4,
      marginTop: 8,
    }}>
      <Text style={{
        flex: 2,
        fontWeight: 'bold',
        color: COLORS.BLACK,
      }}>
        Total Used: {tpPatti.reduce(
          (sum:any, patti:any) => sum + (parseFloat(patti.percentage || patti.patti_percentage) || 0), 0
        )}%
      </Text>
      <Text style={{
        flex: 2,
        fontWeight: 'bold',
        color: COLORS.BLACK,
        textAlign: 'right',
      }}>
        Remaining: {calculateRemainingPercentage()}%
      </Text>
    </View>
  </View>
  );
};
