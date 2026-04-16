import { NextResponse } from 'next/server';
import type { Meal, MealCategory, MealIngredient } from '@/lib/types';

const API_KEY = 'a922197d96cf47b3afd6ca53ad482e85e6dfaea20d0a68edd3033c45bb866760';
const BASE_URL = 'https://openapi.foodsafetykorea.go.kr/api';
const FETCH_COUNT = 50;

// ── 서버 인메모리 캐시 (1시간) ──────────────────────────────────
let _cache: Meal[] | null = null;
let _cacheAt = 0;
const CACHE_TTL = 60 * 60 * 1000;

// ── 재료 이모지 매핑 ────────────────────────────────────────────
const EMOJI_MAP: [string, string][] = [
  ['닭', '🍗'], ['삼겹', '🥩'], ['돼지', '🥩'], ['소고기', '🥩'], ['쇠고기', '🥩'],
  ['참치', '🐟'], ['생선', '🐟'], ['고등어', '🐟'], ['연어', '🐟'], ['새우', '🦐'],
  ['두부', '🥣'], ['계란', '🥚'], ['달걀', '🥚'], ['밥', '🍚'], ['쌀', '🍚'],
  ['현미', '🍚'], ['국수', '🍜'], ['면', '🍜'], ['파스타', '🍝'],
  ['시금치', '🥬'], ['배추', '🥬'], ['상추', '🥬'], ['깻잎', '🌿'], ['파', '🌿'],
  ['버섯', '🍄'], ['당근', '🥕'], ['양파', '🧅'], ['마늘', '🧄'], ['감자', '🥔'],
  ['토마토', '🍅'], ['오이', '🥒'], ['아보카도', '🥑'], ['브로콜리', '🥦'],
  ['김치', '🌶️'], ['고추', '🌶️'], ['간장', '🫙'], ['된장', '🫙'], ['고추장', '🫙'],
  ['소금', '🧂'], ['설탕', '🧂'], ['참기름', '🫙'], ['식용유', '🫙'], ['버터', '🧈'],
  ['우유', '🥛'], ['치즈', '🧀'], ['요거트', '🥛'],
];

function getEmoji(name: string): string {
  for (const [key, em] of EMOJI_MAP) {
    if (name.includes(key)) return em;
  }
  return '🥄';
}

// ── 재료 텍스트 파싱 ────────────────────────────────────────────
function parseIngredients(text: string, recipeId: string): MealIngredient[] {
  if (!text) return [];

  // RCP_PARTS_DTLS 첫 줄은 레시피명 반복인 경우가 많음 → 두 번째 줄부터 사용
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  // 재료 줄 선별: 숫자 단위(g, ml, 개, 큰술 등)가 포함된 줄 우선
  const hasUnit = (s: string) => /[\d]+[gml개모팩컵큰작]|큰술|작은술|한줌|약간|조금/.test(s);
  const ingLines = lines.filter(hasUnit);
  const source = ingLines.length > 0 ? ingLines.join(', ') : lines.slice(1).join(', ');

  const items = source
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 1)
    .slice(0, 6);

  return items.map((item, i) => {
    const firstName = item.split(/[\s(（]/)[0];
    const name = firstName.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '') || firstName;
    return {
      id: `api-${recipeId}-${i}`,
      emoji: getEmoji(name),
      label: item,
      price: '',
      priceNum: 0,
      platform: 'coupang' as const,
      purchaseUrl: `https://www.coupang.com/np/search?q=${encodeURIComponent(name)}`,
    };
  });
}

// ── 카테고리 추론 ───────────────────────────────────────────────
function deriveCategories(kcal: number, way: string, pro: number): MealCategory[] {
  const cats: MealCategory[] = [];
  if (kcal > 0 && kcal < 350) cats.push('low-cal');
  if (pro > 20) cats.push('high-protein');
  // 조리법이 간단한 것들 → 5min
  if (/무침|비빔|샐러드|냉|데침/.test(way)) cats.push('5min');
  return cats.length > 0 ? cats : ['low-cal'];
}

