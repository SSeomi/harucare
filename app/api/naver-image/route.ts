import { NextResponse } from 'next/server';

// 두 가지 형식 모두 지원:
//   형식 A (로컬): NAVER_CLIENT_ID=xxx  +  NAVER_CLIENT_SECRET=yyy  (별도 env)
//   형식 B (Vercel): NAVER_CLIENT_ID=xxx|yyy  (파이프로 ID|Secret 합침)
const rawId = process.env.NAVER_CLIENT_ID ?? '';
const [CLIENT_ID, secretFromId] = rawId.split('|');
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET ?? secretFromId ?? '';

// 서버 인메모리 캐시 (24시간)
const _cache = new Map<string, { url: string; at: number }>();
const TTL = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ error: 'q required' }, { status: 400 });

  // 캐시 히트
  const cached = _cache.get(q);
  if (cached && Date.now() - cached.at < TTL) {
    return NextResponse.json({ url: cached.url });
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: 'Naver API keys not configured' }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(q + ' 음식 요리')}&display=1&filter=large`,
      {
        headers: {
          'X-Naver-Client-Id': CLIENT_ID,
          'X-Naver-Client-Secret': CLIENT_SECRET,
        },
      }
    );
    if (!res.ok) throw new Error(`Naver API ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const url: string = data.items?.[0]?.link ?? '';

    _cache.set(q, { url, at: Date.now() });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[naver-image]', message);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
