"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight,
  ShieldAlert, Key, HelpCircle, CheckCircle2, ArrowLeft
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"lookup" | "reset" | "success">("lookup");
  const [method, setMethod] = useState<"code" | "question">("code");
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);
  
  // Inputs for reset
  const [recoveryCode, setRecoveryCode] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Please enter your email");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/get-security-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No account found with this email");
      } else {
        setSecurityQuestion(data.securityQuestion);
        setStep("reset");
      }
    } catch {
      setError("Failed to verify account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (newPassword.length < 8) {
      return setError("New password must be at least 8 characters");
    }

    if (method === "code" && !recoveryCode.trim()) {
      return setError("Please enter your Recovery Key");
    }
    if (method === "question" && !securityAnswer.trim()) {
      return setError("Please answer the security question");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          method,
          recoveryCode: recoveryCode.trim(),
          securityAnswer: securityAnswer.trim(),
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setStep("success");
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
          <h1 className="text-3xl font-black font-display" style={{ color: "var(--text)" }}>
            Account Recovery
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Reset your password securely using your Recovery Key or Security Question
          </p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm animate-scale-in"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "var(--error)",
              }}
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === "lookup" && (
            <form onSubmit={handleLookup} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="email"
                    id="recovery-email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Verifying Account…</>
                ) : (
                  <><span>Continue</span> <ArrowRight size={16} /></>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-medium inline-flex items-center gap-1.5 hover:underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Reset Password Form */}
          {step === "reset" && (
            <form onSubmit={handleReset} className="space-y-4 animate-fade-in">
              <div className="p-3 rounded-xl mb-2 flex items-center justify-between text-xs" style={{ background: "var(--surface-2)" }}>
                <span className="font-medium truncate" style={{ color: "var(--text)" }}>{email}</span>
                <button
                  type="button"
                  onClick={() => setStep("lookup")}
                  className="text-xs font-semibold hover:underline shrink-0"
                  style={{ color: "var(--accent)" }}
                >
                  Change Email
                </button>
              </div>

              {/* Choose Verification Method Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  Select Recovery Method
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod("code")}
                    className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      method === "code" ? "shadow-sm" : "opacity-70"
                    }`}
                    style={{
                      borderColor: method === "code" ? "var(--accent)" : "var(--border)",
                      background: method === "code" ? "var(--accent-subtle)" : "transparent",
                      color: method === "code" ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    <Key size={14} />
                    <span>Recovery Key</span>
                  </button>

                  {securityQuestion && (
                    <button
                      type="button"
                      onClick={() => setMethod("question")}
                      className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                        method === "question" ? "shadow-sm" : "opacity-70"
                      }`}
                      style={{
                        borderColor: method === "question" ? "var(--accent)" : "var(--border)",
                        background: method === "question" ? "var(--accent-subtle)" : "transparent",
                        color: method === "question" ? "var(--accent)" : "var(--text-secondary)",
                      }}
                    >
                      <HelpCircle size={14} />
                      <span>Security Question</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Method 1: Recovery Code Input */}
              {method === "code" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                    Enter Master Recovery Key
                  </label>
                  <div className="relative">
                    <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                    <input
                      type="text"
                      id="input-recovery-code"
                      placeholder="LF-XXXX-XXXX-XXXX-XXXX"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      className="input-field pl-10 font-mono tracking-wide"
                      required
                    />
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                    This is the code inside your downloaded <code>linkflare-recovery-key.txt</code> file.
                  </p>
                </div>
              )}

              {/* Method 2: Security Question Answer Input */}
              {method === "question" && securityQuestion && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                    Security Question
                  </label>
                  <div className="p-2.5 rounded-lg text-xs font-medium mb-2" style={{ background: "var(--surface-2)", color: "var(--text)" }}>
                    {securityQuestion}
                  </div>
                  <input
                    type="text"
                    id="input-security-answer"
                    placeholder="Enter your answer"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                </div>
              )}

              {/* New Password */}
              <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                  New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="new-password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    required
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

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirm-new-password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Updating Password…</>
                ) : (
                  <><span>Reset Password</span> <CheckCircle2 size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Success State */}
          {step === "success" && (
            <div className="text-center space-y-5 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-glow">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display" style={{ color: "var(--text)" }}>
                  Password Reset Successfully!
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Your account password has been updated. You can now log in using your new credentials.
                </p>
              </div>

              <Link
                href="/login"
                className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 inline-flex"
              >
                <span>Sign In with New Password</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
