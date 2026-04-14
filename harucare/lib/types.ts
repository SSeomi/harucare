export type Persona = 'homebody' | 'active' | 'no-cook';
export type HealthAlert = 'normal' | 'high_bp' | 'high_sugar' | 'overweight';
export type ProductCategory = 'diet' | 'essential' | 'health';
export type MealPattern = 'home' | 'delivery';

export interface HealthSnapshot {
  date: string;        // YYYY-MM-DD
  weight: number;      // kg
  bp_sys: number;      // mmHg systolic
  bp_dia: number;      // mmHg diastolic
  blood_sugar: number; // mg/dL
}

export interface UserProfile {
  name: string;
  persona: Persona;
  goalWeight: number;   // 목표 체중 (kg)
  mealPattern: MealPattern; // 식사 패턴
}

export interface Product {
  id: string;
  name: string;
  emoji: string;
  category: ProductCategory;
  tagline: string;
  reason: string;
  price: string;
  priceNum: number;
  originalPrice: string;
  discountRate: number;
  coupangUrl: string;
  keyBenefit: string;
  detailReason: string;
}
