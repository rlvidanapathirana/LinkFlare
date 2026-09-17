"use client";

import { useState, useEffect, useRef } from "react";
import { X, Link2, Wand2, Calendar, Hash, Lock, Eye, EyeOff, Copy, Check, AlertCircle, CheckCircle2, Loader2, Clock } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface LinkData {
  slug: string;
  longUrl: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
  clickLimit: number | null;
  password: string | null;
}

interface Props {
  onClose: () => void;
  onCreated: (link: LinkData) => void;
  baseUrl: string;
}

type ExpireMode = "none" | "date" | "clicks";

export default function CreateLinkModal({ onClose, onCreated, baseUrl }: Props) {
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState(() => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  });
  const [prefix, setPrefix] = useState("");
  const [expireMode, setExpireMode] = useState<ExpireMode>("none");
  const [expiresAt, setExpiresAt] = useState("");
  const [clickLimit, setClickLimit] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [copied, setCopied] = useState(false);
  const [created, setCreated] = useState<{ slug: string; shortUrl: string } | null>(null);
  const slugTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Live slug availability check
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

  const shortUrlPreview = created
    ? created.shortUrl
    : customSlug
    ? `${baseUrl}/${prefix}${customSlug}`
    : `${baseUrl}/${prefix}xxxxxx`;

  const generateRandomSlug = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setCustomSlug(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!longUrl) return setError("Please enter a URL");
    if (slugStatus === "taken") return setError("This alias is already taken");

    setLoading(true);
    try {
      const body: Record<string, unknown> = { longUrl, prefix };
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
      if (!res.ok) return setError(data.error || "Failed to create link");

      setCreated({ slug: data.slug, shortUrl: data.shortUrl });
      onCreated(data.link);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!created) return;
    navigator.clipboard.writeText(created.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Slug status icon
  const SlugIcon = () => {
    if (slugStatus === "checking") return <Loader2 size={14} className="animate-spin text-[var(--text-muted)]" />;
    if (slugStatus === "available") return <CheckCircle2 size={14} className="text-[var(--success)]" />;
    if (slugStatus === "taken") return <AlertCircle size={14} className="text-[var(--error)]" />;
    return null;
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content p-6" style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-display" style={{ color: "var(--text)" }}>
              Create Short Link
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Shorten, customize, and track your link
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost w-9 h-9 p-0 rounded-lg" id="close-modal-btn">
            <X size={18} />
          </button>
        </div>

        {created ? (
          /* Success State */
          <div className="space-y-5 animate-scale-in">
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h3 className="font-bold text-lg" style={{ color: "var(--text)" }}>Link Created!</h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Your short link is ready to share</p>
            </div>

            {/* Short URL display */}
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <Link2 size={16} style={{ color: "var(--accent)" }} className="flex-shrink-0" />
              <span className="flex-1 font-mono text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                {created.shortUrl}
              </span>
              <button onClick={handleCopy} className="btn-ghost p-1.5 rounded-lg flex-shrink-0" id="copy-short-url-btn">
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <QRCodeCanvas
                id="qr-canvas"
                value={created.shortUrl}
                size={160}
                bgColor="transparent"
                fgColor="currentColor"
                style={{ borderRadius: 8, padding: 8, background: "white" }}
              />
              <button
                className="btn-secondary text-sm"
                id="download-qr-btn"
                onClick={() => {
                  const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
                  if (canvas) {
                    const url = canvas.toDataURL("image/png");
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `linkflare-${created.slug}.png`;
                    a.click();
                  }
                }}
              >
                Download QR Code
              </button>
            </div>

            <button onClick={onClose} className="btn-primary w-full" id="done-btn">Done</button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm animate-scale-in" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--error)" }}>
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            {/* Destination URL */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                Destination URL *
              </label>
              <div className="relative gradient-border">
                <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="url"
                  id="long-url-input"
                  placeholder="https://your-very-long-url.com/goes/here"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Custom Alias */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: "var(--text)" }}>
                  Short Link Alias
                </label>
                <button 
                  type="button" 
                  onClick={generateRandomSlug}
                  className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity" 
                  style={{ color: "var(--accent)" }}
                >
                  <Wand2 size={12} /> Auto-generate Random
                </button>
              </div>
              <div className="flex items-center gap-0 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
                <select
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="px-3 py-3 text-sm outline-none cursor-pointer"
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
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="custom-slug-input"
                    placeholder="my-awesome-link"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    className="w-full px-3 py-3 text-sm bg-transparent outline-none"
                    style={{ color: "var(--text)" }}
                    maxLength={32}
                  />
                </div>
                <div className="pr-3">
                  <SlugIcon />
                </div>
              </div>
              {slugStatus === "taken" && (
                <p className="text-xs mt-1" style={{ color: "var(--error)" }}>This alias is already taken</p>
              )}
              {slugStatus === "available" && (
                <p className="text-xs mt-1" style={{ color: "var(--success)" }}>This alias is available!</p>
              )}
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                Link Expiration <span style={{ color: "var(--text-muted)" }}>(optional)</span>
              </label>
              <div className="flex gap-2 mb-2">
                {(["none", "date", "clicks"] as ExpireMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setExpireMode(mode)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${expireMode === mode ? "bg-[var(--accent)] text-white" : "btn-secondary"}`}
                  >
                    {mode === "none" ? "Never" : mode === "date" ? <span className="flex items-center gap-1 justify-center"><Calendar size={13} /> By Date</span> : <span className="flex items-center gap-1 justify-center"><Hash size={13} /> By Clicks</span>}
                  </button>
                ))}
              </div>
              {expireMode === "date" && (
                <div className="relative animate-slide-down">
                  <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="datetime-local"
                    id="expires-at-input"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="input-field pl-10"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
              {expireMode === "clicks" && (
                <div className="relative animate-slide-down">
                  <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="number"
                    id="click-limit-input"
                    placeholder="e.g. 100"
                    value={clickLimit}
                    onChange={(e) => setClickLimit(e.target.value)}
                    className="input-field pl-10"
                    min="1"
                  />
                </div>
              )}
            </div>

            {/* Password Protection */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                Password Protection <span style={{ color: "var(--text-muted)" }}>(optional)</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password-input"
                  placeholder="Leave empty for no password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost w-7 h-7 p-0"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-xl text-sm" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-muted)" }}>Preview: </span>
              <span className="font-mono font-medium" style={{ color: "var(--accent)" }}>{shortUrlPreview}</span>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3" id="create-link-btn">
              {loading ? (
                <><Loader2 size={17} className="animate-spin" /> Creating Link...</>
              ) : (
                <><Wand2 size={17} /> Create Short Link</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
