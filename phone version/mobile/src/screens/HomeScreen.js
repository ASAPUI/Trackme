import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStore from '../store/useStore';
import { colors, getCat } from '../theme';
import { fmt, fmtDate, filterByPeriod } from '../utils/helpers';

const { width } = Dimensions.get('window');
const PERIODS = ['day','week','month','all'];
const PERIOD_LABELS = { day: 'Today', week: 'Week', month: 'Month', all: 'All' };

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, transactions, stats, period, setPeriod, fetchTransactions, loading } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, []);

  const current = stats[period] || {};
  const allStats = stats.all || {};
  const recent = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  // 7-day bar chart data
  const barData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dayTxns = transactions.filter(t => {
      const td = new Date(t.date);
      return td.toDateString() === d.toDateString() && t.type === 'expense';
    });
    return { day: ['S','M','T','W','T','F','S'][d.getDay()], amt: dayTxns.reduce((s,t)=>s+t.amount,0), isToday: i===6 };
  });
  const maxBar = Math.max(...barData.map(d=>d.amt), 1);

  const budgetPct = user?.monthlyBudget ? Math.min((stats.month?.expenses||0) / user.monthlyBudget * 100, 100) : 0;

  return (
    <ScrollView
      style={[s.root, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Good {getGreeting()},</Text>
          <Text style={s.userName}>{user?.name || 'User'} 👋</Text>
        </View>
        <TouchableOpacity style={s.avatar} onPress={() => navigation.navigate('Settings')}>
          <Text style={s.avatarText}>{(user?.name||'U')[0].toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Hero Card */}
      <View style={s.heroCard}>
        <Text style={s.heroLabel}>NET BALANCE</Text>
        <Text style={[s.heroAmount, { color: (allStats.balance||0) >= 0 ? colors.text : colors.red }]}>
          {fmt(allStats.balance || 0, user?.currency)}
        </Text>
        <Text style={s.heroSub}>{(allStats.balance||0) >= 0 ? 'You\'re on track 🎯' : 'Expenses exceed income'}</Text>

        {/* Budget bar */}
        {user?.monthlyBudget > 0 && (
          <View style={s.budgetBar}>
            <View style={s.budgetTrack}>
              <View style={[s.budgetFill, { width: `${budgetPct}%`, backgroundColor: budgetPct > 85 ? colors.red : budgetPct > 65 ? colors.amber : colors.green }]} />
            </View>
            <Text style={s.budgetLabel}>
              {fmt(stats.month?.expenses||0, user?.currency)} / {fmt(user.monthlyBudget, user?.currency)} budget
            </Text>
          </View>
        )}

        <View style={s.miniRow}>
          <View style={s.miniCard}>
            <Text style={s.miniLabel}>💰 GAINS</Text>
            <Text style={[s.miniVal, { color: colors.green }]}>{fmt(allStats.income||0, user?.currency)}</Text>
          </View>
          <View style={s.miniDivider} />
          <View style={s.miniCard}>
            <Text style={s.miniLabel}>💸 SPENT</Text>
            <Text style={[s.miniVal, { color: colors.red }]}>{fmt(allStats.expenses||0, user?.currency)}</Text>
          </View>
        </View>
      </View>

      {/* Period Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsWrap} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {PERIODS.map(p => (
          <TouchableOpacity key={p} style={[s.tab, period===p && s.tabActive]} onPress={() => setPeriod(p)}>
            <Text style={[s.tabText, period===p && s.tabTextActive]}>{PERIOD_LABELS[p]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Period Stats */}
      <View style={s.statsRow}>
        {[
          { label: 'Income', val: current.income||0, color: colors.green },
          { label: 'Spent',  val: current.expenses||0, color: colors.red },
          { label: 'Balance',val: current.balance||0, color: colors.accent2 },
        ].map(item => (
          <View key={item.label} style={s.statCard}>
            <Text style={s.statLabel}>{item.label}</Text>
            <Text style={[s.statVal, { color: item.color }]}>{fmt(item.val, user?.currency)}</Text>
          </View>
        ))}
      </View>

      {/* 7-Day Chart */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>7-DAY SPENDING</Text>
        <View style={s.barChart}>
          {barData.map((d, i) => (
            <View key={i} style={s.barCol}>
              <View style={s.barTrack}>
                <View style={[s.barFill, { height: `${Math.max(4, d.amt/maxBar*100)}%`, backgroundColor: d.isToday ? colors.accent : colors.accent + '55' }]} />
              </View>
              <Text style={[s.barDay, d.isToday && { color: colors.accent2 }]}>{d.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>RECENT</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {recent.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyText}>No transactions yet.{'\n'}Tap + to add your first one.</Text>
          </View>
        ) : (
          recent.map(t => <TxnRow key={t._id} t={t} currency={user?.currency} />)
        )}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function TxnRow({ t, currency }) {
  const cat = getCat(t.category);
  return (
    <View style={s.txnRow}>
      <View style={[s.txnIcon, { backgroundColor: cat.color + '22' }]}>
        <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
      </View>
      <View style={s.txnInfo}>
        <Text style={s.txnName} numberOfLines={1}>{t.description}</Text>
        <Text style={s.txnCat}>{cat.label} · {fmtDate(t.date)}</Text>
      </View>
      <Text style={[s.txnAmt, { color: t.type==='expense' ? colors.red : colors.green }]}>
        {t.type==='expense'?'-':'+'}{fmt(t.amount, currency)}
      </Text>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, marginBottom: 16 },
  greeting: { fontSize: 15, color: colors.text2 },
  userName: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  heroCard: { marginHorizontal: 20, backgroundColor: colors.card, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: colors.border },
  heroLabel: { fontSize: 11, letterSpacing: 1, color: colors.text3, fontWeight: '600' },
  heroAmount: { fontSize: 42, fontWeight: '700', marginVertical: 6, letterSpacing: -1 },
  heroSub: { fontSize: 13, color: colors.text2, marginBottom: 14 },
  budgetBar: { marginBottom: 16 },
  budgetTrack: { height: 5, backgroundColor: colors.card2, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  budgetFill: { height: '100%', borderRadius: 3 },
  budgetLabel: { fontSize: 11, color: colors.text3 },
  miniRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
  miniCard: { flex: 1, alignItems: 'center' },
  miniDivider: { width: 1, backgroundColor: colors.border },
  miniLabel: { fontSize: 10, color: colors.text3, letterSpacing: 0.5, fontWeight: '600' },
  miniVal: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  tabsWrap: { marginTop: 20 },
  tab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { fontSize: 13, fontWeight: '500', color: colors.text2 },
  tabTextActive: { color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 8, marginHorizontal: 20, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border },
  statLabel: { fontSize: 10, color: colors.text3, letterSpacing: 0.5, fontWeight: '600' },
  statVal: { fontSize: 14, fontWeight: '700', marginTop: 6 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 11, color: colors.text3, letterSpacing: 0.8, fontWeight: '600' },
  seeAll: { fontSize: 13, color: colors.accent2, fontWeight: '500' },
  barChart: { flexDirection: 'row', height: 90, gap: 6, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '100%', backgroundColor: colors.card2, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 6 },
  barDay: { fontSize: 10, color: colors.text3, fontWeight: '500' },
  txnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  txnIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txnInfo: { flex: 1 },
  txnName: { fontSize: 14, fontWeight: '500', color: colors.text },
  txnCat: { fontSize: 12, color: colors.text3, marginTop: 2 },
  txnAmt: { fontSize: 14, fontWeight: '700' },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: colors.text3, textAlign: 'center', fontSize: 14, lineHeight: 20 },
});
