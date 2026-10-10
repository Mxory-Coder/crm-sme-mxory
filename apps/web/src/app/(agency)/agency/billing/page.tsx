import { CheckCircle, Download } from "lucide-react";

const INVOICES = [
  { date: "Jun 2026", inv: "INV-1062", amount: "R 5,499", status: "Paid" },
  { date: "May 2026", inv: "INV-1041", amount: "R 5,499", status: "Paid" },
  { date: "Apr 2026", inv: "INV-1020", amount: "R 5,499", status: "Paid" },
  { date: "Mar 2026", inv: "INV-0999", amount: "R 5,499", status: "Paid" },
  { date: "Feb 2026", inv: "INV-0978", amount: "R 5,499", status: "Paid" },
  { date: "Jan 2026", inv: "INV-0957", amount: "R 5,499", status: "Paid" },
];

const FEATURES = [
  "Unlimited sub-accounts",
  "White label branding",
  "Priority support",
  "Custom domain",
  "API access",
  "Advanced analytics",
];

export default function AgencyBillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Agency Billing
        </h1>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Current subscription */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Current Subscription</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">Agency Plan</span>
          </div>

          <div>
            <p className="text-4xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
              R 5,499
            </p>
            <p className="text-sm text-[#6B7280] mt-0.5">per month · billed monthly</p>
          </div>

          <div className="text-sm text-[#6B7280] space-y-1">
            <p>Renewal date: <span className="font-semibold text-gray-800">Jul 22, 2026</span></p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Included features</p>
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#009B87] shrink-0" />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button className="flex-1 py-2 border border-[#009B87] text-[#009B87] text-sm font-semibold rounded-lg hover:bg-[#009B87]/5 transition-colors">
              Change Plan
            </button>
            <button className="flex-1 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>

        {/* Right: Usage summary */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5">
          <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Usage Summary</h2>

          <div className="space-y-4">
            {[
              { label: "Sub-accounts", value: "12 / Unlimited", percent: null },
              { label: "SMS Credits Remaining", value: "8,420", percent: null },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-[#6B7280]">{item.label}</span>
                <span className="font-semibold text-gray-800 text-sm">{item.value}</span>
              </div>
            ))}

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6B7280]">Storage</span>
                <span className="font-semibold text-gray-800">14.2 GB / 100 GB</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#009B87] rounded-full" style={{ width: "14.2%" }} />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B7280]">API calls this month</span>
              <span className="font-semibold text-gray-800 text-sm">24,891</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="pt-4 border-t border-[#E5E7EB]">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Payment Method</p>
            <div className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Visa ending 4242</p>
                  <p className="text-xs text-[#6B7280]">Expires 09/27</p>
                </div>
              </div>
              <button className="text-xs text-[#009B87] font-semibold hover:underline">Update</button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Invoice History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E5E7EB]">
              {["Date", "Invoice #", "Amount", "Status", "Download"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {INVOICES.map((inv) => (
              <tr key={inv.inv} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{inv.date}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{inv.inv}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{inv.amount}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{inv.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button className="flex items-center gap-1 text-xs text-[#009B87] font-semibold hover:underline">
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
