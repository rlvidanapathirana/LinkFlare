"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap, Mail, Lock, Eye, EyeOff, User, AlertCircle, Loader2,
  ArrowRight, UserPlus, CheckCircle2, ShieldCheck, Download, Copy, Check, Key, HelpCircle
} from "lucide-react";
import { SECURITY_QUESTIONS } from "@/lib/redis";

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#10b981", "#6366f1"];
  return { score, label: labels[score] || "", color: colors[score] || "" };
}

interface RecoveryData {
  user: { id: string; email: string; name: string };
  recoveryCode: string;
  securityQuestion: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Post signup recovery modal state
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) return setError("Passwords don't match");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (!securityAnswer.trim()) return setError("Please provide an answer to the security question");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          securityQuestion,
          securityAnswer: securityAnswer.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
      } else {
        localStorage.setItem("lf_user", JSON.stringify(data.user));
        setRecoveryData({
          user: data.user,
          recoveryCode: data.recoveryCode,
          securityQuestion: data.securityQuestion || securityQuestion,
        });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!recoveryData) return;
    navigator.clipboard.writeText(recoveryData.recoveryCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadRecoveryKit = () => {
    if (!recoveryData) return;
    const content = `===================================================================
LINKFLARE - ACCOUNT RECOVERY KEY & DETAILS
===================================================================
Account Name     : ${recoveryData.user.name}
Account Email    : ${recoveryData.user.email}
Security Question: ${recoveryData.securityQuestion}
Recovery Key     : ${recoveryData.recoveryCode}
Created Date     : ${new Date().toLocaleString()}

===================================================================
⚠️ IMPORTANT SECURITY WARNING:
Keep this Recovery Key in a safe and secure place (e.g. password manager,
printed paper, or safe drive). 

If you ever forget your password, you will NEED this Recovery Key or
your Security Question answer to reset your password and access your
LinkFlare account.

Without this Recovery Key, your account CANNOT be recovered.
===================================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `linkflare-recovery-key-${recoveryData.user.email.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setAcknowledged(true);
  };

  const handleProceedToDashboard = () => {
    router.push("/dashboard");
    router.refresh();
  };

  // ─── Render Recovery Kit Step ──────────────────────────────────────────────
  if (recoveryData) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg animate-scale-in">
          <div className="glass-card p-8 border-2" style={{ borderColor: "rgba(245, 158, 11, 0.4)" }}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 shadow-glow">
                <ShieldCheck size={30} className="text-amber-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display" style={{ color: "var(--text)" }}>
                Save Your Recovery Key
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                Your account is ready! Please save this recovery key before continuing.
              </p>
            </div>

            {/* Warning Alert */}
            <div
              className="p-4 rounded-xl mb-6 text-xs sm:text-sm leading-relaxed border"
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                borderColor: "rgba(245, 158, 11, 0.3)",
                color: "var(--text)",
              }}
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-500 font-semibold block mb-0.5">Keep this file safe!</strong>
                  If you ever forget your password, you will <strong>NEED</strong> this Recovery Key to reset your password. Without this key or your security question answer, your account <strong>cannot be recovered</strong>.
                </div>
              </div>
            </div>

            {/* Recovery Code Display */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Your Master Recovery Key
              </label>
              <div
                className="flex items-center justify-between p-3.5 rounded-xl border font-mono font-bold text-base sm:text-lg tracking-wider"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                  color: "var(--accent)",
                }}
              >
                <span className="select-all truncate">{recoveryData.recoveryCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="btn-ghost p-2 rounded-lg flex-shrink-0 ml-2"
                  title="Copy Recovery Key"
                >
                  {copiedCode ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* Download Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleDownloadRecoveryKit}
                className="w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: downloaded ? "var(--surface-2)" : "linear-gradient(135deg, #FFDD00 0%, #F59E0B 100%)",
                  color: downloaded ? "var(--text)" : "#000000",
                  border: downloaded ? "1px solid var(--border)" : "none",
                }}
              >
                {downloaded ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span>Recovery Kit Downloaded (.txt)</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Download Recovery Kit (.txt)</span>
                  </>
                )}
              </button>

              {/* Acknowledgment Checkbox */}
              <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none px-1" style={{ color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>I have downloaded and stored my Recovery Key in a safe place.</span>
              </label>

              {/* Continue to Dashboard */}
              <button
                type="button"
                onClick={handleProceedToDashboard}
                disabled={!acknowledged && !downloaded}
                className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Standard Signup Form ──────────────────────────────────────────────────
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
          <h1 className="text-3xl font-black font-display" style={{ color: "var(--text)" }}>Create Account</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Free forever. With self-custodial account recovery.
          </p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm animate-scale-in"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--error)" }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  id="signup-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="email"
                  id="signup-email"
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
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="signup-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost w-7 h-7 p-0"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Password strength */}
              {password && (
                <div className="mt-2 animate-fade-in">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= strength.score ? strength.color : "var(--border)",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="signup-confirm-password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  required
                  autoComplete="new-password"
                />
                {confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {confirmPassword === password
                      ? <CheckCircle2 size={15} className="text-emerald-500" />
                      : <AlertCircle size={15} style={{ color: "var(--error)" }} />}
                  </div>
                )}
              </div>
            </div>

            {/* Account Recovery Section */}
            <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <HelpCircle size={15} style={{ color: "var(--accent)" }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                  Account Recovery Setup
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Security Question
                  </label>
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="input-field text-xs sm:text-sm py-2.5 cursor-pointer"
                  >
                    {SECURITY_QUESTIONS.map((q, i) => (
                      <option key={i} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Answer to Security Question
                  </label>
                  <input
                    type="text"
                    id="signup-security-answer"
                    placeholder="Your secret answer"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="input-field text-sm py-2.5"
                    required
                  />
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                    Used along with your Recovery Key if you ever forget your password.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="signup-submit-btn"
              className="btn-primary w-full py-3.5 text-base mt-3"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Account…</>
              ) : (
                <><UserPlus size={18} /> Create Account & Get Recovery Key</>
              )}
            </button>
          </form>

          <p className="text-center mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--accent)" }} id="goto-login-link">
              Sign in <ArrowRight size={13} className="inline" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
