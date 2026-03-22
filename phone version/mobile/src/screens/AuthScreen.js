import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStore from '../store/useStore';
import { colors } from '../theme';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register, loading, error, clearError } = useStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const update = (key, val) => { clearError(); setForm(f => ({ ...f, [key]: val })); };

  const submit = async () => {
    if (mode === 'login') {
      await login(form.email.trim(), form.password);
    } else {
      await register(form.name.trim(), form.email.trim(), form.password);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={[s.hero, { paddingTop: insets.top + 40 }]}>
          <Text style={s.logo}>💸</Text>
          <Text style={s.appName}>FlowTrack</Text>
          <Text style={s.tagline}>Your smart expense companion</Text>
        </View>

        {/* Card */}
        <View style={[s.card, { paddingBottom: insets.bottom + 30 }]}>
          {/* Tabs */}
          <View style={s.tabs}>
            <TouchableOpacity style={[s.tab, mode==='login' && s.tabActive]} onPress={() => { setMode('login'); clearError(); }}>
              <Text style={[s.tabText, mode==='login' && s.tabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tab, mode==='register' && s.tabActive]} onPress={() => { setMode('register'); clearError(); }}>
              <Text style={[s.tabText, mode==='register' && s.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {mode === 'register' && (
            <View style={s.field}>
              <Text style={s.label}>FULL NAME</Text>
              <TextInput style={s.input} placeholder="Amine Benali" placeholderTextColor={colors.text3}
                value={form.name} onChangeText={v => update('name', v)} autoCapitalize="words" />
            </View>
          )}

          <View style={s.field}>
            <Text style={s.label}>EMAIL</Text>
            <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={colors.text3}
              value={form.email} onChangeText={v => update('email', v)}
              autoCapitalize="none" keyboardType="email-address" />
          </View>

          <View style={s.field}>
            <Text style={s.label}>PASSWORD</Text>
            <TextInput style={s.input} placeholder="••••••••" placeholderTextColor={colors.text3}
              value={form.password} onChangeText={v => update('password', v)} secureTextEntry />
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity style={[s.btn, { opacity: loading ? 0.7 : 1 }]} onPress={submit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
            }
          </TouchableOpacity>

          <Text style={s.hint}>
            {mode === 'login' ? 'New to FlowTrack? ' : 'Already have an account? '}
            <Text style={{ color: colors.accent2, fontWeight: '600' }} onPress={() => { setMode(mode==='login'?'register':'login'); clearError(); }}>
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: 'center', paddingBottom: 40 },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 36, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  tagline: { fontSize: 15, color: colors.text3, marginTop: 6 },
  card: { backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, flex: 1 },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  tabActive: { backgroundColor: colors.accent },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.text3 },
  tabTextActive: { color: '#fff' },
  field: { marginBottom: 16 },
  label: { fontSize: 11, color: colors.text3, letterSpacing: 0.8, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 15, color: colors.text, fontSize: 16 },
  error: { color: colors.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: { backgroundColor: colors.accent, borderRadius: 16, padding: 17, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  hint: { textAlign: 'center', color: colors.text3, fontSize: 14 },
});
