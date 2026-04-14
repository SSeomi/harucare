"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { UserProfile, HealthSnapshot } from "@/lib/types";
import {
  getProfile, getCurrentHealth, getHealthHistory, DEFAULT_HEALTH,
} from "@/lib/storage";
import { generateMockHistory, getCoachComment } from "@/lib/health";
import BottomNav from "@/components/BottomNav";

type MetricTab = "weight" | "bp_sys" | "blood_sugar";

const TABS: { key: MetricTab; label: string; unit: string; color: string }[] = [
  { key: "weight",      label: "체중",  unit: "kg",    color: "#2ECC71" },
  { key: "bp_sys",      label: "혈압",  unit: "mmHg",  color: "#2563EB" },
  { key: "blood_sugar", label: "혈당",  unit: "mg/dL", color: "#9333EA" },
];

const PERSONA_LABEL: Record<string, string> = {
  homebody:  "집순이형 🏠",
  active:    "운동 마니아형 🏃",
  "no-cook": "요리 안 함형 🍳",
};
const MEAL_LABEL: Record<string, string> = {
  home:     "집밥 위주",
  delivery: "배달·외식 위주",
};

function CustomTooltip({
  active, payload, label, unit,
}: { active?: boolean; payload?: { value: number }[]; label?: string; unit: string; }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{
        background: "#FFFFFF",
        border: "1px solid #C8EDD8",
        fontSize: "12px",
        color: "#1A1A1A",
        boxShadow: "0 4px 16px rgba(46,204,113,0.12)",
      }}
    >
      <p style={{ color: "#6B7280", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontWeight: 700 }}>{payload[0].value} {unit}</p>
    </div>
  );
}

