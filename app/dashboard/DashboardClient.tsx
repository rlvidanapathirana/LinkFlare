"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import LinkCard from "@/components/LinkCard";
import CreateLinkModal from "@/components/CreateLinkModal";
import AccountSettingsModal from "@/components/AccountSettingsModal";
import {
  Plus, Search, Link2, BarChart2, Zap, Clock, TrendingUp,
  Loader2, Filter, ArrowUpDown, ShieldCheck,
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

interface User {
  userId: string;
  email: string;
  name: string;
}

interface Props {
  user: User;
  baseUrl: string;
}

type SortKey = "newest" | "oldest" | "clicks";

export default function DashboardClient({ user, baseUrl }: Props) {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [effectiveBaseUrl, setEffectiveBaseUrl] = useState("https://shturl.netlify.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEffectiveBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.links) setLinks(data.links);
    } catch {
      console.error("Failed to fetch links");
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (link: LinkData) => {
    // Add to list but do NOT close modal — modal closes itself when user clicks "Done"
    setLinks((prev) => [link, ...prev]);
  };

  const handleDeleted = (slug: string) => {
    setLinks((prev) => prev.filter((l) => l.slug !== slug));
  };

  const handleUpdated = (updated: LinkData) => {
    setLinks((prev) => prev.map((l) => (l.slug === updated.slug ? updated : l)));
  };

  // Filter & search
  const filteredLinks = links
    .filter((l) => {
      if (filter === "active") {
        const expired = l.expiresAt ? new Date(l.expiresAt) < new Date() : false;
        const limitReached = l.clickLimit !== null && l.clicks >= l.clickLimit;
        return !expired && !limitReached;
      }
      if (filter === "expired") {
        const expired = l.expiresAt ? new Date(l.expiresAt) < new Date() : false;
        const limitReached = l.clickLimit !== null && l.clicks >= l.clickLimit;
        return expired || limitReached;
      }
      return true;
    })
    .filter((l) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return l.slug.includes(q) || l.longUrl.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortKey === "clicks") return b.clicks - a.clicks;
      if (sortKey === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Stats
  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0);
  const activeLinks = links.filter((l) => {
    const expired = l.expiresAt ? new Date(l.expiresAt) < new Date() : false;
    const limitReached = l.clickLimit !== null && l.clicks >= l.clickLimit;
    return !expired && !limitReached;
  }).length;
  const expiredLinks = links.length - activeLinks;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black font-display" style={{ color: "var(--text)" }}>
              Welcome back, <span className="gradient-text">{user.name.split(" ")[0]}</span> 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {user.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowSettings(true)}
              id="security-settings-btn"
              className="btn-secondary gap-2 flex-shrink-0"
              title="View Security & Download Recovery Key"
            >
              <ShieldCheck size={17} className="text-amber-500" />
              <span>Recovery Key</span>
            </button>
            <button
              onClick={() => setShowCreate(true)}
              id="create-link-dashboard-btn"
              className="btn-primary gap-2 flex-shrink-0"
            >
              <Plus size={18} /> Create New Link
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Links", value: links.length, icon: <Link2 size={18} />, color: "#6366f1" },
            { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: <TrendingUp size={18} />, color: "#10b981" },
            { label: "Active Links", value: activeLinks, icon: <Zap size={18} />, color: "#f59e0b" },
            { label: "Expired", value: expiredLinks, icon: <Clock size={18} />, color: "#ef4444" },
          ].map((stat, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  {stat.label}
                </span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-black font-display" style={{ color: "var(--text)" }}>
                {loading ? <div className="shimmer h-7 w-12 rounded" /> : stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Links Section */}
        <div className="card p-0 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3" style={{ borderColor: "var(--border)" }}>
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                id="search-links"
                placeholder="Search links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              {/* Filter */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="input-field py-2 pl-8 pr-3 text-sm appearance-none cursor-pointer"
                  id="filter-links"
                  style={{ minWidth: 100 }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
                <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              </div>
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="input-field py-2 pl-8 pr-3 text-sm appearance-none cursor-pointer"
                  id="sort-links"
                  style={{ minWidth: 110 }}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="clicks">Most Clicks</option>
                </select>
                <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              </div>
            </div>
          </div>

          {/* Links List */}
          <div className="p-4 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card animate-pulse" style={{ height: 120 }}>
                  <div className="shimmer h-4 w-1/3 rounded mb-2" />
                  <div className="shimmer h-3 w-2/3 rounded" />
                </div>
              ))
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                  <Link2 size={24} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: "var(--text)" }}>
                  {search ? "No links found" : "No links yet"}
                </h3>
                <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                  {search ? "Try a different search term" : "Create your first short link to get started"}
                </p>
                {!search && (
                  <button onClick={() => setShowCreate(true)} className="btn-primary" id="empty-create-btn">
                    <Plus size={16} /> Create First Link
                  </button>
                )}
              </div>
            ) : (
              filteredLinks.map((link) => (
                <LinkCard
                  key={link.slug}
                  link={link}
                  baseUrl={effectiveBaseUrl}
                  onDeleted={handleDeleted}
                  onUpdated={handleUpdated}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <p>Developed by <a href="https://lakshan.vercel.app/" target="_blank" rel="noopener noreferrer">V.P.R. Lakshan Vidanapathirana</a></p>
      </footer>

      {showCreate && (
        <CreateLinkModal
          baseUrl={effectiveBaseUrl}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {showSettings && (
        <AccountSettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
