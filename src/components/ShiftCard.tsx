import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useCountdown } from "../hooks/useCountdown"; // adjust path

const ShiftCard = ({ card, navigation }: any) => {

  const isDeclared = card.is_declared === true;

  // ⏳ countdown only when NOT declared
  const countdown = !isDeclared ? useCountdown(card.timeLimit) : null;

  const gradientColors = isDeclared
    ? ["#0ea05c", "#11c178"]
    : ["#f97316", "#f59e0b"];

  const badgeBg = isDeclared ? "#d1fae5" : "#fff1e6";
  const badgeText = isDeclared ? "#065f46" : "#c2410c";
  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };
  return (
    <View style={styles.cityCard}>
      <TouchableOpacity disabled={countdown === "No time left & Not declared yet" || card?.is_declared === true} onPress={() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2e33dffb-7baa-4cb6-aa5f-9efc22abb991', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ShiftCard.tsx:35', message: 'onPress handler called', data: { navigationExists: !!navigation, navigationType: typeof navigation, hasNavigate: !!navigation?.navigate }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
        // #endregion
        if (!navigation) {

          return;
        }
        navigation.navigate("AddTransaction", {
          data: card
        })
      }}>
        <LinearGradient colors={gradientColors} style={styles.cityCardHeader}>
          {/* Header */}
          <View style={styles.cityHeaderRow}>
            <View>
              <Text style={styles.cityTitle}>{card.name ?? "-"}</Text>
              <Text style={styles.cityDate}>{formatDate(card.open_date)}</Text>
            </View>

            <View style={[styles.liveChip, { backgroundColor: badgeBg }]}>
              <Text style={[styles.liveChipText, { color: badgeText }]}>
                {card?.declared_number ? card.declared_number : countdown}
              </Text>
            </View>
          </View>

          {/* Status Row */}

        </LinearGradient>

        {/* Body */}
        <View style={styles.cityCardBody}>
          <MetricBox label="Total" value={card.total ?? 0} color="#fff7ed" />
          <MetricBox
            label="Collection"
            value={card.collection ?? 0}
            color="#eef2ff"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ShiftCard;
const MetricBox = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <View style={[styles.metricBox, { backgroundColor: color }]}>
    <Text style={styles.metricLabel}>{label}: </Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);


const styles = StyleSheet.create({
  cityCard: {
    flex: 1,
    minWidth: 170, // Reduced to allow 2 cards on most screens
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cityCardHeader: {
    padding: 10, // Reduced from 16
    gap: 8,
  },
  cityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cityTitle: {
    color: '#fff',
    fontSize: 14, // Reduced from 16
    fontWeight: '700',
  },
  cityDate: {
    color: '#f2f4ff',
    marginTop: 4,
    fontSize: 12,
  },
  liveChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveChipText: {
    fontWeight: '700',
    fontSize: 12,
  },
  cityStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Reduced from 20
    justifyContent: 'space-between',
  },
  statusBadge: {
    backgroundColor: '#ffffff30',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  statusHighlight: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  statusHighlightDeclared: {
    color: '#065f46',
  },
  cityCardBody: {
    flexDirection: 'row',
    padding: 8, // Reduced from 16
    gap: 6, // Reduced from 12
    backgroundColor: '#fff',
  },
  metricBox: {
    flex: 1,
    borderRadius: 8,
    padding: 6, // Reduced from 8
    flexDirection: 'row', // Horizontal layout
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: '#57607a',
    fontSize: 11,
  },
  metricValue: {
    fontSize: 12, // Reduced from 14
    fontWeight: '700',
    color: '#1d2238',
  },
})