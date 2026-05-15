import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../assets/colors';
import APIService from '../screens/services/APIService';
import Toast from 'react-native-toast-message';

interface Shift {
  id: number;
  shift_name: string;
  is_active?: boolean;
  is_declared?: boolean;
}

interface StaffShiftPermission {
  id: number; // This is the permission_id
  shift_id: number;
  shift_name: string;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
};

const StaffShiftsPopup: React.FC<Props> = ({ isOpen, onClose, staff }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staffPermissions, setStaffPermissions] = useState<StaffShiftPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingShiftId, setTogglingShiftId] = useState<number | null>(null);

  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => ['70%', '100%'], []);

  useEffect(() => {
    if (isOpen && staff?.id) {
      fetchData();
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, staff]);

  const fetchData = async () => {
    if (!staff?.id) return;
    setIsLoading(true);
    try {
      const [shiftsRes, permissionsRes] = await Promise.all([
        APIService.GetShift(),
        APIService.GetShiftsByStaff(staff.id)
      ]);

      if (shiftsRes.success && shiftsRes.data) {
        setShifts(shiftsRes.data || []);
      } else {
        setShifts([]);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load shifts',
        });
      }

      if (permissionsRes.success && permissionsRes.data) {
        setStaffPermissions(permissionsRes.data || []);
      } else {
        setStaffPermissions([]);
      }
    } catch (error) {
      console.error("Error fetching shifts/permissions:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaffPermissions = async () => {
    if (!staff?.id) return;
    try {
      const permissionsRes = await APIService.GetShiftsByStaff(staff.id);
      if (permissionsRes.success && permissionsRes.data) {
        setStaffPermissions(permissionsRes.data || []);
      } else {
        setStaffPermissions([]);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleShiftToggle = async (shiftId: number) => {
    if (!staff?.id) return;

    const existingPermission = staffPermissions.find(p => p.shift_id === shiftId);
    setTogglingShiftId(shiftId);

    try {
      if (existingPermission) {
        const res = await APIService.DeleteShiftPermission(existingPermission.id);
        if (res.success) {
          await fetchStaffPermissions();
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Shift permission removed',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: res.message || 'Failed to remove permission',
          });
        }
      } else {
        const res = await APIService.CreateShiftPermission({
          shift_id: shiftId,
          staff_id: staff.id
        });
        if (res.success) {
          await fetchStaffPermissions();
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Shift permission added',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: res.message || 'Failed to add permission',
          });
        }
      }
    } catch (error) {
      console.error("Error toggling shift permission:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred',
      });
    } finally {
      setTogglingShiftId(null);
    }
  };

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      onClose={onClose}
      backgroundStyle={{ backgroundColor: COLORS.BGFILESCOLOR }}
    >
      <View style={styles.modalHeader}>
        <View style={styles.modalTitleContainer}>
          <Text style={styles.modalTitle}>Manage Shifts</Text>
          <Text style={styles.modalSubtitle}>
            Select shifts for {staff?.staff_name || 'User'}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Icon name="cancel" size={scale(20)} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView contentContainerStyle={styles.modalContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.BUTTONBG} />
            <Text style={styles.loadingText}>Loading shifts...</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text style={styles.summaryText}>
              {staffPermissions.length} of {shifts.length} shifts assigned
            </Text>
            {shifts.map((shift) => {
              const isAssigned = staffPermissions.some(p => p.shift_id === shift.id);
              const isToggling = togglingShiftId === shift.id;

              return (
                <TouchableOpacity
                  key={shift.id}
                  style={styles.shiftItem}
                  onPress={() => !isToggling && handleShiftToggle(shift.id)}
                  disabled={isToggling}
                >
                  <View style={styles.shiftInfo}>
                    <Text style={styles.shiftName}>{shift.shift_name}</Text>
                    <Text style={styles.shiftStatus}>
                      {shift.is_active ? "Active" : "Inactive"} • {shift.is_declared ? "Declared" : "Undeclared"}
                    </Text>
                  </View>
                  <View style={styles.checkboxContainer}>
                    {isToggling ? (
                      <ActivityIndicator size="small" color={COLORS.BUTTONBG} />
                    ) : (
                      <Icon
                        name={isAssigned ? "check-box" : "check-box-outline-blank"}
                        size={scale(24)}
                        color={isAssigned ? COLORS.SUCCESSGREEN : "#666"}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  modalSubtitle: {
    fontSize: scale(12),
    color: '#666',
    marginTop: scale(2),
  },
  modalContent: {
    padding: scale(15),
    paddingBottom: scale(40),
  },
  loadingContainer: {
    padding: scale(40),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: scale(10),
    color: '#666',
  },
  listContainer: {
    width: '100%',
  },
  summaryText: {
    fontSize: scale(13),
    fontWeight: '500',
    color: '#777',
    marginBottom: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: scale(5),
  },
  shiftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftName: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#333',
  },
  shiftStatus: {
    fontSize: scale(11),
    color: '#888',
    marginTop: scale(2),
  },
  checkboxContainer: {
    marginLeft: scale(10),
    width: scale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StaffShiftsPopup;
