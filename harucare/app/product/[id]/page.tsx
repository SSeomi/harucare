"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductById } from "@/lib/products-data";
import { getCurrentHealth, getProfile } from "@/lib/storage";
import { Product } from "@/lib/types";

const CATEGORY_COLOR: Record<string, string> = {
  diet:      "#16A34A",
  essential: "#2563EB",
  health:    "#9333EA",
};
const CATEGORY_LABEL: Record<string, string> = {
  diet:      "🥗 식단",
  essential: "🫙 생필품",
  health:    "💊 건강",
};
const CATEGORY_BG: Record<string, string> = {
  diet:      "linear-gradient(160deg, #DCFCE7 0%, #F4FAF6 55%)",
  essential: "linear-gradient(160deg, #DBEAFE 0%, #F4FAF6 55%)",
  health:    "linear-gradient(160deg, #F3E8FF 0%, #F4FAF6 55%)",
};

// 1인가구 최적화 뱃지 (카테고리별)
const BADGES: Record<string, string[]> = {
  diet:      ["✔ 1인분 소포장", "✔ 냉장 보관 쉬움", "✔ 3일 내 소비 가능"],
  essential: ["✔ 혼자 설치 가능", "✔ 소형 사이즈 최적", "✔ 무료 배송 가능"],
  health:    ["✔ 1일 1캡슐 간편", "✔ 소분 포장 편리", "✔ 식후 복용 추천"],
};

// 카테고리별 이점 리스트
const BENEFITS: Record<string, { emoji: string; title: string; desc: string }[]> = {
  diet: [
    { emoji: "🌿", title: "체중 감량에 도움",  desc: "저칼로리·고단백으로 체지방 분해 촉진" },
    { emoji: "💪", title: "단백질 보충",       desc: "근육 유지하며 건강하게 감량 가능" },
    { emoji: "🥬", title: "신선한 재료",        desc: "식이섬유 풍부하여 포만감 오래 유지" },
  ],
  essential: [
    { emoji: "📊", title: "건강 측정 정확도",  desc: "일관된 측정으로 변화를 수치로 확인" },
    { emoji: "🏠", title: "1인 생활 최적화",   desc: "혼자서도 손쉽게 사용하는 디자인" },
    { emoji: "⚡", title: "빠른 피드백",        desc: "측정 즉시 결과 확인 및 앱 연동 지원" },
  ],
  health: [
    { emoji: "🔬", title: "임상 근거 성분",    desc: "연구로 효능이 확인된 핵심 영양소 포함" },
    { emoji: "💊", title: "흡수율 최적화",     desc: "고함량·고흡수 형태로 효과 극대화" },
    { emoji: "🛡️", title: "장기 복용 안전",    desc: "1인 가구 필수 영양소를 무리 없이 보충" },
  ],
};

