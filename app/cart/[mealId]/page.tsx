"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMealById } from "@/lib/meals-data";
import { Meal, MealIngredient } from "@/lib/types";

export default function CartPage({ params }: PageProps<"/cart/[mealId]">) {
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    params.then(({ mealId }) => {
      const m = getMealById(mealId);
      if (!m) { router.replace("/home"); return; }
      setMeal(m);
      setChecked(new Set(m.ingredients.map(i => i.id)));
    });
  }, [params, router]);

  function toggleItem(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

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

  const coupangItems = meal.ingredients.filter(i => i.platform === "coupang");
  const kurlyItems = meal.ingredients.filter(i => i.platform === "kurly");

  const coupangCheckedItems = coupangItems.filter(i => checked.has(i.id));
  const kurlyCheckedItems = kurlyItems.filter(i => checked.has(i.id));

  const coupangTotal = coupangCheckedItems.reduce((sum, i) => sum + i.priceNum, 0);
  const kurlyTotal = kurlyCheckedItems.reduce((sum, i) => sum + i.priceNum, 0);
  const totalPrice = coupangTotal + kurlyTotal;

  function openCoupang() {
    if (coupangCheckedItems.length === 0) return;
    const q = coupangCheckedItems.map(i => i.label.split(" ")[0]).join("+");
    window.open(`https://www.coupang.com/np/search?q=${encodeURIComponent(q)}`, "_blank");
  }

  function openKurly() {
    if (kurlyCheckedItems.length === 0) return;
    const q = kurlyCheckedItems.map(i => i.label.split(" ")[0]).join(" ");
    window.open(`https://www.kurly.com/search?sword=${encodeURIComponent(q)}`, "_blank");
  }

  function openAll() {
    openCoupang();
    openKurly();
  }

  const hasAnyChecked = checked.size > 0;

  return (
    <div className="min-h-screen pb-44" style={{ background: "var(--bg)" }}>

      {/* ── Header ── */}
      <div
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--card-border)",
          paddingTop: "56px",
        }}
      >
        <div className="flex items-center gap-3 px-5 pb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-full flex-shrink-0 transition-opacity hover:opacity-70"
            style={{
              width: "36px", height: "36px",
              background: "var(--faint2)",
              border: "1px solid var(--card-border)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4l-5 5 5 5" stroke="var(--text2)" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h1
              className="font-bold"
              style={{ fontSize: "18px", color: "var(--text)", letterSpacing: "-0.4px" }}
            >
              🛒 장바구니
            </h1>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "1px" }}>
              최저가 플랫폼별로 묶었어요
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-[390px] px-4 pt-5 space-y-4">

        {/* Meal info */}
        <div className="flex items-center gap-3 px-1">
          <span style={{ fontSize: "28px" }}>{meal.emoji}</span>
          <div>
            <p className="font-bold" style={{ fontSize: "15px", color: "var(--text)", letterSpacing: "-0.3px" }}>
              {meal.name}
            </p>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              ⏱ {meal.minutes}분 &nbsp;·&nbsp; 🔥 {meal.kcal}kcal
            </p>
          </div>
        </div>

        {/* ── Coupang Section ── */}
        {coupangItems.length > 0 && (
          <PlatformSection
            platform="coupang"
            items={coupangItems}
            checkedIds={checked}
            onToggle={toggleItem}
            subtotal={coupangTotal}
            onOpen={openCoupang}
          />
        )}

        {/* ── Kurly Section ── */}
        {kurlyItems.length > 0 && (
          <PlatformSection
            platform="kurly"
            items={kurlyItems}
            checkedIds={checked}
            onToggle={toggleItem}
            subtotal={kurlyTotal}
            onOpen={openKurly}
          />
        )}
      </div>

      {/* ── Fixed Bottom ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-10 pt-4"
        style={{ background: "linear-gradient(to top, #F4FAF6 75%, transparent 100%)" }}
      >
        <div className="mx-auto max-w-[390px] space-y-3">
          {/* Total */}
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>전체 합계</span>
            <span
              className="font-bold tabular-nums"
              style={{ fontSize: "22px", color: "var(--primary-dark)", letterSpacing: "-0.5px" }}
            >
              {totalPrice.toLocaleString()}원
            </span>
          </div>

          {/* Text */}
          <p className="text-center" style={{ fontSize: "11px", color: "var(--muted)" }}>
            한 번에 구매하고 내일 아침에 바로 드세요! 🌿
          </p>

          {/* FAB */}
          <button
            onClick={openAll}
            disabled={!hasAnyChecked}
            className="btn-primary w-full"
            style={{
              fontSize: "15px",
              padding: "17px",
              opacity: hasAnyChecked ? 1 : 0.45,
              cursor: hasAnyChecked ? "pointer" : "not-allowed",
            }}
          >
            ✅ 전체 구매하기
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Platform Section Component ── */
function PlatformSection({
  platform,
  items,
  checkedIds,
  onToggle,
  subtotal,
  onOpen,
}: {
  platform: "coupang" | "kurly";
  items: MealIngredient[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  subtotal: number;
  onOpen: () => void;
}) {
  const checkedCount = items.filter(i => checkedIds.has(i.id)).length;
  const isCoupang = platform === "coupang";

  return (
    <div className="card p-5 animate-slide-up">
      {/* Platform header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center rounded-xl font-bold"
          style={{
            width: "42px", height: "42px",
            background: isCoupang ? "#E8F4FD" : "#FFF0F8",
            fontSize: "22px",
          }}
        >
          {isCoupang ? "🛒" : "🛍️"}
        </div>
        <div>
          <p className="font-bold" style={{ fontSize: "15px", color: "var(--text)", letterSpacing: "-0.3px" }}>
            {isCoupang ? "쿠팡에서 구매하기" : "컬리에서 구매하기"}
          </p>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "1px" }}>
            {isCoupang ? "로켓배송 · 내일 새벽 도착" : "샛별배송 · 내일 아침 도착"}
          </p>
        </div>
      </div>

      {/* Item list */}
      <div className="space-y-2 mb-4">
        {items.map(item => {
          const isChecked = checkedIds.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className="w-full flex items-center gap-3 rounded-xl p-3 transition-all active:scale-[0.98]"
              style={{
                background: isChecked ? "rgba(46,204,113,0.06)" : "var(--faint2)",
                border: `1.5px solid ${isChecked ? "rgba(46,204,113,0.25)" : "var(--card-border)"}`,
              }}
            >
              {/* Checkbox */}
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

              {/* Emoji */}
              <span style={{ fontSize: "18px" }}>{item.emoji}</span>

              {/* Label */}
              <p
                className="flex-1 text-left font-medium"
                style={{ fontSize: "13px", color: isChecked ? "var(--text)" : "var(--muted)" }}
              >
                {item.label}
              </p>

              {/* Price */}
              <p
                className="font-bold tabular-nums flex-shrink-0"
                style={{ fontSize: "13px", color: isChecked ? "var(--primary-dark)" : "var(--muted)" }}
              >
                {item.price}
              </p>
            </button>
          );
        })}
      </div>

      {/* Subtotal */}
      <div
        className="flex items-center justify-between pt-3 mb-3"
        style={{ borderTop: "1px solid var(--card-border)" }}
      >
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
          소계 {checkedCount}개
        </span>
        <span
          className="font-bold tabular-nums"
          style={{ fontSize: "16px", color: "var(--primary-dark)" }}
        >
          {subtotal.toLocaleString()}원
        </span>
      </div>

      {/* Platform button */}
      <button
        onClick={onOpen}
        disabled={checkedCount === 0}
        className="w-full rounded-xl py-3 font-bold transition-all active:scale-[0.98]"
        style={{
          fontSize: "14px",
          background: checkedCount > 0
            ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
            : "var(--faint)",
          color: checkedCount > 0 ? "#fff" : "var(--muted)",
          opacity: checkedCount > 0 ? 1 : 0.6,
        }}
      >
        {isCoupang ? "🛒 쿠팡 바로가기" : "🛍️ 컬리 바로가기"}
      </button>
    </div>
  );
}
