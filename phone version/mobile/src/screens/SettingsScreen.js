import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStore from '../store/useStore';
import { colors } from '../theme';
import { fmt } from '../utils/helpers';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateBudget, transactions } = useStore();
  const [budget, setBudget] = useState(String(user?.monthlyBudget || 5000));
  const [alerts, setAlerts] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveBudget = async () => {
    const val = parseFloat(budget);
    if (!val || val <= 0) return Alert.alert('Invalid budget', 'Please enter a valid amount.');
    setSaving(true);
    await updateBudget(val);
    setSaving(false);
    Alert.alert('Saved!', `Monthly budget set to ${fmt(val, user?.currency)}`);
  };

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);

  const Row = ({ icon, bg, title, subtitle, right }) => (
    <View style={s.row}>
      <View style={[s.rowIcon, { backgroundColor: bg }]}>
        <Text style={{ fontSize: 17 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );

  return (
    <ScrollView style={[s.root, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
      <Text style={s.pageTitle}>Settings</Text>

      {/* Profile */}
      <Text style={s.groupLabel}>PROFILE</Text>
      <View style={s.card}>
        <Row icon="👤" bg={colors.accent+'22'} title={user?.name || 'User'} subtitle={user?.email} right={<Text style={s.chevron}>›</Text>} />
        <Row icon="🌍" bg={colors.blue+'22'} title="Currency" subtitle="Moroccan Dirham (MAD)" right={<Text style={s.chevron}>›</Text>} />
      </View>

      {/* Budget */}
      <Text style={s.groupLabel}>BUDGET</Text>
      <View style={s.card}>
        <View style={s.row}>
          <View style={[s.rowIcon, { backgroundColor: colors.green+'22' }]}>
            <Text style={{ fontSize: 17 }}>💰</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>Monthly Budget</Text>
            <Text style={s.rowSub}>Current: {fmt(user?.monthlyBudget || 5000, user?.currency)}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              style={s.budgetInput}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              placeholder="5000"
              placeholderTextColor={colors.text3}
            />
            <TouchableOpacity style={s.saveBtn} onPress={handleSaveBudget} disabled={saving}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{saving ? '...' : 'SET'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Row
          icon="🔔"
          bg={colors.amber+'22'}
          title="Budget Alerts"
          subtitle="Notify at 80% usage"
          right={<Switch value={alerts} onValueChange={setAlerts} trackColor={{ true: colors.accent }} thumbColor="#fff" />}
        />
      </View>

      {/* AI Settings */}
      <Text style={s.groupLabel}>AI ASSISTANT</Text>
      <View style={s.card}>
        <Row icon="🤖" bg={colors.accent+'22'} title="AI Provider" subtitle="Groq · Llama 3.1 · Free tier" right={<Text style={s.chevron}>›</Text>} />
        <Row icon="🔑" bg="#f7ca7422" title="API Key" subtitle="Configure Groq API key" right={<Text style={s.chevron}>›</Text>} />
      </View>

      {/* Stats */}
      <Text style={s.groupLabel}>YOUR DATA</Text>
      <View style={s.card}>
        <Row icon="📊" bg={colors.accent+'22'} title="Total Transactions" subtitle={`${transactions.length} recorded`} />
        <Row icon="📅" bg="#74b9ff22" title="Member Since" subtitle={new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
      </View>

      {/* Danger zone */}
      <Text style={s.groupLabel}>ACCOUNT</Text>
      <View style={s.card}>
        <TouchableOpacity style={s.row} onPress={handleLogout}>
          <View style={[s.rowIcon, { backgroundColor: colors.red+'22' }]}>
            <Text style={{ fontSize: 17 }}>🚪</Text>
          </View>
          <Text style={[s.rowTitle, { color: colors.red }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.footer}>FlowTrack v1.0 · Made with ❤️ in Casablanca{'\n'}AI powered by Groq · Free forever</Text>
      <View style={{ height: insets.bottom + 100 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  pageTitle: { fontSize: 28, fontWeight: '700', color: colors.text, paddingHorizontal: 24, marginBottom: 20 },
  groupLabel: { fontSize: 11, color: colors.text3, letterSpacing: 0.8, fontWeight: '600', paddingHorizontal: 24, marginBottom: 8, marginTop: 16 },
  card: { marginHorizontal: 20, backgroundColor: colors.card, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  rowIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  rowSub: { fontSize: 12, color: colors.text3, marginTop: 1 },
  chevron: { color: colors.text3, fontSize: 20 },
  budgetInput: { backgroundColor: colors.card2, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, color: colors.text, fontSize: 14, width: 80, textAlign: 'right' },
  saveBtn: { backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  footer: { textAlign: 'center', color: colors.text3, fontSize: 12, lineHeight: 20, marginTop: 28, paddingHorizontal: 24 },
});
