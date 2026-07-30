import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';
import Icons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Yup from 'yup';
import { COLORS } from '../../../assets/colors';
import CustomButton from '../../../components/CustomButton';
import CustomDateTimePicker from '../../../components/CustomDatePicker';
import CustomDropdown from '../../../components/CustomDropdown';
import CustomTextInput from '../../../components/CustomTextInput';
import GradientBackground from '../../../components/GradientBackground';
import { PermissionGuard } from '../../../components/PermissionGuard';
import ScreenHeader from '../../../components/ScreenHeader';
import TableGrid from '../../../components/TableGridView';
import { PERMISSIONS } from '../../../helper/permissions';
import { usePermissions } from '../../../hooks/usePermissions';
import useSearchBar from '../../../hooks/useSearchBar';
import APIService from '../../services/APIService';


const AddLimiteVoucherSchema = Yup.object().shape({
    date: Yup.string().required('Please Select Date'),
    partyAndLimit: Yup.string().required('Party & Limit is required'),
    lenaAndDena: Yup.string().required('Lena/Dena is required'),
    amount: Yup.string().required('Amount is required'),
    oppositeParty: Yup.string().required('Opposite Party is required'),
    remark: Yup.string().optional(),
});

const LimitVoucher = ({ navigation }: any) => {
    const { hasPermission } = usePermissions();
    const [isOpenBottomSheet, setIsOpenBottomSheet] = React.useState(false);
    const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = React.useState(true);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [openDropdown, setOpenDropdown] = React.useState(false);
    const [dropdownValue, setDropdownValue] = React.useState(null);
    const [dropdownItems, setDropdownItems] = React.useState([
        { label: 'Credit', value: '1' },
        { label: 'Debit', value: '2' },
    ]);
    const [openPartyDropdown, setOpenPartyDropdown] = React.useState(false);
    const [PartydropdownValue, setPartyDropdownValue] = React.useState(null);
    const [PartydropdownItems, setPartyDropdownItems] = React.useState([
        // { label: 'Ankit-Leadger-Fanter', value: '1' },
        // { label: 'Bhasker-Leadger-CashAgent', value: '2' },
        // { label: 'Bhasker-Leadger-Fanter', value: '3' },
        // { label: 'Jitin-Leadger-Ind Exp', value: '4' },
        // { label: 'Nitesh-Leadger-CashAgent', value: '5' },
    ]);
    const [openOppositPartyDropdown, setOpenOppositPartyDropdown] = React.useState(false);
    const [OppositPartydropdownValue, setOppositPartyDropdownValue] = React.useState(null);
    const [OppositPartydropdownItems, setOppositPartyDropdownItems] = React.useState([
        // { label: 'Ankit-Leadger-Fanter', value: '1' },
        // { label: 'Bhasker-Leadger-CashAgent', value: '2' },
    ]);
    const [filterFromDate, setFilterFromDate] = useState<Date>(new Date());
    const [filterToDate, setFilterToDate] = useState<Date>(new Date());
    const [limitData, setLimitData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const filterBottomSheetRef = React.useRef<BottomSheet>(null);

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
    };

    const handleFilterClosePress = () => {
        if (filterBottomSheetRef.current) {
            filterBottomSheetRef.current.close();
        }
        setIsFilterBottomSheetOpen(false);
    };

    const formatDateForAPI = (date: Date | undefined) => {
        if (!date || !(date instanceof Date)) {
            const currentDate = new Date();
            const day = currentDate.getDate().toString().padStart(2, '0');
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const year = currentDate.getFullYear();
            return `${day}/${month}/${year}`;
        }

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const parseDateString = (dateString: string): Date | null => {
        // Handle DD/MM/YYYY format
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[2], 10);

            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }
        return null;
    };

    const handleFromDateChange = (fieldName: string, value: any) => {
        console.log('From Date selected:', value, typeof value);

        // Try multiple approaches to handle the date value
        let newDate: Date | null = null;

        if (value instanceof Date) {
            newDate = value;
        } else if (typeof value === 'string') {
            // Try parsing DD/MM/YYYY format first
            newDate = parseDateString(value);
            if (!newDate) {
                // Fallback to standard Date constructor
                newDate = new Date(value);
            }
        } else if (value && typeof value === 'object') {
            if (value.toDate) {
                newDate = value.toDate();
            } else if (value._d) {
                newDate = new Date(value._d);
            } else if (value.date) {
                newDate = new Date(value.date);
            }
        }

        if (newDate && !isNaN(newDate.getTime())) {
            console.log('Setting From Date to:', newDate);
            setFilterFromDate(newDate);
        } else {
            console.log('Invalid date value:', value);
            // Fallback to current date if invalid
            setFilterFromDate(new Date());
        }
    };

    const handleToDateChange = (fieldName: string, value: any) => {
        console.log('To Date selected:', value, typeof value);

        // Try multiple approaches to handle the date value
        let newDate: Date | null = null;

        if (value instanceof Date) {
            newDate = value;
        } else if (typeof value === 'string') {
            // Try parsing DD/MM/YYYY format first
            newDate = parseDateString(value);
            if (!newDate) {
                // Fallback to standard Date constructor
                newDate = new Date(value);
            }
        } else if (value && typeof value === 'object') {
            if (value.toDate) {
                newDate = value.toDate();
            } else if (value._d) {
                newDate = new Date(value._d);
            } else if (value.date) {
                newDate = new Date(value.date);
            }
        }

        if (newDate && !isNaN(newDate.getTime())) {
            console.log('Setting To Date to:', newDate);
            setFilterToDate(newDate);
        } else {
            console.log('Invalid date value:', value);
            // Fallback to current date if invalid
            setFilterToDate(new Date());
        }
    };

    const handleFilterSearch = async () => {
        try {
            setLoading(true);
            console.log('Filter dates:', { filterFromDate, filterToDate });

            const params = {
                start_date: formatDateForAPI(filterFromDate),
                end_date: formatDateForAPI(filterToDate),
            };

            console.log('API params:', params);

            const response = await APIService.GetLimitVoucher(params);
            console.log('API response:', response);
            console.log('API response type:', typeof response);
            console.log('API response keys:', response ? Object.keys(response) : 'No response');
            if (response && response.data) {
                console.log('Response.data type:', typeof response.data);
                console.log('Response.data keys:', Object.keys(response.data));
            }

            // Handle the specific API response structure
            let limitDataArray = [];

            if (response && response.success && response.data && Array.isArray(response.data)) {
                // Transform the API data to match the expected format for DeclareStatusCard
                limitDataArray = response.data?.map((item: any) => ({
                    date: item.date || '',
                    partyAndLimit: item.user_id?.name || '',
                    lenaAndDena: item.lena_dena?.name || '',
                    amount: item.amount?.toString() || '',
                    oppositeParty: item.opposite_user_id?.name || '',
                    remark: item.remark || '',
                    id: item.id,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    created_by: item.created_by,
                    updated_by: item.updated_by,
                    is_deleted: item.is_deleted,
                    // Add original API data for form population
                    originalData: item
                }));
            }

            console.log('Processed limit data:', limitDataArray);

            // Ensure we always have an array
            if (!Array.isArray(limitDataArray)) {
                console.log('limitDataArray is not an array, setting to empty array');
                limitDataArray = [];
            }

            setLimitData(limitDataArray);
            handleFilterClosePress();
        } catch (error) {
            console.error('Error fetching limit vouchers:', error);
            setLimitData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLimitVoucher = async (values: any) => {
        try {
            setLoading(true);
            console.log('Creating limit voucher:', values);

            const voucherData = {
                user_id: Number(values.partyAndLimit),
                opposite_user_id: values.oppositeParty,
                lena_dena: Number(values.lenaAndDena),
                amount: Number(values.amount),
                remark: values.remark || '',
                date: values.date instanceof Date ? `${values.date.getDate().toString().padStart(2, '0')}/${(values.date.getMonth() + 1).toString().padStart(2, '0')}/${values.date.getFullYear()}` : values.date
            };

            const response = await APIService.createLimitVoucher(voucherData);
            console.log('Create response:', response);

            if (response?.success) {
                // Reset form and dropdowns
                setPartyDropdownValue(null);
                setDropdownValue(null);
                setOppositPartyDropdownValue(null);
                setSelectedCompany(null);

                // Refresh the data after successful creation
                await handleFilterSearch();
                handleClosePress();
            }
        } catch (error) {
            console.error('Error creating limit voucher:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLimitVoucher = async (values: any) => {
        try {
            setLoading(true);
            console.log('Updating limit voucher:', values);

            const voucherData = {
                user_id: Number(values.partyAndLimit),
                opposite_user_id: Number(values.oppositeParty),
                lena_dena: Number(values.lenaAndDena),
                amount: Number(values.amount),
                remark: values.remark || '',
                date: values.date instanceof Date ? `${values.date.getDate().toString().padStart(2, '0')}/${(values.date.getMonth() + 1).toString().padStart(2, '0')}/${values.date.getFullYear()}` : values.date
            };

            const response = await APIService.UpdateLimitVoucher(voucherData, selectedCompany?.id);
            console.log('Update response:', response);

            if (response?.success) {
                // Reset form and dropdowns
                setPartyDropdownValue(null);
                setDropdownValue(null);
                setOppositPartyDropdownValue(null);
                setSelectedCompany(null);

                // Refresh the data after successful update
                await handleFilterSearch();
                handleClosePress();
            }
        } catch (error) {
            console.error('Error updating limit voucher:', error);
        } finally {
            setLoading(false);
        }
    };
    // DeleteLimitVoucher
    const handleDeleteLimitVoucher = (item: any) => {
        Alert.alert(
            "Delete Voucher",
            "Are you sure you want to delete this voucher?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            console.log('Deleting limit voucher:', item);

                            const voucherId = item.id || item.voucher_id;
                            if (!voucherId) {
                                console.log('Missing voucher id for delete. Item:', item);
                                return;
                            }
                            const response = await APIService.DeleteLimitVoucher(voucherId);
                            console.log('Delete response:', response);

                            if (response?.success) {
                                // Refresh the data after successful deletion
                                await handleFilterSearch();
                            }
                        } catch (error) {
                            console.error('Error deleting limit voucher:', error);
                        } finally {
                            setLoading(false);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };
    useEffect(() => {
        fetchLedgerData();
    }, []);

    const fetchLedgerData = async () => {
        try {
            const response = await APIService.GetLedgerDropDownDataData();
            if (response && response.success && response.data) {
                const transformedLedgers = response.data.map((ledger: any) => ({
                    label: ledger.real_name || ledger.name || 'Unknown Ledger',
                    value: ledger.id?.toString() || ledger.ledger_id?.toString() || '',
                    limit: ledger.limit || 0,
                    closing_balance: ledger.closing_balance || 0
                }));
                setPartyDropdownItems(transformedLedgers);
                setOppositPartyDropdownItems(transformedLedgers);
            }
        } catch (error) {
            console.error('Error fetching ledger data:', error);
        }
    };

    // Search functionality
    const { query, setQuery, filteredItems } = useSearchBar<any>(limitData, {
        selector: (item) => String(item?.partyAndLimit ?? item?.oppositeParty ?? item?.remark ?? ''),
        debounceMs: 200,
    });

    return (
        <PermissionGuard permission={PERMISSIONS.VOUCHER_LIMIT_VIEW.value}>
            <GestureHandlerRootView style={{ flex: 1 }}>

                <GradientBackground colors={["#fdf0d0", "#e0efea"]} locations={[0, 30]}>
                    <SafeAreaView style={style.safeAreaContainer} edges={['top', 'left', 'right']}>
                        <ScreenHeader
                            title={"Limit Voucher"}
                            navigation={navigation}
                            hideBackButton={true}
                            showDrawerButton={true}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10) }}>
                                <TouchableOpacity onPress={() => {
                                    setShowSearch(!showSearch);
                                    if (showSearch) {
                                        setQuery('');
                                    }
                                }}>
                                    <Icons name={showSearch ? 'close' : 'search'} color={COLORS.WHITE} size={scale(20)} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    setIsFilterBottomSheetOpen(true);
                                }}>
                                    <Icon name={'filter-list-alt'} color={COLORS.WHITE} size={scale(20)} />
                                </TouchableOpacity>
                            </View>
                        </ScreenHeader>
                        <View style={style.container}>
                            {showSearch ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10), marginHorizontal: scale(15), marginVertical: scale(10) }}>
                                    <View style={{ flex: 1 }}>
                                        <CustomTextInput
                                            placeholder="Search by party name, opposite party, or remark..."
                                            value={query}
                                            onChangeText={setQuery}
                                            style={{ backgroundColor: COLORS.WHITE, minHeight: 40, borderRadius: 8, paddingHorizontal: 12, elevation: 10 }}
                                        />
                                    </View>
                                    <TouchableOpacity onPress={() => { setQuery(''); setShowSearch(false); }}>
                                        <Icons name={'close-circle'} size={22} color={"red"} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ marginVertical: scale(10), marginHorizontal: scale(15), alignItems: "flex-end" }}>
                                    {hasPermission(PERMISSIONS.VOUCHER_LIMIT_ADD.value) && (
                                        <CustomButton
                                            textColor={COLORS.WHITE}
                                            title="+ Add (F2)"
                                            onPress={() => {
                                                setIsOpenBottomSheet(true);
                                                setSelectedCompany(null);
                                                // Reset dropdown values for new voucher
                                                setPartyDropdownValue(null);
                                                setDropdownValue('1');
                                                setOppositPartyDropdownValue(null);
                                            }}
                                            style={{ width: '50%' }}
                                        />
                                    )}
                                </View>
                            )}
                            <ScrollView
                                style={{ flex: 1 }}
                                keyboardShouldPersistTaps="handled"
                                refreshControl={
                                    <RefreshControl
                                        refreshing={loading && limitData.length > 0}
                                        onRefresh={handleFilterSearch}
                                        colors={[COLORS.BUTTONBG]}
                                    />
                                }
                            >
                                <View style={{ padding: scale(16) }}>
                                    <TableGrid
                                        data={filteredItems}
                                        showTotal={true}
                                        columns={[
                                            { key: 'sno', label: 'S.No.', width: 50 },
                                            { key: 'partyAndLimit', label: 'Party', width: 120 },
                                            { key: 'date', label: 'Date', width: 100 },
                                            { key: 'lenaAndDena', label: 'Dena/Lena', width: 100 },
                                            { key: 'amount', label: 'Amount', width: 80, numeric: true },
                                            { key: 'oppositeParty', label: 'Opposite Party', width: 120 },
                                            { key: 'remark', label: 'Remark', width: 150 },
                                            {
                                                key: 'action',
                                                label: 'Action',
                                                width: 100,
                                                renderCell: (row) => (
                                                    <View style={{ flexDirection: 'row', gap: scale(10) }}>
                                                        {hasPermission(PERMISSIONS.VOUCHER_LIMIT_EDIT.value) && (
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    setSelectedCompany(row);
                                                                    // Set dropdown values for edit mode
                                                                    if (row.originalData?.user_id?.id) {
                                                                        setPartyDropdownValue(row.originalData.user_id.id.toString());
                                                                    }
                                                                    if (row.originalData?.lena_dena?.id) {
                                                                        setDropdownValue(row.originalData.lena_dena.id.toString());
                                                                    }
                                                                    if (row.originalData?.opposite_user_id?.id) {
                                                                        setOppositPartyDropdownValue(row.originalData.opposite_user_id.id.toString());
                                                                    }
                                                                    setIsOpenBottomSheet(true);
                                                                }}
                                                            >
                                                                <Icons name="pencil" size={18} color={COLORS.BUTTONBG} />
                                                            </TouchableOpacity>
                                                        )}
                                                        {hasPermission(PERMISSIONS.VOUCHER_LIMIT_DELETE.value) && (
                                                            <TouchableOpacity onPress={() => handleDeleteLimitVoucher(row)}>
                                                                <Icons name="trash" size={18} color="red" />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                )
                                            }
                                        ]}
                                    />
                                </View>
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
                                                    fontSize: scale(14),
                                                    fontWeight: '600',
                                                    color: COLORS.BLACK,
                                                    marginEnd: scale(5),
                                                }}
                                            >
                                                Add Limit Voucher |
                                                <Text
                                                    style={{
                                                        fontSize: scale(10),
                                                        fontWeight: '500',
                                                        color: COLORS.BLACK,
                                                        marginEnd: scale(5),
                                                    }}
                                                >
                                                    {' '}
                                                    Manage your limit vouchers
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
                                                date: selectedCompany?.originalData?.date || selectedCompany?.date || formatDateForAPI(new Date()),
                                                partyAndLimit: selectedCompany?.originalData?.user_id?.id?.toString() || selectedCompany?.partyAndLimit || '',
                                                lenaAndDena: selectedCompany?.originalData?.lena_dena?.id?.toString() || selectedCompany?.lenaAndDena || '1',
                                                amount: selectedCompany?.originalData?.amount?.toString() || selectedCompany?.amount || '',
                                                oppositeParty: selectedCompany?.originalData?.opposite_user_id?.id?.toString() || selectedCompany?.oppositeParty || '',
                                                remark: selectedCompany?.originalData?.remark || selectedCompany?.remark || '',
                                            }}
                                            enableReinitialize={true}
                                            validationSchema={AddLimiteVoucherSchema}
                                            onSubmit={(values, { resetForm }) => {
                                                console.log('Form Data:', values);

                                                if (selectedCompany) {
                                                    // Update existing voucher
                                                    handleUpdateLimitVoucher(values);
                                                } else {
                                                    // Create new voucher
                                                    handleCreateLimitVoucher(values);
                                                }

                                                // Reset form and dropdowns
                                                resetForm();
                                                setPartyDropdownValue(null);
                                                setDropdownValue('1');
                                                setOppositPartyDropdownValue(null);
                                            }}
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
                                                    <CustomDateTimePicker
                                                        label="Date"
                                                        value={values.date}
                                                        setFieldValue={setFieldValue}
                                                        fieldName="date"
                                                        mode={'date'}
                                                    />
                                                    <CustomDropdown
                                                        label={`Party & Limit ${values.partyAndLimit ? `(${PartydropdownItems.find(i => i.value === values.partyAndLimit)?.limit || '0'})` : ''}`}
                                                        open={openPartyDropdown}
                                                        value={PartydropdownValue}
                                                        items={PartydropdownItems}
                                                        setOpen={setOpenPartyDropdown}
                                                        setValue={(val: any) => {
                                                            const selectedValue = val();
                                                            setPartyDropdownValue(selectedValue);
                                                            setFieldValue('partyAndLimit', selectedValue);

                                                            // Auto-set opposite party if not set, matching web logic
                                                            if (selectedValue && !values.oppositeParty) {
                                                                setOppositPartyDropdownValue(selectedValue);
                                                                setFieldValue('oppositeParty', selectedValue);
                                                            }
                                                        }}
                                                        setItems={setPartyDropdownItems}
                                                        error={errors.partyAndLimit}
                                                    />
                                                    <CustomDropdown
                                                        label="Lena/Dena"
                                                        open={openDropdown}
                                                        value={values.lenaAndDena}
                                                        items={dropdownItems}
                                                        setOpen={setOpenDropdown}
                                                        setValue={(val: any) => {
                                                            const selectedValue = val();
                                                            setDropdownValue(selectedValue);
                                                            setFieldValue('lenaAndDena', selectedValue);
                                                        }}
                                                        setItems={setDropdownItems}
                                                        error={errors.lenaAndDena}
                                                    />
                                                    <CustomTextInput
                                                        label='Amount'
                                                        value={values.amount}
                                                        onChangeText={handleChange('amount')}
                                                        keyboardType='numeric'
                                                        error={touched.amount && typeof errors.amount === 'string' ? errors.amount : undefined}
                                                    />
                                                    <CustomDropdown
                                                        label="Opposite Party"
                                                        open={openOppositPartyDropdown}
                                                        value={values.oppositeParty}
                                                        items={OppositPartydropdownItems.map(item => ({
                                                            ...item,
                                                            label: item.value === values.partyAndLimit ? 'Limit' : item.label
                                                        }))}
                                                        setOpen={setOpenOppositPartyDropdown}
                                                        setValue={(val: any) => {
                                                            const selectedValue = val();
                                                            setOppositPartyDropdownValue(selectedValue);
                                                            setFieldValue('oppositeParty', selectedValue);
                                                        }}
                                                        setItems={setOppositPartyDropdownItems}
                                                        error={errors.oppositeParty}
                                                    />
                                                    <CustomTextInput
                                                        label='Remark'
                                                        value={values.remark}
                                                        onChangeText={handleChange('remark')}
                                                        error={touched.remark && typeof errors.remark === 'string' ? errors.remark : undefined}
                                                    />
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

                            {/* Filter Bottom Sheet */}
                            {isFilterBottomSheetOpen && (
                                <BottomSheet
                                    backgroundStyle={{ backgroundColor: COLORS.BGFILESCOLOR }}
                                    ref={filterBottomSheetRef}
                                    style={{ borderWidth: 1, borderRadius: scale(10) }}
                                    index={0}
                                    snapPoints={snapPoints}
                                    enableDynamicSizing={false}
                                    onChange={(index: number) => {
                                        Keyboard.dismiss();
                                        if (index === -1) {
                                            setIsFilterBottomSheetOpen(false);
                                        } else {
                                            setIsFilterBottomSheetOpen(true);
                                        }
                                    }}
                                    backdropComponent={renderBackdrop}
                                    enablePanDownToClose={true}
                                    onClose={() => {
                                        setIsFilterBottomSheetOpen(false);
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
                                                    fontSize: scale(14),
                                                    fontWeight: '600',
                                                    color: COLORS.BLACK,
                                                    marginEnd: scale(5),
                                                }}
                                            >
                                                Filter Limit Vouchers |
                                                <Text
                                                    style={{
                                                        fontSize: scale(10),
                                                        fontWeight: '500',
                                                        color: COLORS.BLACK,
                                                        marginEnd: scale(5),
                                                    }}
                                                >
                                                    {' '}
                                                    Select date range to filter
                                                </Text>
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={handleFilterClosePress}>
                                            <Icon name="cancel" size={scale(20)} />
                                        </TouchableOpacity>
                                    </View>
                                    <BottomSheetScrollView
                                        style={{
                                            padding: 16,
                                            backgroundColor: COLORS.BGFILESCOLOR,
                                            flex: 1,
                                        }}
                                    >
                                        <View style={{ paddingVertical: scale(20) }}>
                                            <CustomDateTimePicker
                                                label="From Date"
                                                value={filterFromDate}
                                                setFieldValue={handleFromDateChange}
                                                fieldName="fromDate"
                                                mode={'date'}
                                            />

                                            <CustomDateTimePicker
                                                label="To Date"
                                                value={filterToDate}
                                                setFieldValue={handleToDateChange}
                                                fieldName="toDate"
                                                mode={'date'}
                                            />

                                            <View style={{ marginVertical: scale(10) }}>
                                                <Text style={{ fontSize: scale(12), color: COLORS.BLACK, marginBottom: scale(5) }}>
                                                    From: {filterFromDate && filterFromDate instanceof Date ? filterFromDate.toDateString() : 'Not set'}
                                                </Text>
                                                <Text style={{ fontSize: scale(12), color: COLORS.BLACK, marginBottom: scale(10) }}>
                                                    To: {filterToDate && filterToDate instanceof Date ? filterToDate.toDateString() : 'Not set'}
                                                </Text>
                                            </View>

                                            <View style={{ marginVertical: scale(10), flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <CustomButton
                                                    title="Reset Dates"
                                                    onPress={() => {
                                                        setFilterFromDate(new Date());
                                                        setFilterToDate(new Date());
                                                    }}
                                                    textColor={COLORS.WHITE}
                                                    style={{ width: '48%' }}
                                                />
                                                <CustomButton
                                                    title={loading ? "Searching..." : "Search"}
                                                    onPress={handleFilterSearch}
                                                    textColor={COLORS.WHITE}
                                                    style={{ width: '48%' }}
                                                />
                                            </View>
                                        </View>
                                    </BottomSheetScrollView>
                                </BottomSheet>
                            )}
                        </View>
                    </SafeAreaView>
                </GradientBackground>
            </GestureHandlerRootView >
        </PermissionGuard>
    );
};

const style = StyleSheet.create({
    flexSingleColumb: {
        width: "48%"
    },
    safeAreaContainer: {
        flex: 1,
        // backgroundColor: '#fef7e5',
    },
    flexDoubleColumb: { flexDirection: "row", justifyContent: "space-between" },
    container: {
        flex: 1,
        // backgroundColor: COLORS.BGFILESCOLOR
    }
})
export default LimitVoucher;