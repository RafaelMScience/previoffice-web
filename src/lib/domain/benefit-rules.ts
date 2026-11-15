/**
 * Social Security (INSS) & Welfare Domain Rules
 * Pure business rules for Constitutional Amendment 103/2019 and BPC/LOAS.
 */

export interface AgeCalculation {
  years: number;
  months: number;
  days: number;
}

export function calculateAge(birthDateString: string, referenceDate: Date = new Date()): AgeCalculation {
  const birth = new Date(birthDateString);
  let years = referenceDate.getFullYear() - birth.getFullYear();
  let months = referenceDate.getMonth() - birth.getMonth();
  let days = referenceDate.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export interface LoasAssessment {
  perCapitaIncome: number;
  minimumWageThresholdQuarter: number;
  minimumWageThresholdHalf: number;
  isStatutoryEligible: boolean; // <= 1/4 minimum wage
  hasJudicialFavorablePrecedent: boolean; // > 1/4 and <= 1/2 minimum wage
}

/**
 * Calculates BPC/LOAS per capita income (Lei 8.742/93 Art. 20)
 * Evaluates against official minimum wage (standard R$ 1.412,00 baseline).
 */
export function assessLoasEligibility(
  totalFamilyIncome: number,
  familyMemberCount: number,
  minimumWage: number = 1412.0
): LoasAssessment {
  const count = Math.max(1, familyMemberCount);
  const perCapitaIncome = totalFamilyIncome / count;
  const quarterWage = minimumWage / 4;
  const halfWage = minimumWage / 2;

  return {
    perCapitaIncome,
    minimumWageThresholdQuarter: quarterWage,
    minimumWageThresholdHalf: halfWage,
    isStatutoryEligible: perCapitaIncome <= quarterWage,
    hasJudicialFavorablePrecedent: perCapitaIncome > quarterWage && perCapitaIncome <= halfWage,
  };
}

export interface RuralRetirementCheck {
  isEligibleAge: boolean;
  minAgeRequired: number;
  yearsOfRuralActivityRequired: number; // 15 years = 180 months
}

export function checkRuralRetirementAge(
  gender: 'MALE' | 'FEMALE',
  ageYears: number
): RuralRetirementCheck {
  const minAgeRequired = gender === 'MALE' ? 60 : 55;
  return {
    isEligibleAge: ageYears >= minAgeRequired,
    minAgeRequired,
    yearsOfRuralActivityRequired: 15,
  };
}
