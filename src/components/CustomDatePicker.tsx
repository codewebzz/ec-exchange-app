// import React from 'react';
// import { View, Text, Pressable, StyleSheet } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import moment from 'moment';
// import { COLORS } from '../assets/colors';
// import { scale } from 'react-native-size-matters';

// interface DateTimePickerProps {
//      label?:any, value?:any, setFieldValue?:any, fieldName?:any, mode?:any,error?:string
// }

// const CustomDateTimePicker = ({ label, value, setFieldValue, fieldName, mode,error }:DateTimePickerProps) => {
//   const [isPickerVisible, setPickerVisible] = React.useState(false);

// const formatDisplayValue = () => {
//   if (!value) {
//     return mode === 'time' ? '--:--' : 'Select Date';
//   }

//   if (mode === 'time') {
//     return moment(value, 'HH:mm').isValid() ? moment(value, 'hh:mm A').format('hh:mm A') : '--:--';
//   } else if (mode === 'date') {
//     // Try multiple date formats
//     let parsedDate = null;
    
//     // Try DD/MM/YYYY format first (for form inputs)
//     if (moment(value, 'DD/MM/YYYY').isValid()) {
//       parsedDate = moment(value, 'DD/MM/YYYY');
//     }
//     // Try YYYY-MM-DD format (for API responses)
//     else if (moment(value, 'YYYY-MM-DD').isValid()) {
//       parsedDate = moment(value, 'YYYY-MM-DD');
//     }
//     // Try ISO format
//     else if (moment(value).isValid()) {
//       parsedDate = moment(value);
//     }
    
//     return parsedDate ? parsedDate.format('DD/MM/YYYY') : 'Invalid Date';
//   } else {
//     return moment(value, 'DD/MM/YYYY HH:mm').isValid()
//       ? moment(value, 'DD/MM/YYYY HH:mm').format('DD/MM/YYYY HH:mm')
//       : 'Invalid DateTime';
//   }
// };


//   return (
//     <View style={{ marginVertical: 10 }}>
//       <Text style={style.label}>{label}</Text>
//       <Pressable
//         onPress={() => setPickerVisible(true)}
//         style={[
//           style.DropDownStyle,
//           error ? { borderColor: '#EF4444', borderWidth: 1 } : null,
//         ]}
//       >
//         <Text>{formatDisplayValue()}</Text>
//       </Pressable>
//       {typeof error === 'string' && error?.length > 0 ? (
//         <Text style={style.errorText}>{error}</Text>
//       ) : null}
//       {isPickerVisible && (
//  <DateTimePicker
//   value={
//     value
//       ? mode === 'time'
//         ? moment(value, 'HH:mm').isValid()
//           ? moment(value, 'HH:mm').toDate()
//           : new Date()
//         : (() => {
//             // Try multiple date formats for the picker value
//             if (moment(value, 'DD/MM/YYYY').isValid()) {
//               return moment(value, 'DD/MM/YYYY').toDate();
//             } else if (moment(value, 'YYYY-MM-DD').isValid()) {
//               return moment(value, 'YYYY-MM-DD').toDate();
//             } else if (moment(value).isValid()) {
//               return moment(value).toDate();
//             } else {
//               return new Date();
//             }
//           })()
//       : new Date()
//   }
//   mode={mode}
//   display="default"
//   onChange={(event, selectedDate) => {
//     // On Android, only process if event type is 'set' (user confirmed selection)
//     // On iOS, event.type is undefined, so we always process
//     if (event.type === 'dismissed' || event.type === 'neutralButtonPressed') {
//       setPickerVisible(false);
//       return;
//     }
    
//     setPickerVisible(false);
//     if (selectedDate) {
//       let formattedValue = '';
//       if (mode === 'time') {
//         formattedValue = moment(selectedDate).format('HH:mm');
//       } else if (mode === 'date') {
//         formattedValue = moment(selectedDate).format('DD/MM/YYYY');
//       } else {
//         formattedValue = moment(selectedDate).format('DD/MM/YYYY HH:mm');
//       }

//       setFieldValue(fieldName, formattedValue);
//     }
//   }}
//   style={style.DropDownStyle}
// />

// )}

//     </View>
//   );
// };

// const style = StyleSheet.create({
//   DropDownStyle: {
//     backgroundColor: COLORS.WHITE,
//     borderColor: COLORS.WHITE,
//     paddingVertical: scale(13),
//     paddingLeft: scale(10),
//     borderRadius: scale(6),
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//   },
//   label: {
//     marginBottom: 4,
//     fontSize: scale(12),
//     color: '#333',
//     fontWeight: "800"
//   },
//   errorText: {
//     marginTop: scale(4),
//     color: '#EF4444',
//     fontSize: scale(10),
//   },
// })

