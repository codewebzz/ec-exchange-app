// addTransaction/JantriViewModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../../../../assets/colors';
import JantriTable, { JantriTableRef } from './JantriTable';
import APIService from '../../../services/APIService';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

interface JantriViewModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  ledgerId?: string | number;
  shiftId?: string | number;
  date?: string; // Formatted DD/MM/YYYY
  initialData?: any[]; // The direct summary table data
  isDeclared?: boolean;
}

const JantriViewModal: React.FC<JantriViewModalProps> = ({
  visible,
  onClose,
  title,
  ledgerId,
  shiftId,
  date,
  initialData = [],
  isDeclared = false,
}) => {
  const [jantriType, setJantriType] = useState<'non-consolidate-jantri' | 'consolidate-jantri' | 'cut-consolidate-jantri' | 'hpl-jantri'>('non-consolidate-jantri');
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
          title: `Share Jantri - ${title}`,
        });
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing image:', error);
        Alert.alert('Error', 'Failed to share image');
      }
    }
  };

  // Sync with initialData when it changes or when modal opens
  useEffect(() => {
    if (visible && jantriType === 'non-consolidate-jantri') {
      const transformed = initialData.map(item => ({
        number: item.number,
        amount: parseFloat(item.amount) || 0,
      }));
      setTransactions(transformed);
    }
  }, [visible, initialData, jantriType]);

  // Fetch data when type changes (except for non-consolidate)
  useEffect(() => {
    if (visible && jantriType !== 'non-consolidate-jantri') {
      fetchJantriData(jantriType);
    }
  }, [visible, jantriType, ledgerId, shiftId, date]);

  const fetchJantriData = async (type: string) => {
    if (!ledgerId) return;

    try {
      setIsLoading(true);
      const payload = {
        shift_id: shiftId,
        is_declared: isDeclared,
        open_date: date
      };

      let res;
      if (type === 'consolidate-jantri') {
        res = await APIService.GetConsolidatedJantri(Number(ledgerId), payload);
      } else if (type === 'cut-consolidate-jantri') {
        res = await APIService.GetCutConsolidatedJantri(Number(ledgerId), payload);
      } else if (type === 'hpl-jantri') {
        res = await APIService.GetHpCutConsolidatedJantri(Number(ledgerId), payload);
      }

      if (res && res.success) {
        let data = res.data?.transaction || [];
        if (!Array.isArray(data)) {
          data = Object.keys(data).map(key => ({
            number: key,
            amount: data[key]
          }));
        }
        setTransactions(data);
      } else {
        setTransactions([]);
        Alert.alert('Error', res?.message || 'Failed to fetch jantri data');
      }
    } catch (error) {
      console.error('Error fetching jantri data:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRadio = (label: string, value: 'non-consolidate-jantri' | 'consolidate-jantri' | 'cut-consolidate-jantri' | 'hpl-jantri', inHeader: boolean = false) => (
    <TouchableOpacity
      style={styles.radioOption}
      onPress={() => setJantriType(value)}
    >
      <View style={[
        styles.radioOuter,
        inHeader && styles.radioOuterHeader,
        jantriType === value && styles.radioOuterSelected
      ]}>
        {jantriType === value && <View style={[styles.radioInner, inHeader && styles.radioInnerHeader]} />}
      </View>
      <Text
        style={[styles.radioLabel, inHeader && styles.radioLabelHeader, jantriType === value && styles.radioLabelSelected]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
              <View style={styles.headerRadioRow}>
                {renderRadio('Non Cons.', 'non-consolidate-jantri', true)}
                {renderRadio('Cons.', 'consolidate-jantri', true)}
                {renderRadio('Cut Cons.', 'cut-consolidate-jantri', true)}
                {renderRadio('HPL', 'hpl-jantri', true)}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
              >
                <Text style={styles.searchButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color={COLORS.BUTTONBG} />
                <Text style={styles.loadingText}>Loading Jantri Data...</Text>
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
  headerRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10,
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
  gridSection: {
    marginBottom: 20,
    padding: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 12,
    color: '#333',
  },
  radioLabelSelected: {
    fontWeight: 'bold',
  },
  radioLabelHeader: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#1f2a37',
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterHeader: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 4,
  },
  radioOuterSelected: {
    borderColor: '#10b5a6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b5a6',
  },
  radioInnerHeader: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shareButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    marginRight: 6,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
});

export default JantriViewModal;
