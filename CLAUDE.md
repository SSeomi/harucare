@AGENTS.md

# Harucare Project

Next.js 앱 (App Router, TypeScript, Tailwind CSS v4).  
Working directory = repo root = Next.js root (`c:\Users\seo\Desktop\my_project\Harucare`).  
Dev server: `npm run dev` → `http://localhost:3000`

## Custom Commands

| Command  | Description                        |
|----------|------------------------------------|
| `/push`  | 안전한 git push 자동화 (확인 후 push) |

## Key Architecture

- `app/` — Next.js App Router pages & API routes
- `app/api/recipes/route.ts` — MAFRA 공공데이터 레시피 API (기본정보·재료정보·과정정보)
- `lib/types.ts` — 공유 TypeScript 타입
- `lib/meals-data.ts` — 하드코딩 fallback 레시피 데이터
- `components/` — 공유 UI 컴포넌트

## MAFRA API

- Endpoint: `http://211.237.50.150:7080/openapi/{API_KEY}/json/{gridId}/{start}/{end}`
- Key: `a922197d96cf47b3afd6ca53ad482e85e6dfaea20d0a68edd3033c45bb866760`
- Grid IDs:
  - `Grid_20150827000000000226_1` — 레시피 기본정보 (537건)
  - `Grid_20150827000000000227_1` — 레시피 재료정보 (6104건, 1회 최대 1000건)
  - `Grid_20150827000000000228_1` — 레시피 과정정보 (3022건)
- 서버 인메모리 캐시 1시간 TTL 적용 중
