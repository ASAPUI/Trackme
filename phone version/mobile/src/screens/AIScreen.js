import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStore from '../store/useStore';
import { colors } from '../theme';
import { fmt, filterByPeriod, calcStats } from '../utils/helpers';
import api from '../utils/api';

const QUICK_PROMPTS = [
  "How much did I spend today?",
  "Am I over budget?",
  "What's my biggest expense?",
  "How can I save more?",
  "Show my month summary",
];

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const { user, transactions, stats } = useStore();
  const [messages, setMessages] = useState([
    { id: '0', role: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm FlowAI, your personal finance assistant. I can see all your transactions and help you understand your spending habits. What would you like to know?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef();

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    const userMsg = { id: Date.now().toString(), role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history = messages.filter(m => m.role !== 'ai' || m.id !== '0')
        .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));
      history.push({ role: 'user', content: q });

      const { data } = await api.post('/ai/chat', { messages: history });
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: data.reply }]);
    } catch {
      // Local fallback when backend is not reachable
      const allStats = stats.all || {};
      const dayStats = stats.day || {};
      const monthStats = stats.month || {};
      const budget = user?.monthlyBudget || 5000;
      const lower = q.toLowerCase();

      let reply;
      if (lower.includes('today') || lower.includes('aujourd'))
        reply = `Today you've spent ${fmt(dayStats.expenses || 0, user?.currency)}. ${dayStats.expenses > 0 ? 'Keep an eye on your daily spending!' : 'No expenses recorded today yet.'}`;
      else if (lower.includes('budget'))
        reply = `You've used ${Math.round((monthStats.expenses || 0) / budget * 100)}% of your monthly budget. That's ${fmt(monthStats.expenses || 0, user?.currency)} out of ${fmt(budget, user?.currency)}.`;
      else if (lower.includes('balance'))
        reply = `Your overall balance is ${fmt(allStats.balance || 0, user?.currency)} (earned ${fmt(allStats.income || 0, user?.currency)}, spent ${fmt(allStats.expenses || 0, user?.currency)}).`;
      else if (lower.includes('save') || lower.includes('saving'))
        reply = allStats.income > 0
          ? `Your savings rate is ${Math.round((allStats.balance || 0) / allStats.income * 100)}%. Financial experts recommend saving at least 20% of your income.`
          : `Start by adding your income transactions to calculate your savings rate.`;
      else
        reply = `This month: earned ${fmt(monthStats.income || 0, user?.currency)}, spent ${fmt(monthStats.expenses || 0, user?.currency)}, balance ${fmt(monthStats.balance || 0, user?.currency)}. Budget at ${Math.round((monthStats.expenses || 0) / budget * 100)}%.`;

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: reply }]);
    }

    setLoading(false);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <View style={s.aiAvatar}>
          <Text style={{ fontSize: 20 }}>🤖</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.aiName}>FlowAI</Text>
          <Text style={s.aiStatus}>
            <Text style={{ color: colors.green }}>● </Text>Online · Llama 3.1 via Groq
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.role === 'user' ? s.bubbleUser : s.bubbleAI]}>
            <Text style={[s.bubbleText, item.role === 'user' && { color: '#fff' }]}>{item.text}</Text>
          </View>
        )}
        ListFooterComponent={loading ? (
          <View style={[s.bubble, s.bubbleAI, { flexDirection: 'row', gap: 8, alignItems: 'center' }]}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[s.bubbleText, { color: colors.text3 }]}>Thinking...</Text>
          </View>
        ) : null}
      />

      {/* Quick Prompts */}
      <FlatList
        horizontal
        data={QUICK_PROMPTS}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.quickBtn} onPress={() => send(item)}>
            <Text style={s.quickText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Input */}
      <View style={[s.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your finances..."
          placeholderTextColor={colors.text3}
          onSubmitEditing={() => send()}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity style={[s.sendBtn, { opacity: loading || !input.trim() ? 0.5 : 1 }]} onPress={() => send()} disabled={loading || !input.trim()}>
          <Text style={{ fontSize: 18 }}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  aiAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent + '33', alignItems: 'center', justifyContent: 'center' },
  aiName: { fontSize: 16, fontWeight: '700', color: colors.text },
  aiStatus: { fontSize: 12, color: colors.text3, marginTop: 1 },
  bubble: { maxWidth: '82%', padding: 14, borderRadius: 18, marginBottom: 10 },
  bubbleAI: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.accent, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  quickText: { fontSize: 12, color: colors.text2, whiteSpace: 'nowrap' },
  inputRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  input: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10, color: colors.text, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
