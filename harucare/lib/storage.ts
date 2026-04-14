import { HealthSnapshot, UserProfile } from './types';

const KEYS = {
  ONBOARDING:     'hc_onboarding',
  PROFILE:        'hc_profile',
  HEALTH_HISTORY: 'hc_health_history',
  HEALTH_CURRENT: 'hc_health_current',
  MEDICATIONS:    'hc_medications_today',
  CHECKLIST:      'hc_checklist',
} as const;

// ── Profile ─────────────────────────────────────────
export function getProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export function isOnboardingDone(): boolean {
  return localStorage.getItem(KEYS.ONBOARDING) === 'done';
}

export function markOnboardingDone() {
  localStorage.setItem(KEYS.ONBOARDING, 'done');
}

// ── Health Data ──────────────────────────────────────
export const DEFAULT_HEALTH: HealthSnapshot = {
  date: new Date().toISOString().slice(0, 10),
  weight: 65,
  bp_sys: 118,
  bp_dia: 76,
  blood_sugar: 95,
};

export function getCurrentHealth(): HealthSnapshot {
  try {
    const raw = localStorage.getItem(KEYS.HEALTH_CURRENT);
    return raw ? JSON.parse(raw) : DEFAULT_HEALTH;
  } catch { return DEFAULT_HEALTH; }
}

export function saveCurrentHealth(data: HealthSnapshot) {
  localStorage.setItem(KEYS.HEALTH_CURRENT, JSON.stringify(data));
  const history = getHealthHistory();
  const idx = history.findIndex(h => h.date === data.date);
  if (idx >= 0) history[idx] = data;
  else history.push(data);
  localStorage.setItem(KEYS.HEALTH_HISTORY, JSON.stringify(history.slice(-90)));
}

export function getHealthHistory(): HealthSnapshot[] {
  try {
    const raw = localStorage.getItem(KEYS.HEALTH_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ── Medications ──────────────────────────────────────
export function getMedicationsChecked(): string[] {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(KEYS.MEDICATIONS);
    const data = raw ? JSON.parse(raw) : {};
    return data[today] ?? [];
  } catch { return []; }
}

export function toggleMedication(id: string): string[] {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(KEYS.MEDICATIONS);
    const data = raw ? JSON.parse(raw) : {};
    const checked: string[] = data[today] ?? [];
    const next = checked.includes(id)
      ? checked.filter(m => m !== id)
      : [...checked, id];
    localStorage.setItem(KEYS.MEDICATIONS, JSON.stringify({ ...data, [today]: next }));
    return next;
  } catch { return []; }
}

// ── Daily Checklist ──────────────────────────────────
export function getChecklistChecked(): string[] {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(KEYS.CHECKLIST);
    const data = raw ? JSON.parse(raw) : {};
    return data[today] ?? [];
  } catch { return []; }
}

export function toggleChecklistItem(id: string): string[] {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(KEYS.CHECKLIST);
    const data = raw ? JSON.parse(raw) : {};
    const checked: string[] = data[today] ?? [];
    const next = checked.includes(id)
      ? checked.filter(c => c !== id)
      : [...checked, id];
    localStorage.setItem(KEYS.CHECKLIST, JSON.stringify({ ...data, [today]: next }));
    return next;
  } catch { return []; }
}
