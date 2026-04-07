import { Dependent } from '../hooks/useEnrollmentStorage';

export interface CarePlusPricingOption {
  productId: string;
  price: number;
  iuaLevel: string;
  displayText: string;
}

export interface CarePlusPricingResult {
  options: CarePlusPricingOption[];
  isAvailable: boolean;
  errorMessage?: string;
  coverageType: string;
}

export interface EssentialPricingResult {
  price: number;
  displayText: string;
  isAvailable: boolean;
  errorMessage?: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  allowsSpouse: boolean;
  allowsChildren: boolean;
  maxChildren: number;
  price: number;
}

export interface CarePlusPricing {
  productId: string;
  price: number;
  iuaLevel: '500' | '1000' | '1500' | '2500' | '5000';
  ageRange: '18-29' | '30-64';
  coverageType: 'Member Only' | 'Member + Spouse' | 'Member + Children' | 'Member + Family';
}

/** Monthly premiums from rate sheet (productId = benefit ID). Age bands: 18–29 and 30–64. */
export const CARE_PLUS_PRICING: CarePlusPricing[] = [
  { productId: '3277', price: 296.0, iuaLevel: '500', ageRange: '18-29', coverageType: 'Member Only' },
  { productId: '3277', price: 409.0, iuaLevel: '500', ageRange: '30-64', coverageType: 'Member Only' },
  { productId: '3281', price: 249.0, iuaLevel: '1000', ageRange: '18-29', coverageType: 'Member Only' },
  { productId: '3281', price: 299.0, iuaLevel: '1000', ageRange: '30-64', coverageType: 'Member Only' },
  { productId: '3280', price: 223.0, iuaLevel: '1500', ageRange: '18-29', coverageType: 'Member Only' },
  { productId: '3280', price: 267.0, iuaLevel: '1500', ageRange: '30-64', coverageType: 'Member Only' },
  { productId: '3279', price: 206.0, iuaLevel: '2500', ageRange: '18-29', coverageType: 'Member Only' },
  { productId: '3279', price: 246.0, iuaLevel: '2500', ageRange: '30-64', coverageType: 'Member Only' },
  { productId: '3278', price: 194.0, iuaLevel: '5000', ageRange: '18-29', coverageType: 'Member Only' },
  { productId: '3278', price: 230.0, iuaLevel: '5000', ageRange: '30-64', coverageType: 'Member Only' },

  { productId: '3282', price: 673.0, iuaLevel: '500', ageRange: '18-29', coverageType: 'Member + Spouse' },
  { productId: '3282', price: 856.0, iuaLevel: '500', ageRange: '30-64', coverageType: 'Member + Spouse' },
  { productId: '3283', price: 535.0, iuaLevel: '1000', ageRange: '18-29', coverageType: 'Member + Spouse' },
  { productId: '3283', price: 603.0, iuaLevel: '1000', ageRange: '30-64', coverageType: 'Member + Spouse' },
  { productId: '3284', price: 479.0, iuaLevel: '1500', ageRange: '18-29', coverageType: 'Member + Spouse' },
  { productId: '3284', price: 532.0, iuaLevel: '1500', ageRange: '30-64', coverageType: 'Member + Spouse' },
  { productId: '3285', price: 429.0, iuaLevel: '2500', ageRange: '18-29', coverageType: 'Member + Spouse' },
  { productId: '3285', price: 487.0, iuaLevel: '2500', ageRange: '30-64', coverageType: 'Member + Spouse' },
  { productId: '3286', price: 396.0, iuaLevel: '5000', ageRange: '18-29', coverageType: 'Member + Spouse' },
  { productId: '3286', price: 461.0, iuaLevel: '5000', ageRange: '30-64', coverageType: 'Member + Spouse' },

  { productId: '3287', price: 599.0, iuaLevel: '500', ageRange: '18-29', coverageType: 'Member + Children' },
  { productId: '3287', price: 783.0, iuaLevel: '500', ageRange: '30-64', coverageType: 'Member + Children' },
  { productId: '3288', price: 481.0, iuaLevel: '1000', ageRange: '18-29', coverageType: 'Member + Children' },
  { productId: '3288', price: 558.0, iuaLevel: '1000', ageRange: '30-64', coverageType: 'Member + Children' },
  { productId: '3289', price: 433.0, iuaLevel: '1500', ageRange: '18-29', coverageType: 'Member + Children' },
  { productId: '3289', price: 497.0, iuaLevel: '1500', ageRange: '30-64', coverageType: 'Member + Children' },
  { productId: '3290', price: 387.0, iuaLevel: '2500', ageRange: '18-29', coverageType: 'Member + Children' },
  { productId: '3290', price: 454.0, iuaLevel: '2500', ageRange: '30-64', coverageType: 'Member + Children' },
  { productId: '3291', price: 363.0, iuaLevel: '5000', ageRange: '18-29', coverageType: 'Member + Children' },
  { productId: '3291', price: 427.0, iuaLevel: '5000', ageRange: '30-64', coverageType: 'Member + Children' },

  { productId: '3292', price: 988.0, iuaLevel: '500', ageRange: '18-29', coverageType: 'Member + Family' },
  { productId: '3292', price: 1225.0, iuaLevel: '500', ageRange: '30-64', coverageType: 'Member + Family' },
  { productId: '3293', price: 794.0, iuaLevel: '1000', ageRange: '18-29', coverageType: 'Member + Family' },
  { productId: '3293', price: 877.0, iuaLevel: '1000', ageRange: '30-64', coverageType: 'Member + Family' },
  { productId: '3294', price: 711.0, iuaLevel: '1500', ageRange: '18-29', coverageType: 'Member + Family' },
  { productId: '3294', price: 777.0, iuaLevel: '1500', ageRange: '30-64', coverageType: 'Member + Family' },
  { productId: '3295', price: 630.0, iuaLevel: '2500', ageRange: '18-29', coverageType: 'Member + Family' },
  { productId: '3295', price: 712.0, iuaLevel: '2500', ageRange: '30-64', coverageType: 'Member + Family' },
  { productId: '3296', price: 584.0, iuaLevel: '5000', ageRange: '18-29', coverageType: 'Member + Family' },
  { productId: '3296', price: 670.0, iuaLevel: '5000', ageRange: '30-64', coverageType: 'Member + Family' },
];

