"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/home",
    label: "홈",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z"
          stroke={active ? "var(--primary)" : "var(--muted)"}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill={active ? "rgba(46,204,113,0.12)" : "none"}
        />
      </svg>
    ),
  },
  {
    href: "/mypage",
    label: "마이",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle
          cx="11" cy="8" r="3.5"
          stroke={active ? "var(--primary)" : "var(--muted)"}
          strokeWidth="1.8"
          fill={active ? "rgba(46,204,113,0.12)" : "none"}
        />
        <path
          d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7"
          stroke={active ? "var(--primary)" : "var(--muted)"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="bottom-nav">
      {TABS.map(tab => {
        const active = path.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-opacity"
            style={{ opacity: active ? 1 : 0.55 }}
          >
            {tab.icon(active)}
            <span
              className="font-semibold"
              style={{
                fontSize: "11px",
                color: active ? "var(--primary-dark)" : "var(--muted)",
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
