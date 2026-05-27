function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function daysBetween(start, end) {
  const a = parseDate(start);
  const b = parseDate(end);
  if (!a || !b || b < a) return 0;
  return Math.floor((b - a) / 86400000);
}

function monthsBetween(start, end) {
  const a = parseDate(start);
  const b = parseDate(end);
  if (!a || !b || b < a) return 0;
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1;
}

function compoundFactor(monthlyRates = []) {
  return monthlyRates.reduce((factor, rate) => factor * (1 + Number(rate || 0) / 100), 1);
}

const demoMonthlyRates = {
  IPCA: [0.38, 0.46, 0.21, 0.39, 0.24, 0.32, 0.28, 0.16, 0.44, 0.56, 0.41, 0.52],
  INPC: [0.42, 0.55, 0.19, 0.37, 0.29, 0.31, 0.26, 0.20, 0.48, 0.53, 0.39, 0.49],
  IPCA_E: [0.35, 0.43, 0.22, 0.36, 0.25, 0.30, 0.27, 0.18, 0.42, 0.50, 0.37, 0.45],
  IGP_M: [0.07, -0.06, 0.29, 0.31, 0.89, 0.81, 0.61, 0.29, 0.47, 0.64, 0.34, 0.74],
  SELIC: [0.86, 0.80, 0.83, 0.89, 0.83, 0.79, 0.91, 0.87, 0.84, 0.93, 0.89, 0.96],
  TR: [0.08, 0.07, 0.09, 0.08, 0.06, 0.07, 0.09, 0.08, 0.07, 0.09, 0.08, 0.07]
};

function getDemoRates(indexCode, months) {
  const rates = demoMonthlyRates[indexCode] || demoMonthlyRates.IPCA;
  return Array.from({ length: months }, (_, i) => rates[i % rates.length]);
}

function monetaryCorrection({ amount, startDate, endDate, indexCode = "IPCA", monthlyRates }) {
  const months = monthsBetween(startDate, endDate);
  const rates = monthlyRates && monthlyRates.length ? monthlyRates : getDemoRates(indexCode, months);
  const factor = compoundFactor(rates.slice(0, months));
  const corrected = round2(Number(amount || 0) * factor);
  return {
    amount: round2(amount),
    startDate,
    endDate,
    indexCode,
    months,
    factor: Number(factor.toFixed(8)),
    correctionAmount: round2(corrected - Number(amount || 0)),
    total: corrected,
    rates: rates.slice(0, months)
  };
}

function interestAndCorrection({ amount, startDate, endDate, indexCode = "IPCA", interestRateMonthly = 1, interestMode = "simple", correctionFirst = true }) {
  const correction = monetaryCorrection({ amount, startDate, endDate, indexCode });
  const base = correctionFirst ? correction.total : Number(amount || 0);
  const months = correction.months;
  let interest = 0;
  if (interestMode === "compound") {
    interest = base * (Math.pow(1 + Number(interestRateMonthly || 0) / 100, months) - 1);
  } else {
    interest = base * (Number(interestRateMonthly || 0) / 100) * months;
  }
  return {
    ...correction,
    interestRateMonthly: Number(interestRateMonthly || 0),
    interestMode,
    interestAmount: round2(interest),
    totalWithInterest: round2(correction.total + interest),
    memory: `Correção ${indexCode} por ${months} competências; juros ${interestMode === "compound" ? "compostos" : "simples"} de ${interestRateMonthly}% a.m.`
  };
}

function overdueInstallments({ installmentAmount, dueDates = [], calculationDate, indexCode = "INPC", interestRateMonthly = 1, interestMode = "simple", payments = [] }) {
  const items = dueDates.map((dueDate, i) => {
    const paid = payments.filter(p => p.installmentIndex === i).reduce((s, p) => s + Number(p.amount || 0), 0);
    const base = Math.max(0, Number(installmentAmount || 0) - paid);
    const calc = interestAndCorrection({ amount: base, startDate: dueDate, endDate: calculationDate, indexCode, interestRateMonthly, interestMode });
    return {
      installmentIndex: i,
      dueDate,
      originalAmount: round2(installmentAmount),
      paid: round2(paid),
      principalBalance: round2(base),
      correctionAmount: calc.correctionAmount,
      interestAmount: calc.interestAmount,
      total: calc.totalWithInterest,
      months: calc.months,
      factor: calc.factor
    };
  });
  const total = round2(items.reduce((s, item) => s + item.total, 0));
  return { calculationDate, indexCode, interestRateMonthly, interestMode, items, total };
}

function pension({ installmentAmount, firstDueDate, calculationDate, monthsCount, indexCode = "INPC", interestRateMonthly = 1, interestMode = "simple", payments = [] }) {
  const start = parseDate(firstDueDate);
  const dueDates = [];
  for (let i = 0; i < Number(monthsCount || 0); i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    dueDates.push(d.toISOString().slice(0, 10));
  }
  return overdueInstallments({ installmentAmount, dueDates, calculationDate, indexCode, interestRateMonthly, interestMode, payments });
}

