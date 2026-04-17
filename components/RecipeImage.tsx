"use client";

import { useState, useEffect } from "react";
import { fetchImageQueued } from "@/lib/image-queue";

// ── localStorage 캐시 (24h) ──────────────────────────────
const CACHE_KEY = (name: string) => `hc_img_v1_${name}`;
const CACHE_TTL = 24 * 60 * 60 * 1000;

function getLocalCache(name: string): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY(name));
    if (!raw) return null;
    const { url, at } = JSON.parse(raw) as { url: string; at: number };
    if (Date.now() - at > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY(name));
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function setLocalCache(name: string, url: string) {
  try {
    localStorage.setItem(CACHE_KEY(name), JSON.stringify({ url, at: Date.now() }));
  } catch { /* 저장 실패 무시 */ }
}

// ── 카테고리별 Fallback 스타일 ───────────────────────────
const FALLBACK_STYLES: [RegExp, { bg: string; color: string }][] = [
  [/밥|죽|볶음밥|비빔|덮밥/, { bg: "linear-gradient(135deg, #FFF8E1 0%, #FFE082 100%)", color: "#F57F17" }],
  [/국|찌개|탕|전골|soup/, { bg: "linear-gradient(135deg, #FBE9E7 0%, #FFAB91 100%)", color: "#BF360C" }],
  [/면|파스타|국수|라면|냉면/, { bg: "linear-gradient(135deg, #FFF3E0 0%, #FFB74D 100%)", color: "#E65100" }],
  [/구이|스테이크|바비큐|BBQ/, { bg: "linear-gradient(135deg, #EFEBE9 0%, #BCAAA4 100%)", color: "#4E342E" }],
  [/샐러드|무침|나물|채소/, { bg: "linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)", color: "#1B5E20" }],
  [/케이크|빵|디저트|쿠키|과자/, { bg: "linear-gradient(135deg, #FCE4EC 0%, #F48FB1 100%)", color: "#880E4F" }],
  [/튀김|치킨|가라아게/, { bg: "linear-gradient(135deg, #FFFDE7 0%, #FFF176 100%)", color: "#F57F17" }],
  [/찜|수육|장조림|조림/, { bg: "linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)", color: "#4A148C" }],
];

function getFallbackStyle(name: string) {
  for (const [pattern, style] of FALLBACK_STYLES) {
    if (pattern.test(name)) return style;
  }
  return { bg: "linear-gradient(135deg, #E8F8F0 0%, #F0FBF4 100%)", color: "#1B5E20" };
}

// ── 컴포넌트 ─────────────────────────────────────────────

interface RecipeImageProps {
  name: string;
  existingUrl?: string;
  fallbackEmoji: string;
  height?: number | string;
  emojiFontSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function RecipeImage({
  name,
  existingUrl,
  fallbackEmoji,
  height = "100%",
  emojiFontSize = 64,
  className = "",
  style,
}: RecipeImageProps) {
  const [url, setUrl] = useState<string | null>(existingUrl ?? null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    existingUrl ? "ok" : "loading"
  );

  useEffect(() => {
    if (existingUrl) {
      setUrl(existingUrl);
      setStatus("ok");
      return;
    }

    // 1) localStorage 캐시 확인
    const cached = getLocalCache(name);
    if (cached !== null) {
      setUrl(cached || null);
      setStatus(cached ? "ok" : "error");
      return;
    }

    // 2) 큐에 넣어 순차 호출
    let cancelled = false;
    setStatus("loading");

    fetchImageQueued(name)
      .then(imageUrl => {
        if (cancelled) return;
        setLocalCache(name, imageUrl); // 빈 문자열도 저장해서 재요청 방지
        if (imageUrl) {
          setUrl(imageUrl);
          setStatus("ok");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLocalCache(name, ""); // 실패도 캐싱해서 재요청 방지
          setStatus("error");
        }
      });

    return () => { cancelled = true; };
  }, [name, existingUrl]);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: typeof height === "number" ? `${height}px` : height,
    overflow: "hidden",
    ...style,
  };

  // 스켈레톤 shimmer
  if (status === "loading") {
    return (
      <div
        className={`animate-shimmer ${className}`}
        style={containerStyle}
      />
    );
  }

  // 에러 / 이미지 없음 → 카테고리별 fallback
  if (status === "error" || !url) {
    const { bg, color } = getFallbackStyle(name);
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 ${className}`}
        style={{ ...containerStyle, background: bg }}
      >
        <span style={{ fontSize: `${emojiFontSize}px`, lineHeight: 1 }}>
          {fallbackEmoji}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color,
            opacity: 0.7,
            maxWidth: "80%",
            textAlign: "center",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </span>
      </div>
    );
  }

  // 이미지 표시
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      className={className}
      style={{ ...containerStyle, objectFit: "cover" }}
      onError={() => {
        setLocalCache(name, ""); // 깨진 이미지도 캐싱
        setStatus("error");
        setUrl(null);
      }}
    />
  );
}
