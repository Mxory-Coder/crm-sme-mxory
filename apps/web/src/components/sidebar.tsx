"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, Users, TrendingUp, Zap,
  Calendar, FileText, CreditCard, Globe, Share2, BookOpen,
  Star, BarChart2, Settings, ChevronDown, Building2, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Conversations", href: "/conversations", icon: MessageSquare, badge: 12 },
  { label: "Contacts", href: "/contacts", icon: Users },
  {
    label: "Opportunities", href: "/opportunities", icon: TrendingUp,
  },
  { label: "Automation", href: "/automation", icon: Zap },
  { label: "Calendars", href: "/calendars", icon: Calendar },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Sites & Funnels", href: "/sites", icon: Globe },
  { label: "Social Planner", href: "/social", icon: Share2 },
  { label: "Memberships", href: "/memberships", icon: BookOpen },
  { label: "Reputation", href: "/reputation", icon: Star },
  { label: "Reporting", href: "/reporting", icon: BarChart2 },
  { label: "Documents", href: "/documents", icon: FileText },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-[240px] shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col h-full">
      {/* Agency View switcher */}
      <Link href="/agency" className="flex items-center gap-2 mx-3 mt-3 mb-1 px-3 py-2 bg-[#009B87]/8 border border-[#009B87]/20 rounded-lg hover:bg-[#009B87]/15 transition-colors">
        <Building2 className="w-4 h-4 text-[#009B87]" />
        <span className="text-xs font-semibold text-[#009B87]">Agency View</span>
        <ChevronRight className="w-3 h-3 text-[#009B87] ml-auto" />
      </Link>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#E5E7EB]">
        <div className="w-9 h-9 rounded-xl bg-[#009B87] flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-[15px] text-gray-900 leading-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
            sme connect
          </p>
          <p className="text-[10px] text-[#6B7280] tracking-wide uppercase">Online Directory</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active = path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-[#009B87]/12 border-l-[3px] border-[#009B87] text-[#009B87] font-semibold"
                  : "text-[#4B5563] hover:bg-[#009B87]/6 hover:text-[#009B87] border-l-[3px] border-transparent"
              )}
            >
              <item.icon className={cn("w-4.5 h-4.5 shrink-0", active ? "text-[#009B87]" : "text-[#9CA3AF]")} style={{ width: 18, height: 18 }} />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="text-[10px] bg-[#009B87] text-white rounded-full px-1.5 py-0.5 font-bold">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#E5E7EB] p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            path.startsWith("/settings")
              ? "bg-[#009B87]/12 text-[#009B87] font-semibold"
              : "text-[#4B5563] hover:bg-gray-50"
          )}
        >
          <Settings style={{ width: 18, height: 18 }} className="text-[#9CA3AF]" />
          Settings
        </Link>

        {/* User avatar */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#009B87] to-[#39B54A] flex items-center justify-center text-white text-xs font-bold">
            SN
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Siphelele</p>
            <p className="text-xs text-[#6B7280] truncate">Agency Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0" />
        </div>
      </div>
    </aside>
  );
}
