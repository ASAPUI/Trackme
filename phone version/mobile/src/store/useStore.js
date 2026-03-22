import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import { filterByPeriod, calcStats } from '../utils/helpers';

const useStore = create((set, get) => ({
  // Auth
  user: null,
  token: null,

  // Data
  transactions: [],
  stats: { day: {}, week: {}, month: {}, all: {} },
  loading: false,
  error: null,

  // UI
  period: 'month',
  setPeriod: (period) => {
    set({ period });
    get().computeStats();
  },

  // Auth actions
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('ft_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch (e) {
      set({ error: e.response?.data?.error || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      await AsyncStorage.setItem('ft_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch (e) {
      set({ error: e.response?.data?.error || 'Registration failed', loading: false });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('ft_token');
    set({ user: null, token: null, transactions: [] });
  },

  restoreSession: async () => {
    const token = await AsyncStorage.getItem('ft_token');
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, token });
      await get().fetchTransactions();
    } catch {
      await AsyncStorage.removeItem('ft_token');
    }
  },

  // Transaction actions
  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/transactions?limit=200');
      set({ transactions: data.transactions, loading: false });
      get().computeStats();
    } catch (e) {
      // Offline fallback: load from AsyncStorage
      const cached = await AsyncStorage.getItem('ft_txns_cache');
      if (cached) set({ transactions: JSON.parse(cached) });
      set({ loading: false });
    }
  },

  addTransaction: async (txnData) => {
    try {
      const { data } = await api.post('/transactions', txnData);
      set(s => ({ transactions: [data, ...s.transactions] }));
      get().computeStats();
      // Cache for offline
      const all = get().transactions;
      await AsyncStorage.setItem('ft_txns_cache', JSON.stringify(all));
      return data;
    } catch (e) {
      // Offline: save locally
      const offlineTxn = { ...txnData, _id: Date.now().toString(), date: new Date().toISOString(), offline: true };
      set(s => ({ transactions: [offlineTxn, ...s.transactions] }));
      get().computeStats();
      return offlineTxn;
    }
  },

  deleteTransaction: async (id) => {
    set(s => ({ transactions: s.transactions.filter(t => t._id !== id) }));
    get().computeStats();
    try { await api.delete(`/transactions/${id}`); } catch {}
  },

  computeStats: () => {
    const txns = get().transactions;
    set({
      stats: {
        day:   calcStats(filterByPeriod(txns, 'day')),
        week:  calcStats(filterByPeriod(txns, 'week')),
        month: calcStats(filterByPeriod(txns, 'month')),
        all:   calcStats(txns),
      }
    });
  },

  updateBudget: async (budget) => {
    try {
      const { data } = await api.patch('/auth/profile', { monthlyBudget: budget });
      set(s => ({ user: { ...s.user, monthlyBudget: data.monthlyBudget } }));
    } catch {}
  },

  clearError: () => set({ error: null }),
}));

export default useStore;
