"use client";

import { Coffee, Heart, Sparkles, ExternalLink } from "lucide-react";

interface BuyMeCoffeeProps {
  variant?: "card" | "banner" | "compact" | "badge";
  className?: string;
}

export const BMC_LINK = "https://buymeacoffee.com/lakshanvidanapathirana";

export default function BuyMeCoffee({ variant = "card", className = "" }: BuyMeCoffeeProps) {
  if (variant === "compact") {
    return (
      <a
        href={BMC_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${className}`}
        style={{
          background: "linear-gradient(135deg, #FFDD00 0%, #FBBF24 100%)",
          color: "#000000",
          boxShadow: "0 4px 14px rgba(251, 191, 36, 0.35)",
        }}
      >
        <span className="text-sm">☕</span>
        <span>Buy me a coffee</span>
      </a>
    );
  }

  if (variant === "badge") {
    return (
      <a
        href={BMC_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors hover:text-amber-500 hover:border-amber-400 ${className}`}
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        <span>☕</span>
        <span>Support Free Service</span>
      </a>
    );
  }

  // "card" variant: Perfect for after shortening a link
  return (
    <div
      className={`rounded-2xl p-4 transition-all duration-300 border relative overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(255, 221, 0, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)",
        borderColor: "rgba(245, 158, 11, 0.25)",
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg shadow-sm"
            style={{
              background: "linear-gradient(135deg, #FFDD00 0%, #F59E0B 100%)",
              color: "#000000",
            }}
          >
            ☕
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">100% Free Forever</span>
              <Heart size={12} className="text-amber-500 fill-amber-500" />
            </div>
            <p className="text-xs sm:text-sm font-medium mt-0.5" style={{ color: "var(--text)" }}>
              Enjoying LinkFlare? Support the creator to keep it free & ad-free!
            </p>
          </div>
        </div>

        <a
          href={BMC_LINK}
          target="_blank"
          rel="noopener noreferrer"
          id="bmc-result-btn"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 shrink-0 w-full sm:w-auto"
          style={{
            background: "linear-gradient(135deg, #FFDD00 0%, #FBBF24 100%)",
            boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)",
          }}
        >
          <span>☕</span>
          <span>Buy Me a Coffee</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
