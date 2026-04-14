import Link from "next/link";
import { Recommendation } from "@/lib/recommendations";

const CATEGORY_LABEL: Record<string, string> = {
  diet:      "🥗 식단",
  essential: "🫙 생필품",
  health:    "💊 건강",
};

const CATEGORY_COLOR: Record<string, string> = {
  diet:      "#16A34A",
  essential: "#2563EB",
  health:    "#9333EA",
};

interface Props {
  rec: Recommendation;
  index: number;
}

export default function RecommendationCard({ rec, index }: Props) {
  const { product, personalizedReason } = rec;
  const catColor = CATEGORY_COLOR[product.category];

  return (
    <article
      className="card animate-slide-up"
      style={{ animationDelay: `${index * 80 + 60}ms` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Thumbnail emoji */}
          <div
            className="flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{
              width: "56px", height: "56px",
              background: `${catColor}10`,
              border: `1px solid ${catColor}22`,
              fontSize: "28px",
            }}
          >
            {product.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="font-semibold rounded-full"
                style={{
                  fontSize: "10px",
                  color: catColor,
                  background: `${catColor}14`,
                  padding: "2px 7px",
                }}
              >
                {CATEGORY_LABEL[product.category]}
              </span>
            </div>
            <h3
              className="font-bold leading-snug mb-1"
              style={{ fontSize: "15px", color: "var(--text)", letterSpacing: "-0.2px" }}
            >
              {product.name}
            </h3>
            <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
              {personalizedReason}
            </p>
          </div>
        </div>

        {/* Price row */}
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
            <span style={{ fontSize: "12px", color: "var(--faint)", textDecoration: "line-through" }}>
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

          {/* Buttons */}
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
