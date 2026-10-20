export const dateKeyLocal = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const toCalendarKey = (val) => {
  if (!val) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) return trimmed.slice(0, 10);
    const d = new Date(trimmed);
    if (!Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }
  if (val instanceof Date) {
    if (Number.isNaN(val.getTime())) return '';
    if (val.getUTCHours() === 0 && val.getUTCMinutes() === 0) {
      const y = val.getUTCFullYear();
      const m = String(val.getUTCMonth() + 1).padStart(2, '0');
      const day = String(val.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return '';
};

export const LUNCH_CUTOFF_MINUTES = 10.5 * 60; // 10:30 AM IST
export const DINNER_CUTOFF_MINUTES = 16 * 60; // 4:00 PM IST

export const getCurrentISTMinutes = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour').value);
  const minute = Number(parts.find((p) => p.type === 'minute').value);
  return hour * 60 + minute;
};

export const getTodayISTCalendarDate = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    minutesSinceMidnight: Number(get('hour')) * 60 + Number(get('minute'))
  };
};

// Holiday dates from the backend are stored as UTC-midnight representing an
// IST calendar day — read with UTC getters so the key matches regardless of
// the viewing browser's own timezone (mirrors dateKeyLocal, which instead
// reads the locally-constructed walking-cursor date with local getters).
export const holidayDateKeysFrom = (holidays) =>
  new Set((holidays || []).map((h) => {
    const d = new Date(h.date);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }));

export const parseCancellationsFromActivities = (activities = []) => {
  const list = [];
  (activities || []).forEach((act) => {
    if (act?.category !== 'cancellation' || !act?.description) return;
    const match = act.description.match(/Meal cancellation request for (\w+) meal from (.+?) to (.+)/i);
    if (!match) return;
    const mealType = match[1].toLowerCase();
    const startDate = new Date(match[2].trim());
    const endDate = new Date(match[3].trim());
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
      list.push({ startDate, endDate, mealType });
    }
  });
  return list;
};

// `sub.mealType` is dietary preference (veg/non-veg/both-flexible) — it says
// nothing about which meal TIMES a plan covers. Coverage must come from the
// actual remaining lunch/dinner counts instead, same as everywhere else in
// this app (getMealCoverage, the meal-delivery-list query, etc.).
export const calculateSubEndDate = (user, holidayDateKeys = new Set()) => {
  const latestSub = user.subscriptions?.[user.subscriptions.length - 1];
  if (!latestSub) return { date: null, status: 'N/A' };

  const formatDate = (date) => date.toLocaleDateString('en-GB').split('/').join('-');

  let lunchLeft = (user.mealCounts?.lunchMeals || 0) + (user.mealCounts?.nextDayLunchMeals || 0);
  let dinnerLeft = (user.mealCounts?.dinnerMeals || 0) + (user.mealCounts?.nextDayDinnerMeals || 0);

  if (lunchLeft <= 0 && dinnerLeft <= 0) {
    const completedSub = [...(user.subscriptions || [])]
      .reverse()
      .find((sub) => sub.status === 'completed');
    const finishedDateValue = completedSub?.updatedAt || latestSub.completedAt;
    const finishedDate = finishedDateValue ? new Date(finishedDateValue) : null;
    const hasValidFinishedDate = finishedDate && !Number.isNaN(finishedDate.getTime());

    return {
      date: hasValidFinishedDate ? finishedDate : null,
      formattedDate: hasValidFinishedDate ? `Finished on\n${formatDate(finishedDate)}` : null,
      status: 'Finished'
    };
  }

  const cancellations = user.cancellations || [];
  const isCancelled = (date, slot) => {
    const k = dateKeyLocal(date);
    return cancellations.some((c) => {
      if (!c.startDate || !c.endDate) return false;
      const sKey = toCalendarKey(c.startDate);
      const eKey = toCalendarKey(c.endDate);
      if (!sKey || !eKey) return false;
      const slotMatches =
        (c.mealType || '').toLowerCase() === slot.toLowerCase() ||
        (c.mealType || '').toLowerCase() === 'both';
      return k >= sKey && k <= eKey && slotMatches;
    });
  };

  const { year, month, day, minutesSinceMidnight } = getTodayISTCalendarDate();
  const currentDate = new Date(year, month - 1, day, 0, 0, 0, 0);

  const lunchCutoffPassed = minutesSinceMidnight > LUNCH_CUTOFF_MINUTES;
  const dinnerCutoffPassed = minutesSinceMidnight > DINNER_CUTOFF_MINUTES;
  const isTodaySunday = currentDate.getDay() === 0;
  const isTodayHoliday = holidayDateKeys.has(dateKeyLocal(currentDate));

  if (!isTodaySunday && !isTodayHoliday) {
    if (lunchLeft > 0 && !lunchCutoffPassed && !isCancelled(currentDate, 'lunch')) lunchLeft -= 1;
    if (dinnerLeft > 0 && !dinnerCutoffPassed && !isCancelled(currentDate, 'dinner')) dinnerLeft -= 1;
  }

  if (lunchLeft <= 0 && dinnerLeft <= 0) {
    return {
      date: currentDate,
      formattedDate: formatDate(currentDate),
      status: 'Active'
    };
  }

  let daysCount = 0;
  while ((lunchLeft > 0 || dinnerLeft > 0) && daysCount < 365) {
    daysCount++;
    const nextDate = new Date(year, month - 1, day + daysCount, 0, 0, 0, 0);

    const isSunday = nextDate.getDay() === 0;
    const isHoliday = holidayDateKeys.has(dateKeyLocal(nextDate));

    if (!isSunday && !isHoliday) {
      if (lunchLeft > 0 && !isCancelled(nextDate, 'lunch')) lunchLeft -= 1;
      if (dinnerLeft > 0 && !isCancelled(nextDate, 'dinner')) dinnerLeft -= 1;
    }

    if (lunchLeft <= 0 && dinnerLeft <= 0) {
      return {
        date: nextDate,
        formattedDate: formatDate(nextDate),
        status: 'Active'
      };
    }
  }
  return { date: null, status: 'Pending' };
};

