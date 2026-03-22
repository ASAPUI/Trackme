import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';

export const fmt = (amount, currency = 'MAD') =>
  `${Number(amount).toLocaleString('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;

export const fmtDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return `Today · ${format(d, 'HH:mm')}`;
  return format(d, 'MMM d · HH:mm');
};

export const filterByPeriod = (transactions, period) => {
  if (period === 'all') return transactions;
  return transactions.filter(t => {
    const d = new Date(t.date);
    if (period === 'day')   return isToday(d);
    if (period === 'week')  return isThisWeek(d);
    if (period === 'month') return isThisMonth(d);
    return true;
  });
};

export const calcStats = (txns) => {
  const income   = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expenses, balance: income - expenses, count: txns.length };
};
