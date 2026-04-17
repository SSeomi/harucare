/**
 * 네이버 이미지 API 순차 호출 큐 (클라이언트 전용)
 *
 * - 동시에 여러 RecipeImage 컴포넌트가 마운트되어도 한 번에 1개씩 호출
 * - 같은 쿼리가 여러 곳에서 요청되면 하나의 fetch로 합쳐서 처리 (dedup)
 * - 요청 사이에 DELAY_MS 간격을 두어 429 방지
 */

const DELAY_MS = 250; // 요청 간 딜레이 (ms)

type Handlers = {
  resolve: ((url: string) => void)[];
  reject: ((e: Error) => void)[];
};

// 대기 중인 쿼리 순서
const _queue: string[] = [];
// 쿼리별 Promise 핸들러 (dedup용)
const _pending = new Map<string, Handlers>();
let _processing = false;

async function _process() {
  if (_processing) return;
  _processing = true;

  while (_queue.length > 0) {
    const query = _queue.shift()!;
    const handlers = _pending.get(query);
    if (!handlers) continue;
    _pending.delete(query);

    try {
      const res = await fetch(`/api/naver-image?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const url: string = data.url ?? '';
      handlers.resolve.forEach(fn => fn(url));
    } catch (e) {
      const err = e instanceof Error ? e : new Error('image fetch failed');
      handlers.reject.forEach(fn => fn(err));
    }

    // 다음 요청 전 딜레이
    if (_queue.length > 0) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  _processing = false;
}

/**
 * 이미지 URL을 큐에 넣어 순차적으로 가져옵니다.
 * 같은 query가 이미 큐에 있으면 새 fetch 없이 같은 결과를 공유합니다.
 */
export function fetchImageQueued(query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (_pending.has(query)) {
      // 이미 대기 중 → 핸들러만 추가 (dedup)
      _pending.get(query)!.resolve.push(resolve);
      _pending.get(query)!.reject.push(reject);
    } else {
      _pending.set(query, { resolve: [resolve], reject: [reject] });
      _queue.push(query);
      _process();
    }
  });
}
