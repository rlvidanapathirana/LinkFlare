"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import {
  Zap, Moon, Sun, Menu, X, LayoutDashboard, LogOut, LogIn, UserPlus, BarChart2,
} from "lucide-react";
import BuyMeCoffee from "./BuyMeCoffee";

interface User {
  name: string;
  email: string;
}

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lf_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("lf_user");
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isDashboard
          ? "glass border-b border-[var(--border)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span
              className="text-xl font-bold font-display gradient-text"
            >
              LinkFlare
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!isDashboard && (
              <>
                <a href="#features" className="btn-ghost">Features</a>
                <a href="#pricing" className="btn-ghost">Pricing</a>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Buy Me a Coffee */}
            <BuyMeCoffee variant="compact" className="hidden lg:inline-flex" />

            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="btn-ghost w-9 h-9 p-0 rounded-lg"
              aria-label="Toggle theme"
              id="theme-toggle"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <Link href="/dashboard" className="hidden md:flex btn-ghost gap-2">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[var(--border)]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <button onClick={handleLogout} className="btn-ghost text-[var(--error)]" id="logout-btn">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden md:flex btn-ghost" id="login-nav-btn">
                  <LogIn size={16} />
                  Login
                </Link>
                <Link href="/signup" className="hidden md:flex btn-primary text-sm px-4 py-2" id="signup-nav-btn">
                  <UserPlus size={15} />
                  Get Started Free
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden btn-ghost w-9 h-9 p-0"
              onClick={() => setMenuOpen(!menuOpen)}
              id="mobile-menu-btn"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-[var(--border)] animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {!isDashboard && (
              <>
                <a href="#features" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>
                  <BarChart2 size={16} /> Features
                </a>
                <a href="#pricing" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>
                  Pricing
                </a>
              </>
            )}
            {user ? (
              <>
                <Link href="/dashboard" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="block btn-ghost w-full text-left text-[var(--error)]">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>
                  <LogIn size={16} /> Login
                </Link>
                <Link href="/signup" className="block btn-primary w-full justify-start mt-2" onClick={() => setMenuOpen(false)}>
                  <UserPlus size={16} /> Get Started Free
                </Link>
              </>
            )}
            <div className="pt-2">
              <BuyMeCoffee variant="compact" className="w-full justify-center" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
