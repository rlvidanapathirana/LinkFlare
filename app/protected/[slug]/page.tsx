"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, Loader2, Zap } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProtectedPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/links/${slug}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Incorrect password");
      } else {
        // Redirect to the original short link (middleware will now allow through)
        router.push(`/${slug}`);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-black font-display gradient-text">LinkFlare</span>
        </Link>

        <div className="glass-card p-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
            <Lock size={26} />
          </div>
          <h1 className="text-xl font-bold font-display mb-2" style={{ color: "var(--text)" }}>
            Password Required
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            This link is protected. Enter the password to continue.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--error)" }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                id="protected-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost w-7 h-7 p-0"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3" id="protected-submit-btn">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : "Unlock Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
