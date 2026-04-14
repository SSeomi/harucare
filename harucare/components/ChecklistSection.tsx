"use client";

import { useState } from "react";
import Link from "next/link";
import { getChecklistChecked, toggleChecklistItem } from "@/lib/storage";

const ITEMS = [
  { id: "weight_record",  label: "오늘 체중 기록",  link: "/home",  linkText: "기록하기" },
  { id: "water_1_5L",    label: "물 1.5L 마심",     link: null,     linkText: null },
  { id: "meds_done",     label: "약·복용 완료",      link: null,     linkText: null },
];

export default function ChecklistSection() {
  const [checked, setChecked] = useState<string[]>(() => getChecklistChecked());

  function toggle(id: string) {
    setChecked(toggleChecklistItem(id));
  }

  const doneCount = ITEMS.filter(it => checked.includes(it.id)).length;
  const allDone   = doneCount === ITEMS.length;

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-full font-bold"
            style={{
              width: "22px", height: "22px",
              background: allDone ? "var(--primary)" : "var(--faint2)",
              fontSize: "10px",
              color: allDone ? "#fff" : "var(--muted)",
              border: `1px solid ${allDone ? "var(--primary)" : "var(--card-border)"}`,
            }}
          >
            {doneCount}/{ITEMS.length}
          </div>
          {allDone && (
            <span
              className="font-semibold rounded-full animate-fade-in"
              style={{
                fontSize: "11px", color: "var(--primary-dark)",
                background: "var(--badge-green)", padding: "2px 8px",
              }}
            >
              오늘 완료 🎉
            </span>
          )}
        </div>
        <div
          className="rounded-full overflow-hidden"
          style={{ width: "60px", height: "5px", background: "var(--faint)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(doneCount / ITEMS.length) * 100}%`,
              background: "linear-gradient(90deg, var(--primary), var(--primary-dark))",
            }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {ITEMS.map(item => {
          const done = checked.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-3 rounded-xl p-3 transition-all active:scale-[0.98]"
              style={{
                background: done ? "rgba(46,204,113,0.06)" : "var(--faint2)",
                border: `1px solid ${done ? "rgba(46,204,113,0.2)" : "var(--card-border)"}`,
              }}
            >
              {/* Checkbox */}
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: "22px", height: "22px",
                  background: done ? "var(--primary)" : "transparent",
                  border: `2px solid ${done ? "var(--primary)" : "var(--card-border)"}`,
                  transition: "all 0.2s",
                }}
              >
                {done && (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="animate-check-pop">
                    <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Label */}
              <span
                className="flex-1 text-left font-medium"
                style={{
                  fontSize: "14px",
                  color: done ? "var(--muted)" : "var(--text)",
                  textDecoration: done ? "line-through" : "none",
                }}
              >
                {item.label}
              </span>

              {/* Link */}
              {item.link && !done && (
                <Link
                  href={item.link}
                  onClick={e => e.stopPropagation()}
                  className="font-semibold"
                  style={{ fontSize: "12px", color: "var(--primary-dark)" }}
                >
                  {item.linkText}
                </Link>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
