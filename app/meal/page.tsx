"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MEALS_LIST } from "@/lib/meals-data";
import { Meal, MealCategory } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import RecipeImage from "@/components/RecipeImage";

type FilterKey = "all" | MealCategory;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",          label: "전체" },
  { key: "5min",         label: "⚡ 5분 완성" },
  { key: "low-cal",      label: "🥗 저칼로리" },
  { key: "high-protein", label: "💪 고단백" },
];

export default function MealListPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [meals, setMeals] = useState<Meal[]>(MEALS_LIST);
  const [loading, setLoading] = useState(true);
  const [apiSource, setApiSource] = useState(false);

  useEffect(() => {
    fetch("/api/recipes")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMeals(data);
          setApiSource(true);
        }
        // data.fallback === true 이면 MEALS_LIST 그대로 유지
      })
      .catch(() => {/* 하드코딩 유지 */})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? meals
    : meals.filter(m => m.categories.includes(filter as MealCategory));

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>
      <main className="mx-auto max-w-[390px] px-4">

        {/* ── Header ── */}
        <header className="pt-12 pb-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: "24px" }}>🍱</span>
            <h1
              className="font-bold"
              style={{ fontSize: "24px", color: "var(--text)", letterSpacing: "-0.5px" }}
            >
              바로 한끼
            </h1>
            {apiSource && (
              <span
                className="rounded-full font-semibold"
                style={{
                  fontSize: "10px", color: "var(--primary-dark)",
                  background: "var(--badge-green)",
                  border: "1px solid var(--card-border)",
                  padding: "2px 7px",
                  marginLeft: "2px",
                }}
              >
                공공데이터
              </span>
            )}
          </div>
          <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>
            조리 없이 조립만 해도 완성되는 1인 밥상
          </p>
        </header>

        {/* ── Category Filter ── */}
        <div
          className="flex gap-2 mb-5 overflow-x-auto pb-1 animate-fade-in"
          style={{ scrollbarWidth: "none", animationDelay: "60ms" }}
        >
          {FILTERS.map(f => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex-shrink-0 rounded-full font-semibold transition-all active:scale-95"
                style={{
                  fontSize: "12px",
                  padding: "8px 14px",
                  background: active
                    ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
                    : "var(--card)",
                  color: active ? "#fff" : "var(--muted)",
                  border: `1.5px solid ${active ? "transparent" : "var(--card-border)"}`,
                  boxShadow: active ? "0 2px 8px rgba(46,204,113,0.3)" : "none",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2 animate-fade-in">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin-slow"
              style={{ borderColor: "var(--faint)", borderTopColor: "var(--primary)" }}
            />
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>레시피 불러오는 중…</span>
          </div>
        )}

        {/* ── Meal List ── */}
        {!loading && (
          <div className="space-y-3">
            {filtered.map((meal, i) => (
              <Link
                key={meal.id}
                href={`/meal/${meal.id}`}
                className="card flex gap-4 p-4 block transition-transform active:scale-[0.98] animate-slide-up"
                style={{ animationDelay: `${i * 60 + 80}ms` }}
              >
                {/* Thumbnail */}
                <div
                  className="rounded-2xl flex-shrink-0 overflow-hidden"
                  style={{ width: "72px", height: "72px" }}
                >
                  <RecipeImage
                    name={meal.name}
                    existingUrl={meal.imageUrl}
                    fallbackEmoji={meal.emoji}
                    height={72}
                    emojiFontSize={40}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2
                    className="font-bold mb-1 leading-snug"
                    style={{ fontSize: "15px", color: "var(--text)", letterSpacing: "-0.2px" }}
                  >
                    {meal.name}
                  </h2>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>⏱ {meal.minutes}분</span>
                    {meal.kcal > 0 && (
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>🔥 {meal.kcal}kcal</span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--primary-dark)", lineHeight: 1.4 }}>
                    {meal.healthNote}
                  </p>
                  {/* Category badges */}
                  <div className="flex gap-1 mt-2">
                    {meal.categories.map(cat => {
                      const labels: Record<MealCategory, string> = {
                        "5min": "5분 완성",
                        "low-cal": "저칼로리",
                        "high-protein": "고단백",
                      };
                      return (
                        <span
                          key={cat}
                          className="font-semibold rounded-full"
                          style={{
                            fontSize: "10px",
                            color: "var(--primary-dark)",
                            background: "var(--badge-green)",
                            border: "1px solid var(--card-border)",
                            padding: "2px 7px",
                          }}
                        >
                          {labels[cat]}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center flex-shrink-0 self-center" style={{ opacity: 0.35 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="var(--text)" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>🍽️</p>
            <p className="font-semibold" style={{ fontSize: "15px", color: "var(--text2)" }}>
              해당 카테고리 메뉴가 없어요
            </p>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
              다른 필터를 선택해보세요
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
