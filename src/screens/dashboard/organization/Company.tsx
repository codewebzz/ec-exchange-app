import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Keyboard,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DeclareStatusCard from '../../../components/DeclareStatusCard';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomTextInput from '../../../components/CustomTextInput';
import CustomButton from '../../../components/CustomButton';
import { COLORS } from '../../../assets/colors';
import { scale } from 'react-native-size-matters';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../components/ScreenHeader';
import { addCompany } from '../../../redux/reducers/companySlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import APIService from '../../services/APIService';
import Toast from 'react-native-toast-message';
import GradientBackground from '../../../components/GradientBackground';
const AddCompanySchema = Yup.object().shape({
  companyName: Yup.string().required('Company Name is required'),
  printName: Yup.string().required('Print Name is required'),
  shortName: Yup.string().required('Short Name is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  address: Yup.string().required('Address is required'),
  pincode: Yup.string()
    .required('Pincode is required')
    .matches(/^\d{6}$/, 'Pincode must be 6 digits'),
  pan: Yup.string().required('PAN is required'),
  mobile: Yup.string()
    .required('Mobile is required')
    .matches(/^\d{10}$/, 'Mobile must be 10 digits'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  username: Yup.string().required('User Name is required'),
  password: Yup.string().required('Password is required'),
});

const Company = ({ navigation }: any) => {
  const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  console.log(selectedCompany,"selectedCompanyselectedCompany")
  const company = useSelector((state: any) => state?.company);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
 

  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const handleSheetChange = (index: number) => {
    Keyboard.dismiss();
    if (index === -1) {
      setIsOpenBottomSheet(false);
    } else {
      setIsOpenBottomSheet(true);
    }
  };
  const snapPoints = React.useMemo(() => ['100%'], []);
  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={1}
        appearsOnIndex={-1}
      />
    ),
    [],
  );
  const handleClosePress = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
    setIsOpenBottomSheet(false);
    setIsEditing(false)
  };
  const [getData, setData] = React.useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');
  React.useEffect(() => {
    getCompany();
  }, []);
  const handleCreateCompany = async (values: any) => {
    try {
      const payload = {
        company_name:values?.companyName,
        print_name: values?.printName,
        short_name: values?.shortName,
        country: values?.country,
        state: values?.state,
        address: values?.address,
        pincode: values?.pincode,
        pan: values?.pan,
        mobile: values?.mobile,
        mail: values?.email,
        username: values?.username,
        password: values?.password,
      };
      console.log('Company payload:', payload);
      const response =isEditing?await APIService.UpdateCompany(payload,selectedCompany?.id) :await APIService.CreateCompany(payload);
      if (response?.success) {
        setIsOpenBottomSheet(false);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message,
          position: 'bottom',
        });
        getCompany();
      }
    } catch (error) {
      console.error('Create shift failed', error);
    }
  };
  const getCompany = async () => {
    try {
      const response = await APIService.GetCompany();
      if (response?.success) {
        setData(response?.data);
      }
    } catch (error) {
      console.error('Shift fetch failed', error);
    }
  };
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await getCompany();
    } finally {
      setRefreshing(false);
    }
  };
   const handleFormSubmit = (values: any, { resetForm }: any) => {
    
      handleCreateCompany(values);
   
  };
   const handleEditShift = (item: any) => {
    setSelectedCompany(item);
    setIsEditing(true);
    setIsOpenBottomSheet(true);
  };
  const handleToggleActive = async (item: any) => {
  console.log(item,"[][][][][][]")
  try {
    const userId = item?.id;
    const isCurrentlyActive = item?.is_active;

    if (!userId) return;

    const response = isCurrentlyActive
      ? await APIService.ToggleCompanyDeActive(userId)
      : await APIService.ToggleCompanyActive(userId);

    if (response?.success) {
       getCompany();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response?.message || `User ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully`,
        position: 'bottom',
      });

     
    }
  } catch (error) {
    console.error('Toggle active/inactive failed', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Something went wrong while updating status.',
      position: 'bottom',
    });
  }
};
  return (
    <GestureHandlerRootView style={{flex:1}}>
         <GradientBackground colors={[ "#fdf0d0","#e0efea"]} locations={[0,30]}>
      <SafeAreaView
        style={style.safeAreaContainer}
        edges={['top', 'left', 'right']}
      >
        <ScreenHeader
          title={'Company'}
          navigation={navigation}
          hideBackButton={true} showDrawerButton={true}
        />
        <View style={style.container}>
          <View
            style={{
              marginVertical: scale(10),
              marginHorizontal: scale(15),
              alignItems: 'center',
              flexDirection: 'row',
              gap: scale(10),
            }}
          >
            <View style={{ flex: 1 }}>
              <CustomTextInput
                placeholder="Search..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor={'#999'}
              />
            </View>
            <View style={{ width: scale(10) }} />
            <View style={{ width: '40%' }}>
              <CustomButton
                textColor={COLORS.WHITE}
                title="+ Add (F2)"
                onPress={() => {
                  setIsOpenBottomSheet(true);
                  setSelectedCompany(null);
                  setIsEditing(false)
                }}
              />
            </View>
          </View>
          <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <DeclareStatusCard
              data={getData.filter((item: any) => {
                if (!searchText?.trim()) return true;
                const terms = searchText.toLowerCase().split(/\s+/).filter(Boolean);
                const haystack = `${item?.company_name || ''} ${item?.print_name || ''} ${item?.short_name || ''} ${item?.country || ''} ${item?.state || ''} ${item?.mobile || ''} ${item?.mail || ''} ${item?.username || ''}`.toLowerCase();
                return terms.every((t: string) => haystack.includes(t));
              })}
              config={[
                { key: 'company_name', label: 'CompanyName' },
                { key: 'print_name', label: 'Print Name' },
                { key: 'short_name', label: 'Short Name' },
                { key: 'country', label: 'Country' },
                { key: 'state', label: 'State' },
                { key: 'mobile', label: 'Mobile' },
                { key: 'mail', label: 'Email' },
                { key: 'username', label: 'Username' },
                { key: 'created_by', label: 'Added By' },
                { key: 'updated_by', label: 'Updated By' },
              ]}
              isButtonOne={false}
              actionOneLabel="Is Active"
              actionTwoLabel="Action"
                //  onActionOne={handleToggleActive}
             onActionTwo={(item: any) => {
                handleEditShift(item);
              }}
              refreshing={refreshing}
              onRefresh={getData && getData.length > 0 ? onRefresh : undefined}
            />
          </ScrollView>
          {isOpenBottomSheet && (
            <BottomSheet
              backgroundStyle={{ backgroundColor: COLORS.BGFILESCOLOR }}
              ref={bottomSheetRef}
              style={{ borderWidth: 1, borderRadius: scale(10) }}
              index={0}
              snapPoints={snapPoints}
              enableDynamicSizing={false}
              onChange={handleSheetChange}
              backdropComponent={renderBackdrop}
              enablePanDownToClose={true}
              onClose={() => {
                setIsOpenBottomSheet(false);
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: scale(20),
                  paddingBottom: scale(10),
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: scale(16),
                      fontWeight: '600',
                      color: COLORS.BLACK,
                      marginEnd: scale(5),
                    }}
                  >
                    Add Company |
                    <Text
                      style={{
                        fontSize: scale(12),
                        fontWeight: '500',
                        color: COLORS.BLACK,
                        marginEnd: scale(5),
                      }}
                    >
                      Manage your companies
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClosePress}>
                  <Icon name="cancel" size={scale(20)} />
                </TouchableOpacity>
              </View>
              <BottomSheetScrollView
                style={{
                  padding: 16,
                  backgroundColor: COLORS.BGFILESCOLOR,
                  flex: 1,
                }}
                keyboardShouldPersistTaps="handled"
              >
                <Formik
                  initialValues={{
                    companyName: selectedCompany?.company_name || '',
                    printName: selectedCompany?.print_name || '',
                    shortName: selectedCompany?.short_name || '',
                    country: selectedCompany?.country || '',
                    state: selectedCompany?.state || '',
                    pincode: selectedCompany?.pincode || '',
                    pan: selectedCompany?.pan || '',
                    mobile: selectedCompany?.mobile || '',
                    email: selectedCompany?.mail || '',
                    username: selectedCompany?.username || '',
                    password: '',
                    address:selectedCompany?.address || ''
                  }}
                  validationSchema={AddCompanySchema}
                   onSubmit={handleFormSubmit}
                >
                  {({
                    handleChange,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                    setFieldValue,
                  }) => (
                    <View style={{ paddingVertical: scale(20) }}>
                      <CustomTextInput
                        label="Company Name"
                        value={values.companyName}
                        onChangeText={handleChange('companyName')}
                        error={
                          typeof errors.companyName === 'string'
                            ? errors.companyName
                            : undefined
                        }
                      />
                      <View style={style.flexDoubleColumb}>
                        <View style={style.flexSingleColumb}>
                          <CustomTextInput
                            label="Print Name"
                            value={values.printName}
                            onChangeText={handleChange('printName')}
                            error={
                              typeof errors.printName === 'string'
                                ? errors.printName
                                : undefined
                            }
                          />
                        </View>
                        <View style={style.flexSingleColumb}>
                          <CustomTextInput
                            label="Short Name"
                            value={values.shortName}
                            onChangeText={handleChange('shortName')}
                            error={
                              typeof errors.shortName === 'string'
                                ? errors.shortName
                                : undefined
                            }
                          />
                        </View>
                      </View>
                      <View style={style.flexDoubleColumb}>
                        <View style={style.flexSingleColumb}>
                          <CustomTextInput
                            label="Country"
                            value={values.country}
                            onChangeText={handleChange('country')}
                            error={
                              typeof errors.country === 'string'
                                ? errors.country
                                : undefined
                            }
                          />
                        </View>
                        <View style={style.flexSingleColumb}>
                          <CustomTextInput
                            label="State"
                            value={values.state}
                            onChangeText={handleChange('state')}
                            error={
                              typeof errors.state === 'string'
                                ? errors.state
                                : undefined
                            }
                          />
                        </View>
                      </View>
                        <CustomTextInput
                            label="Address"
                            value={values.address}
                            onChangeText={handleChange('address')}
                            error={
                              typeof errors.address === 'string'
                                ? errors.address
                                : undefined
                            }
                        />
                      <View style={style.flexDoubleColumb}>
                        <View style={style.flexSingleColumb}>
                          <CustomTextInput
                            label="PinCode"
                            value={values.pincode}
                            onChangeText={handleChange('pincode')}
                            error={
                              typeof errors.pincode === 'string'
                                ? errors.pincode
                                : undefined
                            }
                          />
                        </View>
                        <View style={style.flexSingleColumb}>
                          <CustomTextInput
                            label="PAN"
                            value={values.pan}
                            onChangeText={handleChange('pan')}
                            error={
                              typeof errors.pan === 'string'
                                ? errors.pan
                                : undefined
                            }
                          />
                        </View>
                      </View>

                      <CustomTextInput
                        label="Mobile"
                        value={values.mobile}
                        onChangeText={handleChange('mobile')}
                        error={
                          typeof errors.mobile === 'string'
                            ? errors.mobile
                            : undefined
                        }
                        keyboardType='number-pad'
                        maxLength={10}
                      />
                      <CustomTextInput
                        label="Email"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        error={
                          typeof errors.email === 'string'
                            ? errors.email
                            : undefined
                        }
                      />
                      <View style={style.flexDoubleColumb}>
                        <View style={style.flexSingleColumb}>
                          <CustomTextInput
                            label="User Name"
                            value={values.username}
                            onChangeText={handleChange('username')}
                            error={
                              typeof errors.username === 'string'
                                ? errors.username
                                : undefined
                            }
                          />
                        </View>
                        <View style={style.flexSingleColumb}>
                          <CustomTextInput
                            label="Password"
                            value={values.password}
                            onChangeText={handleChange('password')}
                            error={
                              typeof errors.password === 'string'
                                ? errors.password
                                : undefined
                            }
                          />
                        </View>
                      </View>

                      <View style={{ marginVertical: scale(10) }}>
                        <CustomButton
                          title="Save"
                          onPress={() => {
                            handleSubmit();
                          }}
                          textColor={COLORS.WHITE}
                        />
                      </View>
                    </View>
                  )}
                </Formik>
              </BottomSheetScrollView>
            </BottomSheet>
          )}
        </View>
      </SafeAreaView>
      </GradientBackground>
    </GestureHandlerRootView>
  );
};
const style = StyleSheet.create({
  flexSingleColumb: {
    width: '48%',
  },
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: '#fef7e5',
  },
  flexDoubleColumb: { flexDirection: 'row', justifyContent: 'space-between' },
  container: {
    flex: 1,
    // backgroundColor: COLORS.BGFILESCOLOR,
  },
});
export default Company;
