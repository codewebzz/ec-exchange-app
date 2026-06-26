// addTransaction/MainJantriModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../../../../assets/colors';
import JantriTable, { JantriTableRef } from './JantriTable';
import APIService from '../../../services/APIService';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

interface MainJantriModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  shiftId?: string | number;
  date?: string; // Formatted DD/MM/YYYY
  isDeclared?: string; // "true" or "false"
}

const MainJantriModal: React.FC<MainJantriModalProps> = ({
  visible,
  onClose,
  title,
  shiftId,
  date,
  isDeclared = "false",
}) => {
  const [amountLess, setAmountLess] = useState('0');
  const [lessPercentage, setLessPercentage] = useState('0');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const tableRef = useRef<JantriTableRef>(null);
  const viewRef = useRef<View>(null);

  const handleShare = async () => {
    try {
      if (viewRef.current) {
        const uri = await captureRef(viewRef, {
          format: 'png',
          quality: 0.9,
        });

        await Share.open({
          url: uri,
          title: 'Share Main Jantri',
        });
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing image:', error);
        Alert.alert('Error', 'Failed to share image');
      }
    }
  };

  useEffect(() => {
    if (visible && shiftId) {
      handleSearch({
        less_amt: parseFloat(amountLess) || 0,
        less_percentage: parseFloat(lessPercentage) || 0
      });
    }
  }, [visible, shiftId, date]);

  const handleSearch = async (data: { less_amt: number; less_percentage: number }) => {
    if (!shiftId) return;

    try {
      setIsLoading(true);
      const payload = {
        shift_id: shiftId,
        is_declared: isDeclared,
        date: date,
        ...data,
      };

      const res = await APIService.GetMainJantri(payload);
      if (res && res.success) {
        let jantriData = res.data?.transaction || [];
        if (!Array.isArray(jantriData)) {
          jantriData = Object.keys(jantriData).map(key => ({
            number: key,
            amount: jantriData[key]
          }));
        }
        setTransactions(jantriData);
      } else {
        setTransactions([]);
        Alert.alert('Error', res?.message || 'Failed to fetch main jantri data');
      }
    } catch (error) {
      console.error('Error fetching main jantri data:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
            </View>

            <View style={styles.headerInputs}>
              <TextInput
                style={styles.headerInput}
                placeholder="Amt Less"
                placeholderTextColor="#9ca3af"
                value={amountLess}
                onChangeText={setAmountLess}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.headerInput}
                placeholder="Less %"
                placeholderTextColor="#9ca3af"
                value={lessPercentage}
                onChangeText={setLessPercentage}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.headerSearchButton}
                onPress={() => handleSearch({
                  less_amt: parseFloat(amountLess) || 0,
                  less_percentage: parseFloat(lessPercentage) || 0
                })}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
              >
                <Text style={styles.searchButtonText}>Share</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>




            {isLoading ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color={COLORS.BUTTONBG} />
                <Text style={styles.loadingText}>Loading Main Jantri Data...</Text>
              </View>
            ) : (
              <View style={[styles.gridSection, { backgroundColor: '#f7f4ec' }]} collapsable={false} ref={viewRef}>
                <JantriTable
                  ref={tableRef}
                  externalTransactions={transactions}
                  isEditable={false}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get('window').height * 0.95,
    height: Dimensions.get('window').width,
    backgroundColor: '#f7f4ec',
    borderRadius: 16,
    overflow: 'hidden',
    transform: [{ rotate: '90deg' }],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2a37',
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fefae0',
    flexShrink: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 10,
  },
  loadingWrapper: {
    padding: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
  },


  headerInputs: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerInput: {
    backgroundColor: '#374151',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    width: 80,
    height: 30,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  headerSearchButton: {
    backgroundColor: '#10b5a6',
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  shareButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  gridSection: {
    marginBottom: 20,
    padding: 10,
  },
});

export default MainJantriModal;