export const BENEFIT_PLANS: Record<string, BenefitPlan> = {
  '449': {
    id: '449',
    name: 'Member Only',
    allowsSpouse: false,
    allowsChildren: false,
    maxChildren: 0,
    price: 49.95,
  },
  '145': {
    id: '145',
    name: 'Member plus One (Spouse or Child)',
    allowsSpouse: true,
    allowsChildren: true,
    maxChildren: 1,
    price: 59.95,
  },
  '3391': {
    id: '3391',
    name: 'Member + Family',
    allowsSpouse: true,
    allowsChildren: true,
    maxChildren: 99,
    price: 69.95,
  },
};

export function getBenefitPlan(benefitId: string): BenefitPlan | null {
  return BENEFIT_PLANS[benefitId] || null;
}

export function validateDependentsForBenefit(
  benefitId: string,
  dependents: Dependent[]
): { isValid: boolean; errorMessage?: string } {
  const plan = getBenefitPlan(benefitId);

  if (!plan) {
    return {
      isValid: false,
      errorMessage: 'Invalid benefit plan selected.',
    };
  }

  const spouseCount = dependents.filter(d => d.relationship === 'Spouse').length;
  const childCount = dependents.filter(d => d.relationship === 'Child').length;

  if (benefitId === '449') {
    if (dependents.length > 0) {
      return {
        isValid: false,
        errorMessage: 'Member Only plan does not allow dependents. Please use the correct enrollment link for your plan type.',
      };
    }
  }

  if (benefitId === '145') {
    if (dependents.length === 0) {
      return {
        isValid: false,
        errorMessage: 'Member plus One plan requires exactly one dependent (spouse or child).',
      };
    }
    if (dependents.length > 1) {
      return {
        isValid: false,
        errorMessage: 'Member plus One plan allows only one dependent. Please remove extra dependents or use the Family plan link.',
      };
    }
    if (spouseCount > 1 || childCount > 1) {
      return {
        isValid: false,
        errorMessage: 'Member plus One plan allows only one dependent (either one spouse or one child).',
      };
    }
  }

  if (benefitId === '3391') {
    if (spouseCount === 0) {
      return {
        isValid: false,
        errorMessage: 'Member + Family plan requires at least one spouse and one child.',
      };
    }
    if (childCount === 0) {
      return {
        isValid: false,
        errorMessage: 'Member + Family plan requires at least one child. If you only need to add a spouse, use the Member plus One plan link.',
      };
    }
  }

  return { isValid: true };
}

