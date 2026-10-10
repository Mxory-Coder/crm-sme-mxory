"use client";

import { useState } from "react";
import { Plus, Copy, Trash2, Rocket } from "lucide-react";

const SNAPSHOTS = [
  {
    id: "1",
    name: "Plumbing Business Starter Pack",
    created: "Jul 2026",
    description: "Complete setup for plumbing and trade businesses — includes lead capture, follow-up sequences, and quote workflows.",
    workflows: 6,
    pipelines: 2,
    funnels: 3,
    templates: 8,
  },
  {
    id: "2",
    name: "Dental Practice Complete",
    created: "Jun 2026",
    description: "Full dental practice system with appointment booking, recall campaigns, review generation, and patient onboarding.",
    workflows: 8,
    pipelines: 3,
    funnels: 2,
    templates: 12,
  },
  {
    id: "3",
    name: "Professional Services Base",
    created: "May 2026",
    description: "Foundational setup for attorneys, consultants, and financial advisors — consultations, nurture sequences, and proposals.",
    workflows: 4,
    pipelines: 1,
    funnels: 4,
    templates: 6,
  },
];

const ACCOUNTS = [
  "Cape Plumbing Co",
  "Apex Dental",
  "AR Boards & Signs",
  "Skyline Developments",
  "Nomsa Beauty Studio",
  "Mountain View Attorneys",
  "TechPulse IT Solutions",
  "Bright Spark Electrical",
  "Bella Vista Restaurant",
  "Durban Print Hub",
  "Sandton Law Group",
  "Fresh Roots Nutrition",
];

export default function SnapshotsPage() {
  const [deployTarget, setDeployTarget] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Snapshots
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
          <Plus className="w-4 h-4" />
          Create Snapshot
        </button>
      </div>

      {/* Explanation card */}
      <div className="bg-[#009B87]/8 border border-[#009B87]/20 rounded-xl p-4">
        <p className="text-sm text-[#007f6e] font-medium">
          💡 Snapshots capture your workflow, pipeline, funnel, and template configs — deploy them to any sub-account in one click.
        </p>
      </div>

      {/* Snapshots grid */}
      <div className="grid grid-cols-2 gap-5">
        {SNAPSHOTS.map((snap) => (
          <div key={snap.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>{snap.name}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">Created {snap.created}</p>
              </div>
            </div>

            <p className="text-sm text-[#6B7280] leading-relaxed">{snap.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: `Workflows ${snap.workflows}`, color: "bg-purple-100 text-purple-700" },
                { label: `Pipelines ${snap.pipelines}`, color: "bg-[#009B87]/10 text-[#009B87]" },
                { label: `Funnels ${snap.funnels}`, color: "bg-blue-100 text-blue-700" },
                { label: `Email Templates ${snap.templates}`, color: "bg-amber-100 text-amber-700" },
              ].map((tag) => (
                <span key={tag.label} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tag.color}`}>
                  {tag.label}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#E5E7EB]">
              <button
                onClick={() => setDeployTarget(snap.id)}
                className="flex items-center gap-2 px-4 py-2 bg-[#39B54A] text-white text-xs font-semibold rounded-lg hover:bg-[#2da03f] transition-colors"
              >
                <Rocket className="w-3.5 h-3.5" />
                Deploy
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                <Copy className="w-3.5 h-3.5" />
                Clone
              </button>
              <button className="ml-auto p-2 rounded-lg text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deploy modal */}
      {deployTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Deploy Snapshot
            </h3>
            <p className="text-sm text-[#6B7280] mb-4">
              {SNAPSHOTS.find((s) => s.id === deployTarget)?.name}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                Select Sub-Account to deploy to
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87] bg-white"
              >
                <option value="">— Choose a sub-account —</option>
                {ACCOUNTS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
              <p className="text-xs text-amber-700 font-medium">
                ⚠️ This will ADD to the target account. Existing data is untouched.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setDeployTarget(null); setSelectedAccount(""); }}
                className="flex-1 py-2 border border-[#E5E7EB] text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setDeployTarget(null); setSelectedAccount(""); }}
                className="flex-1 py-2 bg-[#39B54A] text-white text-sm font-semibold rounded-lg hover:bg-[#2da03f] transition-colors"
              >
                Deploy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
