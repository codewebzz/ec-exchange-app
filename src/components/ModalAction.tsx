import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../assets/colors";

export const ModalActions = ({ onClose, onAdd, editingIndex }:any) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  }}>
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: '#6c757d',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
      }}
      onPress={onClose}
    >
      <Text style={{ color: COLORS.BGFILESCOLOR, fontWeight: 'bold' }}>
        Close
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: COLORS.WHITE,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
      }}
      onPress={onAdd}
    >
      <Text style={{ color: COLORS.BLACK, fontWeight: 'bold' }}>
        {editingIndex >= 0 ? 'Update' : 'Add'}
      </Text>
    </TouchableOpacity>
  </View>
);
