"use client";

import { useState, useEffect } from "react";
import {
  X,
  Link2,
  Calendar,
  Hash,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Check,
  AlertCircle,
  Clock,
  Shield,
  Trash2,
  KeyRound,
} from "lucide-react";

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
  link: LinkData;
  onClose: () => void;
  onUpdated: (link: LinkData) => void;
}

type ExpireMode = "none" | "date" | "clicks";
type PasswordAction = "keep" | "change" | "remove";

export default function EditLinkModal({ link, onClose, onUpdated }: Props) {
  const [longUrl, setLongUrl] = useState(link.longUrl);

  // Expiry state initialization
  const initialExpireMode: ExpireMode = link.clickLimit
    ? "clicks"
    : link.expiresAt
    ? "date"
    : "none";
  const [expireMode, setExpireMode] = useState<ExpireMode>(initialExpireMode);
  const [expiresAt, setExpiresAt] = useState(
    link.expiresAt ? link.expiresAt.slice(0, 16) : ""
  );
  const [clickLimit, setClickLimit] = useState(
    link.clickLimit ? String(link.clickLimit) : ""
  );

  // Password state initialization
  const hasExistingPassword = Boolean(link.password);
  const [passwordAction, setPasswordAction] = useState<PasswordAction>("keep");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [displayBaseUrl, setDisplayBaseUrl] = useState("https://shturl.netlify.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDisplayBaseUrl(window.location.origin);
    }
  }, []);

  const shortUrl = `${displayBaseUrl}/${link.slug}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!longUrl.trim()) {
      return setError("Please enter a valid destination URL");
    }

    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        longUrl: longUrl.trim(),
      };

      // Expiry payload
      if (expireMode === "none") {
        body.expiresAt = null;
        body.clickLimit = null;
      } else if (expireMode === "date") {
        body.expiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;
        body.clickLimit = null;
      } else if (expireMode === "clicks") {
        body.expiresAt = null;
        body.clickLimit = clickLimit ? parseInt(clickLimit, 10) : null;
      }

      // Password payload
      if (hasExistingPassword) {
        if (passwordAction === "remove") {
          body.removePassword = true;
        } else if (passwordAction === "change") {
          if (!newPassword.trim()) {
            setLoading(false);
            return setError("Please enter a new password or choose 'Keep current'");
          }
          body.password = newPassword.trim();
        }
      } else {
        if (newPassword.trim()) {
          body.password = newPassword.trim();
        }
      }

      const res = await fetch(`/api/links/${link.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        return setError(data.error || "Failed to update link");
      }

      setSuccess(true);
      setTimeout(() => {
        onUpdated(data.link);
      }, 700);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content p-6" style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-display" style={{ color: "var(--text)" }}>
              Edit Short Link
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Update destination, expiration, or password protection
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost w-9 h-9 p-0 rounded-lg"
            id="close-edit-modal-btn"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm animate-scale-in"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "var(--error)",
              }}
            >
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {success && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm animate-scale-in"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#10b981",
              }}
            >
              <Check size={15} /> Link updated successfully!
            </div>
          )}

          {/* Destination URL */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
              Destination URL *
            </label>
            <div className="relative gradient-border">
              <Link2
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="url"
                id="edit-long-url-input"
                placeholder="https://your-very-long-url.com/goes/here"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          {/* Short Link Alias (Display) */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
              Short Link Alias
            </label>
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-mono"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--accent)",
              }}
            >
              <Link2 size={15} style={{ color: "var(--text-muted)" }} />
              <span className="font-semibold">{shortUrl}</span>
            </div>
          </div>

          {/* Link Expiration */}
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
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    expireMode === mode ? "bg-[var(--accent)] text-white" : "btn-secondary"
                  }`}
                >
                  {mode === "none" ? (
                    "Never"
                  ) : mode === "date" ? (
                    <span className="flex items-center gap-1 justify-center">
                      <Calendar size={13} /> By Date
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 justify-center">
                      <Hash size={13} /> By Clicks
                    </span>
                  )}
                </button>
              ))}
            </div>

            {expireMode === "date" && (
              <div className="relative animate-slide-down">
                <Clock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="datetime-local"
                  id="edit-expires-at-input"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            )}

            {expireMode === "clicks" && (
              <div className="relative animate-slide-down">
                <Hash
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="number"
                  id="edit-click-limit-input"
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

            {hasExistingPassword ? (
              <div className="space-y-3">
                <div
                  className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    color: "#f59e0b",
                  }}
                >
                  <Shield size={14} />
                  <span>This short link is currently password protected</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPasswordAction("keep")}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                      passwordAction === "keep"
                        ? "bg-[var(--accent)] text-white"
                        : "btn-secondary"
                    }`}
                  >
                    Keep Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasswordAction("change")}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                      passwordAction === "change"
                        ? "bg-[var(--accent)] text-white"
                        : "btn-secondary"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <KeyRound size={12} /> Change
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasswordAction("remove")}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                      passwordAction === "remove"
                        ? "bg-red-500 text-white"
                        : "btn-secondary text-red-500 hover:bg-red-500/10"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <Trash2 size={12} /> Remove
                    </span>
                  </button>
                </div>

                {passwordAction === "change" && (
                  <div className="relative animate-slide-down">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="edit-new-password-input"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      required={passwordAction === "change"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost w-7 h-7 p-0"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="edit-password-input"
                  placeholder="Leave empty for no password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
            )}
          </div>

          {/* Preview */}
          <div
            className="p-3 rounded-xl text-sm"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <span style={{ color: "var(--text-muted)" }}>Preview: </span>
            <span className="font-mono font-medium" style={{ color: "var(--accent)" }}>
              {shortUrl}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3"
              id="cancel-edit-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-3"
              id="save-edit-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Check size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
