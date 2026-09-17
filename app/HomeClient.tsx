"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Zap, BarChart2, QrCode, Lock, Clock, Infinity, ArrowRight,
  CheckCircle, Copy, Check, ExternalLink, Globe, Shield,
  Sparkles, TrendingUp, Users, Link2, Wand2, Calendar, Hash, Eye, EyeOff, Download
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import BuyMeCoffee from "@/components/BuyMeCoffee";

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [customSlug, setCustomSlug] = useState(() => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  });
  const [prefix, setPrefix] = useState("");
  const [expireMode, setExpireMode] = useState<"none" | "date" | "clicks">("none");
  const [expiresAt, setExpiresAt] = useState("");
  const [clickLimit, setClickLimit] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const slugTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [baseUrl, setBaseUrl] = useState("shturl.netlify.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!customSlug || customSlug.length < 3) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/links/check-slug?slug=${encodeURIComponent(prefix + customSlug)}`);
        const data = await res.json();
        setSlugStatus(data.available ? "available" : "taken");
      } catch {
        setSlugStatus("idle");
      }
    }, 500);
  }, [customSlug, prefix]);

  const generateRandomSlug = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setCustomSlug(result);
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    setResult(null);
    if (slugStatus === "taken") {
      setError("This alias is already taken");
      setLoading(false);
      return;
    }

    try {
      const body: Record<string, unknown> = { longUrl: url, prefix };
      if (customSlug) body.customSlug = customSlug;
      if (expireMode === "date" && expiresAt) body.expiresAt = expiresAt;
      if (expireMode === "clicks" && clickLimit) body.clickLimit = parseInt(clickLimit, 10);
      if (password) body.password = password;

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to shorten URL");
      } else {
        // Ensure live origin is always used instead of localhost
        const liveOrigin = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || "https://shturl.netlify.app");
        const resolvedShortUrl = data.shortUrl && !data.shortUrl.includes("localhost") ? data.shortUrl : `${liveOrigin}/${data.slug}`;
        setResult({ shortUrl: resolvedShortUrl, slug: data.slug });
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

  const handleDownloadQR = () => {
    if (!result) return;
    const canvas = document.getElementById(`qr-canvas-${result.slug}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkflare-qr-${result.slug}.png`;
    a.click();
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
            
            {/* Advanced Toggle */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-medium hover:underline flex items-center gap-2"
                style={{ color: "var(--accent)" }}
              >
                {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
              </button>
            </div>

            {/* Advanced Options Panel */}
            {showAdvanced && (
              <div className="mt-6 p-6 rounded-2xl text-left bg-white/5 backdrop-blur-md border animate-scale-in space-y-6" style={{ borderColor: "var(--glass-border)" }}>
                {/* 1. Short Link Alias (Full Width with plenty of room to type) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold" style={{ color: "var(--text)" }}>
                      Short Link Alias
                    </label>
                    <button 
                      type="button" 
                      onClick={generateRandomSlug} 
                      className="text-xs flex items-center gap-1 font-medium hover:opacity-80 transition-opacity" 
                      style={{ color: "var(--accent)" }}
                    >
                      <Wand2 size={13} /> Auto-generate Random
                    </button>
                  </div>
                  <div className="flex items-stretch rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
                    <select
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium outline-none cursor-pointer shrink-0 max-w-[45%] sm:max-w-none truncate"
                      style={{ color: "var(--text-muted)", background: "var(--surface-2)", borderRight: "1px solid var(--border)" }}
                    >
                      <option value="">{baseUrl.replace(/^https?:\/\//, "")}/</option>
                      <option value="s/">{baseUrl.replace(/^https?:\/\//, "")}/s/</option>
                      <option value="sh/">{baseUrl.replace(/^https?:\/\//, "")}/sh/</option>
                      <option value="link/">{baseUrl.replace(/^https?:\/\//, "")}/link/</option>
                      <option value="LinkFlare/">{baseUrl.replace(/^https?:\/\//, "")}/LinkFlare/</option>
                      <option value="go/">{baseUrl.replace(/^https?:\/\//, "")}/go/</option>
                      <option value="to/">{baseUrl.replace(/^https?:\/\//, "")}/to/</option>
                      <option value="visit/">{baseUrl.replace(/^https?:\/\//, "")}/visit/</option>
                      <option value="get/">{baseUrl.replace(/^https?:\/\//, "")}/get/</option>
                      <option value="click/">{baseUrl.replace(/^https?:\/\//, "")}/click/</option>
                    </select>
                    <input
                      type="text"
                      placeholder="my-custom-link"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      className="w-full flex-1 px-3.5 py-3 text-sm sm:text-base font-mono bg-transparent outline-none min-w-0"
                      style={{ color: "var(--text)" }}
                      maxLength={32}
                    />
                  </div>
                  {slugStatus === "taken" && <p className="text-xs mt-1.5 font-medium flex items-center gap-1" style={{ color: "var(--error)" }}>❌ This alias is already taken</p>}
                  {slugStatus === "available" && <p className="text-xs mt-1.5 font-medium flex items-center gap-1" style={{ color: "var(--success)" }}>✅ This alias is available!</p>}
                </div>

                {/* 2. Link Expiration & Password in 2 Columns underneath */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                  {/* Expiration */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>Link Expiration <span style={{ color: "var(--text-muted)" }}>(optional)</span></label>
                    <div className="flex gap-2 mb-2">
                      {(["none", "date", "clicks"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setExpireMode(mode)}
                          className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-colors border ${
                            expireMode === mode ? "bg-opacity-10" : "bg-transparent hover:bg-opacity-5"
                          }`}
                          style={{
                            borderColor: expireMode === mode ? "var(--accent)" : "var(--border)",
                            background: expireMode === mode ? "var(--accent-subtle)" : "transparent",
                            color: expireMode === mode ? "var(--accent)" : "var(--text-secondary)",
                          }}
                        >
                          {mode === "none" && "Never"}
                          {mode === "date" && "By Date"}
                          {mode === "clicks" && "By Clicks"}
                        </button>
                      ))}
                    </div>
                    {expireMode === "date" && (
                      <div className="relative mt-2">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                        <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="input-field pl-9 py-2 text-sm" required min={new Date().toISOString().slice(0, 16)} />
                      </div>
                    )}
                    {expireMode === "clicks" && (
                      <div className="relative mt-2">
                        <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                        <input type="number" placeholder="Number of clicks" value={clickLimit} onChange={(e) => setClickLimit(e.target.value)} className="input-field pl-9 py-2 text-sm" required min="1" max="1000000" />
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>Password Protection <span style={{ color: "var(--text-muted)" }}>(optional)</span></label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                      <input type={showPassword ? "text" : "password"} placeholder="Enter a password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-9 pr-9 py-2 text-sm" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-opacity-10 transition-colors" style={{ color: "var(--text-muted)" }}>
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl text-sm animate-fade-in" style={{ background: "rgba(239,68,68,0.1)", color: "var(--error)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            {result && (
              <div className="mt-6 p-5 rounded-2xl animate-scale-in text-left" style={{ background: "var(--surface)", border: "1px solid var(--success)", boxShadow: "0 8px 30px rgba(16,185,129,0.15)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: "var(--text)" }}>Link Shortened Successfully!</h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Your custom short link is ready.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 p-3 rounded-xl h-full" style={{ background: "var(--surface-2)" }}>
                      <Globe size={18} style={{ color: "var(--accent)" }} />
                      <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono flex-1 truncate font-bold text-lg hover:underline" style={{ color: "var(--accent)" }}>
                        {result.shortUrl.replace(/^https?:\/\//, "")}
                      </a>
                      <button type="button" onClick={handleCopy} className="btn-primary py-2 px-4 shadow-none shrink-0">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        <span className="hidden sm:inline ml-1">{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl shrink-0 border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                    <div className="bg-white p-1 rounded flex-shrink-0">
                      <QRCodeCanvas
                        id={`qr-canvas-${result.slug}`}
                        value={result.shortUrl}
                        size={40}
                        bgColor="#ffffff"
                        fgColor="#1e1b4b"
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <button type="button" onClick={handleDownloadQR} className="btn-secondary py-2 px-3 shadow-none text-sm h-full flex flex-col justify-center items-center">
                      <Download size={14} className="mb-0.5" />
                      <span className="text-xs font-semibold">Save QR</span>
                    </button>
                  </div>
                </div>
                
                <div className="text-sm flex items-center gap-2 px-2" style={{ color: "var(--text-secondary)" }}>
                  <BarChart2 size={15} />
                  Want real-time analytics for this link? <Link href="/signup" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>Create a free account</Link>
                </div>

                {/* Buy Me a Coffee Support Card */}
                <BuyMeCoffee variant="card" className="mt-4" />
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
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/login" style={{ color: "var(--text-muted)" }} className="hover:text-[var(--accent)] transition-colors">Login</Link>
              <Link href="/signup" style={{ color: "var(--text-muted)" }} className="hover:text-[var(--accent)] transition-colors">Sign Up</Link>
              <Link href="/dashboard" style={{ color: "var(--text-muted)" }} className="hover:text-[var(--accent)] transition-colors">Dashboard</Link>
              <BuyMeCoffee variant="compact" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <p>Developed by <a href="https://lakshan.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium" style={{ color: "var(--text)" }}>V.P.R. Lakshan Vidanapathirana</a></p>
            <p>100% Free & Open Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
