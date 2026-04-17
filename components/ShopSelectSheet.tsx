"use client";

import { useEffect } from "react";

export type ShopCategory = "food" | "health" | "daily";

interface Shop {
  key: string;
  name: string;
  icon: string;
  tagline: string;
  badgeBg: string;
  iconColor: string;
  buildUrl: (q: string) => string;
}

const ALL_SHOPS: Record<string, Shop> = {
  coupang: {
    key: "coupang",
    name: "쿠팡",
    icon: "🛒",
    tagline: "로켓배송 · 최저가",
    badgeBg: "#E8F4FD",
    iconColor: "#0073E6",
    buildUrl: q => `https://www.coupang.com/np/search?q=${encodeURIComponent(q)}`,
  },
  kurly: {
    key: "kurly",
    name: "컬리",
    icon: "🛍️",
    tagline: "신선식품 · 새벽배송",
    badgeBg: "#F8F0FF",
    iconColor: "#5F0080",
    buildUrl: q => `https://www.kurly.com/search?sword=${encodeURIComponent(q)}`,
  },
  naver: {
    key: "naver",
    name: "네이버쇼핑",
    icon: "🔍",
    tagline: "최저가 한눈에 비교",
    badgeBg: "#E8F5E9",
    iconColor: "#03C75A",
    buildUrl: q => `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(q)}`,
  },
  oliveyoung: {
    key: "oliveyoung",
    name: "올리브영",
    icon: "💊",
    tagline: "건강식품 · 영양제",
    badgeBg: "#F0FBF4",
    iconColor: "#00863C",
    buildUrl: q => `https://www.oliveyoung.co.kr/store/search/getSearchMain.do?query=${encodeURIComponent(q)}`,
  },
  emart: {
    key: "emart",
    name: "이마트몰",
    icon: "🏪",
    tagline: "대형마트 · 신선식품",
    badgeBg: "#FFF8E1",
    iconColor: "#FF6D00",
    buildUrl: q => `https://emart.ssg.com/search.ssg?query=${encodeURIComponent(q)}`,
  },
};

const CATEGORY_SHOPS: Record<ShopCategory, string[]> = {
  food:   ["coupang", "kurly", "naver"],
  health: ["coupang", "oliveyoung", "naver"],
  daily:  ["coupang", "naver", "emart"],
};

interface ShopSelectSheetProps {
  query: string;
  category?: ShopCategory;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function ShopSelectSheet({
  query,
  category = "food",
  isOpen,
  onClose,
  title = "어디서 구매할까요?",
}: ShopSelectSheetProps) {
  // 시트 열릴 때 배경 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const shops = CATEGORY_SHOPS[category].map(k => ALL_SHOPS[k]);

  function handleShopClick(shop: Shop) {
    window.open(shop.buildUrl(query), "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] rounded-t-3xl animate-sheet-up"
        style={{
          background: "var(--bg)",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.15)",
          paddingBottom: "max(28px, env(safe-area-inset-bottom))",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="rounded-full"
            style={{ width: "36px", height: "4px", background: "var(--faint)" }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-3 pb-4">
          <p
            className="font-bold"
            style={{ fontSize: "18px", color: "var(--text)", letterSpacing: "-0.4px" }}
          >
            {title}
          </p>
          {query && (
            <p
              className="mt-1 truncate"
              style={{ fontSize: "12px", color: "var(--muted)" }}
            >
              검색어: <span style={{ color: "var(--text2)", fontWeight: 600 }}>{query}</span>
            </p>
          )}
        </div>

        {/* Shop list */}
        <div className="px-4 space-y-2">
          {shops.map(shop => (
            <button
              key={shop.key}
              onClick={() => handleShopClick(shop)}
              className="w-full flex items-center gap-4 rounded-2xl p-4 transition-all active:scale-[0.98]"
              style={{
                background: "var(--card)",
                border: "1.5px solid var(--card-border)",
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              }}
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{
                  width: "48px",
                  height: "48px",
                  background: shop.badgeBg,
                  fontSize: "24px",
                }}
              >
                {shop.icon}
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <p
                  className="font-bold"
                  style={{ fontSize: "15px", color: "var(--text)", letterSpacing: "-0.3px" }}
                >
                  {shop.name}
                </p>
                <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                  {shop.tagline}
                </p>
              </div>

              {/* Arrow */}
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={{ opacity: 0.35, flexShrink: 0 }}
              >
                <path
                  d="M6 4l4 4-4 4"
                  stroke="var(--text)" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