function overtime({ salary, divisor = 220, overtimeHours = 0, additionalPercent = 50, nightHours = 0, nightAdditionalPercent = 20, dsrWorkdays = 25, dsrRestdays = 5 }) {
  const hourlyRate = Number(salary || 0) / Number(divisor || 220);
  const overtimeValue = Number(overtimeHours || 0) * hourlyRate * (1 + Number(additionalPercent || 0) / 100);
  const nightValue = Number(nightHours || 0) * hourlyRate * (Number(nightAdditionalPercent || 0) / 100);
  const dsrBase = overtimeValue + nightValue;
  const dsr = Number(dsrWorkdays || 0) > 0 ? dsrBase / Number(dsrWorkdays) * Number(dsrRestdays || 0) : 0;
  return {
    salary: round2(salary),
    divisor: Number(divisor || 220),
    hourlyRate: round2(hourlyRate),
    overtimeHours: Number(overtimeHours || 0),
    additionalPercent: Number(additionalPercent || 0),
    overtimeValue: round2(overtimeValue),
    nightHours: Number(nightHours || 0),
    nightAdditionalPercent: Number(nightAdditionalPercent || 0),
    nightValue: round2(nightValue),
    dsr: round2(dsr),
    total: round2(overtimeValue + nightValue + dsr)
  };
}

function severance({ salary, admissionDate, terminationDate, terminationType = "sem_justa_causa", vacationDue = 0, salaryBalanceDays = 0, fgtsBalance = 0, thirteenthMonths, vacationProportionalMonths }) {
  const months = monthsBetween(admissionDate, terminationDate);
  const thirteenth = Number(thirteenthMonths ?? Math.min(12, months)) / 12 * Number(salary || 0);
  const proportionalVacation = Number(vacationProportionalMonths ?? Math.min(12, months)) / 12 * Number(salary || 0);
  const vacationThird = (Number(vacationDue || 0) + proportionalVacation) / 3;
  const salaryBalance = Number(salary || 0) / 30 * Number(salaryBalanceDays || 0);
  const priorNotice = terminationType === "sem_justa_causa" ? Number(salary || 0) : 0;
  const fgtsFine = terminationType === "sem_justa_causa" ? Number(fgtsBalance || 0) * 0.40 : 0;
  const total = salaryBalance + thirteenth + Number(vacationDue || 0) + proportionalVacation + vacationThird + priorNotice + fgtsFine;
  return {
    salary: round2(salary),
    months,
    salaryBalance: round2(salaryBalance),
    thirteenth: round2(thirteenth),
    vacationDue: round2(vacationDue),
    proportionalVacation: round2(proportionalVacation),
    vacationThird: round2(vacationThird),
    priorNotice: round2(priorNotice),
    fgtsFine: round2(fgtsFine),
    total: round2(total),
    disclaimer: "Cálculo estimativo. Conferir CCT, médias variáveis, aviso prévio proporcional, descontos e verbas específicas."
  };
}

function judicialDebtUpdate({ principal, startDate, endDate, indexCode = "IPCA_E", interestRateMonthly = 1, interestMode = "simple", costs = 0, feesPercent = 10, payments = [] }) {
  const calc = interestAndCorrection({ amount: principal, startDate, endDate, indexCode, interestRateMonthly, interestMode });
  const paymentsTotal = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const subtotal = Math.max(0, calc.totalWithInterest - paymentsTotal + Number(costs || 0));
  const fees = subtotal * Number(feesPercent || 0) / 100;
  return {
    principal: round2(principal),
    startDate,
    endDate,
    indexCode,
    correctionAmount: calc.correctionAmount,
    interestAmount: calc.interestAmount,
    interestMode: calc.interestMode,
    paymentsTotal: round2(paymentsTotal),
    costs: round2(costs),
    feesPercent: Number(feesPercent || 0),
    fees: round2(fees),
    total: round2(subtotal + fees),
    factor: calc.factor,
    months: calc.months
  };
}

function buildMemory(title, input, result) {
  return {
    title,
    generatedAt: new Date().toISOString(),
    input,
    result,
    warnings: [
      "Cálculo auxiliar e conferível pelo advogado.",
      "Índice, juros e termo inicial devem observar o título, decisão judicial, legislação aplicável e jurisprudência vigente.",
      "Em produção, os indexadores devem ser sincronizados de fontes oficiais e versionados."
    ]
  };
}

module.exports = {
  round2,
  daysBetween,
  monthsBetween,
  compoundFactor,
  monetaryCorrection,
  interestAndCorrection,
  overdueInstallments,
  pension,
  overtime,
  severance,
  judicialDebtUpdate,
  buildMemory,
  demoMonthlyRates
};
