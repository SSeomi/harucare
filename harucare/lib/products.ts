export interface Product {
  id: number;
  name: string;
  emoji: string;
  reason: string;
  price: string;
  priceNum: number;
  coupangUrl: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "락앤락 밀폐용기 3종",
    emoji: "🫙",
    reason: "식재료 보관하다 버리는 돈이 용기값보다 많아요",
    price: "12,900원",
    priceNum: 12900,
    coupangUrl: "https://www.coupang.com/np/search?q=락앤락+밀폐용기+3종",
  },
  {
    id: 2,
    name: "3M 욕실 청소 스펀지",
    emoji: "🧽",
    reason: "일주일에 한 번만 써도 곰팡이 걱정 없어집니다",
    price: "4,800원",
    priceNum: 4800,
    coupangUrl: "https://www.coupang.com/np/search?q=3M+욕실+청소+스펀지",
  },
  {
    id: 3,
    name: "비오레 페이셜 폼 200ml",
    emoji: "🧴",
    reason: "세안제 고민 끝, 이거 하나로 아침저녁 충분해요",
    price: "7,200원",
    priceNum: 7200,
    coupangUrl: "https://www.coupang.com/np/search?q=비오레+페이셜폼",
  },
  {
    id: 4,
    name: "다우니 섬유유연제 1.7L",
    emoji: "🌸",
    reason: "세탁 후 이 냄새 없으면 왠지 덜 씻은 것 같아요",
    price: "9,900원",
    priceNum: 9900,
    coupangUrl: "https://www.coupang.com/np/search?q=다우니+섬유유연제+1.7L",
  },
  {
    id: 5,
    name: "비타500 12개입",
    emoji: "🍊",
    reason: "비타민 챙겨야지 하는 생각, 이거 하나로 실천하세요",
    price: "7,200원",
    priceNum: 7200,
    coupangUrl: "https://www.coupang.com/np/search?q=비타500+12개입",
  },
  {
    id: 6,
    name: "에탄올 손소독제 500ml",
    emoji: "💧",
    reason: "손 씻을 수 없을 때 항상 꺼내게 되는 필수품",
    price: "3,900원",
    priceNum: 3900,
    coupangUrl: "https://www.coupang.com/np/search?q=에탄올+손소독제+500ml",
  },
  {
    id: 7,
    name: "지퍼백 대형 20매",
    emoji: "🛍️",
    reason: "냉동 보관부터 여행 짐까지, 없으면 불편한 팔방미인",
    price: "3,500원",
    priceNum: 3500,
    coupangUrl: "https://www.coupang.com/np/search?q=지퍼백+대형+20매",
  },
  {
    id: 8,
    name: "면봉 200개입",
    emoji: "🩺",
    reason: "1인 가구에서 제일 자주 쓰는 소모품, 미리 사두세요",
    price: "2,900원",
    priceNum: 2900,
    coupangUrl: "https://www.coupang.com/np/search?q=면봉+200개입",
  },
  {
    id: 9,
    name: "자일리톨 껌 35개입",
    emoji: "🦷",
    reason: "양치 못 할 때 구강 청결의 가장 현실적인 대안",
    price: "3,800원",
    priceNum: 3800,
    coupangUrl: "https://www.coupang.com/np/search?q=자일리톨+껌+35개입",
  },
  {
    id: 10,
    name: "종이 행주 150매",
    emoji: "🧻",
    reason: "키친타올보다 질기고, 수건보다 위생적인 선택이에요",
    price: "4,200원",
    priceNum: 4200,
    coupangUrl: "https://www.coupang.com/np/search?q=종이행주+150매",
  },
  {
    id: 11,
    name: "핸드 로션 250ml",
    emoji: "🤲",
    reason: "겨울마다 손이 갈라지는 분들, 지금 당장 사세요",
    price: "5,500원",
    priceNum: 5500,
    coupangUrl: "https://www.coupang.com/np/search?q=핸드로션+250ml",
  },
  {
    id: 12,
    name: "테팔 후라이팬 28cm",
    emoji: "🍳",
    reason: "코팅 벗겨진 팬에 계속 요리하지 않아도 됩니다",
    price: "34,900원",
    priceNum: 34900,
    coupangUrl: "https://www.coupang.com/np/search?q=테팔+후라이팬+28cm",
  },
  {
    id: 13,
    name: "수면 안대 + 귀마개 세트",
    emoji: "😴",
    reason: "소음과 빛을 동시에 차단해야 진짜 숙면이 됩니다",
    price: "6,900원",
    priceNum: 6900,
    coupangUrl: "https://www.coupang.com/np/search?q=수면안대+귀마개+세트",
  },
  {
    id: 14,
    name: "락앤락 텀블러 500ml",
    emoji: "☕",
    reason: "텀블러 하나가 매달 카페 비용을 눈에 띄게 줄여줍니다",
    price: "16,500원",
    priceNum: 16500,
    coupangUrl: "https://www.coupang.com/np/search?q=락앤락+텀블러+500ml",
  },
  {
    id: 15,
    name: "욕실 방수 슬리퍼",
    emoji: "🩴",
    reason: "욕실 미끄럼 사고, 가장 저렴하게 예방하는 방법이에요",
    price: "8,900원",
    priceNum: 8900,
    coupangUrl: "https://www.coupang.com/np/search?q=욕실+방수+슬리퍼",
  },
];

// Returns 3 products for today, rotating daily (Korean time UTC+9)
export function getTodaysProducts(): Product[] {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const year = koreaTime.getUTCFullYear();
  const month = koreaTime.getUTCMonth();
  const day = koreaTime.getUTCDate();
  const dayIndex = Math.floor(
    new Date(Date.UTC(year, month, day)).getTime() / (1000 * 60 * 60 * 24)
  );
  // 5 groups of 3 = 15 products, one new group per day
  const groupIndex = dayIndex % 5;
  const startIndex = groupIndex * 3;
  return PRODUCTS.slice(startIndex, startIndex + 3);
}

// Returns formatted Korean date string
export function getTodayLabel(): string {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const month = koreaTime.getUTCMonth() + 1;
  const day = koreaTime.getUTCDate();
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = dayNames[koreaTime.getUTCDay()];
  return `${month}월 ${day}일 · ${dayOfWeek}요일`;
}
