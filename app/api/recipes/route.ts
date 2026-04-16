import { NextResponse } from 'next/server';
import type { Meal, MealCategory, MealIngredient } from '@/lib/types';

const API_KEY = 'a922197d96cf47b3afd6ca53ad482e85e6dfaea20d0a68edd3033c45bb866760';
const BASE = 'http://211.237.50.150:7080/openapi';
// 레시피 기본정보 / 재료정보 / 과정정보
const GRID_BASIC  = 'Grid_20150827000000000226_1';
const GRID_IRDNT  = 'Grid_20150827000000000227_1';
const GRID_CRSE   = 'Grid_20150827000000000228_1';

const RECIPE_LIMIT  = 100;   // 가져올 레시피 수
const CRSE_LIMIT    = 700;   // 과정 행 (100 레시피 × 평균 5.6개 + 여유)
// 재료 API는 1회 최대 1000건 → 2배치로 2000건 수집 (100 레시피 × 평균 11개 ≈ 1140건)
const IRDNT_BATCH   = 1000;

// ── 서버 인메모리 캐시 (1시간) ──────────────────────────────────
let _cache: Meal[] | null = null;
let _cacheAt = 0;
const CACHE_TTL = 60 * 60 * 1000;

// ── 재료명 → 이모지 ────────────────────────────────────────────
const EMOJI_MAP: [string, string][] = [
  ['닭', '🍗'], ['삼겹', '🥩'], ['돼지', '🥩'], ['소고기', '🥩'], ['쇠고기', '🥩'],
  ['안심', '🥩'], ['등심', '🥩'], ['참치', '🐟'], ['생선', '🐟'], ['고등어', '🐟'],
  ['연어', '🐟'], ['새우', '🦐'], ['오징어', '🦑'], ['낙지', '🐙'],
  ['두부', '🥣'], ['계란', '🥚'], ['달걀', '🥚'], ['쌀', '🍚'], ['현미', '🍚'],
  ['국수', '🍜'], ['면', '🍜'], ['파스타', '🍝'],
  ['시금치', '🥬'], ['배추', '🥬'], ['상추', '🥬'], ['깻잎', '🌿'], ['부추', '🌿'],
  ['파', '🌿'], ['버섯', '🍄'], ['당근', '🥕'], ['양파', '🧅'], ['마늘', '🧄'],
  ['감자', '🥔'], ['고구마', '🍠'], ['토마토', '🍅'], ['오이', '🥒'],
  ['아보카도', '🥑'], ['브로콜리', '🥦'], ['콩나물', '🌱'], ['숙주', '🌱'],
  ['김치', '🌶️'], ['고추', '🌶️'], ['간장', '🫙'], ['된장', '🫙'], ['고추장', '🫙'],
  ['소금', '🧂'], ['설탕', '🧂'], ['참기름', '🫙'], ['식용유', '🫙'], ['버터', '🧈'],
  ['우유', '🥛'], ['치즈', '🧀'], ['요거트', '🥛'], ['청포묵', '🥣'],
];
function getEmoji(name: string): string {
  for (const [k, em] of EMOJI_MAP) if (name.includes(k)) return em;
  return '🥄';
}

// ── 요리 유형 → 이모지 ────────────────────────────────────────
const TY_EMOJI: Record<string, string> = {
  '밥': '🍚', '국/찌개': '🍲', '반찬': '🥢', '면/만두': '🍜',
  '디저트': '🍮', '양식': '🍝', '구이': '🥩', '볶음': '🍳',
  '튀김': '🍗', '찜': '🫕', '조림': '🥘', '무침': '🥗',
  '떡/한과': '🍡', '빵': '🍞', '음료': '🧃', '샐러드': '🥗',
  '전/부침': '🥞',
};

