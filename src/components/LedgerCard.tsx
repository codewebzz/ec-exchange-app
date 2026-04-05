import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LedgerCardProps {
  index: number;
  ledger: string;
  addedBy: string;
}

const LedgerCard = ({ index, ledger, addedBy }: LedgerCardProps) => (
  <View style={styles.card}>
    <Text style={styles.index}>#{index}</Text>
    <Text style={styles.ledger}>{ledger}</Text>
    <Text style={styles.meta}>Added By: {addedBy}</Text>
  </View>
);

export default LedgerCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f1f1f1',
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
  },
  index: {
    fontWeight: 'bold',
    color: '#888',
  },
  ledger: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  meta: {
    color: '#666',
  },
});
