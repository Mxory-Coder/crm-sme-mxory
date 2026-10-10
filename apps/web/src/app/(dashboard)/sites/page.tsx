import { Plus, Edit2, Globe, FileText } from "lucide-react";

const FUNNELS = [
  {
    title: "Lead Capture Funnel",
    steps: 3,
    conversion: "24%",
    visitors: "1,240",
    stepColors: ["bg-[#009B87]", "bg-[#39B54A]", "bg-[#009B87]/50"],
  },
  {
    title: "Service Quote Funnel",
    steps: 4,
    conversion: "18%",
    visitors: "892",
    stepColors: ["bg-[#009B87]", "bg-[#39B54A]", "bg-amber-400", "bg-[#009B87]/50"],
  },
  {
    title: "Webinar Registration",
    steps: 2,
    conversion: "31%",
    visitors: "456",
    stepColors: ["bg-[#009B87]", "bg-[#39B54A]"],
  },
];

const WEBSITES = [
  {
    domain: "smeconnect.co.za",
    status: "Live",
    pages: 8,
    edited: "2 days ago",
  },
  {
    domain: "demo.smeconnect.co.za",
    status: "Draft",
    pages: 3,
    edited: "1 week ago",
  },
];

export default function SitesPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Sites & Funnels
        </h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
            <Plus className="w-4 h-4" /> New Funnel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
            <Plus className="w-4 h-4" /> New Site
          </button>
        </div>
      </div>

      {/* Funnels */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Funnels</h2>
        <div className="grid grid-cols-3 gap-4">
          {FUNNELS.map((f, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">{f.steps} steps</p>
              </div>

              {/* Step dots */}
              <div className="flex items-center gap-1">
                {f.stepColors.map((color, si) => (
                  <div key={si} className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded-full ${color}`} />
                    {si < f.stepColors.length - 1 && (
                      <div className="flex-1 h-0.5 bg-[#E5E7EB] w-6" />
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-xs">
                <div>
                  <p className="text-[#6B7280]">Conversion</p>
                  <p className="font-bold text-[#009B87]">{f.conversion}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Visitors</p>
                  <p className="font-bold text-gray-900">{f.visitors}</p>
                </div>
              </div>

              <button className="flex items-center gap-1.5 text-xs text-[#009B87] border border-[#009B87] px-3 py-1.5 rounded-lg hover:bg-[#009B87]/10 font-medium">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Websites */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Websites</h2>
        <div className="grid grid-cols-2 gap-4">
          {WEBSITES.map((w, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F4F9F9] rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-[#009B87]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{w.domain}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    w.status === "Live" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {w.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {w.pages} pages</span>
                  <span>Edited {w.edited}</span>
                </div>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-[#009B87] border border-[#009B87] px-3 py-1.5 rounded-lg hover:bg-[#009B87]/10 font-medium">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
