"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Trash2, Edit2, BarChart2, Lock, Clock, Hash, QrCode, Shield } from "lucide-react";
import Link from "next/link";
import QRModal from "./QRModal";
import EditLinkModal from "./EditLinkModal";

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
  baseUrl: string;
  onDeleted: (slug: string) => void;
  onUpdated: (link: LinkData) => void;
}

export default function LinkCard({ link, baseUrl, onDeleted, onUpdated }: Props) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const shortUrl = `${baseUrl}/${link.slug}`;
  const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;
  const isLimitReached = link.clickLimit !== null && link.clicks >= link.clickLimit;
  const isActive = !isExpired && !isLimitReached;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this link? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/links/${link.slug}`, { method: "DELETE" });
      if (res.ok) onDeleted(link.slug);
    } catch {
      alert("Failed to delete link");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const truncateUrl = (url: string, max = 50) =>
    url.length > max ? url.slice(0, max) + "…" : url;

  return (
    <>
      <div className={`card group transition-all duration-200 hover:-translate-y-0.5 ${!isActive ? "opacity-60" : ""}`}>
        {/* Top Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {/* Short URL */}
            <div className="flex items-center gap-2 mb-1">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-bold text-sm hover:underline"
                style={{ color: "var(--accent)" }}
              >
                {shortUrl.replace(/^https?:\/\//, "")}
              </a>
              <button onClick={handleCopy} className="btn-ghost w-6 h-6 p-0 opacity-60 hover:opacity-100 transition-opacity" id={`copy-${link.slug}`}>
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost w-6 h-6 p-0 opacity-60 hover:opacity-100 transition-opacity">
                <ExternalLink size={13} />
              </a>
            </div>
            {/* Destination */}
            <p className="text-sm truncate" style={{ color: "var(--text-muted)" }} title={link.longUrl}>
              {truncateUrl(link.longUrl)}
            </p>
          </div>

          {/* Click count badge */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <div className="badge badge-info">
              <BarChart2 size={11} />
              {link.clicks.toLocaleString()} clicks
            </div>
            <div className={`badge ${isActive ? "badge-success" : "badge-error"}`}>
              {isActive ? "Active" : isExpired ? "Expired" : "Limit Reached"}
            </div>
          </div>
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>Created {formatDate(link.createdAt)}</span>
          {link.expiresAt && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              Expires {formatDate(link.expiresAt)}
            </span>
          )}
          {link.clickLimit !== null && (
            <span className="flex items-center gap-1">
              <Hash size={11} />
              {link.clicks}/{link.clickLimit} clicks
            </span>
          )}
          {link.password && (
            <span className="flex items-center gap-1 text-amber-500">
              <Shield size={11} />
              Password protected
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <Link
            href={`/dashboard/analytics/${link.slug}`}
            className="btn-ghost text-xs gap-1.5"
            id={`analytics-${link.slug}`}
          >
            <BarChart2 size={14} /> Analytics
          </Link>
          <button onClick={() => setShowQR(true)} className="btn-ghost text-xs gap-1.5" id={`qr-${link.slug}`}>
            <QrCode size={14} /> QR Code
          </button>
          <button onClick={() => setShowEdit(true)} className="btn-ghost text-xs gap-1.5" id={`edit-${link.slug}`}>
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-ghost text-xs gap-1.5 ml-auto"
            style={{ color: "var(--error)" }}
            id={`delete-${link.slug}`}
          >
            <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {showQR && <QRModal shortUrl={shortUrl} slug={link.slug} onClose={() => setShowQR(false)} />}
      {showEdit && <EditLinkModal link={link} onClose={() => setShowEdit(false)} onUpdated={(updated) => { onUpdated(updated); setShowEdit(false); }} />}
    </>
  );
}
