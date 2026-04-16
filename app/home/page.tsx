"use client";

import { useState, useEffect } from "react";
import { Persona, UserProfile, HealthSnapshot } from "@/lib/types";
import {
  getProfile,
  saveProfile,
  getCurrentHealth,
  DEFAULT_HEALTH,
} from "@/lib/storage";
import { getRecommendations } from "@/lib/recommendations";
import { getPrimaryAlert } from "@/lib/health";
import Link from "next/link";
import HealthMetricsSection from "@/components/HealthMetricsSection";
import RecommendationCard from "@/components/RecommendationCard";
import ActionGuideSection from "@/components/ActionGuideSection";
import ChecklistSection from "@/components/ChecklistSection";
import BottomNav from "@/components/BottomNav";
import RecipeImage from "@/components/RecipeImage";
import { MEALS_LIST } from "@/lib/meals-data";
import { Meal } from "@/lib/types";

const PERSONAS: { id: Persona; emoji: string; title: string; desc: string }[] = [
  { id: "homebody", emoji: "🏠", title: "집순이형",      desc: "수면 중심의 안정적 라이프스타일" },
  { id: "active",   emoji: "🏃", title: "운동 마니아형", desc: "활동 많은 하루를 보내요" },
  { id: "no-cook",  emoji: "🍳", title: "요리 안 함형",  desc: "간편식 위주로 먹어요" },
];

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [health, setHealth] = useState<HealthSnapshot>(DEFAULT_HEALTH);
  const [showPersonaSheet, setShowPersonaSheet] = useState(false);
  const [mealList, setMealList] = useState<Meal[]>(MEALS_LIST);

  useEffect(() => {
    setProfile(getProfile());
    setHealth(getCurrentHealth());
    // 레시피 API fetch (실패 시 하드코딩 유지)
    fetch("/api/recipes")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setMealList(data); })
      .catch(() => {});
  }, []);

  const persona = profile?.persona ?? "homebody";
  const name = profile?.name ?? "하루";
  const goalWeight = profile?.goalWeight ?? 60;
  const recs = getRecommendations(persona, health);
  const alert = getPrimaryAlert(health);

  const currentPersona = PERSONAS.find(p => p.id === persona) ?? PERSONAS[0];

  function handlePersonaSelect(id: Persona) {
    if (!profile) return;
    const updated = { ...profile, persona: id };
    saveProfile(updated);
    setProfile(updated);
    setShowPersonaSheet(false);
  }

  // Weight goal progress
  const startWeight = 67;
  const progress = Math.min(
    100,
    Math.max(0, ((startWeight - health.weight) / (startWeight - goalWeight)) * 100)
  );
  const remaining = Math.max(0, health.weight - goalWeight);

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>

      {/* ── Persona Bottom Sheet ── */}
      {showPersonaSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowPersonaSheet(false)}
        >
          <div
            className="w-full max-w-[390px] rounded-t-3xl p-6 pb-10 animate-slide-up"
            style={{ background: "var(--bg)", boxShadow: "0 -4px 32px rgba(0,0,0,0.12)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div
              className="mx-auto mb-5 rounded-full"
              style={{ width: "36px", height: "4px", background: "var(--faint)" }}
            />
            <p
              className="font-bold mb-1"
              style={{ fontSize: "18px", color: "var(--text)", letterSpacing: "-0.4px" }}
            >
              라이프스타일 변경
            </p>
            <p className="mb-5" style={{ fontSize: "13px", color: "var(--muted)" }}>
              선택한 스타일에 맞는 맞춤 가이드를 드려요
            </p>
            <div className="space-y-3">
              {PERSONAS.map(p => {
                const selected = persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePersonaSelect(p.id)}
                    className="w-full text-left rounded-2xl transition-all duration-200 active:scale-[0.98]"
                    style={{
                      padding: "16px 18px",
                      background: selected ? "rgba(46,204,113,0.07)" : "var(--card)",
                      border: `2px solid ${selected ? "var(--primary)" : "var(--card-border)"}`,
                      boxShadow: selected ? "0 4px 16px rgba(46,204,113,0.15)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="flex items-center justify-center rounded-2xl text-3xl leading-none flex-shrink-0"
                        style={{
                          width: "48px", height: "48px",
                          background: selected ? "rgba(46,204,113,0.12)" : "var(--faint2)",
                        }}
                      >
                        {p.emoji}
                      </span>
                      <div className="flex-1">
                        <p
                          className="font-bold"
                          style={{
                            fontSize: "15px",
                            color: selected ? "var(--primary-dark)" : "var(--text)",
                          }}
                        >
                          {p.title}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                          {p.desc}
                        </p>
                      </div>
                      {selected && (
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{ width: "24px", height: "24px", background: "var(--primary)" }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8"
                              strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[390px] px-4">

        {/* ── Header ── */}
        <header className="pt-12 pb-5 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "20px" }}>🌿</span>
            <h1
              className="font-bold"
              style={{ fontSize: "22px", color: "var(--text)", letterSpacing: "-0.5px" }}
            >
              하루케어
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Lifestyle selector */}
            <button
              onClick={() => setShowPersonaSheet(true)}
              className="flex items-center gap-1.5 rounded-full transition-all active:scale-95"
              style={{
                height: "38px",
                padding: "0 12px",
                background: "var(--card)",
                border: "1px solid var(--card-border)",
              }}
              aria-label="라이프스타일 변경"
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>{currentPersona.emoji}</span>
              <span
                className="font-semibold"
                style={{ fontSize: "12px", color: "var(--text2)" }}
              >
                {currentPersona.title}
              </span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.4 }}>
                <path d="M2 4l3 3 3-3" stroke="var(--text)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* Bell */}
            <button
              className="flex items-center justify-center rounded-full"
              style={{
                width: "38px", height: "38px",
                background: "var(--card)",
                border: "1px solid var(--card-border)",
              }}
              aria-label="알림"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 2a5.5 5.5 0 00-5.5 5.5v2L2 11.5h14l-1.5-2V7.5A5.5 5.5 0 009 2z"
                  stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round"
                />
                <path d="M7 13.5a2 2 0 004 0" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── Section 1: Health Cards ── */}
        <section className="mb-5 animate-slide-up" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold" style={{ fontSize: "13px", color: "var(--text2)" }}>
              건강 상태
            </p>
            <p style={{ fontSize: "11px", color: "var(--muted)" }}>카드 탭하면 수정</p>
          </div>
          <HealthMetricsSection health={health} onUpdate={setHealth} goalWeight={goalWeight} />

          {/* Weight Goal Progress */}
          <div
            className="card mt-3 p-4 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p style={{ fontSize: "13px", color: "var(--text2)", fontWeight: 600 }}>
                목표까지{" "}
                <span style={{ color: "var(--primary-dark)", fontWeight: 700 }}>
                  -{remaining.toFixed(1)}kg
                </span>{" "}
                남았어요
              </p>
              <span
                className="rounded-full font-semibold"
                style={{
                  fontSize: "11px", color: "var(--primary-dark)",
                  background: "var(--badge-green)",
                  padding: "2px 8px",
                }}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: "7px", background: "var(--faint)" }}
            >
              <div
                className="h-full rounded-full animate-progress"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--primary), var(--primary-dark))",
                  animationDelay: "400ms",
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span style={{ fontSize: "10px", color: "var(--muted)" }}>{startWeight}kg 시작</span>
              <span style={{ fontSize: "10px", color: "var(--muted)" }}>목표 {goalWeight}kg</span>
            </div>
          </div>
        </section>

        {/* ── Section 2: Daily Action Guide ── */}
        <section className="mb-5 animate-slide-up" style={{ animationDelay: "140ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold" style={{ fontSize: "13px", color: "var(--text2)" }}>
              오늘의 실행 가이드
            </p>
          </div>
          <div className="card p-4">
            <p
              className="font-bold mb-4"
              style={{ fontSize: "15px", color: "var(--text)", letterSpacing: "-0.3px" }}
            >
              🌟 {name}님, 오늘 이렇게만 챙겨보세요!
            </p>
            <ActionGuideSection alert={alert} />
          </div>
        </section>

        {/* ── Section 3: Today's Quick Meal ── */}
        <section className="mb-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold" style={{ fontSize: "13px", color: "var(--text2)" }}>
              오늘 저녁은 이거 어때요?
            </p>
            <Link
              href="/meal"
              className="font-semibold"
              style={{ fontSize: "12px", color: "var(--primary-dark)" }}
            >
              전체 보기
            </Link>
          </div>
          {/* Horizontal scroll big cards */}
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
          >
            {mealList.map((meal) => (
              <div
                key={meal.id}
                className="flex-shrink-0 rounded-2xl overflow-hidden"
                style={{
                  width: "312px",
                  scrollSnapAlign: "start",
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  boxShadow: "0 2px 12px rgba(46,204,113,0.08)",
                }}
              >
                {/* Hero photo area */}
                <div
                  className="relative flex items-center justify-center overflow-hidden"
                  style={{ height: "160px" }}
                >
                  <RecipeImage
                    name={meal.name}
                    existingUrl={meal.imageUrl}
                    fallbackEmoji={meal.emoji}
                    height={160}
                    emojiFontSize={80}
                  />
                  {/* Category badge */}
                  {meal.categories[0] && (
                    <span
                      className="absolute top-3 left-3 font-bold rounded-full px-2 py-1"
                      style={{
                        fontSize: "10px",
                        background: "rgba(46,204,113,0.85)",
                        color: "#fff",
                      }}
                    >
                      {meal.categories[0] === "5min" ? "⚡ 5분" : meal.categories[0] === "low-cal" ? "🥗 저칼로리" : "💪 고단백"}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3
                    className="font-bold mb-2"
                    style={{ fontSize: "16px", color: "var(--text)", letterSpacing: "-0.3px" }}
                  >
                    {meal.name}
                  </h3>

                  {/* Ingredient list */}
                  <div className="space-y-1 mb-3">
                    {meal.ingredients.map(ing => (
                      <div key={ing.id} className="flex items-center gap-2">
                        <span style={{ fontSize: "13px" }}>{ing.emoji}</span>
                        <span style={{ fontSize: "12px", color: "var(--text2)" }}>
                          {ing.label.split("(")[0].trim()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Time / kcal */}
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>⏱ {meal.minutes}분</span>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>🔥 {meal.kcal}kcal</span>
                  </div>

                  {/* Health note */}
                  <p className="mb-3" style={{ fontSize: "12px", color: "var(--primary-dark)", lineHeight: 1.4 }}>
                    {meal.healthNote}
                  </p>

                  {/* Cart button */}
                  <Link
                    href={`/cart/${meal.id}`}
                    className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold transition-opacity active:opacity-80"
                    style={{
                      fontSize: "13px",
                      color: "#fff",
                      background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                    }}
                  >
                    🛒 한번에 담기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Rule of 3 ── */}
        <section className="mb-5">
          <div
            className="flex items-center justify-between mb-3 animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <p className="font-semibold" style={{ fontSize: "13px", color: "var(--text2)" }}>
              오늘의 추천
            </p>
            <span
              className="font-bold rounded-full"
              style={{
                fontSize: "10px", color: "var(--primary-dark)",
                background: "var(--badge-green)",
                padding: "3px 9px",
                border: "1px solid var(--card-border)",
              }}
            >
              Rule of 3
            </span>
          </div>
          <div className="space-y-3">
            {recs.map((rec, i) => (
              <RecommendationCard key={rec.product.id} rec={rec} index={i} />
            ))}
          </div>
        </section>

        {/* ── Section 4: Today's Checklist ── */}
        <section className="animate-slide-up" style={{ animationDelay: "360ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold" style={{ fontSize: "13px", color: "var(--text2)" }}>
              오늘 체크리스트
            </p>
            <span style={{ fontSize: "12px", color: "var(--warning)" }}>목표까지 달림 🔥</span>
          </div>
          <ChecklistSection />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
