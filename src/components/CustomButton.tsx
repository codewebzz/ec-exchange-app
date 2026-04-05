import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle, ActivityIndicator, View } from "react-native";
import { COLORS } from "../assets/colors";
interface ButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?:boolean
  loading?: boolean
}
const CustomButton =({onPress,backgroundColor,style,textColor,textStyle,title,disabled,loading}:ButtonProps)=>{
    const isDisabled = disabled || loading;
    return(
<TouchableOpacity
        style={[
          styles.button,
          style,
          backgroundColor ? { backgroundColor } : undefined,
          isDisabled ? styles.buttonDisabled : undefined
        ]}
        activeOpacity={0.8}
        onPress={onPress}
        disabled={isDisabled}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={textColor || COLORS.WHITE} />
          </View>
        ) : (
          <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    backgroundColor:COLORS.BUTTONBG,
    minHeight: 40,
    paddingHorizontal: 12
  },
  buttonDisabled: {
    opacity: 0.7
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
export default CustomButton;