"use client";

import Link from "next/link";
import RecipeImage from "@/components/RecipeImage";
import { Recommendation } from "@/lib/recommendations";

const CATEGORY_META: Record<string, { label: string; emoji: string; badgeBg: string; badgeText: string }> = {
  diet:      { label: "식단",  emoji: "🥗", badgeBg: "#E8F8F0", badgeText: "#2ECC71" },
  essential: { label: "생필품", emoji: "🛒", badgeBg: "#EBF5FF", badgeText: "#3B82F6" },
  health:    { label: "건강",  emoji: "💊", badgeBg: "#FFF3E8", badgeText: "#FF6B35" },
};

interface Props {
  rec: Recommendation;
  index: number;
}

export default function RecommendationCard({ rec, index }: Props) {
  const { product, personalizedReason } = rec;
  const meta = CATEGORY_META[product.category] ?? CATEGORY_META.health;

  return (
    <article
      className="card animate-slide-up"
      style={{ animationDelay: `${index * 80 + 60}ms` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Thumbnail 64×64 — 네이버 이미지 API로 상품명 검색 */}
          <div
            className="flex-shrink-0 rounded-xl overflow-hidden"
            style={{ width: "64px", height: "64px" }}
          >
            <RecipeImage
              name={product.name}
              fallbackEmoji={product.emoji}
              height={64}
              emojiFontSize={24}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3
                className="font-bold leading-snug"
                style={{ fontSize: "15px", color: "var(--text)", letterSpacing: "-0.2px" }}
              >
                {product.name}
              </h3>
              <span
                className="font-semibold rounded-full flex-shrink-0"
                style={{
                  fontSize: "10px",
                  color: meta.badgeText,
                  background: meta.badgeBg,
                  padding: "2px 7px",
                  border: `1px solid ${meta.badgeText}33`,
                }}
              >
                {meta.emoji} {meta.label}
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
              {personalizedReason}
            </p>
          </div>
        </div>

        {/* Price + buy button */}
        <div
          className="flex items-center justify-between mt-4 pt-3"
          style={{ borderTop: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="font-bold tabular-nums"
              style={{ fontSize: "18px", color: "var(--primary-dark)", letterSpacing: "-0.3px" }}
            >
              {product.price}
            </span>
            <span style={{ fontSize: "12px", color: "var(--muted)", textDecoration: "line-through" }}>
              {product.originalPrice}
            </span>
            <span
              className="font-bold rounded"
              style={{
                fontSize: "11px", color: "#DC2626",
                background: "rgba(220,38,38,0.08)",
                padding: "1px 5px",
              }}
            >
              -{product.discountRate}%
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/product/${product.id}`}
              className="btn-secondary"
              style={{ padding: "7px 12px", fontSize: "12px", width: "auto" }}
            >
              상세
            </Link>
            <a
              href={product.coupangUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ padding: "7px 14px", fontSize: "12px", width: "auto" }}
            >
              구매하기
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