// ── 파싱 헬퍼 ───────────────────────────────────────────────────
function parseMinutes(s: string): number {
  const m = (s || '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 30;
}
function parseKcal(s: string): number {
  const m = (s || '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}
function deriveCategories(kcal: number, minutes: number, irdntCode: string): MealCategory[] {
  const cats: MealCategory[] = [];
  if (kcal > 0 && kcal < 400) cats.push('low-cal');
  if (minutes <= 20) cats.push('5min');
  if (/육류|어패류|두류|달걀/.test(irdntCode)) cats.push('high-protein');
  return cats.length > 0 ? cats : ['low-cal'];
}

// ── 재료 행 → MealIngredient ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toIngredient(row: Record<string, any>, idx: number): MealIngredient {
  const nm  = (row.IRDNT_NM || '').trim();
  const qty = (row.IRDNT_CPCTY || '').trim();
  return {
    id: `mafra-${row.RECIPE_ID}-${idx}`,
    emoji: getEmoji(nm),
    label: qty ? `${nm} ${qty}` : nm,
    price: '',
    priceNum: 0,
    platform: 'coupang',
    purchaseUrl: `https://www.coupang.com/np/search?q=${encodeURIComponent(nm)}`,
  };
}

// ── API fetch 유틸 ─────────────────────────────────────────────
async function fetchGrid(grid: string, limit: number, start = 1) {
  const url = `${BASE}/${API_KEY}/json/${grid}/${start}/${start + limit - 1}`;
  const res  = await fetch(url, { next: { revalidate: 3600 } });
  const text = await res.text();
  if (text.trim().startsWith('<')) throw new Error('MAFRA API HTML error');
  const json = JSON.parse(text);
  if (json[grid]?.result?.code !== 'INFO-000') {
    throw new Error(`MAFRA API: ${json[grid]?.result?.message ?? 'error'}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (json[grid]?.row ?? []) as Record<string, any>[];
}

// ── 레시피 전체 fetch & 조합 ────────────────────────────────────
async function fetchRecipes(): Promise<Meal[]> {
  // 재료 API는 1회 최대 1000건 → 2배치 병렬로 2000건 수집
  const [basicRows, irdntBatch1, irdntBatch2, crseRows] = await Promise.all([
    fetchGrid(GRID_BASIC, RECIPE_LIMIT),
    fetchGrid(GRID_IRDNT, IRDNT_BATCH),
    fetchGrid(GRID_IRDNT, IRDNT_BATCH, IRDNT_BATCH + 1),
    fetchGrid(GRID_CRSE,  CRSE_LIMIT),
  ]);
  const irdntRows = [...irdntBatch1, ...irdntBatch2];

  // RECIPE_ID 기준으로 재료·과정 그룹핑
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const irdntMap = new Map<number, Record<string, any>[]>();
  for (const r of irdntRows) {
    const id = Number(r.RECIPE_ID);
    if (!irdntMap.has(id)) irdntMap.set(id, []);
    irdntMap.get(id)!.push(r);
  }

  const crseMap = new Map<number, string[]>();
  for (const r of crseRows) {
    const id = Number(r.RECIPE_ID);
    if (!crseMap.has(id)) crseMap.set(id, []);
    crseMap.get(id)!.push((r.COOKING_DC || '').trim());
  }

  return basicRows
    .map(row => {
      const rid      = Number(row.RECIPE_ID);
      const name     = (row.RECIPE_NM_KO || '').trim();
      if (!name) return null;

      const minutes  = parseMinutes(row.COOKING_TIME);
      const kcal     = parseKcal(row.CALORIE);
      const sumry    = (row.SUMRY || '').trim();
      const tyNm     = (row.TY_NM || '').trim();
      const nationNm = (row.NATION_NM || '').trim();
      const levelNm  = (row.LEVEL_NM || '').trim();
      const irdntCode= (row.IRDNT_CODE || '').trim();
      const pcNm     = (row.PC_NM || '').trim();

      // 재료: 주재료 우선, 최대 6개
      const allIrdnt = irdntMap.get(rid) ?? [];
      const sorted   = [
        ...allIrdnt.filter(r => r.IRDNT_TY_NM === '주재료'),
        ...allIrdnt.filter(r => r.IRDNT_TY_NM !== '주재료'),
      ].slice(0, 6);
      const ingredients = sorted.map((r, i) => toIngredient(r, i));

      // 조리 단계
      const steps = (crseMap.get(rid) ?? []).filter(Boolean).slice(0, 8);

      const categories = deriveCategories(kcal, minutes, irdntCode);
      const emoji      = TY_EMOJI[tyNm] || '🍽️';
      const healthNote = sumry.length > 40 ? sumry.slice(0, 40) + '…' : sumry || '균형 잡힌 한 끼 식사';
      const highlight  = [
        nationNm && tyNm ? `${nationNm} ${tyNm}` : tyNm || nationNm,
        levelNm  ? `난이도 ${levelNm}` : '',
        pcNm     ? `재료비 ${pcNm}`    : '',
      ].filter(Boolean).join(' · ') + ' ✨';

      return { id: `mafra-${rid}`, emoji, name, minutes, kcal, categories, healthNote, highlight, steps, ingredients } satisfies Meal;
    })
    .filter((m): m is Meal => m !== null);
}

// ── Route Handler ───────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

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
    _cache  = meals;
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
    return NextResponse.json({ error: message, fallback: true }, { status: 503 });
  }
}
