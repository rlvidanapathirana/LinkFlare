import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-black font-display gradient-text">LinkFlare</span>
        </Link>

        <div className="glass-card p-10">
          <div className="text-8xl font-black font-display gradient-text mb-4">404</div>
          <h1 className="text-2xl font-bold font-display mb-3" style={{ color: "var(--text)" }}>
            Link Not Found
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            This short link doesn&apos;t exist. It may have been deleted or never created.
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2" id="404-home-btn">
            Go Home & Create a Link <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
