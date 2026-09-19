/** Display / form helpers: DD-MM-YYYY (+ optional HH:mm). */

const DATE_RE = /^(\d{2})-(\d{2})-(\d{4})$/;
const DATETIME_RE = /^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2}))?$/;

function pad(n) {
  return String(n).padStart(2, '0');
}

export function formatDateDdMmYyyy(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export function formatDateTimeDdMmYyyy(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${formatDateDdMmYyyy(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Form value for datetime fields (DD-MM-YYYY HH:mm). */
export function toDdMmYyyyHm(value) {
  return formatDateTimeDdMmYyyy(value);
}

/** Parse DD-MM-YYYY or DD-MM-YYYY HH:mm → Date, or null/undefined. */
export function parseDdMmYyyyHm(value) {
  const s = String(value || '').trim();
  if (!s) return null;
  const match = s.match(DATETIME_RE);
  if (!match) return undefined;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const hour = match[4] != null ? Number(match[4]) : 0;
  const minute = match[5] != null ? Number(match[5]) : 0;
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined;
  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(d.getTime()) || d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return undefined;
  }
  return d;
}

export function fromDdMmYyyyHmToIso(value) {
  const d = parseDdMmYyyyHm(value);
  if (d === null) return null;
  if (d === undefined) return undefined;
  return d.toISOString();
}

export function isValidDdMmYyyy(value) {
  const s = String(value || '').trim();
  if (!s) return true;
  return DATE_RE.test(s) && parseDdMmYyyyHm(s) instanceof Date;
}
