import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { COLORS } from '../assets/colors';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface DropDownProps {
    label?: string;
    open?: any;
    value?: any;
    items?: any;
    setOpen?: any;
    setValue?: any;
    setItems?: any;
    error?: any;
    bottomOffset?: number;
    placeholder?: string;
    zIndex?: number;
    onOpen?: () => void;
    onChangeValue?: (value: any) => void;
    disabled?: boolean;
    showClearButton?: boolean;
}

const CustomDropdown = ({
    label,
    open,
    value,
    items,
    setOpen,
    setValue,
    setItems,
    error,
    bottomOffset,
    placeholder,
    zIndex = 1000, // Increased default zIndex
    onOpen,
    onChangeValue,
    disabled = false,
    showClearButton = false
}: DropDownProps) => (
    <View style={[style.container, { zIndex: open ? zIndex : 1 }]}>
        <Text style={style.label}>{label}</Text>
        <View style={style.dropdownContainer}>
            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                zIndex={zIndex}
                zIndexInverse={zIndex}
                style={style.DropDownStyle}
                dropDownContainerStyle={style.dropDownContainerStyle}
                bottomOffset={bottomOffset}
                placeholder={placeholder}
                onOpen={onOpen}
                onChangeValue={onChangeValue}
                disabled={disabled}
                // Use modal to avoid BottomSheet/nested scroll conflicts
                listMode="MODAL"
                modalTitle={label || 'Select'}
                searchable={true}
                searchPlaceholder="Search..."
                closeOnBackPressed={true}
                activityIndicatorColor={'#333'}
                activityIndicatorSize={scale(16)}
                // Fallback styles for modal content
                modalContentContainerStyle={{ paddingVertical: scale(8) }}
                // Ensure dropdown stays on top
                modalProps={{
                    animationType: "slide"
                }}
                // Custom styling for dropdown list
                textStyle={style.dropdownText}
                placeholderStyle={style.placeholderStyle}
                // Ensure proper value display
                selectedItemContainerStyle={style.selectedItemContainer}
                selectedItemLabelStyle={style.selectedItemLabel}
                // Auto scroll to selected item
                autoScroll={true}
                // Close dropdown after selection
                closeAfterSelecting={true}
            />
            {showClearButton && (value !== null && value !== undefined && value !== '') && (
                <TouchableOpacity
                    style={[style.clearButton, disabled ? { opacity: 0.5 } : null]}
                    hitSlop={{ top: scale(5), bottom: scale(5), left: scale(8), right: scale(8) }}
                    onPress={() => {
                        if (!disabled) {
                            setValue(null);
                            if (onChangeValue) {
                                onChangeValue(null);
                            }
                        }
                    }}
                    disabled={disabled}
                >
                    <Icon name="close" size={scale(16)} color="#E53E3E" />
                </TouchableOpacity>
            )}
        </View>
        {error && (value === null || value === undefined || value === '') && (
            <Text style={style.error}>{error}</Text>
        )}
    </View>
);

const style = StyleSheet.create({
    container: {
        marginVertical: scale(3),
        // Ensure container doesn't clip content
        overflow: 'visible',
    },
    dropdownContainer: {
        position: 'relative',
        // Ensure dropdown container allows overflow
        overflow: 'visible',
    },
    DropDownStyle: {
        backgroundColor: '#fff',
        borderColor: COLORS.WHITE,
        borderWidth: 1,
        borderRadius: 8,
        minHeight: scale(43),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    dropDownContainerStyle: {
        backgroundColor: '#fff',
        borderColor: COLORS.WHITE,
        borderWidth: 1,
        borderTopWidth: 0,
        borderRadius: 8,
        // Ensure dropdown list appears above other elements
        elevation: 10, // Android shadow/elevation
        shadowColor: '#000', // iOS shadow
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Max height to prevent list from getting too long
        maxHeight: scale(200), // Optimal height for scrollview mode
    },
    clearButton: {
        position: 'absolute',
        right: scale(40),
        top: scale(9),
        zIndex: 9999,
        // elevation: 20,
        padding: scale(4),
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: scale(12),
    },
    label: {
        marginBottom: scale(2),
        fontSize: scale(12),
        color: '#333',
        fontWeight: "800"
    },
    error: {
        color: 'red',
        fontSize: scale(12),
        marginTop: scale(4),
    },
    dropdownText: {
        fontSize: scale(14),
        color: '#333',
    },
    placeholderStyle: {
        fontSize: scale(14),
        color: '#999',
    },
    selectedItemContainer: {
        backgroundColor: '#f0f0f0',
    },
    selectedItemLabel: {
        fontSize: scale(14),
        color: '#333',
        fontWeight: '600',
    },
});

export default CustomDropdown;