"use client";

import { useState } from "react";
import { Search, Plus, Upload, MoreHorizontal } from "lucide-react";
import Link from "next/link";

const ALL_ACCOUNTS = [
  { id: "cape-plumbing", name: "Cape Plumbing Co", plan: "Pro", city: "Cape Town, WC", contacts: 842, workflows: 12, mrr: "R 2,499", status: "Active", ai: "Autopilot", aiColor: "bg-green-500" },
  { id: "apex-dental", name: "Apex Dental", plan: "Pro", city: "Sandton, GP", contacts: 1204, workflows: 8, mrr: "R 2,499", status: "Active", ai: "Autopilot", aiColor: "bg-green-500" },
  { id: "ar-boards", name: "AR Boards & Signs", plan: "Starter", city: "Cape Town, WC", contacts: 234, workflows: 3, mrr: "R 899", status: "Active", ai: "Suggestive", aiColor: "bg-amber-500" },
  { id: "skyline-dev", name: "Skyline Developments", plan: "Agency", city: "Johannesburg, GP", contacts: 3420, workflows: 24, mrr: "R 5,499", status: "Active", ai: "Autopilot", aiColor: "bg-green-500" },
  { id: "nomsa-beauty", name: "Nomsa Beauty Studio", plan: "Starter", city: "Durban, KZN", contacts: 156, workflows: 2, mrr: "R 899", status: "Active", ai: "Off", aiColor: "bg-gray-400" },
  { id: "mountain-attorneys", name: "Mountain View Attorneys", plan: "Pro", city: "Pretoria, GP", contacts: 678, workflows: 7, mrr: "R 2,499", status: "Active", ai: "Suggestive", aiColor: "bg-amber-500" },
  { id: "techpulse", name: "TechPulse IT Solutions", plan: "Pro", city: "Cape Town, WC", contacts: 891, workflows: 15, mrr: "R 2,499", status: "Active", ai: "Autopilot", aiColor: "bg-green-500" },
  { id: "bright-spark", name: "Bright Spark Electrical", plan: "Starter", city: "East London, EC", contacts: 89, workflows: 1, mrr: "R 899", status: "Trial", ai: "Off", aiColor: "bg-gray-400" },
  { id: "bella-vista", name: "Bella Vista Restaurant", plan: "Starter", city: "Cape Town, WC", contacts: 312, workflows: 4, mrr: "R 899", status: "Trial", ai: "Off", aiColor: "bg-gray-400" },
  { id: "durban-print", name: "Durban Print Hub", plan: "Pro", city: "Durban, KZN", contacts: 445, workflows: 6, mrr: "R 2,499", status: "Active", ai: "Suggestive", aiColor: "bg-amber-500" },
  { id: "sandton-law", name: "Sandton Law Group", plan: "Agency", city: "Sandton, GP", contacts: 1890, workflows: 18, mrr: "R 5,499", status: "Active", ai: "Autopilot", aiColor: "bg-green-500" },
  { id: "fresh-roots", name: "Fresh Roots Nutrition", plan: "Starter", city: "Stellenbosch, WC", contacts: 67, workflows: 1, mrr: "R 899", status: "Suspended", ai: "Off", aiColor: "bg-gray-400" },
];

const PLAN_BADGE: Record<string, string> = {
  Agency: "bg-purple-100 text-purple-700",
  Pro: "bg-[#009B87]/10 text-[#009B87]",
  Starter: "bg-gray-100 text-gray-600",
};

const STATUS_BADGE: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Trial: "bg-amber-100 text-amber-700",
  Suspended: "bg-red-100 text-red-700",
};

const FILTERS = ["All", "Active", "Trial", "Suspended"];
const COUNTS: Record<string, number> = { All: 12, Active: 10, Trial: 1, Suspended: 1 };

export default function LocationsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = ALL_ACCOUNTS.filter((a) => {
    const matchFilter = filter === "All" || a.status === filter;
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Sub-Accounts
        </h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] bg-white text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
            <Plus className="w-4 h-4" />
            New Sub-Account
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === f
                  ? "bg-[#009B87] text-white"
                  : "bg-white border border-[#E5E7EB] text-gray-600 hover:border-[#009B87] hover:text-[#009B87]"
              }`}
            >
              {f} ({COUNTS[f]})
            </button>
          ))}
        </div>
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sub-accounts..."
            className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87] bg-white"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((account) => (
          <div key={account.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
            {/* Name + plan */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-900 text-sm">{account.name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{account.city}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_BADGE[account.plan]}`}>
                {account.plan}
              </span>
            </div>

            {/* Status */}
            <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[account.status]}`}>
              {account.status}
            </span>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-[#E5E7EB]">
              {[
                { label: "Contacts", value: account.contacts.toLocaleString() },
                { label: "Workflows", value: account.workflows },
                { label: "MRR", value: account.mrr },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xs font-bold text-gray-900">{s.value}</p>
                  <p className="text-[10px] text-[#6B7280]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* AI indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${account.aiColor}`} />
              <span className="text-xs text-[#6B7280]">AI Agent: <span className="font-semibold text-gray-700">{account.ai}</span></span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-1 relative">
              <Link
                href="/dashboard"
                className="flex-1 text-center py-2 border border-[#009B87] text-[#009B87] text-xs font-semibold rounded-lg hover:bg-[#009B87]/5 transition-colors"
              >
                Enter Account
              </Link>
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === account.id ? null : account.id)}
                  className="p-2 rounded-lg border border-[#E5E7EB] text-[#9CA3AF] hover:bg-gray-50 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {openMenu === account.id && (
                  <div className="absolute right-0 bottom-full mb-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                    {["Edit", "Snapshot", "Suspend", "Delete"].map((action) => (
                      <button
                        key={action}
                        onClick={() => setOpenMenu(null)}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${action === "Delete" ? "text-red-600" : "text-gray-700"}`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
