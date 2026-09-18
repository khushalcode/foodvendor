// Formatting helpers — ported from the Flutter `lib/helper/` folder.

export function formatCurrency(amount: number | null | undefined, currency = '$'): string {
  if (amount == null || Number.isNaN(amount)) return `${currency}0.00`;
  const value = Number(amount);
  return `${currency}${value.toFixed(2)}`;
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDate(date: string | Date | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, opts ?? { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// Returns a "x min ago" / "2 hours ago" style string.
export function timeAgo(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

// Counts down to a target datetime — used by the order card "x min left" badge.
export function minutesUntil(date: string | Date | null): number | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 60_000));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone;
  return `${phone.slice(0, 2)}****${phone.slice(-2)}`;
}

// Compute final price after applying a coupon. Returns the discount amount.
export function computeDiscount(price: number, coupon: { discount_type: 'percentage' | 'fixed'; discount_amount: number; max_discount: number | null; min_purchase: number }): number {
  if (price < coupon.min_purchase) return 0;
  let discount = coupon.discount_type === 'percentage'
    ? (price * coupon.discount_amount) / 100
    : coupon.discount_amount;
  if (coupon.max_discount != null) discount = Math.min(discount, coupon.max_discount);
  return Math.min(discount, price);
}

// Quick ISO date string builder for HTML date inputs
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
