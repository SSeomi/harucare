"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// ── 타입 ────────────────────────────────────────────────
interface StorePrice {
  store: string;
  price: number;
  url: string;
}
interface CartProduct {
  id: number;
  name: string;
  emoji: string;
  prices: StorePrice[]; // 가격 낮은 순으로 정렬된 상태로 표시
}

// ── 하드코딩 상품 데이터 ─────────────────────────────────
const PRODUCTS: CartProduct[] = [
  {
    id: 1, name: "닭가슴살 1팩", emoji: "🍗",
    prices: [
      { store: "쿠팡",     price: 3900, url: "https://www.coupang.com/np/search?q=닭가슴살" },
      { store: "네이버쇼핑", price: 4100, url: "https://search.shopping.naver.com/search/all?query=닭가슴살" },
      { store: "컬리",     price: 4200, url: "https://www.kurly.com/search?sword=닭가슴살" },
    ],
  },
  {
    id: 2, name: "샐러드 믹스", emoji: "🥗",
    prices: [
      { store: "컬리",   price: 4500, url: "https://www.kurly.com/search?sword=샐러드믹스" },
      { store: "이마트", price: 4800, url: "https://emart.ssg.com/search.ssg?query=샐러드믹스" },
      { store: "쿠팡",   price: 5200, url: "https://www.coupang.com/np/search?q=샐러드믹스" },
    ],
  },
  {
    id: 3, name: "저염 드레싱", emoji: "🫙",
    prices: [
      { store: "네이버쇼핑", price: 3200, url: "https://search.shopping.naver.com/search/all?query=저염드레싱" },
      { store: "올리브영",  price: 3500, url: "https://www.oliveyoung.co.kr/store/search/getSearchMain.do?query=저염드레싱" },
      { store: "쿠팡",     price: 3800, url: "https://www.coupang.com/np/search?q=저염드레싱" },
    ],
  },
];

// ── 쇼핑몰 스타일 맵 ─────────────────────────────────────
const STORE_STYLE: Record<string, { icon: string; badgeBg: string; color: string }> = {
  "쿠팡":      { icon: "🛒", badgeBg: "#E8F4FD", color: "#0073E6" },
  "컬리":      { icon: "🛍️", badgeBg: "#F8F0FF", color: "#5F0080" },
  "네이버쇼핑": { icon: "🔍", badgeBg: "#E8F5E9", color: "#03C75A" },
  "올리브영":  { icon: "💊", badgeBg: "#F0FBF4", color: "#00863C" },
  "이마트":    { icon: "🏪", badgeBg: "#FFF8E1", color: "#FF6D00" },
};
function storeStyle(store: string) {
  return STORE_STYLE[store] ?? { icon: "🏬", badgeBg: "#F5F5F5", color: "#666" };
}

// ── 헬퍼: 정렬된 가격 목록 (낮은 순) ──────────────────────
function sortedPrices(p: CartProduct): StorePrice[] {
  return [...p.prices].sort((a, b) => a.price - b.price);
}