export default function MyPage() {
  const [profile, setProfile]       = useState<UserProfile | null>(null);
  const [current, setCurrent]       = useState<HealthSnapshot>(DEFAULT_HEALTH);
  const [history, setHistory]       = useState<HealthSnapshot[]>([]);
  const [activeTab, setActiveTab]   = useState<MetricTab>("weight");

  useEffect(() => {
    const p = getProfile();
    const c = getCurrentHealth();
    let h   = getHealthHistory();
    if (h.length < 7) {
      const mock = generateMockHistory();
      mock[mock.length - 1] = { ...mock[mock.length - 1], ...c };
      h = mock;
    }
    setProfile(p);
    setCurrent(c);
    setHistory(h);
  }, []);

  const name       = profile?.name ?? "하루";
  const persona    = profile?.persona ?? "homebody";
  const goalWeight = profile?.goalWeight ?? 60;
  const mealPat    = profile?.mealPattern ?? "home";
  const coachComment = getCoachComment(current, history, goalWeight);

  const chartData = history.slice(-30).map(h => ({
    date:         h.date.slice(5).replace("-", "/"),
    weight:       h.weight,
    bp_sys:       h.bp_sys,
    blood_sugar:  h.blood_sugar,
  }));

  const activeTabConfig = TABS.find(t => t.key === activeTab)!;

  // Weight goal stats
  const startWeight = history.length > 0 ? history[0].weight : 67;
  const totalNeeded = startWeight - goalWeight;
  const achieved    = startWeight - current.weight;
  const progressPct = Math.min(100, Math.max(0, (achieved / totalNeeded) * 100));
  const remaining   = Math.max(0, current.weight - goalWeight);
  const daysElapsed = history.length;
  const rate        = daysElapsed > 0 ? achieved / daysElapsed : 0;
  const daysLeft    = rate > 0 ? Math.ceil(remaining / rate) : 999;

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>
      <main className="mx-auto max-w-[390px] px-4">

        {/* ── Header ── */}
        <header className="pt-12 pb-5 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "20px" }}>🌿</span>
            <h1 className="font-bold" style={{ fontSize: "22px", color: "var(--text)", letterSpacing: "-0.5px" }}>
              하루케어
            </h1>
          </div>
          <button
            className="flex items-center justify-center rounded-full"
            style={{ width: "38px", height: "38px", background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 6h12M3 9h8M3 12h5" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* ── Profile card ── */}
        <div className="card mb-4 p-4 flex items-center gap-4 animate-slide-up" style={{ animationDelay: "60ms" }}>
          <div
            className="flex items-center justify-center rounded-full font-bold text-2xl flex-shrink-0"
            style={{
              width: "52px", height: "52px",
              background: "var(--badge-green)",
              border: "2px solid var(--primary)",
              color: "var(--primary-dark)",
            }}
          >
            {name[0]}
          </div>
          <div>
            <p className="font-bold" style={{ fontSize: "17px", color: "var(--text)" }}>
              {name}님
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>{PERSONA_LABEL[persona]}</span>
              <span style={{ fontSize: "10px", color: "var(--faint)" }}>·</span>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>{MEAL_LABEL[mealPat]}</span>
            </div>
          </div>
          <div
            className="ml-auto font-semibold rounded-full"
            style={{
              fontSize: "11px", color: "var(--primary-dark)",
              background: "var(--badge-green)",
              border: "1px solid var(--card-border)",
              padding: "4px 10px",
            }}
          >
            {daysElapsed}일 기록
          </div>
        </div>

        {/* ── Weight Goal Report ── */}
        <div className="card mb-4 p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <p className="font-semibold mb-4" style={{ fontSize: "13px", color: "var(--text2)" }}>
            이번 달 건강 리포트
          </p>

          {/* 3 stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: "시작",    value: `${startWeight}kg`,      color: "var(--muted)" },
              { label: "현재",    value: `${current.weight}kg`,   color: "var(--primary-dark)" },
              { label: "목표",    value: `${goalWeight}kg`,        color: "var(--text2)" },
            ].map((s, i) => (
              <div
                key={i}
                className="text-center rounded-xl py-3"
                style={{ background: i === 1 ? "var(--badge-green)" : "var(--faint2)" }}
              >
                <p style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "4px" }}>{s.label}</p>
                <p className="font-bold tabular-nums" style={{ fontSize: "17px", color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold" style={{ fontSize: "13px", color: "var(--text)" }}>
                목표까지{" "}
                <span style={{ color: "var(--primary-dark)" }}>-{remaining.toFixed(1)}kg!</span>
              </p>
              <span
                className="font-bold rounded-full"
                style={{
                  fontSize: "11px", color: "var(--primary-dark)",
                  background: "var(--badge-green)", padding: "2px 8px",
                }}
              >
                달성률 {Math.round(progressPct)}%
              </span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden mb-2"
              style={{ height: "8px", background: "var(--faint)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, var(--primary), var(--primary-dark))",
                  transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              약 {daysLeft < 999 ? `${daysLeft}일` : "–"} 남음
            </p>
          </div>
        </div>

        {/* ── Chart ── */}
        <div className="card mb-4 p-4 animate-slide-up" style={{ animationDelay: "160ms" }}>
          <p className="font-semibold mb-4" style={{ fontSize: "13px", color: "var(--text2)" }}>
            월간 건강 지표 추이
          </p>

          {/* Tab selector */}
          <div className="flex gap-1.5 mb-4 p-1 rounded-xl" style={{ background: "var(--faint2)" }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 py-2 rounded-lg font-semibold transition-all"
                  style={{
                    fontSize: "12px",
                    background: isActive ? "#FFFFFF" : "transparent",
                    color: isActive ? tab.color : "var(--muted)",
                    border: isActive ? `1px solid ${tab.color}30` : "1px solid transparent",
                    boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false}
                interval={6} tick={{ fontSize: 10, fill: "var(--muted)" }} />
              <YAxis tickLine={false} axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted)" }} domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip unit={activeTabConfig.unit} />} />

              {/* Goal weight reference line (only for weight tab) */}
              {activeTab === "weight" && (
                <ReferenceLine
                  y={goalWeight}
                  stroke="#9CA3AF"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  label={{ value: `목표 ${goalWeight}kg`, position: "insideTopRight", fontSize: 9, fill: "#9CA3AF" }}
                />
              )}

              <Line
                type="monotone"
                dataKey={activeTab}
                stroke={activeTabConfig.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: activeTabConfig.color, stroke: "white", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Current value */}
          <div
            className="mt-4 p-3 rounded-xl flex items-center justify-between"
            style={{ background: "var(--faint2)" }}
          >
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              현재 {activeTabConfig.label}
            </span>
            <span className="font-bold tabular-nums" style={{ fontSize: "20px", color: activeTabConfig.color, letterSpacing: "-0.5px" }}>
              {current[activeTab]}
              <span className="font-normal ml-1" style={{ fontSize: "12px", color: "var(--muted)" }}>
                {activeTabConfig.unit}
              </span>
            </span>
          </div>
        </div>

        {/* ── AI Coach Comment ── */}
        <div
          className="mb-4 rounded-2xl p-5 animate-slide-up"
          style={{
            animationDelay: "220ms",
            background: "linear-gradient(135deg, #E8F8F0 0%, #F0FBF4 100%)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="flex items-center justify-center rounded-full text-base flex-shrink-0"
              style={{ width: "32px", height: "32px", background: "rgba(46,204,113,0.15)" }}
            >
              🏆
            </span>
            <p className="font-semibold" style={{ fontSize: "13px", color: "var(--primary-dark)" }}>
              잘하고 있어요!
            </p>
          </div>
          <p style={{ fontSize: "13.5px", color: "var(--text2)", lineHeight: 1.75 }}>
            {coachComment}
          </p>
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--card-border)" }}>
            <p className="font-semibold mb-2" style={{ fontSize: "12px", color: "var(--text2)" }}>
              다음 주 추천 액션
            </p>
            {["저녁 탄수화물 줄이기", "물 하루 1.5L 유지하기", "주 3회 30분 걷기"].map((a, i) => (
              <p key={i} className="flex items-start gap-1.5" style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "4px" }}>
                <span style={{ color: "var(--primary)", marginTop: "2px" }}>•</span>
                {a}
              </p>
            ))}
          </div>
        </div>

        {/* ── AI Premium CTA ── */}
        <button
          className="w-full btn-primary animate-slide-up"
          style={{ animationDelay: "280ms" }}
        >
          🤖 AI 정밀 분석 리포트 받기
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
