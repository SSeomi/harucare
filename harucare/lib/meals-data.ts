import { Meal } from './types';

export const MEALS: Record<string, Meal> = {
  m1: {
    id: 'm1',
    emoji: '🍗',
    name: '단백질 듬뿍 닭가슴살 컵밥',
    minutes: 7,
    kcal: 450,
    categories: ['high-protein'],
    healthNote: '고단백 저지방으로 근육 보호하며 체중 감량',
    highlight: '칼질도 불도 필요 없어요 🙌',
    steps: [
      '오뚜기 현미밥을 전자레인지에 2분 돌리세요',
      '하림 닭가슴살 팩을 뜯어 뜨거운 밥 위에 올리세요',
      '저칼로리 스리라차 소스를 기호에 맞게 뿌리면 완성!',
    ],
    ingredients: [
      {
        id: 'mi1-1',
        label: '오뚜기 현미밥 150g (12개입)',
        price: '13,500원',
        priceNum: 13500,
        coupangUrl: 'https://www.coupang.com/np/search?q=오뚜기+현미밥+12개입',
      },
      {
        id: 'mi1-2',
        label: '하림 닭가슴살 100g (10팩)',
        price: '18,900원',
        priceNum: 18900,
        coupangUrl: 'https://www.coupang.com/np/search?q=하림+닭가슴살+훈제',
      },
      {
        id: 'mi1-3',
        label: '저칼로리 스리라차 소스 230ml',
        price: '6,500원',
        priceNum: 6500,
        coupangUrl: 'https://www.coupang.com/np/search?q=저칼로리+스리라차+소스',
      },
    ],
  },

  m2: {
    id: 'm2',
    emoji: '🍳',
    name: '간장 계란 버터밥',
    minutes: 5,
    kcal: 380,
    categories: ['5min'],
    healthNote: '당 수치를 낮추는 현미밥 조합',
    highlight: '뚝딱 5분, 근사한 한 끼 완성 ✨',
    steps: [
      '현미밥을 전자레인지에 1분 30초 데워주세요',
      '계란 프라이 팬을 30초 예열 후 계란 후라이를 만드세요',
      '밥 위에 버터 5g을 올리고 간장 1큰술을 뿌리면 완성!',
    ],
    ingredients: [
      {
        id: 'mi2-1',
        label: '오뚜기 현미밥 150g (12개입)',
        price: '13,500원',
        priceNum: 13500,
        coupangUrl: 'https://www.coupang.com/np/search?q=오뚜기+현미밥+12개입',
      },
      {
        id: 'mi2-2',
        label: '유정란 구운계란 10구',
        price: '4,900원',
        priceNum: 4900,
        coupangUrl: 'https://www.coupang.com/np/search?q=유정란+구운계란',
      },
      {
        id: 'mi2-3',
        label: '저염 양조간장 500ml',
        price: '3,800원',
        priceNum: 3800,
        coupangUrl: 'https://www.coupang.com/np/search?q=저염+양조간장',
      },
    ],
  },

  m3: {
    id: 'm3',
    emoji: '🥑',
    name: '참치 아보카도 덮밥',
    minutes: 8,
    kcal: 420,
    categories: ['high-protein'],
    healthNote: '아보카도 불포화지방이 혈압 안정에 도움',
    highlight: '마트 재료로 레스토랑 퀄리티 🌟',
    steps: [
      '아보카도를 반으로 갈라 씨를 제거하고 슬라이스 해주세요',
      '참치 캔을 따서 기름기를 제거하고 밥 위에 올려주세요',
      '아보카도를 올리고 간장·와사비·참기름을 뿌리면 완성!',
    ],
    ingredients: [
      {
        id: 'mi3-1',
        label: '동원 참치 100g (4캔 세트)',
        price: '7,900원',
        priceNum: 7900,
        coupangUrl: 'https://www.coupang.com/np/search?q=동원+참치+캔',
      },
      {
        id: 'mi3-2',
        label: '아보카도 (2개입)',
        price: '5,500원',
        priceNum: 5500,
        coupangUrl: 'https://www.coupang.com/np/search?q=아보카도+2개',
      },
      {
        id: 'mi3-3',
        label: '저염 간장 와사비 세트',
        price: '4,200원',
        priceNum: 4200,
        coupangUrl: 'https://www.coupang.com/np/search?q=저염간장+와사비',
      },
    ],
  },

  m4: {
    id: 'm4',
    emoji: '🥣',
    name: '두부 된장국 정식',
    minutes: 10,
    kcal: 320,
    categories: ['low-cal'],
    healthNote: '이소플라본 풍부, 혈압·혈당 동시 완화',
    highlight: '300kcal대 든든한 한 끼 🌿',
    steps: [
      '냄비에 물 300ml를 끓이고 된장 1큰술을 풀어주세요',
      '두부를 2cm 크기로 잘라 끓는 국물에 넣어 3분 끓이세요',
      '파·청양고추를 썰어 넣고 1분 더 끓이면 완성!',
    ],
    ingredients: [
      {
        id: 'mi4-1',
        label: '풀무원 순두부 찌개용 300g',
        price: '2,900원',
        priceNum: 2900,
        coupangUrl: 'https://www.coupang.com/np/search?q=풀무원+순두부',
      },
      {
        id: 'mi4-2',
        label: '해찬들 재래식 된장 500g',
        price: '4,500원',
        priceNum: 4500,
        coupangUrl: 'https://www.coupang.com/np/search?q=해찬들+재래된장',
      },
      {
        id: 'mi4-3',
        label: '오뚜기 현미밥 150g (12개입)',
        price: '13,500원',
        priceNum: 13500,
        coupangUrl: 'https://www.coupang.com/np/search?q=오뚜기+현미밥+12개입',
      },
    ],
  },

  m5: {
    id: 'm5',
    emoji: '🫙',
    name: '저당 그릭요거트 볼',
    minutes: 3,
    kcal: 280,
    categories: ['5min', 'low-cal'],
    healthNote: '프로바이오틱스로 장 건강, 혈당 안정화',
    highlight: '3분이면 완성, 다이어트 아침 식사 🥣',
    steps: [
      '그릭요거트를 그릇에 200g 담아주세요',
      '저당 그래놀라를 30g 위에 올려주세요',
      '블루베리·아몬드를 취향껏 올리면 완성!',
    ],
    ingredients: [
      {
        id: 'mi5-1',
        label: '남양 그릭요거트 무가당 450g',
        price: '5,900원',
        priceNum: 5900,
        coupangUrl: 'https://www.coupang.com/np/search?q=그릭요거트+무가당',
      },
      {
        id: 'mi5-2',
        label: '저당 그래놀라 500g',
        price: '12,500원',
        priceNum: 12500,
        coupangUrl: 'https://www.coupang.com/np/search?q=저당+그래놀라',
      },
      {
        id: 'mi5-3',
        label: '냉동 블루베리 500g',
        price: '8,900원',
        priceNum: 8900,
        coupangUrl: 'https://www.coupang.com/np/search?q=냉동+블루베리',
      },
    ],
  },
};

export const MEALS_LIST = Object.values(MEALS);

export function getMealById(id: string): Meal | undefined {
  return MEALS[id];
}
