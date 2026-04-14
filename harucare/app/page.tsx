"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Entry() {
  const router = useRouter();

  useEffect(() => {
    const done = localStorage.getItem("hc_onboarding");
    router.replace(done === "done" ? "/home" : "/onboarding");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-hc-bg">
      <div className="text-center animate-fade-in">
        <p
          className="font-serif font-black text-hc-primary"
          style={{ fontSize: "36px", letterSpacing: "-1px" }}
        >
          하루케어
        </p>
        <div
          className="mt-4 mx-auto w-6 h-6 border-2 rounded-full animate-spin-slow"
          style={{ borderColor: "var(--faint)", borderTopColor: "var(--primary)" }}
        />
      </div>
    </div>
  );
}
