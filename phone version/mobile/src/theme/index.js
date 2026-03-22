export const colors = {
  bg: '#0e0e11',
  surface: '#17171c',
  card: '#1e1e26',
  card2: '#242430',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  accent: '#7c6aff',
  accent2: '#a695ff',
  green: '#2ecc8a',
  red: '#ff5f6d',
  amber: '#ffb347',
  text: '#f0eff8',
  text2: '#9896b0',
  text3: '#5c5a72',
};

export const CATEGORIES = [
  { id: 'food',          emoji: '🍔', label: 'Food',       color: '#ff6b6b' },
  { id: 'transport',     emoji: '🚗', label: 'Transport',  color: '#ffd93d' },
  { id: 'shopping',      emoji: '🛍️', label: 'Shopping',   color: '#a29bfe' },
  { id: 'health',        emoji: '💊', label: 'Health',     color: '#55efc4' },
  { id: 'housing',       emoji: '🏠', label: 'Housing',    color: '#74b9ff' },
  { id: 'entertainment', emoji: '🎮', label: 'Fun',        color: '#fd79a8' },
  { id: 'education',     emoji: '📚', label: 'Education',  color: '#fdcb6e' },
  { id: 'salary',        emoji: '💼', label: 'Salary',     color: '#2ecc8a' },
  { id: 'freelance',     emoji: '🖥️', label: 'Freelance',  color: '#00cec9' },
  { id: 'investment',    emoji: '📈', label: 'Investment', color: '#6c5ce7' },
  { id: 'other',         emoji: '💫', label: 'Other',      color: '#b2bec3' },
];

export const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[10];
