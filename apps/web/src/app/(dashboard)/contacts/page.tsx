import { Search, Filter, Download, UserPlus, Phone, Mail, MoreHorizontal, Star } from "lucide-react";

const CONTACTS = [
  { name: "John Dlamini", email: "john@example.co.za", phone: "+27 61 524 5923", tags: ["hot-lead", "whatsapp"], stage: "Qualified", assigned: "SN", score: 82 },
  { name: "Sarah Molefe", email: "sarah@molefe.co.za", phone: "+27 72 344 8821", tags: ["vip"], stage: "Proposal Sent", assigned: "SN", score: 91 },
  { name: "Michael van Wyk", email: "mvw@gmail.com", phone: "+27 83 901 2234", tags: ["new-lead"], stage: "New Lead", assigned: "—", score: 34 },
  { name: "Nomsa Dube", email: "nomsa@dubeco.co.za", phone: "+27 76 123 4567", tags: ["client"], stage: "Won", assigned: "SN", score: 95 },
  { name: "Priya Singh", email: "priya@priyadesign.co.za", phone: "+27 82 556 7890", tags: ["proposal"], stage: "Negotiation", assigned: "SN", score: 67 },
  { name: "Thabo Nkosi", email: "thabo@nkosi.co.za", phone: "+27 79 234 5678", tags: ["cold"], stage: "Nurture", assigned: "—", score: 22 },
  { name: "AR Boards & Signs", email: "ar@arboards.co.za", phone: "+27 11 567 8901", tags: ["form-lead"], stage: "New Lead", assigned: "SN", score: 48 },
  { name: "Cape Plumbing Co", email: "info@capeplumbing.co.za", phone: "+27 21 234 5678", tags: ["client", "vip"], stage: "Won", assigned: "SN", score: 88 },
];

const TAG_COLORS: Record<string, string> = {
  "hot-lead": "bg-red-100 text-red-700",
  "whatsapp": "bg-green-100 text-green-700",
  "vip": "bg-purple-100 text-purple-700",
  "new-lead": "bg-blue-100 text-blue-700",
  "client": "bg-teal-100 text-[#009B87]",
  "proposal": "bg-orange-100 text-orange-700",
  "cold": "bg-gray-100 text-gray-600",
  "form-lead": "bg-amber-100 text-amber-700",
};

export default function ContactsPage() {
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Contacts
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">2,841 total contacts in your CRM</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] bg-white text-sm text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] bg-white text-sm text-gray-700 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
            <UserPlus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search contacts..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-10">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Tags</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">AI Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Assigned</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {CONTACTS.map((c, i) => (
              <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#009B87] to-[#39B54A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[#6B7280]">
                      <Mail className="w-3 h-3" />
                      <span className="text-xs">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#6B7280]">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs">{c.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[t] ?? "bg-gray-100 text-gray-600"}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-[#009B87]/10 text-[#009B87] px-2 py-1 rounded-full font-medium">
                    {c.stage}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: c.score >= 70 ? "#39B54A" : c.score >= 40 ? "#F59E0B" : "#EF4444" }}
                    >
                      {c.score}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-[#009B87] flex items-center justify-center text-white text-xs font-bold">
                    {c.assigned}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg">
                    <MoreHorizontal className="w-4 h-4 text-[#9CA3AF]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB]">
          <p className="text-xs text-[#6B7280]">Showing 8 of 2,841 contacts</p>
          <div className="flex items-center gap-1">
            {[1,2,3,"...",142].map((p, i) => (
              <button key={i} className={`w-7 h-7 text-xs rounded-lg font-medium ${p === 1 ? "bg-[#009B87] text-white" : "text-[#6B7280] hover:bg-gray-100"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
