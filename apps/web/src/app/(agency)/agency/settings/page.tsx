"use client";

import { useState } from "react";
import { Eye, EyeOff, Plus, Trash2, AlertTriangle } from "lucide-react";

const LEFT_NAV = ["General", "Security", "Integrations", "API Keys", "Notifications", "Danger Zone"];

const API_KEYS = [
  { name: "Production Key", prefix: "sk-sme-prod-****", created: "Jan 15, 2026", last: "2 min ago" },
  { name: "Development Key", prefix: "sk-sme-dev-****", created: "Mar 3, 2026", last: "5d ago" },
];

export default function AgencySettingsPage() {
  const [section, setSection] = useState("General");
  const [showKey, setShowKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Agency Settings
        </h1>
      </div>

      <div className="flex gap-6">
        {/* Left nav */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {LEFT_NAV.map((item) => (
              <button
                key={item}
                onClick={() => setSection(item)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  section === item
                    ? "bg-[#009B87]/10 text-[#009B87] font-semibold"
                    : "text-[#4B5563] hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-lg">
          {section === "General" && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>General Settings</h2>
              {[
                { label: "Agency Name", value: "SME Connect Agency" },
                { label: "Owner Email", value: "siphelelengxishe16@gmail.com" },
                { label: "Phone", value: "+27 82 555 0100" },
                { label: "Business Address", value: "Cape Town, Western Cape, South Africa" },
                { label: "Country", value: "South Africa" },
                { label: "Timezone", value: "Africa/Johannesburg" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">{field.label}</label>
                  <input
                    defaultValue={field.value}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]"
                  />
                </div>
              ))}
              <button className="w-full py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors mt-2">
                Save Changes
              </button>
            </div>
          )}

          {section === "Security" && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Security</h2>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]" />
              </div>
              <div className="pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p>
                    <p className="text-xs text-[#6B7280]">Add an extra layer of security</p>
                  </div>
                  <button className="px-3 py-1.5 border border-[#009B87] text-[#009B87] text-xs font-semibold rounded-lg hover:bg-[#009B87]/5 transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
              <button className="w-full py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
                Update Password
              </button>
            </div>
          )}

          {section === "Integrations" && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Integrations</h2>
              {[
                { name: "SendGrid", desc: "Email delivery service", connected: true },
                { name: "Stripe", desc: "Payment processing", connected: true },
                { name: "Twilio", desc: "SMS & voice", connected: false },
                { name: "Google Workspace", desc: "Calendar & email sync", connected: false },
              ].map((int) => (
                <div key={int.name} className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{int.name}</p>
                    <p className="text-xs text-[#6B7280]">{int.desc}</p>
                  </div>
                  <button className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${int.connected ? "bg-green-100 text-green-700 hover:bg-green-200" : "border border-[#009B87] text-[#009B87] hover:bg-[#009B87]/5"}`}>
                    {int.connected ? "Connected" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {section === "API Keys" && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium">Never share your API keys. They provide full agency-level access to your account.</p>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                  <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Your API Keys</h2>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-[#009B87] text-white text-xs font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Generate New Key
                  </button>
                </div>
                <div className="divide-y divide-[#E5E7EB]">
                  {API_KEYS.map((key) => (
                    <div key={key.name} className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{key.name}</p>
                        <p className="font-mono text-xs text-[#6B7280] mt-0.5">
                          {showKey === key.name ? "sk-sme-prod-a7f3b8c9d2e1f0a4b5c6d7e8f9a0b1c2" : key.prefix}
                        </p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">Created {key.created} · Last used {key.last}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowKey(showKey === key.name ? null : key.name)}
                          className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#9CA3AF] hover:bg-gray-50 transition-colors"
                        >
                          {showKey === key.name ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button className="p-1.5 rounded-lg border border-[#E5E7EB] text-red-400 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === "Notifications" && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Notification Preferences</h2>
              {[
                { label: "New sub-account registered", desc: "When someone signs up under your agency" },
                { label: "Failed payment", desc: "When a sub-account billing fails" },
                { label: "AI anomaly detected", desc: "Unusual patterns in account activity" },
                { label: "Weekly agency report", desc: "Summary of agency performance every Monday" },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-2 border-b border-[#E5E7EB] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{n.label}</p>
                    <p className="text-xs text-[#6B7280]">{n.desc}</p>
                  </div>
                  <button className="relative w-10 h-5 rounded-full bg-[#009B87]">
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              ))}
              <button className="w-full py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
                Save Preferences
              </button>
            </div>
          )}

          {section === "Danger Zone" && (
            <div className="bg-white border border-red-200 rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-red-700" style={{ fontFamily: "Montserrat, sans-serif" }}>Danger Zone</h2>
              <p className="text-sm text-[#6B7280]">These actions are permanent and cannot be undone. Please proceed with extreme caution.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg bg-red-50/50">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Delete All Sub-Account Data</p>
                    <p className="text-xs text-[#6B7280]">Permanently removes all contact and workflow data from all locations</p>
                  </div>
                  <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg bg-red-50/50">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Close Agency Account</p>
                    <p className="text-xs text-[#6B7280]">Permanently deletes your agency and all associated sub-accounts</p>
                  </div>
                  <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors">
                    Close Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
