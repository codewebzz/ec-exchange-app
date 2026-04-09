import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomTextInput from '../../components/CustomTextInput';
import { scale } from 'react-native-size-matters';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../assets/colors';
import APIService from '../services/APIService';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { setAuthToken } from '../../redux/reducers/authToken';
const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});
interface LoginResponse {
  success: boolean;
  access_token: string
}
const Login = ({ navigation }: any) => {

  const dispatch = useDispatch()
  const handleLogin = async (values: any, setSubmitting: (isSubmitting: boolean) => void) => {
    try {
      const token = APIService.LoginUser({
        username: values?.username?.trim(),
        password: values?.password,
      });
      const result = await token;
      if (result?.success) {
        dispatch(setAuthToken(result?.access_token || result?.refresh_token || ''))

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Login Successfully',
          position: 'bottom',
        });
        // Navigation is controlled by RootStack via token presence
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please Enter Correct Login And Password',
          position: 'bottom',
        });
      }
    } catch (e: any) {
      if (e.response) {
        // console.error('Login failed:', e.response.data?.message);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: e.response.data?.message,
          position: 'bottom',
        });
      } else {
        console.error('Error:', e.message);
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>We're glad to see you again</Text>

        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(true);
            handleLogin(values, setSubmitting);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, submitCount, isSubmitting }) => {
            const passwordRef = React.useRef<any>(null);
            return (
              <>
                <CustomTextInput
                  label='User Name'
                  style={styles.input}
                  placeholder="Enter username"
                  onChangeText={handleChange('username')}
                  onBlur={handleBlur('username')}
                  value={values.username}
                  error={submitCount > 0 ? errors.username : ''}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
                <CustomTextInput
                  ref={passwordRef}
                  label='Password'
                  style={styles.input}
                  placeholder="Enter password"
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  error={submitCount > 0 ? errors.password : ''}
                  returnKeyType="done"
                  onSubmitEditing={() => handleSubmit()}
                />

                <CustomButton
                  title={isSubmitting ? 'Signing in...' : 'Submit'}
                  onPress={() => handleSubmit()}
                  backgroundColor={COLORS.BUTTONBG}
                  textColor={COLORS.WHITE}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                />
              </>
            );
          }}
        </Formik>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: scale(30),
    width: '85%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1b1f3b',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#7d8ca3',
    marginBottom: 24,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#344055',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    fontSize: 16,
    color: COLORS.BLACK
  },
  button: {
    backgroundColor: '#0d122d',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    fontSize: 12,
  },
});

export default Login;
