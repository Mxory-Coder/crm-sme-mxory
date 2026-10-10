"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Zap, MoreHorizontal, Sparkles, Play, Pause, Copy } from "lucide-react";

const WORKFLOWS = [
  {
    id: 1, name: "Missed Call Text Back", status: "published", trigger: "Missed Call",
    enrolled: 142, completed: 138, failed: 1,
    lastRun: "2m ago", steps: 3,
    description: "Sends an instant SMS when a call is missed",
  },
  {
    id: 2, name: "New Lead Welcome Sequence", status: "published", trigger: "Contact Created",
    enrolled: 891, completed: 834, failed: 4,
    lastRun: "8m ago", steps: 6,
    description: "Multi-step onboarding for new leads over 7 days",
  },
  {
    id: 3, name: "Quote Follow-Up", status: "published", trigger: "Opportunity Stage Changed",
    enrolled: 67, completed: 52, failed: 0,
    lastRun: "1h ago", steps: 4,
    description: "Follow up 24h after a proposal is sent",
  },
  {
    id: 4, name: "Review Request (Post-Job)", status: "draft", trigger: "Tag Added",
    enrolled: 0, completed: 0, failed: 0,
    lastRun: "Never", steps: 2,
    description: "Asks clients for a Google review after job completion",
  },
  {
    id: 5, name: "Birthday SMS", status: "published", trigger: "Date/Time",
    enrolled: 312, completed: 311, failed: 0,
    lastRun: "Yesterday", steps: 1,
    description: "Sends a personalised birthday message to contacts",
  },
  {
    id: 6, name: "Stale Lead Re-Engagement", status: "paused", trigger: "Date/Time",
    enrolled: 28, completed: 14, failed: 2,
    lastRun: "3d ago", steps: 5,
    description: "Re-engages leads with no activity in 14+ days",
  },
];

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  published: { label: "Published", bg: "bg-green-100", text: "text-green-700", dot: "#39B54A" },
  draft:     { label: "Draft",     bg: "bg-gray-100",  text: "text-gray-600",  dot: "#9CA3AF" },
  paused:    { label: "Paused",    bg: "bg-amber-100", text: "text-amber-700", dot: "#F59E0B" },
};

export default function AutomationPage() {
  const [search, setSearch] = useState("");

  const filtered = WORKFLOWS.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.trigger.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Automation
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {WORKFLOWS.filter((w) => w.status === "published").length} active workflows · {WORKFLOWS.reduce((s, w) => s + w.enrolled, 0).toLocaleString()} total enrollments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-[#009B87]/40 text-[#009B87] bg-[#009B87]/6 text-sm font-medium rounded-lg hover:bg-[#009B87]/10">
            <Sparkles className="w-4 h-4" />
            Build with AI
          </button>
          <Link href="/automation/builder" className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
            <Plus className="w-4 h-4" />
            New Workflow
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search workflows..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87]"
        />
      </div>

      {/* Workflow list */}
      <div className="space-y-2">
        {filtered.map((w) => {
          const s = STATUS_STYLES[w.status];
          const successRate = w.enrolled > 0 ? Math.round((w.completed / w.enrolled) * 100) : 0;
          return (
            <div
              key={w.id}
              className="bg-white rounded-xl border border-[#E5E7EB] px-5 py-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#009B87]/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-[#009B87]" />
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{w.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${s.bg} ${s.text}`}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.dot }} />
                      {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">{w.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-[#9CA3AF] bg-gray-100 px-2 py-0.5 rounded-full">
                      Trigger: {w.trigger}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">{w.steps} steps</span>
                    <span className="text-[10px] text-[#9CA3AF]">Last run: {w.lastRun}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{w.enrolled.toLocaleString()}</p>
                    <p className="text-[10px] text-[#9CA3AF]">Enrolled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#39B54A]">{w.completed.toLocaleString()}</p>
                    <p className="text-[10px] text-[#9CA3AF]">Completed</p>
                  </div>
                  {w.failed > 0 && (
                    <div className="text-center">
                      <p className="text-sm font-bold text-red-500">{w.failed}</p>
                      <p className="text-[10px] text-[#9CA3AF]">Failed</p>
                    </div>
                  )}
                  {w.enrolled > 0 && (
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${successRate}%`, background: successRate > 80 ? "#39B54A" : "#F59E0B" }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{successRate}%</span>
                      </div>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">Success rate</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {w.status === "published" ? (
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-amber-50 rounded-lg text-amber-500" title="Pause">
                      <Pause className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-green-50 rounded-lg text-[#39B54A]" title="Publish">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-[#6B7280]" title="Clone">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-[#9CA3AF]">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI builder CTA */}
      <div className="bg-gradient-to-r from-[#009B87] to-[#007A6C] rounded-xl p-5 flex items-center justify-between">
        <div className="text-white">
          <p className="font-bold text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Build a workflow in plain English</p>
          <p className="text-teal-100 text-sm mt-0.5">
            Describe what you want and Claude will build the full automation for you instantly.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#009B87] text-sm font-bold rounded-xl hover:bg-teal-50 shrink-0 ml-4">
          <Sparkles className="w-4 h-4" />
          Try AI Builder
        </button>
      </div>
    </div>
  );
}
