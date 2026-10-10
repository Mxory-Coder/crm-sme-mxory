import Link from "next/link";
import { ArrowUpRight, Plus, ChevronRight, MoreHorizontal } from "lucide-react";

const ACCOUNTS = [
  { name: "Cape Plumbing Co", plan: "Pro", contacts: 842, mrr: "R 2,499", status: "Active", ai: "✅ Autopilot", lastActive: "2 min ago" },
  { name: "Apex Dental", plan: "Pro", contacts: 1204, mrr: "R 2,499", status: "Active", ai: "✅ Autopilot", lastActive: "15 min ago" },
  { name: "AR Boards & Signs", plan: "Starter", contacts: 234, mrr: "R 899", status: "Active", ai: "💬 Suggestive", lastActive: "1h ago" },
  { name: "Skyline Developments", plan: "Agency", contacts: 3420, mrr: "R 5,499", status: "Active", ai: "✅ Autopilot", lastActive: "3h ago" },
  { name: "Nomsa Beauty Studio", plan: "Starter", contacts: 156, mrr: "R 899", status: "Active", ai: "❌ Off", lastActive: "Yesterday" },
  { name: "Mountain View Attorneys", plan: "Pro", contacts: 678, mrr: "R 2,499", status: "Active", ai: "💬 Suggestive", lastActive: "2d ago" },
  { name: "TechPulse IT Solutions", plan: "Pro", contacts: 891, mrr: "R 2,499", status: "Active", ai: "✅ Autopilot", lastActive: "3d ago" },
  { name: "Bright Spark Electrical", plan: "Starter", contacts: 89, mrr: "R 899", status: "Trial", ai: "❌ Off", lastActive: "5d ago" },
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

export default function AgencyOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Agency Overview
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">SME Connect Agency</p>
        </div>
        <Link
          href="/agency/locations"
          className="flex items-center gap-2 px-4 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Sub-Account
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Sub-Accounts", value: "12", delta: "+2 this month", color: "text-green-600" },
          { label: "Total Contacts", value: "28,450", delta: "+1,240", color: "text-[#009B87]" },
          { label: "Monthly Revenue", value: "R 284,500", delta: "+18%", color: "text-green-600" },
          { label: "Active Workflows", value: "89", delta: "+12", color: "text-[#009B87]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {stat.value}
            </p>
            <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${stat.color}`}>
              <ArrowUpRight className="w-3 h-3" />
              {stat.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Sub-accounts table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Sub-Accounts
          </h2>
          <Link href="/agency/locations" className="text-xs text-[#009B87] font-semibold flex items-center gap-1 hover:underline">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                {["Name", "Plan", "Contacts", "MRR", "Status", "AI Agent", "Last Active", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {ACCOUNTS.map((a) => (
                <tr key={a.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_BADGE[a.plan]}`}>
                      {a.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{a.contacts.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{a.mrr}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{a.ai}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{a.lastActive}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href="/dashboard"
                        className="px-3 py-1 bg-[#009B87] text-white text-xs font-semibold rounded-lg hover:bg-[#007f6e] transition-colors"
                      >
                        Enter
                      </Link>
                      <button className="p-1 rounded-lg text-[#9CA3AF] hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
          Showing 8 of 12 sub-accounts
        </div>
      </div>

      {/* AI Revenue strip */}
      <div className="bg-gradient-to-r from-[#009B87] to-[#39B54A] rounded-xl p-5 flex items-center justify-between">
        <p className="text-white font-semibold">
          Agency AI is generating value across <span className="font-black">9 active sub-accounts</span>
        </p>
        <Link
          href="/agency/audit-logs"
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          View AI Report →
        </Link>
      </div>
    </div>
  );
}