export function calculateEssentialPricing(dependents: Dependent[]): EssentialPricingResult {
  const spouseCount = dependents.filter(d => d.relationship === 'Spouse').length;
  const childCount = dependents.filter(d => d.relationship === 'Child').length;
  const totalDependents = dependents.length;

  if (totalDependents === 0) {
    return {
      price: 49.95,
      displayText: '$49.95 per Month for Member Only',
      isAvailable: true,
    };
  }

  if (spouseCount === 1 && childCount === 0) {
    return {
      price: 59.95,
      displayText: '$59.95 per Month for Member plus One (Spouse or Child)',
      isAvailable: true,
    };
  }

  if (spouseCount === 0 && childCount === 1) {
    return {
      price: 59.95,
      displayText: '$59.95 per Month for Member plus One (Spouse or Child)',
      isAvailable: true,
    };
  }

  if (spouseCount === 1 && childCount >= 1) {
    return {
      price: 69.95,
      displayText: '$69.95 per Month for Member + Family',
      isAvailable: true,
    };
  }

  if (spouseCount === 0 && childCount > 1) {
    return {
      price: 0,
      displayText: 'No product available',
      isAvailable: false,
      errorMessage: 'Multiple children require a family plan. Please add a spouse or remove children to continue.',
    };
  }

  return {
    price: 49.95,
    displayText: '$49.95 per Month for Member Only',
    isAvailable: true,
  };
}

export function calculateAgeFromDOB(dob: string): number | null {
  if (!dob || dob.length !== 10) return null;

  const [month, day, year] = dob.split('/').map(num => parseInt(num, 10));
  if (!month || !day || !year) return null;

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function getAgeRange(age: number): '18-29' | '30-64' | null {
  if (age >= 18 && age <= 29) return '18-29';
  if (age >= 30 && age <= 64) return '30-64';
  return null;
}

export function getCoverageType(dependents: Dependent[]): 'Member Only' | 'Member + Spouse' | 'Member + Children' | 'Member + Family' {
  const spouseCount = dependents.filter(d => d.relationship === 'Spouse').length;
  const childCount = dependents.filter(d => d.relationship === 'Child').length;

  if (spouseCount === 0 && childCount === 0) return 'Member Only';
  if (spouseCount > 0 && childCount === 0) return 'Member + Spouse';
  if (spouseCount === 0 && childCount > 0) return 'Member + Children';
  return 'Member + Family';
}

export function getCarePlusPricingOptions(memberDOB: string, dependents: Dependent[]): CarePlusPricingResult {
  const age = calculateAgeFromDOB(memberDOB);

  if (age === null) {
    return {
      options: [],
      isAvailable: false,
      errorMessage: 'Please enter a valid date of birth to see pricing options.',
      coverageType: 'Member Only',
    };
  }

  const ageRange = getAgeRange(age);

  if (!ageRange) {
    return {
      options: [],
      isAvailable: false,
      errorMessage: 'Coverage is available for members aged 18-64 only.',
      coverageType: 'Member Only',
    };
  }

  const coverageType = getCoverageType(dependents);

  const matchingPrices = CARE_PLUS_PRICING.filter(
    p => p.ageRange === ageRange && p.coverageType === coverageType
  );

  const iuaOrder: Record<string, number> = { '500': 0, '1000': 1, '1500': 2, '2500': 3, '5000': 4 };
  matchingPrices.sort((a, b) => iuaOrder[a.iuaLevel] - iuaOrder[b.iuaLevel]);

  if (matchingPrices.length === 0) {
    return {
      options: [],
      isAvailable: false,
      errorMessage: 'No pricing options available for this configuration.',
      coverageType,
    };
  }

  const options: CarePlusPricingOption[] = matchingPrices.map(p => ({
    productId: p.productId,
    price: p.price,
    iuaLevel: `$${p.iuaLevel}`,
    displayText: `$${p.price.toFixed(2)} per Month for ${coverageType} - $${p.iuaLevel} IUA (${p.productId})`,
  }));

  return {
    options,
    isAvailable: true,
    coverageType,
  };
}
