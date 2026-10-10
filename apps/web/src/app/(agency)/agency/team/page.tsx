"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const AGENCY_STAFF = [
  { name: "Siphelele Ngxishe", email: "siphelelengxishe16@gmail.com", type: "Agency Owner", locations: "All", last: "Now", owner: true },
  { name: "Thabo Mokoena", email: "thabo@smeconnect.co.za", type: "Agency Admin", locations: "All", last: "1h ago", owner: false },
  { name: "Sarah van der Berg", email: "sarah@smeconnect.co.za", type: "Agency User", locations: "5 locations", last: "3h ago", owner: false },
];

const RECENT_ADDED = [
  { name: "Lungelo Dlamini", location: "Apex Dental", role: "Admin", added: "Today" },
  { name: "Priya Naidoo", location: "TechPulse IT Solutions", role: "User", added: "Yesterday" },
  { name: "Marco Ferreira", location: "Skyline Developments", role: "Admin", added: "3d ago" },
  { name: "Ayanda Khumalo", location: "Nomsa Beauty Studio", role: "User", added: "5d ago" },
];

const TYPE_BADGE: Record<string, string> = {
  "Agency Owner": "bg-purple-100 text-purple-700",
  "Agency Admin": "bg-[#009B87]/10 text-[#009B87]",
  "Agency User": "bg-gray-100 text-gray-600",
};

export default function TeamPage() {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Agency Team
        </h1>
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Agency-Level Staff */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Agency-Level Staff</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">Users with access to the agency portal</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E5E7EB]">
              {["Name", "Email", "User Type", "Locations Access", "Only Assigned Data", "Last Active", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {AGENCY_STAFF.map((member) => (
              <StaffRow key={member.email} member={member} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Recently Added to Sub-Accounts */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Recently Added to Sub-Accounts</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">Users added to individual locations</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E5E7EB]">
              {["Name", "Location", "Role", "Added", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {RECENT_ADDED.map((row) => (
              <tr key={row.name + row.location} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                <td className="px-4 py-3 text-[#6B7280]">{row.location}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.role === "Admin" ? "bg-[#009B87]/10 text-[#009B87]" : "bg-gray-100 text-gray-600"}`}>
                    {row.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6B7280]">{row.added}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-[#009B87] font-semibold hover:underline">Edit</button>
                    <button className="text-xs text-red-500 font-semibold hover:underline">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Invite Team Member</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Email</label>
                <input placeholder="colleague@example.com" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Role</label>
                <select className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87] bg-white">
                  <option>Agency Admin</option>
                  <option>Agency User</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setInviteOpen(false)} className="flex-1 py-2 border border-[#E5E7EB] text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => setInviteOpen(false)} className="flex-1 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffRow({ member }: { member: typeof AGENCY_STAFF[number] }) {
  const [onlyAssigned, setOnlyAssigned] = useState(false);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
      <td className="px-4 py-3 text-[#6B7280]">{member.email}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          member.type === "Agency Owner" ? "bg-purple-100 text-purple-700" :
          member.type === "Agency Admin" ? "bg-[#009B87]/10 text-[#009B87]" :
          "bg-gray-100 text-gray-600"
        }`}>
          {member.type}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-700">{member.locations}</td>
      <td className="px-4 py-3">
        {!member.owner && (
          <button
            onClick={() => setOnlyAssigned(!onlyAssigned)}
            className={`relative w-10 h-5 rounded-full transition-colors ${onlyAssigned ? "bg-amber-400" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${onlyAssigned ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        )}
      </td>
      <td className="px-4 py-3 text-[#6B7280]">{member.last}</td>
      <td className="px-4 py-3">
        {!member.owner && (
          <div className="flex gap-2">
            <button className="text-xs text-[#009B87] font-semibold hover:underline">Edit</button>
            <button className="text-xs text-red-500 font-semibold hover:underline">Remove</button>
          </div>
        )}
      </td>
    </tr>
  );
}
