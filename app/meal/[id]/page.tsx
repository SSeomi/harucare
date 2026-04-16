"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMealById } from "@/lib/meals-data";
import { Meal, MealIngredient } from "@/lib/types";

export default function MealDetailPage({ params }: PageProps<"/meal/[id]">) {
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    params.then(async ({ id }) => {
      let m: Meal | undefined;
      // API 데이터(api-xxx) vs 하드코딩 데이터 분기
      if (id.startsWith("api-")) {
        try {
          const res = await fetch(`/api/recipes?id=${encodeURIComponent(id)}`);
          if (res.ok) m = await res.json();
        } catch {/* fallback */}
      }
      if (!m) m = getMealById(id);
      if (!m) { router.replace("/meal"); return; }
      setMeal(m);
      setChecked(new Set(m.ingredients.map(i => i.id)));
    });
  }, [params, router]);

  function toggleIngredient(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function buildCartUrl(meal: Meal) {
    const names = meal.ingredients
      .filter(i => checked.has(i.id))
      .map(i => i.label.split(/[\s(（]/)[0])
      .join("+");
    return `https://www.coupang.com/np/search?q=${encodeURIComponent(names || meal.name)}`;
  }

  const totalPrice = meal?.ingredients
    .filter(i => checked.has(i.id))
    .reduce((sum, i) => sum + i.priceNum, 0) ?? 0;

  const hasPrice = (meal?.ingredients ?? []).some(i => i.priceNum > 0);

  if (!meal) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin-slow"
          style={{ borderColor: "var(--faint)", borderTopColor: "var(--primary)" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36" style={{ background: "var(--bg)" }}>

      {/* ── Hero ── */}
      <div className="relative" style={{ paddingTop: "56px", paddingBottom: "32px" }}>

        {meal.imageUrl ? (
          <div style={{ position: "relative", height: "260px", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meal.imageUrl}
              alt={meal.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(244,250,246,0.85) 80%, #F4FAF6 100%)",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              background: "linear-gradient(160deg, #E8F8F0 0%, #F4FAF6 60%)",
              paddingTop: "8px",
              paddingBottom: "8px",
            }}
          >
            <div className="text-center mb-6" style={{ fontSize: "88px", lineHeight: 1 }}>
              {meal.emoji}
            </div>
          </div>
        )}

        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 mb-6"
          style={{ position: "absolute", top: "56px", left: 0, right: 0 }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{
              color: meal.imageUrl ? "#fff" : "var(--text2)",
              textShadow: meal.imageUrl ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4l-5 5 5 5" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: "13px" }}>뒤로</span>
          </button>
        </div>

        {/* Name + meta */}
        <div className="px-5 mt-4">
          <h1
            className="font-bold mb-3"
            style={{ fontSize: "24px", color: "var(--text)", letterSpacing: "-0.6px", lineHeight: 1.3 }}
          >
            {meal.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span
              className="flex items-center gap-1 rounded-full font-semibold"
              style={{
                fontSize: "12px", color: "var(--text2)",
                background: "rgba(255,255,255,0.75)",
                border: "1px solid var(--card-border)",
                padding: "5px 11px",
              }}
            >
              ⏱ {meal.minutes}분 소요
            </span>
            {meal.kcal > 0 && (
              <span
                className="flex items-center gap-1 rounded-full font-semibold"
                style={{
                  fontSize: "12px", color: "var(--text2)",
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid var(--card-border)",
                  padding: "5px 11px",
                }}
              >
                🔥 {meal.kcal}kcal
              </span>
            )}
            <span
              className="flex items-center gap-1 rounded-full font-semibold"
              style={{
                fontSize: "12px", color: "var(--primary-dark)",
                background: "var(--badge-green)",
                border: "1px solid var(--card-border)",
                padding: "5px 11px",
              }}
            >
              🥗 {meal.healthNote}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-[390px] px-4 pt-5 space-y-4">

        {/* Assembly Guide */}
        {meal.steps.length > 0 && (
          <div className="card p-5 animate-slide-up" style={{ animationDelay: "60ms" }}>
            <p
              className="font-bold mb-4"
              style={{ fontSize: "16px", color: "var(--text)", letterSpacing: "-0.3px" }}
            >
              이렇게만 하세요 👇
            </p>
            <div className="space-y-4">
              {meal.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
                    style={{
                      width: "28px", height: "28px",
                      background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                      color: "#fff", fontSize: "13px", marginTop: "1px",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--text2)", lineHeight: 1.6, flex: 1 }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
            <div
              className="mt-5 rounded-xl flex items-center gap-2 py-3 px-4"
              style={{ background: "var(--badge-green)", border: "1px solid var(--card-border)" }}
            >
              <span style={{ fontSize: "18px" }}>✨</span>
              <p className="font-semibold" style={{ fontSize: "13px", color: "var(--primary-dark)" }}>
                {meal.highlight}
              </p>
            </div>
          </div>
        )}

        {/* Ingredients */}
        {meal.ingredients.length > 0 && (
          <div className="card p-5 animate-slide-up" style={{ animationDelay: "120ms" }}>
            <p
              className="font-bold mb-4"
              style={{ fontSize: "16px", color: "var(--text)", letterSpacing: "-0.3px" }}
            >
              {hasPrice ? "이 조합 바로 구매하기 🛒" : "필요한 재료 🥄"}
            </p>
            <div className="space-y-3">
              {meal.ingredients.map((ing: MealIngredient) => {
                const isChecked = checked.has(ing.id);
                return (
                  <button
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className="w-full flex items-center gap-3 rounded-xl p-3 transition-all active:scale-[0.98]"
                    style={{
                      background: isChecked ? "rgba(46,204,113,0.06)" : "var(--faint2)",
                      border: `1.5px solid ${isChecked ? "rgba(46,204,113,0.25)" : "var(--card-border)"}`,
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        width: "22px", height: "22px",
                        background: isChecked ? "var(--primary)" : "transparent",
                        border: `2px solid ${isChecked ? "var(--primary)" : "var(--card-border)"}`,
                        transition: "all 0.2s",
                      }}
                    >
                      {isChecked && (
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="animate-check-pop">
                          <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: "16px" }}>{ing.emoji}</span>
                    <p
                      className="flex-1 text-left font-medium"
                      style={{ fontSize: "13px", color: isChecked ? "var(--text)" : "var(--muted)" }}
                    >
                      {ing.label}
                    </p>
                    {ing.priceNum > 0 && (
                      <p
                        className="font-bold tabular-nums flex-shrink-0"
                        style={{ fontSize: "13px", color: isChecked ? "var(--primary-dark)" : "var(--muted)" }}
                      >
                        {ing.price}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            {hasPrice && (
              <div
                className="flex items-center justify-between mt-4 pt-4"
                style={{ borderTop: "1px solid var(--card-border)" }}
              >
                <span style={{ fontSize: "13px", color: "var(--muted)" }}>선택 {checked.size}개 합계</span>
                <span
                  className="font-bold tabular-nums"
                  style={{ fontSize: "18px", color: "var(--primary-dark)", letterSpacing: "-0.5px" }}
                >
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fixed FAB ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-3"
        style={{ background: "linear-gradient(to top, #F4FAF6 70%, transparent 100%)" }}
      >
        <div className="mx-auto max-w-[390px] space-y-2">
          <p className="text-center" style={{ fontSize: "11px", color: "var(--muted)" }}>
            한 번에 구매하고 내일 아침에 바로 드세요!
          </p>
          <a
            href={buildCartUrl(meal)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ fontSize: "15px", padding: "17px" }}
          >
            🛒 쿠팡에서 재료 검색
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
