import { MessageSquare, Mail, Phone, Search, Sparkles, Send, Paperclip } from "lucide-react";

const THREADS = [
  { name: "John Dlamini", preview: "Hey I wanted to ask about pricing...", time: "2m", channel: "whatsapp", unread: 2, active: true },
  { name: "Sarah Molefe", preview: "Thanks for sending the quote!", time: "15m", channel: "sms", unread: 0, active: false },
  { name: "AR Boards & Signs", preview: "Invoice question re: last month", time: "1h", channel: "email", unread: 1, active: false },
  { name: "Michael van Wyk", preview: "Can you call me back?", time: "2h", channel: "sms", unread: 0, active: false },
  { name: "Priya Singh", preview: "The samples look great, let's proceed", time: "3h", channel: "instagram", unread: 0, active: false },
  { name: "Nomsa Dube", preview: "When can we start?", time: "4h", channel: "facebook", unread: 0, active: false },
];

const MSGS = [
  { from: "John Dlamini", body: "Hey, I wanted to ask about pricing for a full bathroom renovation.", time: "10:28 AM", dir: "in", channel: "whatsapp" },
  { from: "You", body: "Hi John! We'd love to help with your bathroom renovation. Our packages start from R8,500 for a standard reno.", time: "10:30 AM", dir: "out", ai: false, channel: "whatsapp" },
  { from: "John Dlamini", body: "Nice, what does that include exactly?", time: "10:32 AM", dir: "in", channel: "whatsapp" },
];

const CHANNEL_ICONS: Record<string, { icon: typeof MessageSquare; color: string }> = {
  whatsapp: { icon: MessageSquare, color: "#25D366" },
  sms: { icon: Phone, color: "#2563EB" },
  email: { icon: Mail, color: "#D97706" },
  instagram: { icon: MessageSquare, color: "#E1306C" },
  facebook: { icon: MessageSquare, color: "#1877F2" },
};

export default function ConversationsPage() {
  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-0 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white -mt-2">
      {/* Left: thread list */}
      <div className="w-80 shrink-0 border-r border-[#E5E7EB] flex flex-col">
        <div className="p-3 border-b border-[#E5E7EB]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F4F9F9] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/20"
            />
          </div>
          <div className="flex gap-1 mt-2">
            {["All", "Unread", "Mine"].map((f) => (
              <button key={f} className={`text-xs px-2.5 py-1 rounded-full font-medium ${f === "All" ? "bg-[#009B87] text-white" : "text-[#6B7280] hover:bg-gray-100"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {THREADS.map((t, i) => {
            const ch = CHANNEL_ICONS[t.channel] ?? CHANNEL_ICONS.sms;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-[#F3F4F6] hover:bg-[#F9FAFB] ${t.active ? "bg-[#E6F7F5]" : ""}`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#009B87] to-[#39B54A] flex items-center justify-center text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                    style={{ background: ch.color }}
                  >
                    <ch.icon className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 truncate">{t.name}</span>
                    <span className="text-[10px] text-[#9CA3AF] shrink-0 ml-1">{t.time}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] truncate mt-0.5">{t.preview}</p>
                </div>
                {t.unread > 0 && (
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[#009B87] text-white text-[10px] font-bold flex items-center justify-center">
                    {t.unread}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: message thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Thread header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#009B87] to-[#39B54A] flex items-center justify-center text-white font-bold text-sm">
              J
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">John Dlamini</p>
              <p className="text-xs text-[#6B7280]">WhatsApp · +27 61 524 5923 · Assigned to: You</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-gray-50">Mark Done</button>
            <button className="text-xs px-3 py-1.5 bg-[#009B87] text-white rounded-lg hover:bg-[#007A6C]">Assign</button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {MSGS.map((m, i) => (
            <div key={i} className={`flex ${m.dir === "out" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-sm rounded-2xl px-4 py-2.5 text-sm ${
                  m.dir === "out"
                    ? "bg-[#009B87] text-white rounded-br-sm"
                    : "bg-[#F4F9F9] text-gray-900 rounded-bl-sm"
                }`}
              >
                <p>{m.body}</p>
                <p className={`text-[10px] mt-1 ${m.dir === "out" ? "text-teal-100" : "text-[#9CA3AF]"}`}>{m.time}</p>
              </div>
            </div>
          ))}

          {/* AI Draft */}
          <div className="mx-2 rounded-xl bg-[#009B87]/8 border border-[#009B87]/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#009B87]" />
              <span className="text-xs font-semibold text-[#009B87]">AI Draft</span>
              <span className="text-[10px] bg-[#009B87]/10 text-[#009B87] px-2 py-0.5 rounded-full">Not sent</span>
            </div>
            <p className="text-sm text-gray-700">
              A full bathroom reno includes demo, waterproofing, new tiles, fixtures, plumbing connections, and final finish. We also handle permits. Want to schedule a site visit this week?
            </p>
            <div className="flex gap-2 mt-2">
              <button className="text-xs px-3 py-1.5 bg-[#009B87] text-white rounded-lg font-medium">Send</button>
              <button className="text-xs px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg">Edit</button>
              <button className="text-xs px-3 py-1.5 text-[#9CA3AF] rounded-lg hover:bg-gray-50">Dismiss</button>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-[#E5E7EB] p-3">
          <div className="flex items-end gap-2">
            <button className="w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:bg-gray-100 rounded-lg">
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="flex-1 bg-[#F4F9F9] border border-[#E5E7EB] rounded-xl px-3 py-2">
              <textarea
                rows={2}
                placeholder="Message John... (Ctrl+Enter to send)"
                className="w-full bg-transparent text-sm text-gray-900 placeholder:text-[#9CA3AF] resize-none focus:outline-none"
              />
            </div>
            <button className="w-9 h-9 flex items-center justify-center bg-[#009B87] hover:bg-[#007A6C] text-white rounded-xl transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
