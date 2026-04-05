import { StyleSheet, View } from "react-native";
import CustomTextInput from "../../../components/CustomTextInput";
import { COLORS } from "../../../assets/colors";

export const RateCommissionFields = ({ values, errors, touched, handleChange, formLogic }:any) => {
  return (
    <>
      <View style={style.flexDoubleColumb}>
        <View style={style.flexSingleColumb}>
          <CustomTextInput
            label="Dhai rate"
            value={values.dhaniRate}
            onChangeText={(value) => formLogic.handleDhaniRateChange(value, handleChange)}
            error={touched.dhaniRate && typeof errors.dhaniRate === 'string' ? errors.dhaniRate : undefined}
            keyboardType='numeric'
          />
        </View>
        <View style={style.flexSingleColumb}>
          <CustomTextInput
            label="Commission"
            value={values.commission}
            onChangeText={handleChange('commission')}
            error={touched.commission && typeof errors.commission === 'string' ? errors.commission : undefined}
            keyboardType='numeric'
          />
        </View>
      </View>

      <View style={style.flexDoubleColumb}>
        <View style={style.flexSingleColumb}>
          <CustomTextInput
            label="Harup rate"
            value={values.harupRate}
            onChangeText={formLogic.handleHarupRateChange}
            error={touched.harupRate && typeof errors.harupRate === 'string' ? errors.harupRate : undefined}
            keyboardType='numeric'
          />
        </View>
        <View style={style.flexSingleColumb}>
          <CustomTextInput
            label="Commission"
            value={values.harupCommission}
            onChangeText={handleChange('harupCommission')}
            error={touched.harupCommission && typeof errors.harupCommission === 'string' ? errors.harupCommission : undefined}
            keyboardType='numeric'
          />
        </View>
      </View>
    </>
  );
};

const style = StyleSheet.create({
  flexSingleColumb: {
    width: '48%',
  },
  flexDoubleColumb: { flexDirection: 'row', justifyContent: 'space-between' },
  container: {
    flex: 1,
    backgroundColor: COLORS.BGFILESCOLOR,
  },
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fef7e5',
  },
});
