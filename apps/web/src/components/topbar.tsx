"use client";

import { Bell, Search, Sparkles, Plus } from "lucide-react";

export default function TopBar({ title }: { title?: string }) {
  return (
    <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-6 gap-4 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search contacts, conversations..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-[#F4F9F9] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87] placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Ask AI */}
        <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#009B87] to-[#39B54A] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
          <Sparkles className="w-4 h-4" />
          Ask AI
        </button>

        {/* Quick add */}
        <button className="w-9 h-9 flex items-center justify-center bg-[#009B87] text-white rounded-lg hover:bg-[#007A6C] transition-colors">
          <Plus className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#39B54A] rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
}