/**
 * Calculates the next actual delivery date and meal slot for a customer,
 * taking cancellations, cutoffs, Sundays, holidays, and subscription start date into account.
 */
export const calculateNextDelivery = ({
  mealCounts,
  cancellations = [],
  holidayDateKeys = new Set(),
  startDate = null
}) => {
  if (!mealCounts) return null;

  const lunchLeft = (mealCounts.lunchMeals || 0) + (mealCounts.nextDayLunchMeals || 0);
  const dinnerLeft = (mealCounts.dinnerMeals || 0) + (mealCounts.nextDayDinnerMeals || 0);

  if (lunchLeft <= 0 && dinnerLeft <= 0) return null;

  const isCancelled = (d, slot) => {
    const k = dateKeyLocal(d);
    return (cancellations || []).some((c) => {
      if (!c.startDate || !c.endDate) return false;
      const sKey = toCalendarKey(c.startDate);
      const eKey = toCalendarKey(c.endDate);
      if (!sKey || !eKey) return false;
      const slotMatches =
        (c.mealType || '').toLowerCase() === slot.toLowerCase() ||
        (c.mealType || '').toLowerCase() === 'both';
      return k >= sKey && k <= eKey && slotMatches;
    });
  };

  const startKey = startDate ? toCalendarKey(startDate) : null;
  const { year, month, day, minutesSinceMidnight } = getTodayISTCalendarDate();
  const today = new Date(year, month - 1, day, 0, 0, 0, 0);
  const todayKey = dateKeyLocal(today);

  const isTodaySunday = today.getDay() === 0;
  const isTodayHoliday = holidayDateKeys.has(todayKey);
  const isTodayEligibleByStartDate = !startKey || todayKey >= startKey;

  // Check today's slots if today is a valid delivery day and eligible
  if (!isTodaySunday && !isTodayHoliday && isTodayEligibleByStartDate) {
    if (lunchLeft > 0 && minutesSinceMidnight <= LUNCH_CUTOFF_MINUTES && !isCancelled(today, 'lunch')) {
      return { meal: 'Lunch', date: today };
    }
    if (dinnerLeft > 0 && minutesSinceMidnight <= DINNER_CUTOFF_MINUTES && !isCancelled(today, 'dinner')) {
      return { meal: 'Dinner', date: today };
    }
  }

  // Search upcoming days (up to 365 days)
  for (let offset = 1; offset <= 365; offset++) {
    const nextDate = new Date(year, month - 1, day + offset, 0, 0, 0, 0);
    const nextKey = dateKeyLocal(nextDate);

    if (nextDate.getDay() === 0) continue; // Sunday
    if (holidayDateKeys.has(nextKey)) continue; // Holiday
    if (startKey && nextKey < startKey) continue; // Before subscription start

    if (lunchLeft > 0 && !isCancelled(nextDate, 'lunch')) {
      return { meal: 'Lunch', date: nextDate };
    }
    if (dinnerLeft > 0 && !isCancelled(nextDate, 'dinner')) {
      return { meal: 'Dinner', date: nextDate };
    }
  }

  return null;
};
