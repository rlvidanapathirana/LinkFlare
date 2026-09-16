"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Zap, BarChart2, QrCode, Lock, Clock, Infinity, ArrowRight,
  CheckCircle, Copy, Check, ExternalLink, Globe, Shield,
  Sparkles, TrendingUp, Users, Link2,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Zap size={22} className="text-yellow-400" />,
    title: "Lightning Fast Redirects",
    description: "Edge-powered redirects in under 5ms globally. Your visitors never wait.",
  },
  {
    icon: <BarChart2 size={22} className="text-blue-400" />,
    title: "Real-Time Analytics",
    description: "Track clicks, countries, devices, referrers, and browsers with beautiful charts.",
  },
  {
    icon: <QrCode size={22} className="text-green-400" />,
    title: "QR Code Generator",
    description: "Every link gets an auto-generated, downloadable QR code. Instantly.",
  },
  {
    icon: <Lock size={22} className="text-red-400" />,
    title: "Password Protection",
    description: "Secure your links with a password. Only authorized users can access.",
  },
  {
    icon: <Clock size={22} className="text-orange-400" />,
    title: "Link Expiration",
    description: "Set links to expire by date/time or after a number of clicks.",
  },
  {
    icon: <Sparkles size={22} className="text-purple-400" />,
    title: "Custom Aliases",
    description: "Create memorable back-halves like /your-brand or /promo2024.",
  },
  {
    icon: <Globe size={22} className="text-cyan-400" />,
    title: "Geo Tracking",
    description: "See exactly which countries and cities your clicks come from.",
  },
  {
    icon: <Shield size={22} className="text-pink-400" />,
    title: "Secure & Private",
    description: "Your data is encrypted and never sold. Privacy first.",
  },
];

const STATS = [
  { label: "Links Shortened", value: "10M+", icon: <Link2 size={20} /> },
  { label: "Monthly Clicks", value: "500M+", icon: <TrendingUp size={20} /> },
  { label: "Active Users", value: "250K+", icon: <Users size={20} /> },
  { label: "Countries Served", value: "195", icon: <Globe size={20} /> },
];

