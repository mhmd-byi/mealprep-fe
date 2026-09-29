const dateKeyLocal = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const LUNCH_CUTOFF_MINUTES = 10.5 * 60;
const DINNER_CUTOFF_MINUTES = 16 * 60;

const getCurrentISTMinutes = () => {
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
  const isCancelled = (date, slot) => cancellations.some((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return date >= start && date <= end && (c.mealType === slot || c.mealType === 'both');
  });

  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const lunchCutoffPassed = getCurrentISTMinutes() > LUNCH_CUTOFF_MINUTES;
  const dinnerCutoffPassed = getCurrentISTMinutes() > DINNER_CUTOFF_MINUTES;
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
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + daysCount);

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
