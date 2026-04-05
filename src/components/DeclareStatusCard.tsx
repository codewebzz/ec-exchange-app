import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, FlatList } from 'react-native';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';

const noDataAnimation = require('../assets/gif/NoDataAnimation.json');
interface DataConfig {
  key: string;
  label: string;
}

interface DeclareStatusCardProps {
  data: Record<string, any>[];
  config: DataConfig[];
  statusKey?: string;
  onActionOne?: (item: any) => void;
  onActionTwo?: (item: any) => void;
  actionOneLabel?: string;
  actionTwoLabel?: string;
  isButtonOne?: boolean;
  isButtonTwo?: boolean
  value?: boolean
  useToggleOne?: boolean;
  activeKey?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const DeclareStatusCard = ({
  data,
  config,
  statusKey = 'status',
  onActionOne,
  onActionTwo,
  actionOneLabel = 'Edit',
  actionTwoLabel = 'Delete',
  isButtonOne = true,
  isButtonTwo = true,
  value,
  useToggleOne = false,
  activeKey = 'active_status',
  refreshing = false,
  onRefresh,
}: DeclareStatusCardProps) => {
  const formatValue = (value: any, key: string) => {
    if (value === null || value === undefined) {
      return '';
    }

    // Handle amount fields specifically
    if (key.toLowerCase().includes('amount')) {
      if (typeof value === 'number') {
        return value.toString();
      }
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return value;
      }
    }

    if (value instanceof Date) {
      if (key.toLowerCase().includes('time') || key.toLowerCase().includes('timestamp')) {
        return value.toLocaleString();
      }
      if (key.toLowerCase().includes('datetime') || key.toLowerCase().includes('created') || key.toLowerCase().includes('updated')) {
        return value.toLocaleString();
      }
      return value.toLocaleDateString();
    }

    if (typeof value === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
      return value;
    }

    // Only try to parse as date if it's not a number and not an amount field
    if (typeof value === 'string' && !isNaN(Date.parse(value)) && !key.toLowerCase().includes('amount')) {
      const date = new Date(value);
      if (key.toLowerCase().includes('time') || key.toLowerCase().includes('timestamp') ||
        key.toLowerCase().includes('datetime') || key.toLowerCase().includes('created') ||
        key.toLowerCase().includes('updated')) {
        return date.toLocaleString();
      }
      return date.toLocaleDateString();
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return '';
      // If array contains objects, try to present meaningful labels
      if (typeof value[0] === 'object') {
        const mapped = value.map((v: any) => {
          if (v == null) return '';
          if (typeof v !== 'object') return String(v);
          if (v.name) return v.name;
          if (v.title) return v.title;
          if (v.label) return v.label;
          if (v.username) return v.username;
          if (v.real_name) return v.real_name;
          if (v.id !== undefined) return String(v.id);
          return JSON.stringify(v);
        });
        return mapped.join(', ');
      }
      // Primitive arrays
      return value.map((v) => String(v)).join(', ');
    }

    if (typeof value === 'object') {
      // Handle common object patterns
      if (value.name) {
        return value.name;
      }
      if (value.title) {
        return value.title;
      }
      if (value.label) {
        return value.label;
      }
      // For user_role specifically, you could add:
      // if (key === 'user_role' && value.name) {
      //   return value.name;
      // }

      // Fallback: join object values for readability
      try {
        const objectValues = Object.values(value).map((v) => String(v));
        return objectValues.join(', ');
      } catch {
        return JSON.stringify(value);
      }
    }

    return String(value);
  };
  const getStatusMeta = (status?: string) => {
    if (!status) return { color: '#9CA3AF', icon: 'info', label: '' };
    const s = String(status).toLowerCase();
    if (s.includes('approve')) return { color: '#10B981', icon: 'check-circle', label: 'Approved' };
    if (s.includes('reject')) return { color: '#EF4444', icon: 'cancel', label: 'Rejected' };
    if (s.includes('pending') || s.includes('hold')) return { color: '#F59E0B', icon: 'schedule', label: 'Pending' };
    if (s.includes('active')) return { color: '#10B981', icon: 'check-circle', label: 'Active' };
    if (s.includes('inactive')) return { color: '#9CA3AF', icon: 'pause-circle-filled', label: 'Inactive' };
    return { color: '#3B82F6', icon: 'info', label: String(status) };
  };

