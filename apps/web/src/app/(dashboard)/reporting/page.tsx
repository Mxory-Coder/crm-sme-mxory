"use client";

import { useState } from "react";
import { Download, Sparkles, TrendingUp, MessageSquare, CheckCircle, DollarSign } from "lucide-react";

const DATE_RANGES = ["Last 7d", "Last 30d", "Last 90d", "Custom"];

const FUNNEL_STAGES = [
  { label: "Leads", count: 284, pct: 100 },
  { label: "Qualified", count: 142, pct: 50 },
  { label: "Proposal", count: 67, pct: 24 },
  { label: "Won", count: 18, pct: 6 },
];

const TOP_CHANNELS = [
  { channel: "SMS", count: 1284, pct: 42 },
  { channel: "Email", count: 894, pct: 29 },
  { channel: "WhatsApp", count: 642, pct: 21 },
  { channel: "Web Chat", count: 241, pct: 8 },
];

export default function ReportingPage() {
  const [activeRange, setActiveRange] = useState("Last 30d");

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Reporting
        </h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] bg-white text-sm text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
            <Sparkles className="w-4 h-4" /> AI Narrative
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        {DATE_RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRange(r)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              activeRange === r
                ? "bg-[#009B87] text-white border-[#009B87]"
                : "bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "New Contacts", value: "284", icon: TrendingUp, color: "text-[#009B87]", bg: "bg-[#009B87]/10" },
          { label: "Conversations", value: "142", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Deals Closed", value: "18", icon: CheckCircle, color: "text-[#39B54A]", bg: "bg-[#39B54A]/10" },
          { label: "Revenue", value: "R 94,500", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${k.bg}`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">{k.label}</p>
              <p className="text-xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Contacts Over Time</h2>
        <svg viewBox="0 0 560 160" className="w-full">
          <line x1="40" y1="10" x2="40" y2="140" stroke="#E5E7EB" strokeWidth="1"/>
          <line x1="40" y1="140" x2="540" y2="140" stroke="#E5E7EB" strokeWidth="1"/>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#009B87" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#009B87" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M40,120 L123,105 L206,90 L289,70 L372,55 L455,35 L540,20 L540,140 L40,140 Z" fill="url(#lineGrad)"/>
          <polyline points="40,120 123,105 206,90 289,70 372,55 455,35 540,20" fill="none" stroke="#009B87" strokeWidth="2"/>
          {[{x:40,y:120},{x:123,y:105},{x:206,y:90},{x:289,y:70},{x:372,y:55},{x:455,y:35},{x:540,y:20}].map((p,i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#009B87"/>
          ))}
          <text x="40" y="155" fontSize="10" fill="#6B7280" textAnchor="middle">Jun 16</text>
          <text x="123" y="155" fontSize="10" fill="#6B7280" textAnchor="middle">Jun 17</text>
          <text x="206" y="155" fontSize="10" fill="#6B7280" textAnchor="middle">Jun 18</text>
          <text x="289" y="155" fontSize="10" fill="#6B7280" textAnchor="middle">Jun 19</text>
          <text x="372" y="155" fontSize="10" fill="#6B7280" textAnchor="middle">Jun 20</text>
          <text x="455" y="155" fontSize="10" fill="#6B7280" textAnchor="middle">Jun 21</text>
          <text x="540" y="155" fontSize="10" fill="#6B7280" textAnchor="middle">Jun 22</text>
        </svg>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
          <div className="space-y-3">
            {FUNNEL_STAGES.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700 font-medium">{s.label}</span>
                  <span className="text-[#6B7280]">{s.count}</span>
                </div>
                <div className="h-6 bg-[#E5E7EB] rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#009B87] to-[#39B54A] rounded-lg flex items-center px-2"
                    style={{ width: `${s.pct}%` }}
                  >
                    <span className="text-[10px] text-white font-medium">{s.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Channels */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Channels</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">Channel</th>
                <th className="text-right py-2 text-xs font-semibold text-[#6B7280] uppercase">Messages</th>
                <th className="text-right py-2 text-xs font-semibold text-[#6B7280] uppercase">Share</th>
              </tr>
            </thead>
            <tbody>
              {TOP_CHANNELS.map((c, i) => (
                <tr key={i} className="border-b border-[#F3F4F6]">
                  <td className="py-2.5 text-gray-900 font-medium">{c.channel}</td>
                  <td className="py-2.5 text-right text-[#6B7280]">{c.count.toLocaleString()}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-xs bg-[#009B87]/10 text-[#009B87] px-2 py-0.5 rounded-full font-medium">{c.pct}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Narrative */}
      <div className="bg-[#F4F9F9] rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#009B87] shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700 italic">
          Over the last 30 days, your CRM has seen an <strong>18% growth</strong> in new contacts compared to the previous period. Conversations are up 12%, with SMS remaining your top channel at 42% of total messages. Your sales team closed 18 deals worth <strong>R 94,500</strong> — a strong performance driven by improved lead qualification. Consider doubling down on WhatsApp outreach, which shows the highest engagement-to-conversion ratio this month.
        </p>
      </div>
    </div>
  );
}
