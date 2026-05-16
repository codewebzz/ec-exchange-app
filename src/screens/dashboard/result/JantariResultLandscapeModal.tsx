import React, { useRef } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import JantriTable, { JantriTableRef } from '../Transaction/addTransaction/JantriTable';

interface JantariResultLandscapeModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  transactions: any[];
}

const JantariResultLandscapeModal: React.FC<JantariResultLandscapeModalProps> = ({
  visible,
  onClose,
  title,
  transactions,
}) => {
  const tableRef = useRef<JantriTableRef>(null);

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
            <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.gridSection}>
              <JantriTable
                ref={tableRef}
                externalTransactions={transactions}
                isEditable={false}
              />
            </View>
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
    transform: [{ rotate: '90deg' }], // Same rotation as MainJantriModal
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2a37',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fefae0',
    flexShrink: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 10,
  },
  gridSection: {
    marginBottom: 20,
    padding: 10,
  },
});

export default JantariResultLandscapeModal;
