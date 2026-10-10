"use client";

import { useState } from "react";
import { Plus, TrendingUp, Clock, AlertCircle, MoreHorizontal } from "lucide-react";

const TABS = ["Orders", "Invoices", "Subscriptions", "Transactions"];

const ORDERS = [
  { id: "ORD-001", contact: "John Dlamini", product: "CRM Subscription", amount: 2500, status: "Paid", date: "Jun 1, 2026" },
  { id: "ORD-002", contact: "Sarah Molefe", product: "SMS Package", amount: 800, status: "Paid", date: "Jun 3, 2026" },
  { id: "ORD-003", contact: "Priya Singh", product: "Consulting", amount: 12000, status: "Pending", date: "Jun 5, 2026" },
  { id: "ORD-004", contact: "Thabo Nkosi", product: "CRM Subscription", amount: 2500, status: "Paid", date: "Jun 6, 2026" },
  { id: "ORD-005", contact: "Nomsa Dube", product: "Web Design Package", amount: 9500, status: "Overdue", date: "May 28, 2026" },
  { id: "ORD-006", contact: "James van der Berg", product: "Email Marketing", amount: 1500, status: "Paid", date: "Jun 8, 2026" },
  { id: "ORD-007", contact: "Fatima Kader", product: "Annual Retainer", amount: 8000, status: "Pending", date: "Jun 10, 2026" },
  { id: "ORD-008", contact: "Lungelo Mthembu", product: "CRM Onboarding", amount: 3600, status: "Paid", date: "Jun 12, 2026" },
];

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
};

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("Orders");

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Payments
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#009B87]/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#009B87]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Total Revenue</p>
            <p className="text-xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>R 284,500</p>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Pending</p>
            <p className="text-xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>R 12,400</p>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Overdue</p>
            <p className="text-xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>R 3,200</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-[#E5E7EB] flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-[#009B87] text-[#009B87]"
                : "border-transparent text-[#6B7280] hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      {activeTab === "Orders" ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Order #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o, i) => (
                <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-[#6B7280]">{o.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{o.contact}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{o.product}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">R {o.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] text-xs">{o.date}</td>
                  <td className="px-4 py-3">
                    <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal className="w-4 h-4 text-[#9CA3AF]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
          <p className="text-[#6B7280] text-sm">No data yet for {activeTab}.</p>
        </div>
      )}
    </div>
  );
}