// export default CustomDateTimePicker;
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { COLORS } from '../assets/colors';
import { scale } from 'react-native-size-matters';

interface DateTimePickerProps {
  label?: any;
  value?: any;
  setFieldValue?: any;
  fieldName?: any;
  mode?: any;
  error?: string;
}

const CustomDateTimePicker = ({ 
  label, 
  value, 
  setFieldValue, 
  fieldName, 
  mode, 
  error 
}: DateTimePickerProps) => {
  const [isPickerVisible, setPickerVisible] = React.useState(false);

  // Convert value to Date object for the picker
  const getDateValue = () => {
    if (!value) return new Date();

    // If already a Date object
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }

    // If string, try to parse
    if (typeof value === 'string') {
      if (mode === 'time') {
        return moment(value, 'HH:mm').isValid() 
          ? moment(value, 'HH:mm').toDate() 
          : new Date();
      } else if (mode === 'date') {
        // Try multiple formats
        if (moment(value, 'DD/MM/YYYY').isValid()) {
          return moment(value, 'DD/MM/YYYY').toDate();
        } else if (moment(value, 'YYYY-MM-DD').isValid()) {
          return moment(value, 'YYYY-MM-DD').toDate();
        } else if (moment(value).isValid()) {
          return moment(value).toDate();
        }
      }
    }

    return new Date();
  };

  // Format for display
  const formatDisplayValue = () => {
    if (!value) {
      return mode === 'time' ? '--:--' : 'Select Date';
    }

    // If it's a Date object
    if (value instanceof Date && !isNaN(value.getTime())) {
      if (mode === 'time') {
        return moment(value).format('hh:mm A');
      } else if (mode === 'date') {
        return moment(value).format('DD/MM/YYYY');
      } else {
        return moment(value).format('DD/MM/YYYY HH:mm');
      }
    }

    // If it's a string
    if (typeof value === 'string') {
      if (mode === 'time') {
        return moment(value, 'HH:mm').isValid() 
          ? moment(value, 'HH:mm').format('hh:mm A') 
          : '--:--';
      } else if (mode === 'date') {
        let parsedDate = null;
        
        if (moment(value, 'DD/MM/YYYY').isValid()) {
          parsedDate = moment(value, 'DD/MM/YYYY');
        } else if (moment(value, 'YYYY-MM-DD').isValid()) {
          parsedDate = moment(value, 'YYYY-MM-DD');
        } else if (moment(value).isValid()) {
          parsedDate = moment(value);
        }
        
        return parsedDate ? parsedDate.format('DD/MM/YYYY') : 'Invalid Date';
      }
    }

    return 'Invalid Date';
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('📅 Date picker event:', event.type, selectedDate);

    // Handle Android dismiss/cancel
    if (event.type === 'dismissed' || event.type === 'neutralButtonPressed') {
      setPickerVisible(false);
      return;
    }

    // Close picker
    setPickerVisible(false);

    // If no date selected, return
    if (!selectedDate) {
      console.log('❌ No date selected');
      return;
    }

    console.log('✅ Date selected:', selectedDate);
    console.log('✅ Field name:', fieldName);

    // Pass the Date object directly to Formik
    // Don't convert to string - let Formik handle the Date object
    setFieldValue(fieldName, selectedDate);
    
    console.log('✅ setFieldValue called with Date object');
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={style.label}>{label}</Text>
      <Pressable
        onPress={() => {
          console.log('📅 Opening date picker for:', fieldName);
          console.log('📅 Current value:', value);
          setPickerVisible(true);
        }}
        style={[
          style.DropDownStyle,
          error ? { borderColor: '#EF4444', borderWidth: 1 } : null,
        ]}
      >
        <Text style={{ color: value ? COLORS.BLACK : '#999' }}>
          {formatDisplayValue()}
        </Text>
      </Pressable>
      {typeof error === 'string' && error?.length > 0 ? (
        <Text style={style.errorText}>{error}</Text>
      ) : null}
      {isPickerVisible && (
        <DateTimePicker
          value={getDateValue()}
          mode={mode}
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const style = StyleSheet.create({
  DropDownStyle: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.WHITE,
    paddingVertical: scale(13),
    paddingLeft: scale(10),
    borderRadius: scale(6),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  label: {
    marginBottom: 4,
    fontSize: scale(12),
    color: '#333',
    fontWeight: '800',
  },
  errorText: {
    marginTop: scale(4),
    color: '#EF4444',
    fontSize: scale(10),
  },
});

export default CustomDateTimePicker;
