"use client";

import { useState } from "react";
import { HealthSnapshot } from "@/lib/types";
import { getBPStatus, getSugarStatus, getWeightStatus } from "@/lib/health";
import { saveCurrentHealth } from "@/lib/storage";

interface Props {
  health: HealthSnapshot;
  onUpdate: (h: HealthSnapshot) => void;
  goalWeight?: number;
}

type MetricKey = "weight" | "bp_sys" | "blood_sugar";

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  icon: string;
  format: (h: HealthSnapshot) => string;
  status: (h: HealthSnapshot, gw?: number) => { label: string; color: string; alert: boolean };
}

const METRICS: MetricConfig[] = [
  {
    key:    "weight",
    label:  "체중",
    unit:   "kg",
    min:    30, max: 150, step: 0.5,
    icon:   "⚖️",
    format: h => `${h.weight}`,
    status: (h, gw) => getWeightStatus(h.weight, gw),
  },
  {
    key:    "bp_sys",
    label:  "혈압",
    unit:   "mmHg",
    min:    80, max: 200, step: 1,
    icon:   "❤️",
    format: h => `${h.bp_sys}/${h.bp_dia}`,
    status: h => getBPStatus(h.bp_sys),
  },
  {
    key:    "blood_sugar",
    label:  "혈당",
    unit:   "mg/dL",
    min:    60, max: 400, step: 1,
    icon:   "🩸",
    format: h => `${h.blood_sugar}`,
    status: h => getSugarStatus(h.blood_sugar),
  },
];

export default function HealthMetricsSection({ health, onUpdate, goalWeight }: Props) {
  const [editing, setEditing] = useState<MetricConfig | null>(null);
  const [draft, setDraft]     = useState<HealthSnapshot>(health);

  function openEditor(m: MetricConfig) {
    setDraft({ ...health });
    setEditing(m);
  }

  function handleSave() {
    const updated = { ...draft, date: new Date().toISOString().slice(0, 10) };
    saveCurrentHealth(updated);
    onUpdate(updated);
    setEditing(null);
  }

  return (
    <>
      {/* ── 3-col metric cards ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {METRICS.map(m => {
          const st = m.status(health, goalWeight);
          return (
            <button
              key={m.key}
              onClick={() => openEditor(m)}
              className="card text-left p-3 transition-transform active:scale-95"
            >
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 500 }}>
                  {m.label}
                </p>
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: "20px", height: "20px",
                    background: "var(--badge-green)",
                    fontSize: "11px",
                  }}
                >
                  +
                </span>
              </div>
              <p
                className="font-bold tabular-nums leading-none mb-2"
                style={{
                  fontSize: m.key === "bp_sys" ? "14px" : "18px",
                  color: "var(--text)",
                  letterSpacing: "-0.3px",
                }}
              >
                {m.format(health)}
                <span style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 400, marginLeft: "1px" }}>
                  {m.unit}
                </span>
              </p>
              <span
                className="inline-block font-semibold rounded-full"
                style={{
                  fontSize: "10px",
                  color: st.color,
                  background: `${st.color}18`,
                  padding: "2px 6px",
                }}
              >
                {st.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Bottom Sheet ── */}
      {editing && (
        <>
          <div className="sheet-backdrop" onClick={() => setEditing(null)} />
          <div className="sheet-panel">
            {/* Handle */}
            <div className="flex justify-center mb-5">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--faint)" }} />
            </div>

            <p style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 500, marginBottom: "4px" }}>
              {editing.label} 입력
            </p>

            {/* Current value display */}
            <div className="flex items-end gap-1.5 mb-5">
              <span
                className="font-bold tabular-nums"
                style={{
                  fontSize: "52px",
                  color: "var(--primary-dark)",
                  lineHeight: 1,
                  letterSpacing: "-2px",
                }}
              >
                {editing.key === "bp_sys"
                  ? `${draft.bp_sys}/${draft.bp_dia}`
                  : draft[editing.key]}
              </span>
              <span className="font-medium pb-2" style={{ fontSize: "16px", color: "var(--muted)" }}>
                {editing.unit}
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={editing.min}
              max={editing.max}
              step={editing.step}
              value={draft[editing.key]}
              onChange={e => {
                const v = parseFloat(e.target.value);
                if (editing.key === "bp_sys") {
                  setDraft(d => ({ ...d, bp_sys: v, bp_dia: Math.round(v * 0.64) }));
                } else {
                  setDraft(d => ({ ...d, [editing.key]: v }));
                }
              }}
              className="mb-6"
            />

            <button className="btn-primary" onClick={handleSave}>
              저장하기
            </button>
          </div>
        </>
      )}
    </>
  );
}
