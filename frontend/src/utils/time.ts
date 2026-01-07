export function parseTimeToMinutes(t: string | undefined | null): number | null {
  if (!t) return null;
  const trimmed = t.trim();
  if (trimmed === '--:--' || trimmed === '') return null;
  const parts = trimmed.split(':');
  if (parts.length < 2) return null;
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

export function minutesToHHMM(mins: number): string {
  const sign = mins < 0 ? '-' : '';
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${sign}${hh}:${mm}`;
}

export function formatBankMinutes(mins: number): string {
  const sign = mins < 0 ? '-' : '+';
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}:${String(m).padStart(2, '0')}`;
}

export function diffMinutes(a: string | undefined | null, b: string | undefined | null): number | null {
  const ma = parseTimeToMinutes(a);
  const mb = parseTimeToMinutes(b);
  if (ma == null || mb == null) return null;
  return mb - ma;
}
