import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import GradientBackground from '../../components/GradientBackground';
import LinearGradient from 'react-native-linear-gradient';
import APIService from '../services/APIService';
import { useCountdown } from '../../hooks/useCountdown';
import ShiftCard from '../../components/ShiftCard';


const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

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

const DashboardScreen = ({navigation}:any) => {
  const [recentUserRes, setRecentUserRes] = useState<any>([]);
  const [shiftDataRes, setShiftDataRes] = useState<any>([]);
  const [undeclaredRes, setUndeclaredRes] = useState<any>([]);
  const [ledgerRows, setLedgerRows] = useState<string[][]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [shiftLoading, setShiftLoading] = useState(false);
// console.log(recentUserRes,"recentUserResrecentUserResrecentUserRes")
  // const shiftCards = Array.isArray(recentUserRes?.data)
  //   ? recentUserRes.data
  //   : Array.isArray(recentUserRes)
  //   ? recentUserRes
  //   : [];

  const redeclareRows: Array<{
    id: number;
    shiftName: string;
    date: string;
    transactions: number;
  }> = [];

 

 console.log(shiftDataRes,"shiftDataRes[]")
  const fetchRecentUsers = useCallback(async () => {
    console.log('[fetchRecentUsers] called');
    try {
      const response = await APIService.getRecentUser();
      // const response = await APIService.GetLeadger({ active: 1, per_page: 25 });
      const data = Array.isArray(response?.data) ? response.data : [];
      const formatted = data.map((item: any, index: number) => [
        (index + 1).toString(),
        item?.real_name ?? item?.name ?? '-',
        item?.username ?? '-',
        item?.user_role?.name ?? item?.user_role ?? '-',
        item?.created_by?.username ?? item?.created_by ?? '-',
        formatDateTime(item?.created_at),
        item?.active_status ? 'Active' : 'Inactive',
      ]);
      setRecentUserRes(formatted);
  
    } catch (error) {
      console.error('Recent fetchRecentUsers fetch failed', error);
      setRecentUserRes([]); // keep state consistent
    }
  }, []);
  const fetchShiftData = useCallback(async () => {
    console.log('[fetchShiftData] called');
    try {
      setShiftLoading(true);
      const response = await APIService.getDashboardShiftData();
      const data = Array.isArray(response?.data) ? response.data : [];
      setShiftDataRes(data);
      console.log('Shift data loaded:', data);
    } catch (error) {
      console.error('Recent fetchShiftData fetch failed', error);
      setShiftDataRes([]);
    } finally {
      setShiftLoading(false);
    }
  }, []);
  useEffect(() => {
    // loadRecentLedgers();
    fetchShiftData();
    fetchRecentUsers()
  }, [
    // loadRecentLedgers
    fetchRecentUsers,fetchShiftData]);
  // const fetchRecentUsers = useCallback(async () => {
  //   const resp = await APIService.getRecentUser();
  //   return Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
  // }, []);

  // const fetchShiftData = useCallback(async () => {
  //   const resp = await APIService.getDashboardShiftData();
  //   return Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
  // }, []);
  // const countdown = useCountdown(card.timeLimit);
  const fetchUndeclared = useCallback(async () => {
    const resp = await APIService.getallundeclaredtransactionsbydateshift();
    return Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
  }, []);
// console.log(fetchRecentUsers(),"fetchRecentUsersfetchRecentUsersfetchRecentUsers")
//   const fetchDashboardMeta = useCallback(async () => {
//     try {
//       const [recentUserPayload, shiftDataPayload, undeclaredPayload] = await Promise.all([
//         fetchRecentUsers(),
//         fetchShiftData(),
//         fetchUndeclared(),
//       ]);

//       setRecentUserRes(recentUserPayload);
//       setShiftDataRes(shiftDataPayload);
//       setUndeclaredRes(undeclaredPayload);

//       console.log('Dashboard recent users:', recentUserPayload);
//       console.log('Dashboard shift data:', shiftDataPayload);
//       console.log('Dashboard undeclared transactions:', undeclaredPayload);
//     } catch (err) {
//       console.error('Dashboard meta fetch failed', err);
//     }
//   }, [fetchRecentUsers, fetchShiftData, fetchUndeclared]);

  // useEffect(() => {
  //   fetchDashboardMeta();
  // }, [fetchDashboardMeta]);
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <GradientBackground colors={[ "#fdf0d0","#e0efea"]} locations={[0,30]}>
      <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
     
     <ScreenHeader title={"Dashboard"} navigation={navigation} hideBackButton={true} showDrawerButton={true} />
   
  <ScrollView
     contentContainerStyle={styles.scrollContent}
     showsVerticalScrollIndicator={false}
    nestedScrollEnabled
   >
     <View style={styles.topRow}>
       {shiftLoading ? (
         <View style={styles.shiftLoading}>
           <ActivityIndicator color="#4f46e5" size="large" />
         </View>
       ) : Array.isArray(shiftDataRes) && shiftDataRes.length > 0 ? (
        shiftDataRes.map((card: any) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2e33dffb-7baa-4cb6-aa5f-9efc22abb991',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardScreen.tsx:167',message:'Rendering ShiftCard',data:{hasNavigation:!!navigation,navigationType:typeof navigation,willPassNavigation:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return (
          <ShiftCard
            key={card.id?.toString() ?? card.name}
            card={card}
            navigation={navigation}
          />
        )})
      ): (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No shift data available</Text>
        </View>
      )}
     </View>

     <View style={styles.sectionsRow}>
       <View style={styles.sectionCard}>
         <SectionHeader
           title="Recent Ledgers"
           subtitle="Latest declarations"
           actionLabel="Export"
           onAction={() => {}}
         />
         <DashboardTable
           headers={['S.No.', 'Name', 'Username', 'Role', 'Created By', 'Created At', 'Status']}
           rows={recentUserRes}
           statusColumnIndex={6}
          columnWidths={[60, 160, 140, 120, 140, 170, 100]}
           loading={ledgerLoading}
           emptyText="No ledgers found"
         />
       </View>

       <View style={styles.sectionCard}>
         <SectionHeader
           title="Redeclare Transaction"
           subtitle="Audit trail"
           actionLabel="Export"
           onAction={() => {}}
         />
         {redeclareRows.length === 0 ? (
           <View style={styles.emptyState}>
             <Text style={styles.emptyStateText}>No results found.</Text>
           </View>
         ) : (
           <DashboardTable
             headers={['S.No.', 'Shift Name', 'Date', 'Transactions', 'Action']}
             rows={redeclareRows.map(item => [
               item.id.toString(),
               item.shiftName,
               item.date,
               item.transactions.toString(),
               'View',
             ])}
           />
         )}
       </View>
     </View>

   </ScrollView>

   </SafeAreaView>
      </GradientBackground>
    
    </GestureHandlerRootView>
  );
};

