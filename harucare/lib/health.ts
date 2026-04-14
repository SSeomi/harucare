import { HealthAlert, HealthSnapshot } from './types';

// ── Status Classification ────────────────────────────
export function getBPStatus(sys: number): { label: string; color: string; alert: boolean } {
  if (sys < 120) return { label: '정상',  color: '#16A34A', alert: false };
  if (sys < 130) return { label: '주의',  color: '#EA580C', alert: true  };
  return           { label: '높음',  color: '#DC2626', alert: true  };
}

export function getSugarStatus(val: number): { label: string; color: string; alert: boolean } {
  if (val < 100) return { label: '정상',  color: '#16A34A', alert: false };
  if (val < 126) return { label: '주의',  color: '#EA580C', alert: true  };
  return           { label: '높음',  color: '#DC2626', alert: true  };
}

export function getWeightStatus(val: number, goalWeight?: number): { label: string; color: string; alert: boolean } {
  if (goalWeight) {
    const diff = val - goalWeight;
    if (diff <= 0)    return { label: '목표 달성', color: '#16A34A', alert: false };
    if (diff <= 3)    return { label: '근접',      color: '#2ECC71', alert: false };
    if (diff <= 7)    return { label: '진행 중',   color: '#EA580C', alert: true  };
    return             { label: '관리 필요',       color: '#DC2626', alert: true  };
  }
  if (val < 70) return { label: '정상',     color: '#16A34A', alert: false };
  if (val < 85) return { label: '관리 필요', color: '#EA580C', alert: true  };
  return           { label: '주의',      color: '#DC2626', alert: true  };
}

export function getPrimaryAlert(h: HealthSnapshot): HealthAlert {
  if (h.bp_sys >= 130)      return 'high_bp';
  if (h.blood_sugar >= 100) return 'high_sugar';
  if (h.weight >= 75)       return 'overweight';
  return 'normal';
}

// ── Daily Action Guide ───────────────────────────────
export type ActionItem = { emoji: string; text: string; subText?: string };

export function getActionGuide(alert: HealthAlert): [ActionItem, ActionItem, ActionItem] {
  switch (alert) {
    case 'high_bp':
      return [
        { emoji: '🥣', text: '저염 식단 1끼 먹기', subText: '나트륨 2,000mg 이하 목표' },
        { emoji: '💧', text: '물 1.5L 마시기',     subText: '혈압 안정에 직접적 도움' },
        { emoji: '📊', text: '오늘 혈압 측정하기', subText: '아침 기상 직후 측정 권장' },
      ];
    case 'high_sugar':
      return [
        { emoji: '🥗', text: '저당 식품 선택하기', subText: '당지수(GI) 55 이하 식품 위주' },
        { emoji: '🚶', text: '식후 10분 걷기',      subText: '혈당 스파이크 30% 감소 효과' },
        { emoji: '🩸', text: '식후 혈당 체크',      subText: '식후 2시간 정상 범위 < 140' },
      ];
    case 'overweight':
      return [
        { emoji: '🍗', text: '저칼로리 한 끼 챙기기', subText: '닭가슴살·채소 위주 구성' },
        { emoji: '🏃', text: '만보 걷기 도전',         subText: '하루 500kcal 소모 목표' },
        { emoji: '💪', text: '간식 대신 단백질 섭취', subText: '포만감 유지 + 근육 보호' },
      ];
    default:
      return [
        { emoji: '⚖️', text: '오늘 체중 기록하기',  subText: '일관된 측정이 핵심이에요' },
        { emoji: '💧', text: '물 1.5L 마시기',       subText: '신진대사 활성화의 첫 걸음' },
        { emoji: '💪', text: '간식 대신 단백질 섭취', subText: '포만감 높이고 체성분 개선' },
      ];
  }
}

// ── Mock Monthly History ─────────────────────────────
export function generateMockHistory(): HealthSnapshot[] {
  const days: HealthSnapshot[] = [];
  const now = Date.now();
  const weightSeed = [
    67.0, 66.5, 66.8, 67.2, 66.9, 66.5, 66.0, 65.8, 65.5, 65.9,
    66.2, 65.8, 65.5, 65.0, 65.2, 65.5, 65.8, 65.3, 64.9, 65.2,
    65.5, 65.0, 64.8, 65.0, 65.3, 65.5, 65.2, 64.9, 65.0, 65.2,
  ];
  const bpSeed = [
    122, 120, 119, 121, 123, 118, 116, 117, 119, 120,
    122, 121, 119, 117, 118, 120, 119, 117, 116, 118,
    119, 120, 118, 116, 117, 119, 120, 118, 117, 118,
  ];
  const sugarSeed = [
    98, 96, 99, 101, 97, 95, 94, 96, 98, 100,
    97, 95, 93, 95, 97, 99, 97, 95, 94, 96,
    98, 97, 95, 94, 96, 98, 97, 95, 94, 95,
  ];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    days.push({
      date:         d.toISOString().slice(0, 10),
      weight:       weightSeed[29 - i],
      bp_sys:       bpSeed[29 - i],
      bp_dia:       Math.round(bpSeed[29 - i] * 0.64),
      blood_sugar:  sugarSeed[29 - i],
    });
  }
  return days;
}

// ── AI Coach Comment ─────────────────────────────────
export function getCoachComment(
  current: HealthSnapshot,
  history: HealthSnapshot[],
  goalWeight?: number
): string {
  const recent = history.slice(-7);
  if (recent.length < 3) {
    return '건강 데이터를 3일 이상 기록하면 AI 코치 분석이 시작돼요. 매일 측정을 습관화해보세요!';
  }
  const avgBP    = recent.reduce((s, h) => s + h.bp_sys, 0) / recent.length;
  const avgSugar = recent.reduce((s, h) => s + h.blood_sugar, 0) / recent.length;
  const weightTrend = recent[recent.length - 1].weight - recent[0].weight;

  if (avgBP >= 128) {
    return `최근 7일 평균 혈압이 ${Math.round(avgBP)}mmHg로 다소 높습니다. 오메가3·마그네슘 보충과 저나트륨 식단을 권장해요. 취침 30분 전 복식호흡도 효과적입니다.`;
  }
  if (avgSugar >= 100) {
    return `최근 7일 평균 혈당이 ${Math.round(avgSugar)}mg/dL입니다. 식후 가벼운 10분 산책과 저당 식품 선택이 인슐린 민감도 개선에 도움이 됩니다.`;
  }
  if (weightTrend > 0.5) {
    return `최근 ${recent.length}일간 체중이 ${weightTrend.toFixed(1)}kg 증가했어요. 고단백·저지방 식단과 규칙적인 운동으로 리셋해보세요.`;
  }
  if (weightTrend < -0.3) {
    const lost = Math.abs(weightTrend).toFixed(1);
    const remaining = goalWeight ? ` 목표까지 ${(current.weight - goalWeight).toFixed(1)}kg 남았어요!` : '';
    return `이번 주 -${lost}kg 감량으로 순조롭게 진행 중이에요! 🏆${remaining} 저녁 탄수화물 줄이기로 페이스를 유지해보세요.`;
  }
  const goalNote = goalWeight
    ? ` 목표 ${goalWeight}kg까지 ${(current.weight - goalWeight).toFixed(1)}kg 남았어요.`
    : '';
  return `현재 체중 ${current.weight}kg, 혈압 ${current.bp_sys}/${current.bp_dia}mmHg — 전반적으로 안정적입니다.${goalNote} 이 페이스를 유지해보세요!`;
}