export default function ProductDetail({ params }: PageProps<"/product/[id]">) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [personalReason, setPersonalReason] = useState("");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      const p = getProductById(id);
      if (!p) { router.replace("/home"); return; }
      setProduct(p);

      const health  = getCurrentHealth();
      const profile = getProfile();
      const name    = profile?.name ?? "회원";
      setPersonalReason(
        `${name}님의 현재 수치(혈압 ${health.bp_sys}/${health.bp_dia}mmHg, 혈당 ${health.blood_sugar}mg/dL)를 기준으로 추천드렸어요. ${p.detailReason}`
      );
    });
  }, [params, router]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin-slow"
          style={{ borderColor: "var(--faint)", borderTopColor: "var(--primary)" }}
        />
      </div>
    );
  }

  const catColor = CATEGORY_COLOR[product.category];
  const benefits = BENEFITS[product.category];
  const badges   = BADGES[product.category];

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--bg)" }}>

      {/* ── Hero ── */}
      <div className="relative pt-14 pb-10 px-5" style={{ background: CATEGORY_BG[product.category] }}>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ color: "var(--text2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4l-5 5 5 5" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: "13px" }}>뒤로</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(l => !l)}
              className="flex items-center justify-center rounded-full transition-transform active:scale-90"
              style={{
                width: "36px", height: "36px",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid var(--card-border)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill={liked ? "#DC2626" : "none"}>
                <path d="M8 13.5S2 9.8 2 5.5A3.5 3.5 0 018 3.7 3.5 3.5 0 0114 5.5c0 4.3-6 8-6 8z"
                  stroke={liked ? "#DC2626" : "var(--muted)"} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="flex items-center justify-center rounded-full"
              style={{
                width: "36px", height: "36px",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid var(--card-border)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="4" cy="8" r="1.5" stroke="var(--muted)" strokeWidth="1.5" />
                <circle cx="12" cy="3.5" r="1.5" stroke="var(--muted)" strokeWidth="1.5" />
                <circle cx="12" cy="12.5" r="1.5" stroke="var(--muted)" strokeWidth="1.5" />
                <path d="M5.5 7.2l5-3M5.5 8.8l5 3" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category badge */}
        <span
          className="inline-block font-semibold rounded-full mb-4"
          style={{
            fontSize: "11px", color: catColor,
            background: `${catColor}18`,
            padding: "4px 10px",
          }}
        >
          {CATEGORY_LABEL[product.category]}
        </span>

        {/* Emoji */}
        <div className="text-7xl leading-none mb-4">{product.emoji}</div>

        {/* Name & tagline */}
        <h1
          className="font-bold leading-tight mb-2"
          style={{ fontSize: "26px", color: "var(--text)", letterSpacing: "-0.6px" }}
        >
          {product.name}
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text2)", lineHeight: 1.5 }}>
          {product.tagline}
        </p>

        {/* Key benefit pill */}
        <div
          className="inline-flex items-center gap-2 mt-4 rounded-xl"
          style={{
            background: `${catColor}12`,
            border: `1px solid ${catColor}28`,
            padding: "8px 14px",
          }}
        >
          <span style={{ color: catColor }}>✦</span>
          <p className="font-semibold" style={{ fontSize: "12px", color: catColor }}>
            {product.keyBenefit}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-[390px] px-5 pt-5 space-y-4">

        {/* Recommendation reason */}
        <div className="card p-5">
          <p className="font-semibold mb-2" style={{ fontSize: "12px", color: "var(--primary-dark)" }}>
            🩺 건강 데이터 기반 추천 근거
          </p>
          <p style={{ fontSize: "13.5px", color: "var(--text2)", lineHeight: 1.7 }}>
            {personalReason}
          </p>
        </div>

        {/* Reason list */}
        <div className="card p-5">
          <p className="font-semibold mb-4" style={{ fontSize: "13px", color: "var(--text)" }}>
            추천 이유
          </p>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    width: "36px", height: "36px",
                    background: "var(--badge-green)",
                    fontSize: "16px",
                  }}
                >
                  {b.emoji}
                </span>
                <div>
                  <p className="font-semibold" style={{ fontSize: "14px", color: "var(--text)" }}>
                    {b.title}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* This product benefits */}
        <div className="card p-5">
          <p className="font-semibold mb-3" style={{ fontSize: "13px", color: "var(--text)" }}>
            이 제품을 쓰면
          </p>
          <div className="space-y-2">
            {[
              `✔ ${product.keyBenefit}`,
              "✔ 1인 가구 적합 용량·포장",
              "✔ 꾸준한 사용으로 효과 축적",
            ].map((item, i) => (
              <p key={i} className="font-medium" style={{ fontSize: "13px", color: "var(--text2)" }}>
                {item}
              </p>
            ))}
          </div>
        </div>

        {/* 1인가구 최적화 뱃지 */}
        <div className="card p-5">
          <p className="font-semibold mb-3" style={{ fontSize: "13px", color: "var(--text)" }}>
            1인가구 최적화
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, i) => (
              <span
                key={i}
                className="font-medium rounded-full"
                style={{
                  fontSize: "12px",
                  color: "var(--primary-dark)",
                  background: "var(--badge-green)",
                  border: "1px solid var(--card-border)",
                  padding: "5px 12px",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="card p-5">
          <div className="flex items-end gap-3 mb-3">
            <span
              className="font-bold tabular-nums"
              style={{ fontSize: "34px", color: "var(--primary-dark)", letterSpacing: "-1px" }}
            >
              {product.price}
            </span>
            <div className="pb-1 flex items-center gap-2">
              <span style={{ fontSize: "13px", color: "var(--faint)", textDecoration: "line-through" }}>
                {product.originalPrice}
              </span>
              <span
                className="font-bold rounded"
                style={{
                  fontSize: "12px", color: "#DC2626",
                  background: "rgba(220,38,38,0.08)",
                  padding: "2px 6px",
                }}
              >
                {product.discountRate}% 할인
              </span>
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--muted)" }}>
            쿠팡 파트너스 링크 · 최저가 기준
          </p>
        </div>
      </div>

      {/* ── FAB ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{ background: "linear-gradient(to top, #F4FAF6 65%, transparent 100%)" }}
      >
        <div className="mx-auto max-w-[390px]">
          <a
            href={product.coupangUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ fontSize: "16px", padding: "18px" }}
          >
            🛒 쿠팡에서 바로 구매하기
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
