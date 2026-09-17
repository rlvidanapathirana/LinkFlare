"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        localStorage.setItem("lf_user", JSON.stringify(data.user));
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="text-2xl font-black font-display gradient-text">LinkFlare</span>
          </Link>
          <h1 className="text-3xl font-black font-display" style={{ color: "var(--text)" }}>Welcome back</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Sign in to manage your short links
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm animate-scale-in"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--error)" }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="email"
                  id="login-email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: "var(--text)" }}>
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium hover:underline transition-colors"
                  style={{ color: "var(--accent)" }}
                  id="forgot-password-link"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost w-7 h-7 p-0"
                  id="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Signing In…</>
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: "var(--accent)" }} id="goto-signup-link">
              Sign up free <ArrowRight size={13} className="inline" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
