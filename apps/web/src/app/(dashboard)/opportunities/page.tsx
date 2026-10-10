"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Sparkles, TrendingUp } from "lucide-react";

const STAGES = [
  { id: "new", label: "New Lead", color: "#6B7280", count: 3, total: "R 19,450" },
  { id: "qualified", label: "Qualified", color: "#3B82F6", count: 2, total: "R 47,950" },
  { id: "proposal", label: "Proposal Sent", color: "#F59E0B", count: 2, total: "R 57,000" },
  { id: "negotiation", label: "Negotiation", color: "#8B5CF6", count: 1, total: "R 12,000" },
  { id: "won", label: "Won", color: "#39B54A", count: 2, total: "R 38,500" },
];

const DEALS: Record<string, { name: string; contact: string; value: string; score: number; days: number }[]> = {
  new: [
    { name: "Home Security Install", contact: "Michael van Wyk", value: "R 8,500", score: 41, days: 1 },
    { name: "Office Deep Clean", contact: "Thabo Nkosi", value: "R 4,950", score: 22, days: 3 },
    { name: "Website Redesign", contact: "AR Boards & Signs", value: "R 6,000", score: 48, days: 0 },
  ],
  qualified: [
    { name: "Bathroom Renovation", contact: "John Dlamini", value: "R 2,950", score: 82, days: 4 },
    { name: "Garden Landscaping", contact: "Cape Plumbing Co", value: "R 45,000", score: 75, days: 2 },
  ],
  proposal: [
    { name: "Office Fitout", contact: "Priya Singh", value: "R 45,000", score: 67, days: 6 },
    { name: "Fleet Graphics", contact: "AR Boards & Signs", value: "R 12,000", score: 55, days: 3 },
  ],
  negotiation: [
    { name: "Branding Package", contact: "Nomsa Dube", value: "R 12,000", score: 91, days: 8 },
  ],
  won: [
    { name: "Logo Design", contact: "Sarah Molefe", value: "R 3,500", score: 95, days: 12 },
    { name: "SEO Package", contact: "Cape Plumbing Co", value: "R 35,000", score: 88, days: 9 },
  ],
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#39B54A" : score >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
      style={{ background: color }}
    >
      {score}
    </div>
  );
}

export default function OpportunitiesPage() {
  const [dragging, setDragging] = useState<string | null>(null);

  return (
    <div className="space-y-5 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Opportunities
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Direct Sales Pipeline · 10 open deals · R 136,400 total value</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] bg-white text-sm text-gray-700 rounded-lg hover:bg-gray-50">
            <TrendingUp className="w-4 h-4" /> Pipeline Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
            <Plus className="w-4 h-4" /> Add Deal
          </button>
        </div>
      </div>

      {/* AI insight */}
      <div className="bg-[#009B87]/8 border border-[#009B87]/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-[#009B87] shrink-0" />
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-[#009B87]">AI:</span> "Branding Package" (score 91) has been in Negotiation for 8 days with no activity — follow up today before it goes cold.
        </p>
        <button className="ml-auto text-xs text-[#009B87] font-semibold hover:underline whitespace-nowrap">View Deal →</button>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage.id}
            className="w-64 shrink-0 bg-[#F4F9F9] rounded-xl border border-[#E5E7EB] flex flex-col"
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Column header */}
            <div className="px-3 py-3 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color }} />
                  <span className="text-sm font-semibold text-gray-900">{stage.label}</span>
                  <span className="text-xs bg-white border border-[#E5E7EB] text-[#6B7280] rounded-full px-2 py-0.5 font-medium">
                    {stage.count}
                  </span>
                </div>
                <button className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-lg">
                  <Plus className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </button>
              </div>
              <p className="text-xs text-[#6B7280] mt-1 font-medium">{stage.total}</p>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 min-h-[200px]">
              {(DEALS[stage.id] ?? []).map((deal, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => setDragging(deal.name)}
                  onDragEnd={() => setDragging(null)}
                  className={`bg-white rounded-xl border border-[#E5E7EB] p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                    dragging === deal.name ? "opacity-50 scale-95" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{deal.name}</p>
                    <button className="shrink-0 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    </button>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-3">{deal.contact}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">{deal.value}</span>
                    <div className="flex items-center gap-2">
                      {deal.days > 5 && (
                        <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium">
                          {deal.days}d
                        </span>
                      )}
                      <ScoreRing score={deal.score} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty drop zone */}
              {(DEALS[stage.id] ?? []).length === 0 && (
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#9CA3AF]">Drop deals here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