// ── 페이지 ───────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();

  // 전체 체크 (초기값: 전부 선택)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(
    new Set(PRODUCTS.map(p => p.id))
  );

  function toggleProduct(id: number) {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setCheckedIds(
      checkedIds.size === PRODUCTS.length
        ? new Set()
        : new Set(PRODUCTS.map(p => p.id))
    );
  }

  // ── 파생 데이터 ────────────────────────────────────────
  // 체크된 상품 → 최저가 쇼핑몰별로 그룹핑
  const storeGroups = useMemo(() => {
    const map = new Map<string, { items: { product: CartProduct; cheapest: StorePrice }[]; url: string }>();
    for (const product of PRODUCTS) {
      if (!checkedIds.has(product.id)) continue;
      const cheapest = sortedPrices(product)[0];
      if (!map.has(cheapest.store)) {
        map.set(cheapest.store, { items: [], url: cheapest.url });
      }
      map.get(cheapest.store)!.items.push({ product, cheapest });
    }
    return map;
  }, [checkedIds]);

  // 전체 합계 (각 상품의 최저가 기준)
  const totalPrice = useMemo(() =>
    PRODUCTS.filter(p => checkedIds.has(p.id))
      .reduce((sum, p) => sum + sortedPrices(p)[0].price, 0),
    [checkedIds]
  );

  // 절약 금액 (최고가 - 최저가 합산)
  const totalSavings = useMemo(() =>
    PRODUCTS.filter(p => checkedIds.has(p.id))
      .reduce((sum, p) => {
        const prices = p.prices.map(e => e.price);
        return sum + Math.max(...prices) - Math.min(...prices);
      }, 0),
    [checkedIds]
  );

  function openAllStores() {
    storeGroups.forEach(group => {
      // 각 그룹의 대표 URL (첫 번째 아이템의 cheapest URL)
      const url = group.items[0]?.cheapest.url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  const allChecked = checkedIds.size === PRODUCTS.length;
  const hasChecked = checkedIds.size > 0;

  return (
    <div className="min-h-screen pb-44" style={{ background: "var(--bg)" }}>

      {/* ── 헤더 ── */}
      <div
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--card-border)",
          paddingTop: "56px",
        }}
      >
        <div className="flex items-start justify-between px-5 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center rounded-full flex-shrink-0 transition-opacity hover:opacity-70"
              style={{
                width: "36px", height: "36px",
                background: "var(--faint2)",
                border: "1px solid var(--card-border)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4l-5 5 5 5" stroke="var(--text2)" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <h1
                className="font-bold"
                style={{ fontSize: "18px", color: "var(--text)", letterSpacing: "-0.4px" }}
              >
                🛒 오늘의 장바구니
              </h1>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "1px" }}>
                최저가 쇼핑몰을 찾아드렸어요
              </p>
            </div>
          </div>

          {/* 전체선택 */}
          <button
            onClick={toggleAll}
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{ marginTop: "4px" }}
          >
            <div
              className="flex items-center justify-center rounded-md"
              style={{
                width: "20px", height: "20px",
                background: allChecked ? "var(--primary)" : "transparent",
                border: `2px solid ${allChecked ? "var(--primary)" : "var(--card-border)"}`,
                transition: "all 0.2s",
              }}
            >
              {allChecked && (
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: "12px", color: "var(--text2)", fontWeight: 600 }}>전체선택</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[390px] px-4 pt-5 space-y-5">

        {/* ── 상품 리스트 ── */}
        <section>
          <div className="space-y-3">
            {PRODUCTS.map(product => {
              const sorted = sortedPrices(product);
              const cheapestPrice = sorted[0].price;
              const isChecked = checkedIds.has(product.id);

              return (
                <div
                  key={product.id}
                  className="card p-4 animate-slide-up transition-all"
                  style={{
                    border: `1.5px solid ${isChecked ? "rgba(46,204,113,0.3)" : "var(--card-border)"}`,
                    background: isChecked ? "rgba(46,204,113,0.02)" : "var(--card)",
                  }}
                >
                  {/* 상품명 + 체크박스 */}
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => toggleProduct(product.id)}
                      className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        width: "24px", height: "24px",
                        background: isChecked ? "var(--primary)" : "transparent",
                        border: `2px solid ${isChecked ? "var(--primary)" : "var(--card-border)"}`,
                        transition: "all 0.2s",
                      }}
                    >
                      {isChecked && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-check-pop">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span style={{ fontSize: "22px" }}>{product.emoji}</span>
                    <p
                      className="font-bold flex-1"
                      style={{
                        fontSize: "15px",
                        color: isChecked ? "var(--text)" : "var(--muted)",
                        letterSpacing: "-0.2px",
                      }}
                    >
                      {product.name}
                    </p>
                    {/* 최저가 금액 */}
                    <p
                      className="font-bold tabular-nums flex-shrink-0"
                      style={{
                        fontSize: "15px",
                        color: isChecked ? "var(--primary-dark)" : "var(--muted)",
                      }}
                    >
                      {cheapestPrice.toLocaleString()}원
                    </p>
                  </div>

                  {/* 쇼핑몰별 가격 목록 */}
                  <div className="space-y-1.5 pl-9">
                    {sorted.map((entry, idx) => {
                      const s = storeStyle(entry.store);
                      const isCheapest = idx === 0;
                      return (
                        <div key={entry.store} className="flex items-center gap-2">
                          {/* 쇼핑몰 아이콘 */}
                          <div
                            className="flex items-center justify-center rounded-lg flex-shrink-0"
                            style={{
                              width: "22px", height: "22px",
                              background: s.badgeBg,
                              fontSize: "12px",
                            }}
                          >
                            {s.icon}
                          </div>
                          <span
                            style={{
                              fontSize: "12px",
                              color: isCheapest ? "var(--text)" : "var(--muted)",
                              fontWeight: isCheapest ? 600 : 400,
                              minWidth: "64px",
                            }}
                          >
                            {entry.store}
                          </span>
                          <span
                            className="tabular-nums"
                            style={{
                              fontSize: "12px",
                              color: isCheapest ? "var(--primary-dark)" : "var(--muted)",
                              fontWeight: isCheapest ? 700 : 400,
                            }}
                          >
                            {entry.price.toLocaleString()}원
                          </span>
                          {isCheapest && (
                            <span
                              className="font-bold rounded-full"
                              style={{
                                fontSize: "9px",
                                color: "#fff",
                                background: "var(--primary)",
                                padding: "2px 6px",
                              }}
                            >
                              최저가
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 쇼핑몰별 그룹핑 ── */}
        {hasChecked && (
          <section className="animate-fade-in">
            <p
              className="font-semibold mb-3"
              style={{ fontSize: "13px", color: "var(--text2)" }}
            >
              📦 쇼핑몰별 묶음
            </p>
            <div className="space-y-3">
              {Array.from(storeGroups.entries()).map(([storeName, group]) => {
                const s = storeStyle(storeName);
                const subtotal = group.items.reduce((sum, { cheapest }) => sum + cheapest.price, 0);

                return (
                  <div key={storeName} className="card p-4 animate-slide-up">
                    {/* 쇼핑몰 헤더 */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="flex items-center justify-center rounded-xl flex-shrink-0"
                        style={{
                          width: "40px", height: "40px",
                          background: s.badgeBg,
                          fontSize: "20px",
                        }}
                      >
                        {s.icon}
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-bold"
                          style={{ fontSize: "14px", color: "var(--text)", letterSpacing: "-0.3px" }}
                        >
                          {storeName}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "1px" }}>
                          {group.items.length}개 상품
                        </p>
                      </div>
                      <p
                        className="font-bold tabular-nums"
                        style={{ fontSize: "16px", color: s.color }}
                      >
                        {subtotal.toLocaleString()}원
                      </p>
                    </div>

                    {/* 상품 목록 */}
                    <div
                      className="space-y-1.5 mb-3 py-3"
                      style={{ borderTop: "1px solid var(--card-border)", borderBottom: "1px solid var(--card-border)" }}
                    >
                      {group.items.map(({ product, cheapest }) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: "14px" }}>{product.emoji}</span>
                            <span style={{ fontSize: "13px", color: "var(--text2)" }}>
                              {product.name}
                            </span>
                          </div>
                          <span
                            className="tabular-nums font-semibold"
                            style={{ fontSize: "13px", color: "var(--primary-dark)" }}
                          >
                            {cheapest.price.toLocaleString()}원
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 바로가기 버튼 */}
                    <button
                      onClick={() => window.open(group.items[0].cheapest.url, "_blank", "noopener,noreferrer")}
                      className="w-full rounded-xl py-2.5 font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{
                        fontSize: "13px",
                        color: s.color,
                        background: s.badgeBg,
                        border: `1.5px solid ${s.color}30`,
                      }}
                    >
                      {storeName} 바로가기
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 선택 없을 때 */}
        {!hasChecked && (
          <div className="text-center py-12 animate-fade-in">
            <p style={{ fontSize: "36px", marginBottom: "10px" }}>🛒</p>
            <p className="font-semibold" style={{ fontSize: "14px", color: "var(--text2)" }}>
              상품을 선택해주세요
            </p>
          </div>
        )}
      </div>

      {/* ── 고정 하단 FAB ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-10 pt-3"
        style={{ background: "linear-gradient(to top, #F4FAF6 70%, transparent 100%)" }}
      >
        <div className="mx-auto max-w-[390px] space-y-2">
          {/* 합계 */}
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>
              선택 {checkedIds.size}개 합계
            </span>
            <span
              className="font-bold tabular-nums"
              style={{ fontSize: "22px", color: "var(--primary-dark)", letterSpacing: "-0.5px" }}
            >
              {totalPrice.toLocaleString()}원
            </span>
          </div>

          {/* 절약 안내 */}
          {totalSavings > 0 && hasChecked && (
            <p className="text-center animate-fade-in" style={{ fontSize: "12px", color: "var(--primary-dark)", fontWeight: 600 }}>
              최저가로 구매하면 {totalSavings.toLocaleString()}원 절약돼요! 💚
            </p>
          )}

          {/* 전체 열기 버튼 */}
          <button
            onClick={openAllStores}
            disabled={!hasChecked}
            className="btn-primary w-full"
            style={{
              fontSize: "15px",
              padding: "17px",
              opacity: hasChecked ? 1 : 0.45,
              cursor: hasChecked ? "pointer" : "not-allowed",
            }}
          >
            ✅ 선택한 쇼핑몰 전체 열기
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