// ── 카테고리별 이모지 ───────────────────────────────────────────
const PAT_EMOJI: Record<string, string> = {
  '반찬': '🥢', '국&찌개': '🍲', '밥': '🍚', '면&만두': '🍜',
  '디저트': '🍮', '양식': '🍝', '일식': '🍣', '중국식': '🥡',
  '간식': '🍘', '주식': '🍱',
};

// ── MFDS API row → Meal 변환 ────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): Meal {
  const id = `api-${row.RCP_SEQ}`;
  const name = (row.RCP_NM || '레시피').trim();
  const kcal = parseInt(row.INFO_ENG || '0', 10) || 0;
  const pro = parseInt(row.INFO_PRO || '0', 10) || 0;
  const way = (row.RCP_WAY2 || '').trim();

  // 조리 단계: MANUAL01 ~ MANUAL20
  const steps: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const key = `MANUAL${String(i).padStart(2, '0')}`;
    const val = (row[key] || '').trim();
    if (!val) continue;
    // 앞의 "N." 숫자 제거 후 뒤의 알파벳 artifact(a/b/c) 제거
    const cleaned = val.replace(/^\d+\.\s*/, '').replace(/[a-c]$/, '').trim();
    if (cleaned) steps.push(cleaned);
  }

  const ingredients = parseIngredients(row.RCP_PARTS_DTLS || '', row.RCP_SEQ);
  const categories = deriveCategories(kcal, way, pro);

  // 건강 노트
  const naTip = (row.RCP_NA_TIP || '').replace(/\s+/g, ' ').trim();
  const healthNote = naTip
    ? (naTip.length > 35 ? naTip.slice(0, 35) + '…' : naTip)
    : (kcal < 350 ? '저칼로리로 체중 관리에 도움' : '균형 잡힌 한 끼 식사');

  const emoji = PAT_EMOJI[row.RCP_PAT2] || '🍽️';
  const imageUrl = row.ATT_FILE_NO_MAIN || row.ATT_FILE_NO_MK || undefined;

  return {
    id,
    emoji,
    name,
    minutes: steps.length <= 3 ? 5 : steps.length <= 5 ? 10 : 15,
    kcal,
    categories,
    healthNote,
    highlight: way ? `${way}으로 뚝딱 완성 ✨` : '간편하게 즐기는 한 끼 ✨',
    steps: steps.slice(0, 8),
    ingredients,
    imageUrl,
  };
}

// ── 실제 API fetch ──────────────────────────────────────────────
async function fetchRecipes(): Promise<Meal[]> {
  const url = `${BASE_URL}/${API_KEY}/COOKRCP01/json/1/${FETCH_COUNT}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const text = await res.text();

  // 키 오류 시 HTML alert 반환
  if (text.trim().startsWith('<')) {
    throw new Error('MFDS API key invalid or not activated');
  }

  const json = JSON.parse(text);
  const rows: Record<string, string>[] = json?.COOKRCP01?.row ?? [];
  if (rows.length === 0) throw new Error('Empty response from MFDS API');

  return rows.map(mapRow).filter(m => m.name && m.steps.length > 0);
}

// ── Route Handlers ──────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // 캐시 hit
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) {
    if (id) {
      const meal = _cache.find(m => m.id === id);
      return meal
        ? NextResponse.json(meal)
        : NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(_cache);
  }

  try {
    const meals = await fetchRecipes();
    _cache = meals;
    _cacheAt = Date.now();

    if (id) {
      const meal = meals.find(m => m.id === id);
      return meal
        ? NextResponse.json(meal)
        : NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(meals);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[recipes API]', message);
    // 클라이언트가 fallback 플래그를 보고 하드코딩 데이터를 사용
    return NextResponse.json(
      { error: message, fallback: true },
      { status: 503 }
    );
  }
}