export default function HomeClient() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    setResult(null);

    // For non-logged-in users, redirect to signup
    const stored = localStorage.getItem("lf_user");
    if (!stored) {
      localStorage.setItem("lf_pending_url", url);
      window.location.href = "/signup";
      return;
    }

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to shorten URL");
      } else {
        setResult({ shortUrl: data.shortUrl, slug: data.slug });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen hero-bg">
      <Navbar />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        {/* Floating orbs */}
        <div
          className="absolute top-20 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent)" }}
        />
        <div
          className="absolute top-40 right-1/4 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.12), transparent)" }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in"
            style={{ background: "var(--accent-subtle)", border: "1px solid var(--border)", color: "var(--accent)" }}>
            <Sparkles size={14} />
            100% Free, Forever. No Credit Card Required.
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-display leading-[1.05] mb-6 animate-slide-up">
            Shorten.{" "}
            <span className="gradient-text">Track.</span>
            <br />
            <span className="gradient-text-warm">Dominate.</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
            style={{ color: "var(--text-secondary)", animationDelay: "0.1s" }}>
            The world&apos;s most advanced URL shortener — with custom aliases, real-time analytics,
            QR codes, password protection, and link expiry. <strong style={{ color: "var(--text)" }}>All completely free.</strong>
          </p>

          {/* URL Input */}
          <form onSubmit={handleShorten} className="max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl glass-card">
              <div className="relative flex-1">
                <Link2 size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  ref={inputRef}
                  type="url"
                  id="hero-url-input"
                  placeholder="Paste your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-transparent outline-none text-base"
                  style={{ color: "var(--text)" }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                id="hero-shorten-btn"
                className="btn-primary px-6 py-3.5 text-base rounded-xl flex-shrink-0"
              >
                {loading ? "Shortening…" : <>Shorten It <ArrowRight size={18} /></>}
              </button>
            </div>

            {error && (
              <p className="text-sm mt-2 text-center animate-fade-in" style={{ color: "var(--error)" }}>
                {error}
              </p>
            )}

            {/* Result */}
            {result && (
              <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-xl animate-scale-in"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <a
                    href={result.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm font-bold truncate hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    {result.shortUrl}
                  </a>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={handleCopy} className="btn-ghost text-sm py-1.5 px-2" id="hero-copy-btn">
                    {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                  </button>
                  <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm py-1.5 px-2">
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            )}
          </form>

          {/* Social proof */}
          <p className="text-xs mt-6 animate-fade-in" style={{ color: "var(--text-muted)", animationDelay: "0.3s" }}>
            Trusted by 250,000+ creators, marketers, and developers worldwide
          </p>
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <div key={i} className="card text-center group hover:border-[var(--accent)] transition-all">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-black font-display gradient-text mb-1">{stat.value}</div>
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black font-display mb-4">
              Everything You Need.{" "}
              <span className="gradient-text">Nothing You Don&apos;t.</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Premium features that competitors charge $99/month for — available to you at no cost.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="card group hover:-translate-y-1 transition-all duration-200" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  {f.icon}
                </div>
                <h3 className="font-bold mb-2" style={{ color: "var(--text)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "var(--surface)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black font-display mb-14">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Paste Your URL", desc: "Drop any long URL into our shortener. We'll validate and process it instantly." },
              { step: "02", title: "Customize & Configure", desc: "Add a custom alias, set expiry, add a password, or generate a QR code." },
              { step: "03", title: "Share & Track", desc: "Share your short link and watch real-time analytics roll in on your dashboard." },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-black font-display gradient-text opacity-20 mb-3">{item.step}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing (All Free) ───────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black font-display mb-4">
            Simple Pricing
          </h2>
          <p className="text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
            One plan. All features. Forever free.
          </p>

          <div className="card glow-border relative overflow-hidden">
            <div className="absolute top-4 right-4 badge badge-success text-xs">
              <Sparkles size={10} /> FREE FOREVER
            </div>
            <div className="mb-6">
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-6xl font-black font-display gradient-text">$0</span>
                <span className="text-lg mb-2" style={{ color: "var(--text-muted)" }}>/month</span>
              </div>
              <p style={{ color: "var(--text-secondary)" }}>No credit card required. No hidden fees.</p>
            </div>

            <ul className="space-y-3 mb-8 text-left">
              {[
                "Unlimited short links",
                "Custom aliases",
                "Real-time analytics",
                "QR code generation",
                "Link expiration (date & clicks)",
                "Password protection",
                "Geo & device tracking",
                "Referrer tracking",
                "Dashboard & link management",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/signup" id="cta-signup-btn" className="btn-primary w-full py-3.5 text-base justify-center flex items-center gap-2">
              Start Shortening for Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "var(--surface)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 animate-float shadow-glow">
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-display mb-4">
            Ready to <span className="gradient-text">Ignite</span> your links?
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
            Join 250,000+ users who've already switched to the smartest, fastest, free URL shortener.
          </p>
          <Link href="/signup" id="final-cta-btn" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
            Create Free Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Zap size={13} className="text-white" fill="white" />
              </div>
              <span className="font-bold font-display gradient-text">LinkFlare</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/login" style={{ color: "var(--text-muted)" }} className="hover:text-[var(--accent)] transition-colors">Login</Link>
              <Link href="/signup" style={{ color: "var(--text-muted)" }} className="hover:text-[var(--accent)] transition-colors">Sign Up</Link>
              <Link href="/dashboard" style={{ color: "var(--text-muted)" }} className="hover:text-[var(--accent)] transition-colors">Dashboard</Link>
            </div>
          </div>
          <p>Developed by <a href="https://lakshan.vercel.app/" target="_blank" rel="noopener noreferrer">V.P.R. Lakshan Vidanapathirana</a></p>
        </div>
      </footer>
    </div>
  );
}