export default DashboardScreen;

const MetricBox = ({label, value, color}:{label:string; value:string | number; color:string}) => (
  <View style={[styles.metricBox, {backgroundColor: color}]}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
}:{
  title:string;
  subtitle:string;
  actionLabel?:string;
  onAction?:()=>void;
}) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
    {!!actionLabel && (
      <TouchableOpacity style={styles.sectionAction} onPress={onAction}>
        <Text style={styles.sectionActionText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const DashboardTable = ({
  headers,
  rows,
  statusColumnIndex,
  columnWidths,
  loading,
  emptyText = 'No data available',
}:{
  headers:string[];
  rows:string[][];
  statusColumnIndex?:number;
  columnWidths?:number[];
  loading?:boolean;
  emptyText?:string;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    nestedScrollEnabled
    contentContainerStyle={styles.tableScrollContent}
  >
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        {headers.map((header, index) => (
          <View
            key={header}
            style={[
              styles.cellWrapper,
              columnWidths?.[index]
                ? {minWidth: columnWidths[index], maxWidth: columnWidths[index]}
                : null,
            ]}
          >
            <Text style={[styles.cell, styles.headerCell, index === 0 && styles.cellCenter]}>
              {header}
            </Text>
          </View>
        ))}
      </View>
      {loading ? (
        <View style={styles.tableLoading}>
          <ActivityIndicator color="#4f46e5" />
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{emptyText}</Text>
        </View>
      ) : (
        rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[styles.tableRow, rowIndex % 2 === 1 && styles.tableRowStriped]}
          >
            {row.map((value, colIndex) => (
              <View
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.cellWrapper,
                  columnWidths?.[colIndex]
                    ? {minWidth: columnWidths[colIndex], maxWidth: columnWidths[colIndex]}
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.cell,
                    statusColumnIndex === colIndex && value === 'Active' && styles.activeBadge,
                    colIndex === 0 && styles.cellCenter,
                    statusColumnIndex === colIndex && styles.cellCenter,
                  ]}
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
    gap: 20,
  },
  safeAreaContainer: {
    flex: 1,
    // backgroundColor removed to allow gradient to show through
  },
  topRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  cityCard: {
    flex: 1,
    minWidth: 260,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#00000030',
    shadowOffset: {width:0, height:6},
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cityCardHeader: {
    padding: 16,
    gap: 12,
  },
  cityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cityTitle: {
    color: '#fff',
    fontSize: 16,
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
    marginTop: 20,
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
    fontSize: 24,
    fontWeight: '700',
  },
  statusHighlightDeclared: {
    color: '#065f46',
  },
  cityCardBody: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  metricBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
  },
  metricLabel: {
    color: '#57607a',
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d2238',
  },
  sectionsRow: {
    // flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  sectionCard: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: "100%",
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#00000020',
    shadowOffset: {width:0, height:4},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b2635',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7c8696',
    marginTop: 2,
  },
  sectionAction: {
    borderWidth: 1,
    borderColor: '#dfe3f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sectionActionText: {
    fontWeight: '600',
    color: '#1b2635',
  },
  table: {
    borderWidth: 1,
    borderColor: '#edf0f7',
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 760,
  },
  tableScrollContent: {
    flexGrow: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableRowStriped: {
    backgroundColor: '#fbfcff',
  },
  tableHeaderRow: {
    backgroundColor: '#f7f8fb',
  },
  cellWrapper: {
    flex: 1,
    minWidth: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  cell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#334155',
  },
  cellCenter: {
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: '700',
    fontSize: 12,
    color: '#1d2238',
  },
  tableLoading: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    color: '#16a34a',
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#8f95a3',
    fontSize: 13,
  },
  shiftLoading: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
