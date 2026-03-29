export const epley = (weightKg: number, reps: number): number =>
  reps === 1 ? weightKg : weightKg * (1 + reps / 30);

export const KG_TO_LBS = 2.20462;

export const toDisplayWeight = (kg: number, unit: 'kg' | 'lbs'): number =>
  unit === 'lbs'
    ? Math.round(kg * KG_TO_LBS * 10) / 10
    : Math.round(kg * 10) / 10;

export const toKg = (value: number, unit: 'kg' | 'lbs'): number =>
  unit === 'lbs' ? value / KG_TO_LBS : value;
