import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../assets/colors";
import { scale } from "react-native-size-matters";

export const ModalHeader = ({ title, onClose }:any) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  }}>
    <Text style={{ fontSize: scale(14), fontWeight: 'bold', color: COLORS.BLACK }}>
      {title}
    </Text>
    <TouchableOpacity onPress={onClose}>
      <Text style={{ fontSize: 24, color: COLORS.BLACK }}>×</Text>
    </TouchableOpacity>
  </View>
);