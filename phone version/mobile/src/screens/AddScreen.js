import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStore from '../store/useStore';
import { colors, CATEGORIES } from '../theme';
import { fmt } from '../utils/helpers';

export default function AddScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { addTransaction, user } = useStore();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('food');
  const [loading, setLoading] = useState(false);

  const visibleCats = type === 'expense'
    ? CATEGORIES.filter(c => !['salary','freelance','investment'].includes(c.id))
    : CATEGORIES.filter(c => ['salary','freelance','investment','other'].includes(c.id));

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return Alert.alert('Invalid amount', 'Please enter a valid amount.');
    if (!desc.trim()) return Alert.alert('Description required', 'Please describe this transaction.');
    setLoading(true);
    await addTransaction({ type, amount: amt, description: desc.trim(), category });
    setLoading(false);
    setAmount(''); setDesc(''); setCategory('food');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, paddingTop: insets.top + 16 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={s.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={s.title}>New Transaction</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Type Toggle */}
        <View style={s.typeRow}>
          <TouchableOpacity style={[s.typeBtn, type==='expense' && s.typeBtnExpenseActive]} onPress={() => { setType('expense'); setCategory('food'); }}>
            <Text style={[s.typeBtnText, type==='expense' && { color: colors.red }]}>💸 Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.typeBtn, type==='income' && s.typeBtnIncomeActive]} onPress={() => { setType('income'); setCategory('salary'); }}>
            <Text style={[s.typeBtnText, type==='income' && { color: colors.green }]}>💰 Income</Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={s.amountWrap}>
          <Text style={s.currency}>{user?.currency || 'MAD'}</Text>
          <TextInput
            style={[s.amountInput, { color: type==='expense' ? colors.red : colors.green }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.text3}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        <View style={s.section}>
          <Text style={s.label}>DESCRIPTION</Text>
          <TextInput
            style={s.input}
            value={desc}
            onChangeText={setDesc}
            placeholder="What was this for?"
            placeholderTextColor={colors.text3}
          />
        </View>

        <View style={s.section}>
          <Text style={s.label}>CATEGORY</Text>
          <View style={s.catGrid}>
            {visibleCats.map(cat => (
              <TouchableOpacity key={cat.id} style={[s.catBtn, category===cat.id && { backgroundColor: cat.color + '22', borderColor: cat.color }]} onPress={() => setCategory(cat.id)}>
                <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                <Text style={[s.catLabel, category===cat.id && { color: cat.color }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[s.submitBtn, { opacity: loading ? 0.7 : 1 }]} onPress={submit} disabled={loading}>
          <Text style={s.submitText}>{loading ? 'Saving...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}</Text>
        </TouchableOpacity>
        <View style={{ height: insets.bottom + 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.text2, fontSize: 16 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  typeRow: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 24 },
  typeBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  typeBtnExpenseActive: { backgroundColor: colors.red + '15', borderColor: colors.red },
  typeBtnIncomeActive: { backgroundColor: colors.green + '15', borderColor: colors.green },
  typeBtnText: { fontSize: 15, fontWeight: '600', color: colors.text2 },
  amountWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30, paddingHorizontal: 20 },
  currency: { fontSize: 24, color: colors.text3, marginRight: 8, marginTop: 8, fontWeight: '600' },
  amountInput: { fontSize: 56, fontWeight: '700', flex: 1, textAlign: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  label: { fontSize: 11, color: colors.text3, letterSpacing: 0.8, fontWeight: '600', marginBottom: 10 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 15, color: colors.text, fontSize: 16 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { width: '22%', aspectRatio: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', gap: 4 },
  catLabel: { fontSize: 10, color: colors.text3, fontWeight: '500' },
  submitBtn: { marginHorizontal: 20, padding: 18, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
