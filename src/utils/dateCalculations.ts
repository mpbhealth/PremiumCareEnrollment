const EASTERN_TIMEZONE = 'America/New_York';

export interface EffectiveDateOption {
  display: string;
  value: string;
}

/** Calendar Y-M-D parts for the instant `now`, in America/New_York (handles EST/EDT). */
function getEasternCalendarParts(now: Date): { year: number; month0: number; day: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  let year = 0;
  let month = 0;
  let day = 0;

  for (const part of formatter.formatToParts(now)) {
    if (part.type === 'year') year = Number(part.value);
    if (part.type === 'month') month = Number(part.value);
    if (part.type === 'day') day = Number(part.value);
  }

  return { year, month0: month - 1, day };
}

/**
 * Dropdown options for membership start (`effectiveDate`).
 * Policy cutoff uses Eastern time; labels use UTC for stable MM/DD/YYYY ↔ display alignment across locales.
 * @see docs/effectiveDate.md
 */
export function calculateEffectiveDates(reference: Date = new Date()): EffectiveDateOption[] {
  const eastern = getEasternCalendarParts(reference);
  const useLateBracket = eastern.day > 20;
  const addMonths = useLateBracket ? 2 : 1;

  const dates: EffectiveDateOption[] = [];

  for (let i = 0; i < 3; i++) {
    const utcMs = Date.UTC(eastern.year, eastern.month0 + addMonths + i, 1);
    const y = new Date(utcMs).getUTCFullYear();
    const m0 = new Date(utcMs).getUTCMonth();

    const display = new Date(utcMs).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });

    const month = String(m0 + 1).padStart(2, '0');
    const day = '01';
    const valueFormat = `${month}/${day}/${y}`;

    dates.push({ display, value: valueFormat });
  }

  return dates;
}

/** Parse MM/DD/YYYY as calendar date at UTC midnight; used so labels align across timezones (see docs/effectiveDate.md). */
export function effectiveDateStringToUtcMs(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const segments = trimmed.split('/');
  if (segments.length !== 3) return null;

  const month = Number(segments[0]);
  const day = Number(segments[1]);
  const year = Number(segments[2]);
  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(year)) return null;

  return Date.UTC(year, month - 1, day);
}

/**
 * Format stored `effectiveDate` (MM/DD/YYYY) for UI; UTC calendar semantics match dropdown `display` values.
 */
export function formatEffectiveDateDisplay(value: string): string {
  const utcMs = effectiveDateStringToUtcMs(value);
  if (utcMs === null) return value.trim();

  return new Date(utcMs).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Same as {@link formatEffectiveDateDisplay} with long month — e.g. PDF output. */
export function formatEffectiveDateLongDisplay(value: string): string {
  const utcMs = effectiveDateStringToUtcMs(value);
  if (utcMs === null) return value.trim();

  return new Date(utcMs).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
