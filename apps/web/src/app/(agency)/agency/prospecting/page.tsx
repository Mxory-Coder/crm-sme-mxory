"use client";

import { useState } from "react";
import { Search, Loader2, Star, Phone, Globe, Copy, Send } from "lucide-react";

const MOCK_RESULTS = [
  {
    name: "Cape Town Dental Centre",
    address: "45 Long Street, Cape Town, 8001",
    rating: 4.2,
    reviews: 87,
    phone: "+27 21 422 1234",
    website: "capetowndental.co.za",
    score: 38,
    scoreColor: "text-red-600 bg-red-50 border-red-200",
    insights: ["No online booking system detected", "Last Google review was 4 months ago"],
  },
  {
    name: "Smile Studio Cape Town",
    address: "12 Bree Street, Cape Town, 8001",
    rating: 4.7,
    reviews: 203,
    phone: "+27 21 433 5678",
    website: "smilestudio.co.za",
    score: 62,
    scoreColor: "text-amber-600 bg-amber-50 border-amber-200",
    insights: ["Website lacks a clear call-to-action", "No automated recall system visible"],
  },
  {
    name: "Blouberg Dental Practice",
    address: "8 Blaauwberg Road, Bloubergstrand, 7441",
    rating: 3.9,
    reviews: 41,
    phone: "+27 21 556 9012",
    website: "bloubergdental.co.za",
    score: 29,
    scoreColor: "text-red-600 bg-red-50 border-red-200",
    insights: ["Inactive social media presence", "No patient review automation detected"],
  },
  {
    name: "Sea Point Family Dental",
    address: "22 Main Road, Sea Point, 8005",
    rating: 4.5,
    reviews: 156,
    phone: "+27 21 439 3456",
    website: "seapointdental.co.za",
    score: 71,
    scoreColor: "text-amber-600 bg-amber-50 border-amber-200",
    insights: ["Good ratings but low review volume vs competitors", "No live chat widget on website"],
  },
  {
    name: "Constantia Dental Specialists",
    address: "3 Spaanschemat River Road, Constantia, 7806",
    rating: 4.8,
    reviews: 312,
    phone: "+27 21 794 7890",
    website: "constantiadental.co.za",
    score: 85,
    scoreColor: "text-green-600 bg-green-50 border-green-200",
    insights: ["Strong online presence but no CRM integration visible", "Opportunity to automate appointment reminders"],
  },
];

function ScoreCircle({ score, colorClass }: { score: number; colorClass: string }) {
  return (
    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-sm ${colorClass}`} style={{ fontFamily: "Montserrat, sans-serif" }}>
      {score}
    </div>
  );
}

export default function ProspectingPage() {
  const [bizType, setBizType] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("10km");
  const [state, setState] = useState<"idle" | "loading" | "results">("idle");

  const handleSearch = () => {
    setState("loading");
    setTimeout(() => setState("results"), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Prospecting Tool
        </h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Find local businesses and generate AI-powered audit reports</p>
      </div>

      {/* Search form */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Business Type</label>
            <input
              value={bizType}
              onChange={(e) => setBizType(e.target.value)}
              placeholder="e.g. dental practice, plumbing company"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Location / City</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Cape Town, Western Cape"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Radius</label>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87] bg-white"
            >
              {["5km", "10km", "25km", "50km"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={state === "loading"}
            className="flex items-center gap-2 px-5 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors disabled:opacity-60 mt-5"
          >
            <Search className="w-4 h-4" />
            Generate Leads
          </button>
        </div>
      </div>

      {/* Loading */}
      {state === "loading" && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-10 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#009B87] animate-spin" />
          <p className="text-sm text-[#6B7280] font-medium">Claude is scanning local directories...</p>
        </div>
      )}

      {/* Results */}
      {state === "results" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
              5 businesses found near {location || "Cape Town"}
            </h2>
          </div>

          <div className="space-y-4">
            {MOCK_RESULTS.map((biz) => (
              <div key={biz.name} className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <ScoreCircle score={biz.score} colorClass={biz.scoreColor} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{biz.name}</h3>
                        <p className="text-xs text-[#6B7280] mt-0.5">{biz.address}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5"
                            fill={i < Math.floor(biz.rating) ? "currentColor" : "none"}
                          />
                        ))}
                        <span className="text-xs text-[#6B7280] ml-1">{biz.rating} ({biz.reviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7280]">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{biz.phone}</span>
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{biz.website}</span>
                    </div>

                    <div className="mt-3 space-y-1">
                      {biz.insights.map((insight, i) => (
                        <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5">
                          <span className="text-amber-500 mt-0.5">•</span>
                          {insight}
                        </p>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#009B87] text-white text-xs font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
                        <Send className="w-3 h-3" />
                        Send Outreach
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Add to CRM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Outreach preview */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
              AI Outreach Preview
            </h3>
            <p className="text-xs text-[#6B7280] mb-3">Here's your personalised outreach for Apex Dental...</p>
            <div className="bg-gray-50 border border-[#E5E7EB] rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
              <p>Hi Dr. Naidoo,</p>
              <br />
              <p>
                I noticed that Apex Dental doesn't currently have an automated booking and follow-up system in place. With 203 reviews and a 4.7-star rating, you're clearly delivering excellent care — but you might be missing out on re-engaging past patients and converting website visitors into appointments automatically.
              </p>
              <br />
              <p>
                We help dental practices in Cape Town save 10+ hours per week with AI-powered patient communication. Would you be open to a 15-minute call this week?
              </p>
              <br />
              <p>Best,<br />Siphelele @ SME Connect</p>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
                <Send className="w-4 h-4" />
                Send via Email
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
