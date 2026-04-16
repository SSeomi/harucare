"use client";

import { useState } from "react";
import { getMedicationsChecked, toggleMedication } from "@/lib/storage";

const MEDICATIONS = [
  { id: "omega3",   label: "오메가3",    time: "아침" },
  { id: "magnesium", label: "마그네슘",  time: "저녁" },
  { id: "vitamin_d", label: "비타민D",  time: "아침" },
];

const REORDERS = [
  { name: "오메가3", daysLeft: 3 },
  { name: "마그네슘", daysLeft: 12 },
];

export default function MedicationSection() {
  const [checked, setChecked] = useState<string[]>(() => getMedicationsChecked());

  function toggle(id: string) {
    setChecked(toggleMedication(id));
  }

  const allDone = MEDICATIONS.every(m => checked.includes(m.id));

  return (
    <div className="space-y-3">
      {/* Medication Check */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p
            className="font-sans font-semibold text-[14px]"
            style={{ color: "var(--text)" }}
          >
            약 복용 체크
          </p>
          {allDone && (
            <span
              className="font-sans text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ color: "var(--green)", background: "rgba(74,222,128,0.12)" }}
            >
              오늘 완료 ✓
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {MEDICATIONS.map(m => {
            const done = checked.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggle(m.id)}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all active:scale-95"
                style={{
                  background: done ? "rgba(22,163,74,0.08)" : "var(--faint2)",
                  border: `1px solid ${done ? "rgba(22,163,74,0.25)" : "var(--card-border)"}`,
                }}
              >
                <span className="text-xl">{done ? "✅" : "💊"}</span>
                <span
                  className="font-sans text-[11px] font-medium"
                  style={{ color: done ? "var(--green)" : "var(--muted)" }}
                >
                  {m.label}
                </span>
                <span
                  className="font-sans text-[10px]"
                  style={{ color: "var(--faint)" }}
                >
                  {m.time}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reorder Reminders */}
      {REORDERS.some(r => r.daysLeft <= 14) && (
        <div className="card p-4">
          <p
            className="font-sans font-semibold text-[14px] mb-3"
            style={{ color: "var(--text)" }}
          >
            재구매 알림
          </p>
          <div className="space-y-2">
            {REORDERS.map(r => (
              <div
                key={r.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: r.daysLeft <= 5 ? "var(--red)" : "var(--orange)" }}
                  />
                  <span
                    className="font-sans text-[13px]"
                    style={{ color: "var(--text2)" }}
                  >
                    {r.name}
                  </span>
                </div>
                <span
                  className="font-sans text-[12px] font-semibold"
                  style={{ color: r.daysLeft <= 5 ? "var(--red)" : "var(--orange)" }}
                >
                  {r.daysLeft}일 남음
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
