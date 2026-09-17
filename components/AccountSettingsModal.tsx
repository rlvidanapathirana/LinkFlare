"use client";

import { useState, useEffect } from "react";
import {
  X, ShieldCheck, Download, Copy, Check, Key, HelpCircle,
  AlertCircle, Loader2, RefreshCw, CheckCircle2
} from "lucide-react";
import { SECURITY_QUESTIONS } from "@/lib/redis";

interface Props {
  onClose: () => void;
  user: { userId: string; email: string; name: string };
}

export default function AccountSettingsModal({ onClose, user }: Props) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/recovery-kit")
      .then((res) => res.json())
      .then((data) => {
        if (data.securityQuestion) {
          setSecurityQuestion(data.securityQuestion);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatusMsg("");
    setGenerating(true);

    try {
      const res = await fetch("/api/auth/recovery-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          securityQuestion,
          securityAnswer: securityAnswer.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate new key");
      } else {
        setRecoveryCode(data.recoveryCode);
        setStatusMsg("New Recovery Key generated! Please download or save it.");
        setDownloaded(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!recoveryCode) return;
    navigator.clipboard.writeText(recoveryCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = () => {
    if (!recoveryCode) return;
    const content = `===================================================================
LINKFLARE - ACCOUNT RECOVERY KEY & DETAILS
===================================================================
Account Name     : ${user.name}
Account Email    : ${user.email}
Security Question: ${securityQuestion}
Recovery Key     : ${recoveryCode}
Updated Date     : ${new Date().toLocaleString()}

===================================================================
⚠️ IMPORTANT SECURITY WARNING:
Keep this Recovery Key in a safe and secure place.
If you ever forget your password, you will NEED this Recovery Key or
your Security Question answer to reset your password and access your
LinkFlare account.
===================================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `linkflare-recovery-key-${user.email.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content p-6" style={{ maxWidth: 540 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display" style={{ color: "var(--text)" }}>
                Account Security & Recovery
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Manage your password recovery options & keys
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost w-9 h-9 p-0 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading security details…</p>
          </div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-xs" style={{ background: "rgba(239,68,68,0.1)", color: "var(--error)" }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {statusMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-xs" style={{ background: "rgba(16,185,129,0.1)", color: "var(--success)" }}>
                <CheckCircle2 size={15} />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Generated Recovery Code view */}
            {recoveryCode && (
              <div className="p-4 rounded-xl border animate-scale-in" style={{ background: "var(--surface-2)", borderColor: "var(--accent)" }}>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Your New Master Recovery Key
                </label>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 font-mono font-bold text-sm tracking-wider mb-3">
                  <span className="select-all truncate text-amber-400">{recoveryCode}</span>
                  <button onClick={handleCopyCode} className="btn-ghost p-1.5 rounded" title="Copy">
                    {copiedCode ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 text-xs shadow-sm"
                  style={{
                    background: downloaded ? "var(--surface)" : "linear-gradient(135deg, #FFDD00 0%, #F59E0B 100%)",
                    color: downloaded ? "var(--text)" : "#000000",
                    border: downloaded ? "1px solid var(--border)" : "none",
                  }}
                >
                  {downloaded ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Download size={15} />}
                  <span>{downloaded ? "Recovery Kit Downloaded (.txt)" : "Download Recovery Kit (.txt)"}</span>
                </button>
              </div>
            )}

            {/* Recovery settings form */}
            <form onSubmit={handleGenerateNewKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text)" }}>
                  Security Question
                </label>
                <select
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  className="input-field text-xs py-2.5 cursor-pointer"
                >
                  {SECURITY_QUESTIONS.map((q, i) => (
                    <option key={i} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text)" }}>
                  Update Security Answer <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter new answer (leave blank to keep current)"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={generating}
                  className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <><Loader2 size={14} className="animate-spin" /> Generating…</>
                  ) : (
                    <><RefreshCw size={14} /> Generate & Download New Recovery Key</>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-2 border-t text-[11px] leading-relaxed" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              💡 If you ever lose access to your password, you will be prompted for your Recovery Key or this Security Question to reset it.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
