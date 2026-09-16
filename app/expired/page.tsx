import Link from "next/link";
import { Clock, Zap, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link Expired — LinkFlare",
  description: "This short link has expired or reached its click limit.",
};

export default function ExpiredPage() {
  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-black font-display gradient-text">LinkFlare</span>
        </Link>

        <div className="glass-card p-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            <Clock size={30} />
          </div>
          <h1 className="text-2xl font-black font-display mb-3" style={{ color: "var(--text)" }}>
            Link Expired
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            This link has expired or reached its maximum click limit. It is no longer active.
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2" id="expired-home-btn">
            Create Your Own Free Links <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
