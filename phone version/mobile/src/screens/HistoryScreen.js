import React, { useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, isToday, isYesterday } from 'date-fns';
import useStore from '../store/useStore';
import { colors, getCat } from '../theme';
import { fmt, filterByPeriod } from '../utils/helpers';

const PERIODS = [
  { key: 'day', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'all', label: 'All' },
];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, deleteTransaction, user } = useStore();
  const [period, setPeriod] = useState('month');

  const filtered = filterByPeriod(transactions, period)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  // Group by date
  const grouped = filtered.reduce((acc, t) => {
    const d = new Date(t.date);
    const key = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
    const existing = acc.find(g => g.title === key);
    if (existing) existing.data.push(t);
    else acc.push({ title: key, data: [t] });
    return acc;
  }, []);

  const onDelete = (id) =>
    Alert.alert('Delete?', 'Remove this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);

  return (
    <View style={[s.root, { paddingTop: insets.top + 16 }]}>
      <View style={s.header}>
        <Text style={s.title}>History</Text>
        <Text style={s.count}>{filtered.length} transactions</Text>
      </View>

      <View style={s.tabsWrap}>
        {PERIODS.map(p => (
          <TouchableOpacity key={p.key} style={[s.tab, period===p.key && s.tabActive]} onPress={() => setPeriod(p.key)}>
            <Text style={[s.tabText, period===p.key && s.tabTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
          <Text style={s.emptyText}>No transactions in this period</Text>
        </View>
      ) : (
        <SectionList
          sections={grouped}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          renderSectionHeader={({ section }) => (
            <Text style={s.dateHeader}>{section.title}</Text>
          )}
          renderItem={({ item: t }) => {
            const cat = getCat(t.category);
            return (
              <TouchableOpacity style={s.txnRow} onLongPress={() => onDelete(t._id)} activeOpacity={0.7}>
                <View style={[s.icon, { backgroundColor: cat.color + '22' }]}>
                  <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
                </View>
                <View style={s.info}>
                  <Text style={s.name} numberOfLines={1}>{t.description}</Text>
                  <Text style={s.catText}>{cat.label}</Text>
                </View>
                <Text style={[s.amount, { color: t.type==='expense' ? colors.red : colors.green }]}>
                  {t.type==='expense'?'-':'+'}{fmt(t.amount, user?.currency)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  count: { fontSize: 13, color: colors.text3, marginTop: 2 },
  tabsWrap: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  tab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { fontSize: 13, fontWeight: '500', color: colors.text2 },
  tabTextActive: { color: '#fff' },
  dateHeader: { fontSize: 12, color: colors.text3, fontWeight: '600', letterSpacing: 0.5, marginTop: 20, marginBottom: 8 },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '500', color: colors.text },
  catText: { fontSize: 12, color: colors.text3, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: colors.text3, fontSize: 14 },
});
