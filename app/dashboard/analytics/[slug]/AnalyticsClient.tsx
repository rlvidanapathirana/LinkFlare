"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ClicksChart from "@/components/charts/ClicksChart";
import TopBarChart from "@/components/charts/TopBarChart";
import DevicePieChart from "@/components/charts/DevicePieChart";
import {
  ArrowLeft, BarChart2, Globe, Smartphone, Link2, ExternalLink,
  TrendingUp, Users, Share2, Monitor, Loader2, Copy, Check,
} from "lucide-react";

interface ClickEvent {
  timestamp: string;
  country: string;
  city: string;
  referrer: string;
  device: string;
  browser: string;
  os: string;
}

interface Analytics {
  totalClicks: number;
  clicksOverTime: { date: string; clicks: number }[];
  topCountries: { name: string; value: number }[];
  topReferrers: { name: string; value: number }[];
  devices: { name: string; value: number }[];
  browsers: { name: string; value: number }[];
  os: { name: string; value: number }[];
  recentClicks: ClickEvent[];
}

interface LinkData {
  slug: string;
  longUrl: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
}

interface Props {
  slug: string;
  baseUrl: string;
}

export default function AnalyticsClient({ slug, baseUrl }: Props) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const shortUrl = `${baseUrl}/${slug}`;

  useEffect(() => {
    fetch(`/api/links/${slug}/analytics`)
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data.analytics);
        setLink(data.link);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "var(--accent)" }} />
          <p style={{ color: "var(--text-muted)" }}>Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <Link href="/dashboard" className="btn-ghost mt-1 flex-shrink-0" id="back-to-dashboard">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer"
                className="font-mono font-bold text-xl hover:underline" style={{ color: "var(--accent)" }}>
                {shortUrl.replace(/^https?:\/\//, "")}
              </a>
              <button onClick={handleCopy} className="btn-ghost w-7 h-7 p-0" id="analytics-copy-btn">
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost w-7 h-7 p-0">
                <ExternalLink size={14} />
              </a>
            </div>
            {link && (
              <p className="text-sm truncate" style={{ color: "var(--text-muted)" }}>{link.longUrl}</p>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Clicks", value: analytics?.totalClicks?.toLocaleString() ?? "0", icon: <TrendingUp size={18} />, color: "#6366f1" },
            { label: "Top Country", value: analytics?.topCountries?.[0]?.name ?? "N/A", icon: <Globe size={18} />, color: "#10b981" },
            { label: "Top Referrer", value: analytics?.topReferrers?.[0]?.name ?? "Direct", icon: <Share2 size={18} />, color: "#f59e0b" },
            { label: "Top Device", value: analytics?.devices?.[0]?.name ?? "N/A", icon: <Smartphone size={18} />, color: "#ef4444" },
          ].map((kpi, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{kpi.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${kpi.color}15`, color: kpi.color }}>
                  {kpi.icon}
                </div>
              </div>
              <div className="text-xl font-black font-display truncate" style={{ color: "var(--text)" }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Clicks Over Time */}
        <div className="card mb-6">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
            <BarChart2 size={17} style={{ color: "var(--accent)" }} />
            Clicks Over Last 30 Days
          </h2>
          {analytics && analytics.clicksOverTime.length > 0 ? (
            <ClicksChart data={analytics.clicksOverTime} />
          ) : (
            <div className="h-48 flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
              No click data yet
            </div>
          )}
        </div>

        {/* 2-column charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Top Countries */}
          <div className="card">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Globe size={17} style={{ color: "var(--accent)" }} />
              Top Countries
            </h2>
            {analytics && analytics.topCountries.length > 0 ? (
              <TopBarChart data={analytics.topCountries} />
            ) : (
              <div className="h-48 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
                No geo data yet
              </div>
            )}
          </div>

          {/* Top Referrers */}
          <div className="card">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Share2 size={17} style={{ color: "var(--accent)" }} />
              Top Referrers
            </h2>
            {analytics && analytics.topReferrers.length > 0 ? (
              <TopBarChart data={analytics.topReferrers} color="#10b981" />
            ) : (
              <div className="h-48 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
                No referrer data yet
              </div>
            )}
          </div>
        </div>

        {/* Device & Browser breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Smartphone size={17} style={{ color: "var(--accent)" }} />
              Devices
            </h2>
            {analytics && analytics.devices.length > 0 ? (
              <DevicePieChart data={analytics.devices} />
            ) : (
              <div className="h-48 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>No data</div>
            )}
          </div>
          <div className="card">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Monitor size={17} style={{ color: "var(--accent)" }} />
              Browsers
            </h2>
            {analytics && analytics.browsers.length > 0 ? (
              <DevicePieChart data={analytics.browsers} />
            ) : (
              <div className="h-48 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>No data</div>
            )}
          </div>
          <div className="card">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Users size={17} style={{ color: "var(--accent)" }} />
              Operating Systems
            </h2>
            {analytics && analytics.os.length > 0 ? (
              <DevicePieChart data={analytics.os} />
            ) : (
              <div className="h-48 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>No data</div>
            )}
          </div>
        </div>

        {/* Recent Clicks Table */}
        {analytics && analytics.recentClicks.length > 0 && (
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-bold text-base flex items-center gap-2" style={{ color: "var(--text)" }}>
                <Link2 size={17} style={{ color: "var(--accent)" }} />
                Recent Clicks
              </h2>
            </div>
            <div className="table-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Time", "Country", "City", "Referrer", "Device", "Browser"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentClicks.map((click, i) => (
                    <tr key={i} className="transition-colors" style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                        {new Date(click.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text)" }}>{click.country}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{click.city}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="badge badge-info text-xs">{click.referrer}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{click.device}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{click.browser}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <footer>
        <p>Developed by <a href="https://lakshan.vercel.app/" target="_blank" rel="noopener noreferrer">V.P.R. Lakshan Vidanapathirana</a></p>
      </footer>
    </div>
  );
}
