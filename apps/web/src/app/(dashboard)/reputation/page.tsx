"use client";

import { useState } from "react";
import { Star, Send, MessageSquare } from "lucide-react";

const STAR_BREAKDOWN = [
  { stars: 5, count: 198, pct: 70 },
  { stars: 4, count: 54, pct: 19 },
  { stars: 3, count: 18, pct: 6 },
  { stars: 2, count: 9, pct: 3 },
  { stars: 1, count: 5, pct: 2 },
];

const REVIEWS = [
  {
    name: "John Dlamini",
    rating: 5,
    platform: "Google",
    date: "Jun 20, 2026",
    text: "Exceptional service! The team was professional and delivered exactly what was promised. Highly recommend.",
  },
  {
    name: "Sarah Molefe",
    rating: 4,
    platform: "Google",
    date: "Jun 18, 2026",
    text: "Very happy with the CRM system. It has transformed how we manage our client relationships.",
  },
  {
    name: "Priya Naidoo",
    rating: 5,
    platform: "Facebook",
    date: "Jun 15, 2026",
    text: "The onboarding process was smooth and the support team is always available. Five stars!",
  },
  {
    name: "Thabo Nkosi",
    rating: 3,
    platform: "Google",
    date: "Jun 10, 2026",
    text: "Good product overall but some features could be more intuitive. Support team was helpful.",
  },
  {
    name: "Nomsa Dube",
    rating: 5,
    platform: "Facebook",
    date: "Jun 8, 2026",
    text: "Absolutely love using this platform for our business. The automation features save us hours every week.",
  },
];

const AI_REPLIES: Record<number, string> = {
  0: "Thank you so much, John! We're thrilled to hear about your positive experience. It's our mission to deliver professional and reliable service every time. We look forward to continuing to support your business!",
  1: "Thank you for your kind words, Sarah! We're so glad the CRM has made a difference for your team. We're always improving — stay tuned for new features!",
  2: "Thank you, Priya! We put a lot of effort into making onboarding seamless, and we're delighted it showed. Our support team loves hearing this!",
  3: "Thank you for the honest feedback, Thabo. We're always working to improve usability and appreciate you taking the time to share your thoughts. Please feel free to reach out with specific suggestions!",
  4: "That's amazing to hear, Nomsa! Automation is at the heart of what we do, and knowing it's saving you hours every week means the world to us. Thank you for the wonderful review!",
};

export default function ReputationPage() {
  const [activeReply, setActiveReply] = useState<number | null>(null);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Reputation
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
          <Send className="w-4 h-4" /> Request Review
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Average Rating", value: "4.7★" },
          { label: "Total Reviews", value: "284" },
          { label: "This Month", value: "+23" },
          { label: "Response Rate", value: "91%" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-[#009B87]" style={{ fontFamily: "Montserrat, sans-serif" }}>{s.value}</p>
            <p className="text-xs text-[#6B7280] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left */}
        <div className="flex-1 space-y-5">
          {/* Star Breakdown */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Rating Breakdown</h2>
            <div className="space-y-2">
              {STAR_BREAKDOWN.map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 w-16 shrink-0">
                    <span className="text-xs text-[#6B7280] mr-1">{row.stars}</span>
                    {Array.from({ length: row.stars }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="text-xs text-[#6B7280] w-12 text-right">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-900">Recent Reviews</h2>
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star
                            key={si}
                            className={`w-3 h-3 ${si < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#6B7280]">{r.platform} · {r.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveReply(activeReply === i ? null : i)}
                    className="flex items-center gap-1.5 text-xs border border-[#009B87] text-[#009B87] px-3 py-1.5 rounded-lg hover:bg-[#009B87]/10 font-medium"
                  >
                    <MessageSquare className="w-3 h-3" /> AI Reply
                  </button>
                </div>
                <p className="text-sm text-[#6B7280]">{r.text}</p>
                {activeReply === i && (
                  <div className="space-y-2 border-t border-[#E5E7EB] pt-3">
                    <textarea
                      className="w-full text-sm border border-[#E5E7EB] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87] resize-none"
                      rows={3}
                      defaultValue={AI_REPLIES[i]}
                    />
                    <button className="flex items-center gap-2 px-4 py-1.5 bg-[#009B87] hover:bg-[#007A6C] text-white text-xs font-semibold rounded-lg">
                      <Send className="w-3 h-3" /> Send Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="w-80 shrink-0">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Send Review Request</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#6B7280] block mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Dlamini"
                  className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] block mb-1">Template</label>
                <select className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87] bg-white">
                  <option>Standard Review Request</option>
                  <option>Post-Service Follow-up</option>
                  <option>Monthly Check-in</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] block mb-2">Channel</label>
                <div className="space-y-2">
                  {["SMS", "Email", "WhatsApp"].map((ch) => (
                    <label key={ch} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="channel" value={ch} className="accent-[#009B87]" defaultChecked={ch === "SMS"} />
                      <span className="text-sm text-gray-700">{ch}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
                <Send className="w-4 h-4" /> Send Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
