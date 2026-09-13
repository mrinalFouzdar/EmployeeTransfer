const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/** Counts whole business days (Mon-Fri) elapsed between `from` and `to`. */
export function businessDaysBetween(from: Date, to: Date): number {
  if (to <= from) return 0;
  let count = 0;
  let cursor = new Date(from.getTime());
  while (cursor < to) {
    cursor = addDays(cursor, 1);
    if (!isWeekend(cursor)) count += 1;
  }
  return count;
}

/**
 * BR-11 (resolved): the effective date must fall on/after the next payroll cut-off.
 * ASSUMPTION (no payroll calendar exists in this system yet): payroll cut-off is the
 * last calendar day of each month. This is a documented simplification, not a BRD fact -
 * flagged for replacement once a real payroll calendar/integration is available.
 */
export function nextPayrollCutoff(from: Date): Date {
  const cutoff = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 0));
  if (cutoff.getTime() >= from.getTime()) {
    return cutoff;
  }
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 2, 0));
}

/** BR-11: is `effectiveDate` before the next payroll cut-off from `submittedAt`? */
export function isBeforeNextPayrollCutoff(submittedAt: Date, effectiveDate: Date): boolean {
  return effectiveDate.getTime() < nextPayrollCutoff(submittedAt).getTime();
}
