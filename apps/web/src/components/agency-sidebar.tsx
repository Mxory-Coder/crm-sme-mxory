"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, Copy, Search,
  Paintbrush, CreditCard, Shield, Settings, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", href: "/agency", icon: LayoutDashboard },
  { label: "Sub-Accounts", href: "/agency/locations", icon: Building2, badge: "12" },
  { label: "Team", href: "/agency/team", icon: Users },
  { label: "Snapshots", href: "/agency/snapshots", icon: Copy },
  { label: "Prospecting", href: "/agency/prospecting", icon: Search },
  { label: "White Label", href: "/agency/white-label", icon: Paintbrush },
  { label: "Billing", href: "/agency/billing", icon: CreditCard },
  { label: "Audit Logs", href: "/agency/audit-logs", icon: Shield },
];

export default function AgencySidebar() {
  const path = usePathname();

  return (
    <aside className="w-[240px] shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col h-full">
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

      {/* Agency View badge */}
      <div className="px-4 pt-3 pb-1">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#009B87] text-white text-xs font-semibold tracking-wide">
          Agency View
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active =
            item.href === "/agency"
              ? path === "/agency"
              : path.startsWith(item.href);
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
              <item.icon
                className={cn("shrink-0", active ? "text-[#009B87]" : "text-[#9CA3AF]")}
                style={{ width: 18, height: 18 }}
              />
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
          href="/agency/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            path.startsWith("/agency/settings")
              ? "bg-[#009B87]/12 text-[#009B87] font-semibold"
              : "text-[#4B5563] hover:bg-gray-50"
          )}
        >
          <Settings style={{ width: 18, height: 18 }} className="text-[#9CA3AF]" />
          Settings
        </Link>

        {/* User chip */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#009B87] to-[#39B54A] flex items-center justify-center text-white text-xs font-bold">
            SN
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Siphelele</p>
            <p className="text-xs text-[#6B7280] truncate">Agency Owner</p>
          </div>
          <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0" />
        </div>
      </div>
    </aside>
  );
}
