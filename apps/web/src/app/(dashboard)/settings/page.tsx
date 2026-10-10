"use client";

import { useState } from "react";
import { Clock, Upload, UserPlus } from "lucide-react";

const NAV_ITEMS = [
  "General",
  "Branding",
  "Team",
  "Integrations",
  "Phone & SMS",
  "Billing",
  "API Keys",
  "Notifications",
];

const TEAM_MEMBERS = [
  { name: "Sipho Mthembu", email: "sipho@smeconnect.co.za", role: "Admin", status: "Active", lastActive: "Today" },
  { name: "Priya Naidoo", email: "priya@smeconnect.co.za", role: "Manager", status: "Active", lastActive: "Yesterday" },
  { name: "James van Berg", email: "james@smeconnect.co.za", role: "Agent", status: "Active", lastActive: "Jun 20" },
  { name: "Thandi Dube", email: "thandi@smeconnect.co.za", role: "Agent", status: "Inactive", lastActive: "Jun 10" },
];

const ROLE_BADGE: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700",
  Manager: "bg-blue-100 text-blue-700",
  Agent: "bg-gray-100 text-gray-600",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [hidePoweredBy, setHidePoweredBy] = useState(false);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
        Settings
      </h1>

      <div className="flex gap-6">
        {/* Left Nav */}
        <div className="w-48 shrink-0">
          <nav className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-l-4 ${
                  activeTab === item
                    ? "border-[#009B87] bg-[#F4F9F9] text-[#009B87] font-semibold"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white border border-[#E5E7EB] rounded-xl p-6">
          {/* General */}
          {activeTab === "General" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">General Settings</h2>
              <div className="space-y-4">
                {[
                  { label: "Business Name", defaultValue: "SME Connect Demo", type: "text" },
                  { label: "Business Email", defaultValue: "hello@smeconnect.co.za", type: "email" },
                  { label: "Phone", defaultValue: "+27 11 123 4567", type: "tel" },
                  { label: "Website", defaultValue: "https://smeconnect.co.za", type: "url" },
                  { label: "Address", defaultValue: "123 Innovation Hub, Sandton, Johannesburg", type: "text" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-[#6B7280] block mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      defaultValue={f.defaultValue}
                      className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87]"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-[#6B7280] block mb-1">Timezone</label>
                  <select className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87] bg-white" defaultValue="Africa/Johannesburg">
                    <option value="Africa/Johannesburg">Africa/Johannesburg (SAST +02:00)</option>
                    <option value="Africa/Cape_Town">Africa/Cape_Town (SAST +02:00)</option>
                    <option value="UTC">UTC +00:00</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280] block mb-1">Language</label>
                  <select className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87] bg-white">
                    <option>English</option>
                    <option>Afrikaans</option>
                    <option>Zulu</option>
                    <option>Xhosa</option>
                  </select>
                </div>
              </div>
              <button className="px-5 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
                Save Changes
              </button>
            </div>
          )}

          {/* Branding */}
          {activeTab === "Branding" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Branding</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#6B7280] block mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" defaultValue="#009B87" className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer" />
                    <input type="text" defaultValue="#009B87" className="w-28 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280] block mb-1">Logo</label>
                  <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#009B87]/50 transition-colors">
                    <Upload className="w-6 h-6 text-[#9CA3AF]" />
                    <p className="text-sm text-[#6B7280]">Click or drag logo here</p>
                    <p className="text-xs text-[#9CA3AF]">PNG, SVG up to 2MB</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280] block mb-1">Platform Name</label>
                  <input type="text" defaultValue="SME Connect" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280] block mb-1">Custom Domain</label>
                  <input type="text" defaultValue="app.smeconnect.co.za" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87]" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Hide Powered By</p>
                    <p className="text-xs text-[#6B7280]">Remove "Powered by SME Connect" label</p>
                  </div>
                  <button
                    onClick={() => setHidePoweredBy(!hidePoweredBy)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${hidePoweredBy ? "bg-[#009B87]" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${hidePoweredBy ? "left-5.5" : "left-0.5"}`} style={{ left: hidePoweredBy ? "22px" : "2px" }} />
                  </button>
                </div>
              </div>
              <button className="px-5 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
                Save Branding
              </button>
            </div>
          )}

          {/* Team */}
          {activeTab === "Team" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Team Members</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
                  <UserPlus className="w-4 h-4" /> Invite Member
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">Name</th>
                    <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">Email</th>
                    <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">Role</th>
                    <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">Status</th>
                    <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {TEAM_MEMBERS.map((m, i) => (
                    <tr key={i} className="border-b border-[#F3F4F6]">
                      <td className="py-3 font-medium text-gray-900">{m.name}</td>
                      <td className="py-3 text-[#6B7280] text-xs">{m.email}</td>
                      <td className="py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[m.role]}`}>{m.role}</span>
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#6B7280] text-xs">{m.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Coming Soon for other tabs */}
          {!["General", "Branding", "Team"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 bg-[#F4F9F9] rounded-full flex items-center justify-center">
                <Clock className="w-7 h-7 text-[#009B87]" />
              </div>
              <p className="text-sm font-medium text-gray-900">{activeTab}</p>
              <p className="text-xs text-[#6B7280]">This section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
