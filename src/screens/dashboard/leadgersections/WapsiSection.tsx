import { Text, TouchableOpacity, View } from "react-native";
import CustomTextInput from "../../../components/CustomTextInput";
import { COLORS } from "../../../assets/colors";
import { WapsiTable } from "../Leadgertables/WapsiTable";
import { scale } from "react-native-size-matters";

export const WapsiSection = ({ values, errors, touched, handleChange, tpWapsi, formLogic }:any) => {
  const handleTPWapsiClick = () => {
    if (!formLogic.validateWapsiAccess()) return;
    
    tpWapsi.setIsTPWapsiModalOpen(true);
    tpWapsi.setTpWapsiModalData({ partyName: '', wapsiAmount: '' });
    formLogic.setEditingTPWapsiIndex(-1);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
        <View style={{ width: '60%' }}>
          <CustomTextInput
            label="Wapsi"
            value={values.wapsi}
            onChangeText={handleChange('wapsi')}
            keyboardType="numeric"
            error={
              touched.wapsi && typeof errors.wapsi === 'string'
                ? errors.wapsi
                : undefined
            }
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: COLORS.BLACK,
            paddingVertical: scale(15),
            paddingHorizontal: 20,
            borderRadius: 8,
            alignItems: 'center',
            marginVertical: 12,
            width: '35%',
            top:scale(7)
          }}
          onPress={handleTPWapsiClick}
        >
          <Text style={{ color: COLORS.WHITE, fontWeight: 'bold',fontSize:12}}>
            Add TP-Wapsi
          </Text>
        </TouchableOpacity>
      </View>

      {values?.tpWapsi?.length > 0 && (
        <WapsiTable
          tpWapsi={values.tpWapsi}
          onEdit={tpWapsi.handleEditTPWapsi}
          onDelete={tpWapsi.handleDeleteTPWapsi}
          remainingWapsi={tpWapsi.calculateRemainingWapsi()}
        />
      )}
    </View>
  );
};
