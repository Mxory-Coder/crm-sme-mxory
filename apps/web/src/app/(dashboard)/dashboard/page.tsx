import {
  Users, MessageSquare, TrendingUp, Calendar,
  ArrowUpRight, ArrowDownRight, Sparkles, Phone, Mail, Star,
} from "lucide-react";

const KPI = [
  { label: "Total Contacts", value: "2,841", change: "+12.4%", up: true, icon: Users, color: "#009B87" },
  { label: "Open Conversations", value: "47", change: "+3", up: true, icon: MessageSquare, color: "#39B54A" },
  { label: "Pipeline Value", value: "R 1.24M", change: "+8.2%", up: true, icon: TrendingUp, color: "#009B87" },
  { label: "Appointments Today", value: "9", change: "-2", up: false, icon: Calendar, color: "#F59E0B" },
];

const ACTIVITY = [
  { name: "John Dlamini", action: "Replied via WhatsApp", time: "2m ago", icon: MessageSquare, color: "#25D366" },
  { name: "Sarah Molefe", action: "Booked discovery call", time: "8m ago", icon: Calendar, color: "#009B87" },
  { name: "AR Boards & Signs", action: "Form submitted", time: "15m ago", icon: Mail, color: "#F59E0B" },
  { name: "Cape Plumbing Co", action: "Left a 5-star review", time: "32m ago", icon: Star, color: "#EAB308" },
  { name: "Thabo Nkosi", action: "Missed call → SMS sent", time: "1h ago", icon: Phone, color: "#EF4444" },
];

const OPEN_DEALS = [
  { name: "Bathroom Renovation", contact: "John Dlamini", stage: "Qualified", value: "R 2,950", score: 82 },
  { name: "Office Fitout", contact: "Priya Singh", stage: "Proposal Sent", value: "R 45,000", score: 67 },
  { name: "Home Security Install", contact: "Michael van Wyk", stage: "New Lead", value: "R 8,500", score: 41 },
  { name: "Branding Package", contact: "Nomsa Dube", stage: "Negotiation", value: "R 12,000", score: 91 },
];

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#39B54A" : score >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
      style={{ background: color }}
    >
      {score}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden h-36">
        <div className="absolute inset-0 bg-gradient-to-r from-[#009B87] via-[#007A6C] to-[#005C55]" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #39B54A 0%, transparent 60%)" }}
        />
        <div className="relative z-10 p-6 flex items-center justify-between h-full">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
              Good morning, Siphelele 👋
            </h1>
            <p className="text-teal-100 text-sm mt-1">Here's what's happening in your business today</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-xl border border-white/20 transition-colors backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Get AI Summary
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {KPI.map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${k.color}15` }}>
                <k.icon className="w-5 h-5" style={{ color: k.color }} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${k.up ? "text-[#39B54A]" : "text-[#EF4444]"}`}>
                {k.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {k.change}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>{k.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Open Deals */}
        <div className="col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Open Deals</h2>
            <button className="text-xs text-[#009B87] font-medium hover:underline">View all →</button>
          </div>
          <div className="space-y-2">
            {OPEN_DEALS.map((deal) => (
              <div key={deal.name}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F4F9F9] transition-colors cursor-pointer">
                <ScoreRing score={deal.score} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{deal.name}</p>
                  <p className="text-xs text-[#6B7280] truncate">{deal.contact}</p>
                </div>
                <span className="text-xs bg-[#009B87]/10 text-[#009B87] px-2 py-1 rounded-full font-medium whitespace-nowrap">
                  {deal.stage}
                </span>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{deal.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
            <span className="w-2 h-2 bg-[#39B54A] rounded-full animate-pulse" />
          </div>
          <div className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${a.color}15` }}>
                  <a.icon className="w-4 h-4" style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{a.name}</p>
                  <p className="text-xs text-[#6B7280] truncate">{a.action}</p>
                </div>
                <span className="text-[10px] text-[#9CA3AF] whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight banner */}
      <div className="bg-gradient-to-r from-[#009B87]/8 via-[#009B87]/5 to-transparent border border-[#009B87]/20 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#009B87] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">AI Insight</p>
          <p className="text-sm text-[#6B7280]">
            3 leads haven't been contacted in 5+ days. Your reply rate drops 40% after 72h — act now.
          </p>
        </div>
        <button className="px-3 py-2 bg-[#009B87] text-white text-xs font-semibold rounded-lg hover:bg-[#007A6C] whitespace-nowrap">
          View Leads
        </button>
      </div>
    </div>
  );
}
