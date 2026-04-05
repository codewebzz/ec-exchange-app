import { Text, TouchableOpacity, View } from "react-native";

export const PattiInModalTable = ({ tpPatti, onDelete }:any) => (
  <View style={{
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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
        color: '#fff',
        fontWeight: 'bold',
      }}>
        Party Name
      </Text>
      <Text style={{
        flex: 1,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
      }}>
        Percentage
      </Text>
      <Text style={{
        flex: 1,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
      }}>
        Action
      </Text>
    </View>

    {/* Data Rows */}
    {tpPatti.map((patti:any, index:any) => (
      <View key={index} style={{
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: index < tpPatti.length - 1 ? 1 : 0,
        borderBottomColor: '#e0e0e0',
      }}>
        <Text style={{ flex: 2, color: '#333' }}>
          {patti.partyName}
        </Text>
        <Text style={{
          flex: 1,
          color: '#333',
          textAlign: 'center',
        }}>
          {patti.percentage}%
        </Text>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <TouchableOpacity
            onPress={() => onDelete(index)}
            style={{ marginRight: 8 }}
          >
            <Text style={{ color: '#dc3545' }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </View>
);
