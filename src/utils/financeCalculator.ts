export function calculateLoanDetails({
  vehiclePrice,
  downPayment,
  interestRate,
  loanTermYears,
  paymentFrequency,
}: {
  vehiclePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  paymentFrequency: 'weekly' | 'biweekly' | 'monthly';
}): {
  paymentAmount: number;
  totalPayments: number;
  totalInterest: number;
  financedAmount: number;
} {
  // Calculate financed amount (after down payment)
  const financedAmount = vehiclePrice - downPayment;
  const annualRate = interestRate / 100;

  // Calculate number of payments based on frequency
  let paymentsPerYear: number;
  switch (paymentFrequency) {
    case 'weekly':
      paymentsPerYear = 52;
      break;
    case 'biweekly':
      paymentsPerYear = 26;
      break;
    case 'monthly':
    default:
      paymentsPerYear = 12;
      break;
  }

  const totalPayments = paymentsPerYear * loanTermYears;
  const periodicRate = annualRate / paymentsPerYear;

  // Calculate payment amount using the loan payment formula on the financed amount only
  const paymentAmount = financedAmount * 
    (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / 
    (Math.pow(1 + periodicRate, totalPayments) - 1);

  // Total amount paid over loan term (excluding down payment)
  const totalAmountWithInterest = paymentAmount * totalPayments;
  const totalInterest = totalAmountWithInterest - financedAmount;

  return {
    paymentAmount: Math.round(paymentAmount * 100) / 100,
    totalPayments,
    totalInterest: Math.round(totalInterest * 100) / 100,
    financedAmount,
  };
}

interface RemainingPaymentsParams {
  originalAmount: number;
  interestRate: number;
  paymentAmount: number;
  paymentFrequency: 'weekly' | 'biweekly' | 'monthly';
  totalPaid: number;
}

export function calculateRemainingPayments({
  originalAmount,
  interestRate,
  paymentAmount,
  paymentFrequency,
  totalPaid
}: RemainingPaymentsParams): {
  remainingPayments: number;
  remainingAmount: number;
} {
  // Get periodic interest rate
  let periodsPerYear: number;
  switch (paymentFrequency) {
    case 'weekly':
      periodsPerYear = 52;
      break;
    case 'biweekly':
      periodsPerYear = 26;
      break;
    case 'monthly':
    default:
      periodsPerYear = 12;
      break;
  }
  
  const periodicRate = (interestRate / 100) / periodsPerYear;
  
  // Calculate remaining principal after payments
  let remainingAmount = originalAmount;
  let amountPaid = totalPaid;
  
  // For each payment made, calculate interest and principal portions
  while (amountPaid >= paymentAmount && remainingAmount > 0) {
    const interestPortion = remainingAmount * periodicRate;
    const principalPortion = paymentAmount - interestPortion;
    
    remainingAmount -= principalPortion;
    amountPaid -= paymentAmount;
  }
  
  // If there's a partial payment remaining
  if (amountPaid > 0 && remainingAmount > 0) {
    const interestPortion = remainingAmount * periodicRate;
    const principalPortion = amountPaid - interestPortion;
    remainingAmount -= principalPortion;
  }
  
  // Calculate number of remaining payments needed
  let remainingPayments = 0;
  if (remainingAmount > 0) {
    // Use the same loan payment formula to calculate remaining payments
    remainingPayments = Math.ceil(
      Math.log(paymentAmount / (paymentAmount - remainingAmount * periodicRate)) /
      Math.log(1 + periodicRate)
    );
  }

  return {
    remainingPayments: Math.max(0, remainingPayments),
    remainingAmount: Math.max(0, Math.round(remainingAmount * 100) / 100)
  };
}

export function calculateEarlyPayoff({
  remainingPrincipal,
  originalLoanAmount,
  totalInterest,
  remainingPayments,
  totalPayments,
}: {
  remainingPrincipal: number;
  originalLoanAmount: number;
  totalInterest: number;
  remainingPayments: number;
  totalPayments: number;
}): {
  payoffAmount: number;
  totalSavings: number;
  interestSaved: number;
} {
  // Calculate the proportion of the loan term remaining
  const remainingTermRatio = remainingPayments / totalPayments;
  
  // Calculate remaining interest proportionally
  const remainingInterest = totalInterest * remainingTermRatio;
  
  // Calculate how much interest has been earned up to this point
  const earnedInterest = totalInterest - remainingInterest;
  
  // Early payoff amount is the remaining principal plus earned interest
  const payoffAmount = Math.round(remainingPrincipal + earnedInterest);
  
  // Calculate total amount if paid normally (excluding down payment)
  const totalAmountIfPaidNormally = originalLoanAmount + totalInterest;
  
  // Calculate total amount with early payoff
  const totalAmountWithEarlyPayoff = (originalLoanAmount - remainingPrincipal) + payoffAmount;
  
  // Calculate total savings
  const totalSavings = Math.round(totalAmountIfPaidNormally - totalAmountWithEarlyPayoff);
  
  // Calculate interest saved
  const interestSaved = Math.round(remainingInterest);

  return {
    payoffAmount,
    totalSavings,
    interestSaved,
  };
}