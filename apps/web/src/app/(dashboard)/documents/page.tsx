import { Plus, Eye, Send, Copy, FileText, FileCheck, Clock, AlertCircle } from "lucide-react";

const DOCUMENTS = [
  { name: "Service Agreement 2026", type: "Contract", contact: "Thandi Mokoena", status: "Signed", date: "Jun 1, 2026", value: 45000 },
  { name: "Marketing Proposal Q3", type: "Proposal", contact: "Sipho Dlamini", status: "Sent", date: "Jun 5, 2026", value: 12500 },
  { name: "Software Quote #204", type: "Quote", contact: "Priya Naidoo", status: "Awaiting", date: "Jun 8, 2026", value: 8900 },
  { name: "Consulting Agreement", type: "Contract", contact: "James van der Berg", status: "Signed", date: "May 28, 2026", value: 32000 },
  { name: "Web Design Proposal", type: "Proposal", contact: "Nomsa Zulu", status: "Draft", date: "—", value: 18000 },
  { name: "Annual Retainer 2025", type: "Contract", contact: "Fatima Kader", status: "Expired", date: "Jan 15, 2026", value: 96000 },
  { name: "CRM Onboarding Quote", type: "Quote", contact: "Lungelo Mthembu", status: "Signed", date: "Jun 10, 2026", value: 5400 },
  { name: "Brand Strategy Deck", type: "Proposal", contact: "Keanu Patel", status: "Sent", date: "Jun 14, 2026", value: 22000 },
];

const STATUS_STYLES: Record<string, string> = {
  Signed: "bg-green-100 text-green-700",
  Sent: "bg-blue-100 text-blue-700",
  Draft: "bg-gray-100 text-gray-500",
  Expired: "bg-red-100 text-red-700",
  Awaiting: "bg-amber-100 text-amber-700",
};

const TYPE_COLORS: Record<string, string> = {
  Contract: "bg-purple-100 text-purple-700",
  Proposal: "bg-blue-100 text-blue-700",
  Quote: "bg-amber-100 text-amber-700",
};

export default function DocumentsPage() {
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Documents
        </h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] bg-white text-sm text-gray-700 rounded-lg hover:bg-gray-50">
            <Plus className="w-4 h-4" /> New Document
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
            <Plus className="w-4 h-4" /> New Contract
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Sent", value: 34, icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Signed", value: 28, icon: FileCheck, color: "text-green-600", bg: "bg-green-50" },
          { label: "Awaiting", value: 6, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Expired", value: 2, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
              <p className="text-xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Sent Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Value</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {DOCUMENTS.map((d, i) => (
              <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#6B7280]" />
                    <span className="font-medium text-gray-900 text-sm">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[d.type]}`}>{d.type}</span>
                </td>
                <td className="px-4 py-3 text-[#6B7280] text-sm">{d.contact}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[d.status]}`}>{d.status}</span>
                </td>
                <td className="px-4 py-3 text-[#6B7280] text-xs">{d.date}</td>
                <td className="px-4 py-3 font-semibold text-gray-900 text-sm">R {d.value.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg" title="View">
                      <Eye className="w-4 h-4 text-[#6B7280]" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg" title="Send">
                      <Send className="w-4 h-4 text-[#6B7280]" />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg" title="Copy">
                      <Copy className="w-4 h-4 text-[#6B7280]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
