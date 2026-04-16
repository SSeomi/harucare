import { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ORDINALS = ["첫 번째", "두 번째", "세 번째"];

export default function ProductCard({ product, index }: ProductCardProps) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      className="product-card animate-slide-up"
      style={{ animationDelay: `${index * 130 + 80}ms` }}
    >
      {/* Giant background number */}
      <span className="card-number" aria-hidden="true">
        {num}
      </span>

      <div className="relative p-6 pt-5">
        {/* Top row: emoji + ordinal badge */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[40px] leading-none">{product.emoji}</span>
          <span
            className="text-[11px] font-sans font-medium tracking-wider px-3 py-1.5 rounded-full"
            style={{
              color: "var(--muted)",
              background: "var(--faint)",
              letterSpacing: "0.08em",
            }}
          >
            {ORDINALS[index]} 추천
          </span>
        </div>

        {/* Product Name */}
        <h2
          className="font-serif font-bold leading-tight mb-3"
          style={{
            fontSize: "clamp(20px, 5.5vw, 24px)",
            color: "var(--text)",
            letterSpacing: "-0.3px",
          }}
        >
          {product.name}
        </h2>

        {/* Reason */}
        <p
          className="font-sans leading-relaxed mb-5"
          style={{
            fontSize: "13.5px",
            color: "var(--muted)",
            lineHeight: 1.65,
          }}
        >
          {product.reason}
        </p>

        {/* Divider */}
        <div
          className="mb-4"
          style={{ height: "1px", background: "var(--faint)" }}
        />

        {/* Price */}
        <div className="price">{product.price}</div>

        {/* Buy Button */}
        <a
          href={product.coupangUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="buy-btn"
          aria-label={`${product.name} 쿠팡에서 구매하기`}
        >
          쿠팡에서 구매하기
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </article>
  );
}
