export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (date) =>
  date ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date)) : '';

export const formatDateTime = (date) =>
  date
    ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(date))
    : '';

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const diffMs = new Date(date).getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const divisions = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let duration = diffSec;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) return rtf.format(Math.round(duration), unit);
    duration /= amount;
  }
  return '';
};

export const truncate = (str, length = 100) => (str && str.length > length ? `${str.slice(0, length)}…` : str);
