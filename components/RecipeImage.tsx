"use client";

import { useState, useEffect } from "react";

interface RecipeImageProps {
  /** 레시피 이름 (검색 쿼리에 사용) */
  name: string;
  /** meals-data 등에서 이미 imageUrl이 있으면 바로 사용, 없으면 Naver 검색 */
  existingUrl?: string;
  /** 이미지 없거나 에러 시 표시할 이모지 */
  fallbackEmoji: string;
  /** 컨테이너 높이 (px 숫자 또는 CSS 문자열) */
  height?: number | string;
  /** 이모지 폴백의 font-size (px) */
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
    let cancelled = false;
    setStatus("loading");

    fetch(`/api/naver-image?q=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.url) {
          setUrl(data.url);
          setStatus("ok");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => { cancelled = true; };
  }, [name, existingUrl]);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: typeof height === "number" ? `${height}px` : height,
    overflow: "hidden",
    ...style,
  };

  // 스켈레톤 (shimmer)
  if (status === "loading") {
    return (
      <div
        className={`animate-shimmer ${className}`}
        style={containerStyle}
      />
    );
  }

  // 에러 / 이미지 없음 → 이모지 폴백
  if (status === "error" || !url) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{
          ...containerStyle,
          background: "linear-gradient(135deg, #E8F8F0 0%, #F0FBF4 100%)",
          fontSize: `${emojiFontSize}px`,
        }}
      >
        {fallbackEmoji}
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
      onError={() => { setStatus("error"); setUrl(null); }}
    />
  );
}
