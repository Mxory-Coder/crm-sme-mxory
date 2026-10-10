"use client";

import { useState } from "react";
import { Plus, Calendar, Sparkles, MessageSquare } from "lucide-react";

const PLATFORMS = ["All", "Facebook", "Instagram", "WhatsApp"];

const WEEK_DAYS = [
  { label: "Mon", date: "Jun 22" },
  { label: "Tue", date: "Jun 23" },
  { label: "Wed", date: "Jun 24" },
  { label: "Thu", date: "Jun 25" },
  { label: "Fri", date: "Jun 26" },
  { label: "Sat", date: "Jun 27" },
  { label: "Sun", date: "Jun 28" },
];

const WEEK_POSTS: Record<number, { caption: string; platform: string; color: string }[]> = {
  0: [
    { caption: "Exciting news for SMEs!", platform: "Facebook", color: "bg-blue-100 text-blue-700" },
    { caption: "Tips for business growth", platform: "Instagram", color: "bg-pink-100 text-pink-700" },
  ],
  2: [
    { caption: "New feature alert 🚀", platform: "WhatsApp", color: "bg-green-100 text-green-700" },
  ],
  4: [
    { caption: "Weekend offer: 20% off", platform: "Facebook", color: "bg-blue-100 text-blue-700" },
    { caption: "Client success story", platform: "Instagram", color: "bg-pink-100 text-pink-700" },
  ],
  6: [
    { caption: "Weekly wrap-up", platform: "WhatsApp", color: "bg-green-100 text-green-700" },
  ],
};

const SCHEDULED_POSTS = [
  { caption: "Exciting news for SMEs! We're launching...", platform: "Facebook", datetime: "Jun 22 · 9:00 AM", status: "Scheduled" },
  { caption: "Tips for business growth in 2026", platform: "Instagram", datetime: "Jun 22 · 11:00 AM", status: "Scheduled" },
  { caption: "New feature alert — check out our CRM update", platform: "WhatsApp", datetime: "Jun 24 · 2:00 PM", status: "Scheduled" },
  { caption: "Weekend offer: 20% off all packages", platform: "Facebook", datetime: "Jun 26 · 8:00 AM", status: "Published" },
  { caption: "Weekly wrap-up — great week for SMEs!", platform: "WhatsApp", datetime: "Jun 21 · 4:00 PM", status: "Failed" },
];

const STATUS_BADGE: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-700",
  Published: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-700",
};

export default function SocialPage() {
  const [caption, setCaption] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Social Planner
        </h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] bg-white text-sm text-gray-700 rounded-lg hover:bg-gray-50">
            <Plus className="w-4 h-4" /> New Post
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
            <Calendar className="w-4 h-4" /> Schedule Post
          </button>
        </div>
      </div>

      {/* AI Caption Strip */}
      <div className="bg-[#F4F9F9] rounded-xl p-4 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-[#009B87] shrink-0" />
        <span className="text-sm font-medium text-gray-700 shrink-0">AI Caption Generator</span>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Describe your post..."
          className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87]"
        />
        <button className="flex items-center gap-2 px-4 py-1.5 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg shrink-0">
          <Sparkles className="w-4 h-4" /> Generate with AI
        </button>
      </div>

      {/* Platform Filter */}
      <div className="flex gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => setActiveFilter(p)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${
              activeFilter === p
                ? "bg-[#009B87] text-white border-[#009B87]"
                : "bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Week Calendar Grid */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#E5E7EB]">
          {WEEK_DAYS.map((d, i) => (
            <div key={i} className="px-2 py-3 border-r border-[#E5E7EB] last:border-r-0">
              <p className="text-xs font-semibold text-[#6B7280] uppercase">{d.label}</p>
              <p className="text-xs text-gray-900 font-medium">{d.date}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {WEEK_DAYS.map((_, i) => {
            const posts = WEEK_POSTS[i] ?? [];
            return (
              <div key={i} className="h-40 border-r border-[#E5E7EB] last:border-r-0 p-2 space-y-1.5">
                {posts.map((post, pi) => (
                  <div key={pi} className={`rounded-lg p-1.5 text-[10px] font-medium flex items-start gap-1 ${post.color}`}>
                    <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{post.caption}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Posts */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Scheduled Posts</h2>
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Caption</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Platform</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Scheduled</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULED_POSTS.map((p, i) => (
                <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#6B7280] shrink-0" />
                      <span className="text-sm text-gray-900 truncate max-w-xs">{p.caption}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{p.platform}</td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{p.datetime}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGE[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
