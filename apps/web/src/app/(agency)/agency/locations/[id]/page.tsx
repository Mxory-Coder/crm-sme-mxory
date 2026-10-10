"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ExternalLink, Mail, Phone, Globe, MapPin, Clock, Bot, ChevronRight, Plus } from "lucide-react";

const TABS = ["Overview", "Team", "Billing", "Settings"];

const TEAM = [
  { name: "Siphelele Ngxishe", email: "siphelelengxishe16@gmail.com", role: "Location Owner", status: "Active", last: "Now" },
  { name: "Thabo Mokoena", email: "thabo@capeplumbing.co.za", role: "Admin", status: "Active", last: "2h ago" },
  { name: "Sarah Joubert", email: "sarah@capeplumbing.co.za", role: "User", status: "Active", last: "1d ago" },
  { name: "Mark Williams", email: "mark@capeplumbing.co.za", role: "User", status: "Invited", last: "—" },
];

const ACTIVITY = [
  { icon: "👤", text: "New contact: John Smith added via website form", time: "2 min ago", color: "bg-blue-50 text-blue-600" },
  { icon: "⚡", text: "Contact enrolled in 'New Lead Follow-up' workflow", time: "15 min ago", color: "bg-purple-50 text-purple-600" },
  { icon: "📅", text: "Appointment booked: Plumbing inspection — Thu 26 Jun", time: "1h ago", color: "bg-green-50 text-green-600" },
  { icon: "💳", text: "Payment received: R 1,850 from Michael De Beer", time: "3h ago", color: "bg-[#009B87]/5 text-[#009B87]" },
  { icon: "🤖", text: "AI Agent Sam handled conversation — closed as resolved", time: "5h ago", color: "bg-amber-50 text-amber-600" },
];

const INVOICES = [
  { date: "Jun 2026", inv: "INV-0842", amount: "R 2,499", status: "Paid" },
  { date: "May 2026", inv: "INV-0819", amount: "R 2,499", status: "Paid" },
  { date: "Apr 2026", inv: "INV-0795", amount: "R 2,499", status: "Paid" },
];

export default function LocationDetailPage() {
  const [tab, setTab] = useState("Overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/agency/locations" className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Cape Plumbing Co
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
            </div>
            <p className="text-xs text-[#6B7280]">Cape Town, WC · Pro Plan</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Enter Account
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E5E7EB]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-[#009B87] text-[#009B87]"
                : "border-transparent text-[#6B7280] hover:text-gray-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "Overview" && (
        <div className="grid grid-cols-3 gap-6">
          {/* Left: business info */}
          <div className="col-span-1 space-y-4">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>Business Info</h3>
              {[
                { icon: Mail, label: "Email", value: "info@capeplumbing.co.za" },
                { icon: Phone, label: "Phone", value: "+27 21 555 0123" },
                { icon: Globe, label: "Website", value: "capeplumbing.co.za" },
                { icon: MapPin, label: "Address", value: "12 Buitenkant St, Cape Town" },
                { icon: Clock, label: "Timezone", value: "Africa/Johannesburg" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-[#9CA3AF] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">Plan</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#009B87]/10 text-[#009B87] mt-1 inline-block">Pro</span>
              </div>
            </div>

            {/* AI Agent card */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-[#009B87]" />
                <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>AI Agent</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Name</span>
                  <span className="font-semibold text-gray-900">Sam</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Mode</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Autopilot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Last message</span>
                  <span className="font-medium text-gray-800">2 min ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">KB entries</span>
                  <span className="font-medium text-gray-800">67</span>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="mt-3 flex items-center justify-center gap-1 w-full py-2 border border-[#009B87] text-[#009B87] text-xs font-semibold rounded-lg hover:bg-[#009B87]/5 transition-colors"
              >
                View Agent <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Right: KPIs + activity */}
          <div className="col-span-2 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Contacts", value: "842" },
                { label: "Active Workflows", value: "12" },
                { label: "Conversations", value: "234" },
                { label: "MRR", value: "R 2,499" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>{kpi.value}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Recent Activity</h3>
              <div className="space-y-3">
                {ACTIVITY.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{item.text}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team tab */}
      {tab === "Team" && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Team Members</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
              <Plus className="w-4 h-4" />
              Invite to Location
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                {["Name", "Email", "Role", "Status", "Last Active", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {TEAM.map((member) => (
                <tr key={member.email} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{member.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${member.role === "Location Owner" ? "bg-purple-100 text-purple-700" : member.role === "Admin" ? "bg-[#009B87]/10 text-[#009B87]" : "bg-gray-100 text-gray-600"}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${member.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{member.last}</td>
                  <td className="px-4 py-3">
                    {member.role !== "Location Owner" && (
                      <div className="flex gap-2">
                        <button className="text-xs text-[#009B87] font-semibold hover:underline">Edit</button>
                        <button className="text-xs text-red-500 font-semibold hover:underline">Remove</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing tab */}
      {tab === "Billing" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Plan card */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Current Plan</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#009B87]/10 text-[#009B87]">Pro</span>
              </div>
              <p className="text-3xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>R 2,499<span className="text-sm font-normal text-[#6B7280]">/mo</span></p>
              <p className="text-sm text-[#6B7280]">Next billing: <span className="font-semibold text-gray-800">Jul 22, 2026</span></p>
              <p className="text-sm text-[#6B7280]">Payment: <span className="font-semibold text-gray-800">Visa ending 4242</span></p>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 border border-[#009B87] text-[#009B87] text-sm font-semibold rounded-lg hover:bg-[#009B87]/5 transition-colors">Change Plan</button>
                <button className="flex-1 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors">Cancel</button>
              </div>
            </div>

            {/* Usage */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Usage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#6B7280]">SMS Credits</span>
                    <span className="font-semibold text-gray-800">1,240 / 5,000</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#009B87] rounded-full" style={{ width: "24.8%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#6B7280]">Storage</span>
                    <span className="font-semibold text-gray-800">2.1 GB / 10 GB</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#39B54A] rounded-full" style={{ width: "21%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Invoice History</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                  {["Date", "Invoice #", "Amount", "Status", "Download"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {INVOICES.map((inv) => (
                  <tr key={inv.inv} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{inv.date}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{inv.inv}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{inv.amount}</td>
                    <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{inv.status}</span></td>
                    <td className="px-4 py-3"><button className="text-[#009B87] hover:underline text-xs font-semibold">↓ PDF</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings tab */}
      {tab === "Settings" && (
        <div className="space-y-6 max-w-xl">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Business Settings</h3>
            {[
              { label: "Business Name", value: "Cape Plumbing Co" },
              { label: "Phone", value: "+27 21 555 0123" },
              { label: "Website", value: "capeplumbing.co.za" },
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
            <button className="w-full py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
              Save Changes
            </button>
          </div>

          <div className="bg-white border border-red-200 rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-red-700" style={{ fontFamily: "Montserrat, sans-serif" }}>Danger Zone</h3>
            <p className="text-sm text-[#6B7280]">These actions are irreversible. Please be certain before proceeding.</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-amber-400 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                Suspend Account
              </button>
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
