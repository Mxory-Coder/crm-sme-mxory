import { Download, AlertTriangle, Search } from "lucide-react";

const LOGS = [
  { time: "2026-06-22 14:32", user: "Siphelele Ngxishe", action: "Published workflow", actionType: "create", entity: "Follow-up Sequence", location: "Cape Plumbing Co", ip: "197.221.14.88" },
  { time: "2026-06-22 13:15", user: "Thabo Mokoena", action: "User login", actionType: "auth", entity: "Session", location: "Agency", ip: "196.35.88.102" },
  { time: "2026-06-22 12:44", user: "Sarah van der Berg", action: "Contact deleted", actionType: "delete", entity: "Contact #4421", location: "Apex Dental", ip: "41.63.220.15" },
  { time: "2026-06-22 12:43", user: "Sarah van der Berg", action: "Contact deleted", actionType: "delete", entity: "Contact #4420", location: "Apex Dental", ip: "41.63.220.15" },
  { time: "2026-06-22 12:42", user: "Sarah van der Berg", action: "Contact deleted", actionType: "delete", entity: "Contact #4419", location: "Apex Dental", ip: "41.63.220.15" },
  { time: "2026-06-22 11:58", user: "Siphelele Ngxishe", action: "Settings updated", actionType: "update", entity: "White Label Config", location: "Agency", ip: "197.221.14.88" },
  { time: "2026-06-22 10:30", user: "Siphelele Ngxishe", action: "Snapshot deployed", actionType: "create", entity: "Plumbing Starter Pack", location: "Bright Spark Electrical", ip: "197.221.14.88" },
  { time: "2026-06-22 09:15", user: "Thabo Mokoena", action: "Billing plan updated", actionType: "update", entity: "Pro → Agency Plan", location: "Skyline Developments", ip: "196.35.88.102" },
  { time: "2026-06-21 17:44", user: "Sarah van der Berg", action: "Viewed contacts list", actionType: "view", entity: "Contacts", location: "TechPulse IT Solutions", ip: "196.44.12.77" },
  { time: "2026-06-21 16:02", user: "Siphelele Ngxishe", action: "API key generated", actionType: "create", entity: "Production Key", location: "Agency", ip: "197.221.14.88" },
  { time: "2026-06-21 14:20", user: "Thabo Mokoena", action: "Team member invited", actionType: "create", entity: "lungelo@apexdental.co.za", location: "Apex Dental", ip: "196.35.88.102" },
  { time: "2026-06-21 11:05", user: "System", action: "Failed login attempt", actionType: "auth", entity: "Session", location: "Agency", ip: "41.99.45.233" },
];

const ACTION_BADGE: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  view: "bg-gray-100 text-gray-600",
  auth: "bg-amber-100 text-amber-700",
};

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Audit Logs
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] bg-white text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* AI anomaly strip */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            AI detected an unusual pattern: <strong>3 bulk contact deletions</strong> in the last hour from IP <strong>41.63.220.15</strong>
          </p>
        </div>
        <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors shrink-0">
          Investigate
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {["Last 7d", "Last 30d", "Last 90d"].map((d, i) => (
            <button
              key={d}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${i === 0 ? "bg-[#009B87] text-white" : "border border-[#E5E7EB] bg-white text-gray-600 hover:border-[#009B87] hover:text-[#009B87]"}`}
            >
              {d}
            </button>
          ))}
        </div>
        <select className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-[#009B87] text-gray-700">
          <option>All Users</option>
          <option>Siphelele Ngxishe</option>
          <option>Thabo Mokoena</option>
          <option>Sarah van der Berg</option>
          <option>System</option>
        </select>
        <select className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-[#009B87] text-gray-700">
          <option>All Actions</option>
          <option>Contact</option>
          <option>Workflow</option>
          <option>Settings</option>
          <option>Auth</option>
          <option>Billing</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E5E7EB]">
              {["Timestamp", "User", "Action", "Entity", "Location", "IP Address"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {LOGS.map((log, i) => (
              <tr key={i} className={`hover:bg-gray-50 ${log.actionType === "delete" && log.ip === "41.63.220.15" ? "bg-red-50/50" : ""}`}>
                <td className="px-4 py-3 font-mono text-xs text-[#6B7280] whitespace-nowrap">{log.time}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{log.user}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ACTION_BADGE[log.actionType]}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6B7280] text-xs">{log.entity}</td>
                <td className="px-4 py-3 text-[#6B7280] text-xs">{log.location}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#9CA3AF]">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
