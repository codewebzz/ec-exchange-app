import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useCountdown } from "../hooks/useCountdown";

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

  const getBadgeText = () => {
    if (card?.declared_number) return `${card.declared_number}`;
    if (isDeclared) return 'Declared';
    if (!countdown) return 'Live';
    if (countdown === "No time left & Not declared yet") return 'Ended';
    return countdown;
  };

  const isEnded = countdown === "No time left & Not declared yet";

  return (
    <View style={styles.cityCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isEnded || isDeclared}
        onPress={() => {
          if (!navigation) return;
          navigation.navigate("AddTransaction", {
            data: card,
            shiftId: card.id?.toString()
          });
        }}
      >
        <LinearGradient colors={gradientColors} style={styles.cityCardHeader}>
          <View style={styles.cityHeaderTop}>
            <Text style={styles.cityTitle} numberOfLines={1}>
              {card.name ?? "-"}
            </Text>
            <View style={[styles.liveChip, { backgroundColor: badgeBg }]}>
              <Text style={[styles.liveChipText, { color: badgeText }]} numberOfLines={1}>
                {getBadgeText()}
              </Text>
            </View>
          </View>
          <Text style={styles.cityDate}>{formatDate(card.open_date)}</Text>
        </LinearGradient>

        {/* Body */}
        <View style={styles.cityCardBody}>
          <MetricBox label="Total" value={card.total ?? 0} color="#fff7ed" />
          <MetricBox label="Collection" value={card.collection ?? 0} color="#eef2ff" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ShiftCard;

const MetricBox = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <View style={[styles.metricBox, { backgroundColor: color }]}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  cityCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cityCardHeader: {
    padding: 10,
    gap: 4,
  },
  cityHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  cityTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  cityDate: {
    color: '#f2f4ff',
    fontSize: 11,
    marginTop: 2,
  },
  liveChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '50%',
  },
  liveChipText: {
    fontWeight: '700',
    fontSize: 10,
  },
  cityCardBody: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    backgroundColor: '#fff',
  },
  metricBox: {
    flex: 1,
    borderRadius: 8,
    padding: 6,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  metricLabel: {
    color: '#57607a',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d2238',
  },
});