"use client";

import { HealthAlert } from "@/lib/types";
import { getActionGuide } from "@/lib/health";

interface Props {
  alert: HealthAlert;
}

export default function ActionGuideSection({ alert }: Props) {
  const actions = getActionGuide(alert);

  return (
    <div className="space-y-3">
      {actions.map((action, i) => (
        <div key={i} className="flex items-center gap-3">
          {/* Number badge */}
          <div
            className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
            style={{
              width: "32px", height: "32px",
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color: "#fff",
              fontSize: "14px",
            }}
          >
            {i + 1}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="font-semibold" style={{ fontSize: "14px", color: "var(--text)" }}>
              {action.emoji} {action.text}
            </p>
            {action.subText && (
              <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                {action.subText}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
