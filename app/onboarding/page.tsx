"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Persona, MealPattern } from "@/lib/types";
import { markOnboardingDone, saveProfile } from "@/lib/storage";

const PERSONAS: { id: Persona; emoji: string; title: string; desc: string }[] = [
  { id: "homebody", emoji: "🏠", title: "집순이형",      desc: "수면 중심의 안정적 라이프스타일" },
  { id: "active",   emoji: "🏃", title: "운동 마니아형", desc: "활동 많은 하루를 보내요" },
  { id: "no-cook",  emoji: "🍳", title: "요리 안 함형",  desc: "간편식 위주로 먹어요" },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [persona, setPersona] = useState<Persona | null>(null);

  // Step 2
  const [name, setName] = useState("");
  const [goalWeightStr, setGoalWeightStr] = useState("58");
  const [mealPattern, setMealPattern] = useState<MealPattern>("home");

  function handleFinish() {
    const goalWeight = parseFloat(goalWeightStr) || 60;
    saveProfile({
      name: name.trim() || "하루",
      persona: persona!,
      goalWeight,
      mealPattern,
    });
    markOnboardingDone();
    router.replace("/home");
  }

  const step2Valid = goalWeightStr.length > 0 && parseFloat(goalWeightStr) > 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <main className="flex-1 flex flex-col mx-auto w-full max-w-[390px] px-5 pt-14 pb-8">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 animate-fade-in">
          <span style={{ fontSize: "22px" }}>🌿</span>
          <span
            className="font-bold"
            style={{ fontSize: "18px", color: "var(--primary-dark)", letterSpacing: "-0.3px" }}
          >
            하루케어
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8 animate-fade-in" style={{ animationDelay: "60ms" }}>
          {[1, 2].map(n => (
            <div
              key={n}
              className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: n <= step
                  ? "linear-gradient(90deg, var(--primary), var(--primary-dark))"
                  : "var(--faint)",
              }}
            />
          ))}
        </div>

        {/* ── STEP 1: Persona ── */}
        {step === 1 && (
          <>
            <p
              className="font-medium mb-1 animate-fade-in"
              style={{ fontSize: "12px", color: "var(--primary)", animationDelay: "100ms" }}
            >
              STEP 1 / 2
            </p>
            <h1
              className="font-bold mb-2 animate-slide-up"
              style={{
                fontSize: "24px", color: "var(--text)",
                letterSpacing: "-0.5px", lineHeight: 1.3,
                animationDelay: "120ms",
              }}
            >
              나에게 맞는 추천을 위해<br />
              생활 패턴을 알려주세요 🌱
            </h1>
            <p
              className="mb-8 animate-fade-in"
              style={{ fontSize: "14px", color: "var(--muted)", animationDelay: "180ms" }}
            >
              선택한 스타일에 맞는 맞춤 가이드를 드려요
            </p>

            <div className="space-y-3 flex-1">
              {PERSONAS.map((p, i) => {
                const selected = persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPersona(p.id)}
                    className="w-full text-left rounded-2xl transition-all duration-200 active:scale-[0.98] animate-slide-up"
                    style={{
                      animationDelay: `${i * 80 + 220}ms`,
                      padding: "18px 20px",
                      background: selected ? "rgba(46,204,113,0.07)" : "var(--card)",
                      border: `2px solid ${selected ? "var(--primary)" : "var(--card-border)"}`,
                      boxShadow: selected ? "0 4px 16px rgba(46,204,113,0.15)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="flex items-center justify-center rounded-2xl text-3xl leading-none flex-shrink-0"
                        style={{
                          width: "52px", height: "52px",
                          background: selected ? "rgba(46,204,113,0.12)" : "var(--faint2)",
                        }}
                      >
                        {p.emoji}
                      </span>
                      <div className="flex-1">
                        <p
                          className="font-bold"
                          style={{
                            fontSize: "16px",
                            color: selected ? "var(--primary-dark)" : "var(--text)",
                          }}
                        >
                          {p.title}
                        </p>
                        <p
                          style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}
                        >
                          {p.desc}
                        </p>
                      </div>
                      {selected && (
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0 animate-check-pop"
                          style={{
                            width: "24px", height: "24px",
                            background: "var(--primary)",
                          }}
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

            <button
              className="btn-primary mt-8"
              disabled={!persona}
              onClick={() => setStep(2)}
            >
              다음으로
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <p
              className="text-center mt-4 animate-fade-in"
              style={{ fontSize: "12px", color: "var(--muted)", animationDelay: "600ms" }}
            >
              🔒 나의 데이터는 안전하게 보호됩니다
            </p>
          </>
        )}

        {/* ── STEP 2: Goal Weight + Meal Pattern + Name ── */}
        {step === 2 && (
          <>
            <p
              className="font-medium mb-1 animate-fade-in"
              style={{ fontSize: "12px", color: "var(--primary)" }}
            >
              STEP 2 / 2
            </p>
            <h1
              className="font-bold mb-2 animate-slide-up"
              style={{
                fontSize: "24px", color: "var(--text)",
                letterSpacing: "-0.5px", lineHeight: 1.3,
                animationDelay: "60ms",
              }}
            >
              목표 체중과 식사 패턴을<br />
              알려주세요 🎯
            </h1>
            <p
              className="mb-8 animate-fade-in"
              style={{ fontSize: "14px", color: "var(--muted)", animationDelay: "120ms" }}
            >
              더 정확한 추천을 위해 사용돼요
            </p>

            {/* Goal Weight Input */}
            <div
              className="card p-5 mb-4 animate-slide-up"
              style={{ animationDelay: "160ms" }}
            >
              <p className="font-semibold mb-3" style={{ fontSize: "14px", color: "var(--text2)" }}>
                목표 체중
              </p>
              <div className="flex items-end gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  value={goalWeightStr}
                  onChange={e => setGoalWeightStr(e.target.value)}
                  min={30} max={150}
                  placeholder="58"
                  className="outline-none font-bold tabular-nums"
                  style={{
                    fontSize: "52px",
                    color: "var(--primary-dark)",
                    letterSpacing: "-2px",
                    lineHeight: 1,
                    width: "130px",
                    background: "transparent",
                    border: "none",
                    caretColor: "var(--primary)",
                  }}
                />
                <span
                  className="font-medium pb-2"
                  style={{ fontSize: "20px", color: "var(--muted)" }}
                >
                  kg
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "8px" }}>
                현재 체중보다 낮은 값으로 설정하세요
              </p>
            </div>

            {/* Meal Pattern */}
            <div
              className="card p-5 mb-4 animate-slide-up"
              style={{ animationDelay: "220ms" }}
            >
              <p className="font-semibold mb-3" style={{ fontSize: "14px", color: "var(--text2)" }}>
                식사 패턴
              </p>
              <div className="flex gap-2">
                {(["home", "delivery"] as MealPattern[]).map(pattern => {
                  const active = mealPattern === pattern;
                  const labels = { home: "🏠 집에서 자주 먹음", delivery: "🛵 배달·외식 많음" };
                  return (
                    <button
                      key={pattern}
                      onClick={() => setMealPattern(pattern)}
                      className="flex-1 py-3 rounded-xl font-semibold transition-all"
                      style={{
                        fontSize: "13px",
                        background: active ? "var(--primary)" : "var(--faint2)",
                        color: active ? "#fff" : "var(--muted)",
                        border: `1.5px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
                      }}
                    >
                      {labels[pattern]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name Input */}
            <div
              className="card p-5 mb-6 animate-slide-up"
              style={{ animationDelay: "280ms" }}
            >
              <p className="font-semibold mb-3" style={{ fontSize: "14px", color: "var(--text2)" }}>
                이름 (선택)
              </p>
              <input
                type="text"
                placeholder="이름 또는 닉네임"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={10}
                className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={{
                  fontSize: "16px",
                  background: "var(--faint2)",
                  border: "1.5px solid var(--card-border)",
                  color: "var(--text)",
                  caretColor: "var(--primary)",
                }}
                onFocus={e => { e.target.style.borderColor = "var(--primary)"; }}
                onBlur={e =>  { e.target.style.borderColor = "var(--card-border)"; }}
              />
            </div>

            <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "340ms" }}>
              <button
                className="btn-primary"
                disabled={!step2Valid}
                onClick={handleFinish}
              >
                시작하기 🌿
              </button>
              <button className="btn-secondary" onClick={() => setStep(1)}>
                이전으로
              </button>
            </div>

            <p
              className="text-center mt-4 animate-fade-in"
              style={{ fontSize: "12px", color: "var(--muted)", animationDelay: "500ms" }}
            >
              🔒 나의 데이터는 안전하게 보호됩니다
            </p>
          </>
        )}
      </main>
    </div>
  );
}
