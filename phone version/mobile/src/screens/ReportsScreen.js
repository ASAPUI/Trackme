import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import useStore from '../store/useStore';
import { colors, getCat, CATEGORIES } from '../theme';
import { fmt, filterByPeriod, calcStats } from '../utils/helpers';

const { width } = Dimensions.get('window');
const DONUT_R = 55, DONUT_STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * DONUT_R;

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, user, stats } = useStore();

  const monthTxns = filterByPeriod(transactions, 'month');
  const monthExpenses = monthTxns.filter(t => t.type === 'expense');
  const totalExp = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const budget = user?.monthlyBudget || 5000;
  const allStats = stats.all || {};
  const monthStats = stats.month || {};

  // Category breakdown
  const catData = useMemo(() => {
    const map = {};
    monthExpenses.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map)
      .map(([id, amount]) => ({ ...getCat(id), amount, pct: totalExp ? amount / totalExp : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthExpenses]);

  // Donut segments
  let offset = 0;
  const segments = catData.map(cat => {
    const dash = cat.pct * CIRCUMFERENCE;
    const gap = CIRCUMFERENCE - dash;
    const seg = { ...cat, dash, gap, offset: CIRCUMFERENCE - offset };
    offset += dash;
    return seg;
  });

  // Savings rate
  const savingsRate = allStats.income > 0 ? Math.max(0, allStats.balance / allStats.income * 100) : 0;
  const budgetUsage = (monthStats.expenses || 0) / budget * 100;

  // Health checks
  const health = [
    { label: 'Savings Rate', value: `${Math.round(savingsRate)}%`, status: savingsRate >= 20 ? 'good' : savingsRate >= 0 ? 'warn' : 'bad', desc: savingsRate >= 20 ? 'Excellent! Above 20% target' : savingsRate >= 10 ? 'Getting there, aim for 20%' : 'Try to increase your savings' },
    { label: 'Budget Usage', value: `${Math.round(budgetUsage)}%`, status: budgetUsage < 80 ? 'good' : budgetUsage < 100 ? 'warn' : 'bad', desc: budgetUsage < 80 ? `${fmt(budget - (monthStats.expenses||0), user?.currency)} remaining` : budgetUsage < 100 ? 'Approaching your limit!' : 'Over budget this month' },
    { label: 'Net Balance', value: fmt(allStats.balance || 0, user?.currency), status: (allStats.balance||0) >= 0 ? 'good' : 'bad', desc: (allStats.balance||0) >= 0 ? 'More income than expenses' : 'Expenses exceed income' },
  ];

  const statusColor = { good: colors.green, warn: colors.amber, bad: colors.red };
  const statusIcon  = { good: '✅', warn: '⚠️', bad: '🔴' };

  return (
    <ScrollView style={[s.root, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
      <Text style={s.pageTitle}>Reports</Text>
      <Text style={s.pageSub}>Month overview · {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>

      {/* Donut chart */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>SPENDING BY CATEGORY</Text>
        <View style={s.donutRow}>
          <Svg width={140} height={140} viewBox="0 0 140 140">
            <G rotation="-90" origin="70,70">
              {totalExp === 0 ? (
                <Circle cx="70" cy="70" r={DONUT_R} stroke={colors.card2} strokeWidth={DONUT_STROKE} fill="none" />
              ) : segments.map((seg, i) => (
                <Circle key={i} cx="70" cy="70" r={DONUT_R}
                  stroke={seg.color} strokeWidth={DONUT_STROKE} fill="none"
                  strokeDasharray={`${seg.dash} ${seg.gap}`}
                  strokeDashoffset={seg.offset}
                />
              ))}
            </G>
          </Svg>
          <View style={s.legend}>
            {catData.slice(0, 5).map(cat => (
              <View key={cat.id} style={s.legendRow}>
                <View style={[s.legendDot, { backgroundColor: cat.color }]} />
                <Text style={s.legendLabel} numberOfLines={1}>{cat.label}</Text>
                <Text style={s.legendPct}>{Math.round(cat.pct * 100)}%</Text>
              </View>
            ))}
            {catData.length === 0 && <Text style={{ color: colors.text3, fontSize: 13 }}>No expenses yet</Text>}
          </View>
        </View>
      </View>

      {/* Financial Health */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>FINANCIAL HEALTH</Text>
        {health.map(h => (
          <View key={h.label} style={[s.healthRow, { backgroundColor: statusColor[h.status] + '11', borderColor: statusColor[h.status] + '33' }]}>
            <Text style={{ fontSize: 18 }}>{statusIcon[h.status]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.healthLabel}>{h.label}</Text>
              <Text style={s.healthDesc}>{h.desc}</Text>
            </View>
            <Text style={[s.healthVal, { color: statusColor[h.status] }]}>{h.value}</Text>
          </View>
        ))}
      </View>

      {/* Top categories table */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>TOP EXPENSES THIS MONTH</Text>
        {catData.length === 0
          ? <Text style={{ color: colors.text3, fontSize: 14 }}>No expenses recorded</Text>
          : catData.slice(0, 6).map(cat => (
            <View key={cat.id} style={s.catRow}>
              <Text style={{ fontSize: 22, width: 36 }}>{cat.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={s.catName}>{cat.label}</Text>
                  <Text style={[s.catAmt, { color: colors.red }]}>{fmt(cat.amount, user?.currency)}</Text>
                </View>
                <View style={s.catBarTrack}>
                  <View style={[s.catBarFill, { width: `${cat.pct * 100}%`, backgroundColor: cat.color }]} />
                </View>
              </View>
            </View>
          ))
        }
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  pageTitle: { fontSize: 28, fontWeight: '700', color: colors.text, paddingHorizontal: 24 },
  pageSub: { fontSize: 13, color: colors.text3, paddingHorizontal: 24, marginTop: 4, marginBottom: 16 },
  card: { marginHorizontal: 20, backgroundColor: colors.card, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 11, color: colors.text3, letterSpacing: 0.8, fontWeight: '600', marginBottom: 16 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 13, color: colors.text2 },
  legendPct: { fontSize: 13, color: colors.text3, fontVariant: ['tabular-nums'] },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  healthLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  healthDesc: { fontSize: 11, color: colors.text3, marginTop: 2 },
  healthVal: { fontSize: 14, fontWeight: '700' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  catName: { fontSize: 13, fontWeight: '500', color: colors.text },
  catAmt: { fontSize: 13, fontWeight: '700' },
  catBarTrack: { height: 4, backgroundColor: colors.card2, borderRadius: 2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2 },
});
