"use client";

import { useState } from "react";
import { X, Link2, Calendar, Hash, Loader2, Check, AlertCircle } from "lucide-react";

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

export default function EditLinkModal({ link, onClose, onUpdated }: Props) {
  const [longUrl, setLongUrl] = useState(link.longUrl);
  const [expiresAt, setExpiresAt] = useState(
    link.expiresAt ? link.expiresAt.slice(0, 16) : ""
  );
  const [clickLimit, setClickLimit] = useState(
    link.clickLimit ? String(link.clickLimit) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: Record<string, unknown> = { longUrl };
      body.expiresAt = expiresAt || null;
      body.clickLimit = clickLimit ? parseInt(clickLimit, 10) : null;

      const res = await fetch(`/api/links/${link.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed to update");

      setSuccess(true);
      setTimeout(() => {
        onUpdated(data.link);
      }, 800);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content p-6" style={{ maxWidth: 480 }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg font-display" style={{ color: "var(--text)" }}>Edit Link</h3>
          <button onClick={onClose} className="btn-ghost w-8 h-8 p-0" id="close-edit-btn"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "var(--error)" }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
              <Check size={14} /> Updated successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
              Destination URL
            </label>
            <div className="relative">
              <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="url"
                id="edit-long-url"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
              Expiry Date/Time <span style={{ color: "var(--text-muted)" }}>(leave empty for never)</span>
            </label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="datetime-local"
                id="edit-expires-at"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
              Click Limit <span style={{ color: "var(--text-muted)" }}>(leave empty for unlimited)</span>
            </label>
            <div className="relative">
              <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="number"
                id="edit-click-limit"
                value={clickLimit}
                onChange={(e) => setClickLimit(e.target.value)}
                className="input-field pl-10"
                min="1"
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" id="cancel-edit-btn">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1" id="save-edit-btn">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Check size={15} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
