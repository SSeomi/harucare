import { NextResponse } from 'next/server';
import type { Meal, MealCategory } from '@/lib/types';

const API_KEY = 'a922197d96cf47b3afd6ca53ad482e85e6dfaea20d0a68edd3033c45bb866760';
// 농림축산식품 공공데이터포털 레시피 기본정보 API
const BASE_URL = 'http://211.237.50.150:7080/openapi';
const GRID_BASIC = 'Grid_20150827000000000226_1';
const FETCH_COUNT = 100;

// ── 서버 인메모리 캐시 (1시간) ──────────────────────────────────
let _cache: Meal[] | null = null;
let _cacheAt = 0;
const CACHE_TTL = 60 * 60 * 1000;

// ── 요리 유형 → 이모지 ──────────────────────────────────────────
const TY_EMOJI: Record<string, string> = {
  '밥': '🍚', '국/찌개': '🍲', '반찬': '🥢', '면/만두': '🍜',
  '디저트': '🍮', '양식': '🍝', '구이': '🥩', '볶음': '🍳',
  '튀김': '🍗', '찜': '🫕', '조림': '🥘', '무침': '🥗',
  '떡/한과': '🍡', '빵': '🍞', '음료': '🧃', '샐러드': '🥗',
  '샌드위치': '🥪', '스프': '🍵', '전/부침': '🥞',
};

// ── 주재료 분류 → 이모지 ───────────────────────────────────────
const IRDNT_EMOJI: Record<string, string> = {
  '곡류': '🌾', '채소류': '🥬', '육류': '🥩', '어패류': '🐟',
  '두류': '🫘', '달걀류': '🥚', '유제품류': '🥛', '과일류': '🍎',
  '버섯류': '🍄', '해조류': '🌿', '기타': '🥄',
};

// ── 조리시간 파싱: "30분" → 30 ─────────────────────────────────
function parseMinutes(cookingTime: string): number {
  const m = (cookingTime || '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 30;
}

// ── 칼로리 파싱: "580Kcal" → 580 ──────────────────────────────
function parseKcal(calorie: string): number {
  const m = (calorie || '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

// ── 카테고리 추론 ───────────────────────────────────────────────
function deriveCategories(kcal: number, minutes: number, tyNm: string): MealCategory[] {
  const cats: MealCategory[] = [];
  if (kcal > 0 && kcal < 400) cats.push('low-cal');
  if (minutes <= 20) cats.push('5min');
  if (/닭|두부|콩|계란|달걀|생선|참치|새우|고기/.test(tyNm)) cats.push('high-protein');
  return cats.length > 0 ? cats : ['low-cal'];
}

// ── MAFRA API row → Meal 변환 ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): Meal {
  const id = `mafra-${row.RECIPE_ID}`;
  const name = (row.RECIPE_NM_KO || '레시피').trim();
  const minutes = parseMinutes(row.COOKING_TIME);
  const kcal = parseKcal(row.CALORIE);
  const sumry = (row.SUMRY || '').trim();
  const tyNm = (row.TY_NM || '').trim();
  const nationNm = (row.NATION_NM || '').trim();
  const levelNm = (row.LEVEL_NM || '').trim();
  const irdntCode = (row.IRDNT_CODE || '').trim();
  const pcNm = (row.PC_NM || '').trim();

  const categories = deriveCategories(kcal, minutes, irdntCode + tyNm);

  const emoji = TY_EMOJI[tyNm] || IRDNT_EMOJI[irdntCode] || '🍽️';

  const healthNote = sumry.length > 40 ? sumry.slice(0, 40) + '…' : sumry || '균형 잡힌 한 끼 식사';

  const highlight = [
    nationNm && tyNm ? `${nationNm} ${tyNm}` : tyNm || nationNm,
    levelNm ? `난이도 ${levelNm}` : '',
    pcNm ? `재료비 ${pcNm}` : '',
  ].filter(Boolean).join(' · ') + ' ✨';

  // 요약 문장을 조리 팁으로 활용
  const steps = sumry ? [sumry] : [];

  return {
    id,
    emoji,
    name,
    minutes,
    kcal,
    categories,
    healthNote,
    highlight,
    steps,
    ingredients: [],
    imageUrl: undefined,
  };
}

// ── 실제 API fetch ──────────────────────────────────────────────
async function fetchRecipes(): Promise<Meal[]> {
  const url = `${BASE_URL}/${API_KEY}/json/${GRID_BASIC}/1/${FETCH_COUNT}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const text = await res.text();

  // HTML 오류 응답 확인
  if (text.trim().startsWith('<')) {
    throw new Error('MAFRA API key invalid or not activated');
  }

  const json = JSON.parse(text);
  const data = json[GRID_BASIC];

  if (!data || data.result?.code !== 'INFO-000') {
    throw new Error(`MAFRA API error: ${data?.result?.message || 'Unknown error'}`);
  }

  const rows: Record<string, string>[] = data.row ?? [];
  if (rows.length === 0) throw new Error('Empty response from MAFRA API');

  return rows.map(mapRow).filter(m => m.name);
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
    return NextResponse.json(
      { error: message, fallback: true },
      { status: 503 }
    );
  }
}
