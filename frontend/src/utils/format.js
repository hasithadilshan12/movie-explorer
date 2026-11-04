import { LANGUAGES } from './constants';

export function formatRuntime(minutes) {
  if (!minutes || minutes < 1) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function formatMoney(value) {
  if (!value || value <= 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value, fallback = '—') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatYear(value) {
  if (!value) return '';
  return String(value).slice(0, 4);
}

export function formatRelative(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

export function formatLanguage(code) {
  if (!code) return '—';
  return LANGUAGES[code] || code.toUpperCase();
}

export function formatCount(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('en-US').format(number);
}

export function initials(name = '?') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function truncate(text = '', length = 140) {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}