  const getActiveButtonStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? '#10B981' : '#EF476F',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: 999,
  });
  const renderCard = ({ item, index }: { item: any; index: number }) => {
    const statusVal = item[statusKey];
    const borderColor = getBorderColor(statusVal);
    const status = getStatusMeta(statusVal);

    return (
      <View style={[styles.card, { borderLeftColor: borderColor }]}>
        <View style={styles.headerRow}>
          <View style={styles.statusPill}>
            <Icon name={status.icon as any} size={16} color={status.color} />
            {!!status.label && <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>}
          </View>
          <View style={styles.indexPill}>
            <Text style={styles.indexText}>#{index + 1}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {config.map((field, i) => {
          const v = formatValue(item[field.key], field.key);
          return (
            <View key={field.key + String(i)} style={styles.kvRow}>
              <Text style={styles.keyText}>{field.label}</Text>
              <Text style={styles.valueText} numberOfLines={1}>{String(v) || '-'}</Text>
            </View>
          );
        })}

        <View style={styles.footerRow}>
          {useToggleOne ? (
            <View style={styles.toggleWrap}>
              <Text style={styles.toggleLabel}>Status</Text>
              <Switch value={Boolean(item["" + String(activeKey)])} onValueChange={() => onActionOne?.(item)} />
            </View>
          ) : (
            isButtonOne && (
              <TouchableOpacity onPress={() => onActionOne?.(item)} style={getActiveButtonStyle(Boolean(item["" + String(activeKey)]))} activeOpacity={0.85}>
                {/* <Icon name={Boolean(item["" + String(activeKey)]) ? 'toggle-on' : 'toggle-off'} size={18} color={'#FFFFFF'} style={{ marginRight: scale(6) }} /> */}
                <Text style={styles.primaryText}>{actionOneLabel ? actionOneLabel : (item["" + String(activeKey)] ? 'Active' : 'Inactive')}</Text>
              </TouchableOpacity>
            )
          )}

          {isButtonTwo && (
            <TouchableOpacity onPress={() => onActionTwo?.(item)} style={styles.secondaryBtn} activeOpacity={0.85}>
              <Icon name="delete-outline" size={18} color={'#B45309'} />
              <Text style={styles.secondaryText}>{actionTwoLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ marginBottom: scale(30), flex: 1 }}>
      <View style={styles.refreshHeader}>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton} disabled={!!refreshing} activeOpacity={0.85}>
          <Icon name="refresh" size={scale(18)} color={refreshing ? '#9CA3AF' : '#2563EB'} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={data || []}
        keyExtractor={(item, index) => String((item as any)?.id ?? index)}
        renderItem={renderCard}
        refreshing={Boolean(refreshing)}
        onRefresh={onRefresh}
        contentContainerStyle={(data && data.length > 0) ? styles.listContent : styles.emptyListContainer}
        ListEmptyComponent={EmptyStateAnimation}
      />
    </View>
  );
};

const EmptyStateAnimation = React.memo(() => {
  const animationRef = useRef<LottieView>(null);

  return (
    <View style={styles.emptyContainer}>
      <LottieView
        ref={animationRef}
        source={noDataAnimation}
        autoPlay
        loop
        style={styles.emptyAnimation}
        resizeMode="contain"
        hardwareAccelerationAndroid
      />
    </View>
  );
});

const getBorderColor = (status: string) => {
  if (!status) return '#9CA3AF';
  switch (status.toLowerCase()) {
    case 'approved':
      return '#10B981';
    case 'pending':
      return '#F59E0B';
    case 'rejected':
      return '#EF4444';
    case 'under review':
      return '#6366F1';
    default:
      return '#9CA3AF';
  }
};

export default DeclareStatusCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderLeftWidth: 4,
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    marginBottom: scale(14),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: scale(12),
    fontWeight: '700',
    marginLeft: 6,
  },
  indexPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  indexText: {
    fontSize: scale(12),
    color: '#111827',
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: scale(10),
  },
  kvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  keyText: {
    color: '#6B7280',
    fontSize: scale(12),
  },
  valueText: {
    color: '#111827',
    fontSize: scale(13),
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: scale(12),
    color: '#374151',
    fontWeight: '600',
    marginRight: 8,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: scale(6),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionBtn: {
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  secondaryText: {
    marginLeft: 6,
    color: '#92400E',
    fontSize: 13,
    fontWeight: '700',
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(40),
    minHeight: scale(300),
  },
  emptyAnimation: {
    width: scale(200),
    height: scale(200),
  },
  emptyText: {
    fontSize: scale(16),
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  refreshHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
  },
  refreshButton: {
    padding: scale(8),
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  listContent: {
    paddingHorizontal: scale(12),
    paddingTop: scale(4),
    paddingBottom: scale(12),
  },
});