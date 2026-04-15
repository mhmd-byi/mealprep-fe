export const calculateSubEndDate = (user) => {
  const latestSub = user.subscriptions?.[user.subscriptions.length - 1];
  if (!latestSub) return { date: null, status: 'N/A' };

  const lunchMeals = (user.mealCounts?.lunchMeals || 0) + (user.mealCounts?.nextDayLunchMeals || 0);
  const dinnerMeals = (user.mealCounts?.dinnerMeals || 0) + (user.mealCounts?.nextDayDinnerMeals || 0);
  let totalMealsLeft = lunchMeals + dinnerMeals;

  if (totalMealsLeft <= 0) return { date: null, status: 'Finished' };

  const cancellations = user.cancellations || [];
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  let daysCount = 0;
  while (totalMealsLeft > 0 && daysCount < 365) { 
    daysCount++;
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + daysCount);
    
    let mealsForThisDay = 0;
    if (latestSub.mealType === 'both') {
      const isLunchCancelled = cancellations.some(c => {
        const start = new Date(c.startDate);
        const end = new Date(c.endDate);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        return nextDate >= start && nextDate <= end && (c.mealType === 'lunch' || c.mealType === 'both');
      });
      const isDinnerCancelled = cancellations.some(c => {
        const start = new Date(c.startDate);
        const end = new Date(c.endDate);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        return nextDate >= start && nextDate <= end && (c.mealType === 'dinner' || c.mealType === 'both');
      });
      if (!isLunchCancelled) mealsForThisDay++;
      if (!isDinnerCancelled) mealsForThisDay++;
    } else {
      const userMealType = latestSub.mealType?.toLowerCase();
      const isCancelled = cancellations.some(c => {
        const start = new Date(c.startDate);
        const end = new Date(c.endDate);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        return nextDate >= start && nextDate <= end && (c.mealType === userMealType || c.mealType === 'both');
      });
      if (!isCancelled) mealsForThisDay = 1;
    }
    
    totalMealsLeft -= mealsForThisDay;
    if (totalMealsLeft <= 0) {
      return { 
        date: nextDate, 
        formattedDate: nextDate.toLocaleDateString('en-GB').split('/').join('-'),
        status: 'Active' 
      };
    }
  }
  return { date: null, status: 'Pending' };
};
