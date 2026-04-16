import { HealthAlert, Persona, Product } from './types';
import { PRODUCTS } from './products-data';
import { getPrimaryAlert } from './health';
import { HealthSnapshot } from './types';

// [diet, essential, health] product IDs per persona × alert
const REC_MAP: Record<Persona, Record<HealthAlert, [string, string, string]>> = {
  homebody: {
    normal:     ['d5', 'e4', 'h7'],
    high_bp:    ['d4', 'e2', 'h3'],
    high_sugar: ['d3', 'e3', 'h4'],
    overweight: ['d2', 'e5', 'h9'],
  },
  active: {
    normal:     ['d2', 'e5', 'h6'],
    high_bp:    ['d4', 'e2', 'h1'],
    high_sugar: ['d3', 'e3', 'h5'],
    overweight: ['d2', 'e5', 'h6'],
  },
  'no-cook': {
    normal:     ['d1', 'e1', 'h8'],
    high_bp:    ['d4', 'e2', 'h3'],
    high_sugar: ['d3', 'e1', 'h4'],
    overweight: ['d1', 'e1', 'h9'],
  },
};

export interface Recommendation {
  product: Product;
  personalizedReason: string;
}

function buildReason(
  product: Product,
  persona: Persona,
  health: HealthSnapshot,
  alert: HealthAlert
): string {
  const name = product.name;
  if (alert === 'high_bp') {
    return `혈압 ${health.bp_sys}mmHg — ${name}의 성분이 혈압 관리에 직접 도움이 돼요`;
  }
  if (alert === 'high_sugar') {
    return `혈당 ${health.blood_sugar}mg/dL — ${name}으로 인슐린 반응을 안정시켜 보세요`;
  }
  if (alert === 'overweight') {
    return `체중 ${health.weight}kg — ${name}이 체중 관리 루틴의 핵심이에요`;
  }
  // normal
  if (persona === 'homebody') return `집에서 보내는 시간이 많은 분께 ${name}을 특별히 추천해요`;
  if (persona === 'active')   return `활발한 라이프스타일에 ${name}으로 회복을 챙기세요`;
  return `바쁜 하루에도 ${name} 하나로 건강을 지킬 수 있어요`;
}

export function getRecommendations(
  persona: Persona,
  health: HealthSnapshot
): Recommendation[] {
  const alert = getPrimaryAlert(health);
  const ids = REC_MAP[persona][alert];

  return ids.map(id => {
    const product = PRODUCTS[id];
    return {
      product,
      personalizedReason: buildReason(product, persona, health, alert),
    };
  });
}
