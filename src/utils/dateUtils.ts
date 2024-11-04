export function calculateFirstPaymentDate(
  startDate: Date,
  frequency: 'weekly' | 'biweekly' | 'monthly'
): Date {
  const date = new Date(startDate);
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }
  
  return date;
}

export function getNextPaymentDate(
  startDate: Date,
  frequency: 'weekly' | 'biweekly' | 'monthly',
  previousDate?: Date
): Date {
  const date = previousDate ? new Date(previousDate) : new Date(startDate);
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }
  
  return date;
}

export function isOverdue(dueDate: string, gracePeriodDays: number = 3): boolean {
  const due = new Date(dueDate);
  due.setDate(due.getDate() + gracePeriodDays);
  return new Date() > due;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generatePaymentSchedule(
  startDate: Date,
  frequency: 'weekly' | 'biweekly' | 'monthly',
  numberOfPayments: number,
  amount: number
): Array<Omit<Payment, 'id' | 'saleId'>> {
  const schedule: Array<Omit<Payment, 'id' | 'saleId'>> = [];
  let currentDate = calculateFirstPaymentDate(startDate, frequency);

  for (let i = 0; i < numberOfPayments; i++) {
    schedule.push({
      amount,
      dueDate: currentDate.toISOString(),
      status: 'pending'
    });
    currentDate = getNextPaymentDate(startDate, frequency, currentDate);
  }

  return schedule;
}