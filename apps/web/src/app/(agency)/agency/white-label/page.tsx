"use client";

import { useState } from "react";
import { Upload, CheckCircle, AlertCircle, Save } from "lucide-react";

const TABS = ["Branding", "Domain", "Mobile App", "Email Config"];

export default function WhiteLabelPage() {
  const [tab, setTab] = useState("Branding");
  const [showPreview, setShowPreview] = useState(false);
  const [hidePoweredBy, setHidePoweredBy] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#009B87");
  const [accentColor, setAccentColor] = useState("#39B54A");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          White Label Settings
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E5E7EB]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-[#009B87] text-[#009B87]"
                : "border-transparent text-[#6B7280] hover:text-gray-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Branding tab */}
      {tab === "Branding" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Brand Identity</h3>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Platform Name</label>
                <input defaultValue="SME Connect" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]" />
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Logo</label>
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 flex flex-col items-center gap-2 hover:border-[#009B87] transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-[#9CA3AF]" />
                  <p className="text-xs text-[#6B7280]">Drag & drop or <span className="text-[#009B87] font-semibold">browse</span></p>
                  <p className="text-[10px] text-[#9CA3AF]">PNG, SVG — max 2MB</p>
                  <div className="mt-2 w-24 h-10 bg-[#009B87] rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>sme connect</span>
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Favicon</label>
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-4 flex items-center gap-3 hover:border-[#009B87] transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-[#009B87] rounded flex items-center justify-center text-white text-xs font-bold">S</div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Upload favicon (32×32 ICO or PNG)</p>
                    <button className="text-xs text-[#009B87] font-semibold hover:underline">Change</button>
                  </div>
                </div>
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Primary Color</label>
                  <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-3 py-2">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                    <span className="text-sm font-mono text-gray-700">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Accent Color</label>
                  <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-3 py-2">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                    <span className="text-sm font-mono text-gray-700">{accentColor}</span>
                  </div>
                </div>
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">Hide "Powered by SME Connect"</p>
                  <p className="text-xs text-[#6B7280]">Remove branding from client-facing pages</p>
                </div>
                <button
                  onClick={() => setHidePoweredBy(!hidePoweredBy)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${hidePoweredBy ? "bg-[#009B87]" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hidePoweredBy ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>

              {/* Login BG */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Login Page Background</label>
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-4 flex items-center gap-3 hover:border-[#009B87] transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-[#9CA3AF]" />
                  <p className="text-xs text-[#6B7280]">Upload background image (1920×1080 recommended)</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPreview(!showPreview)} className="flex-1 py-2 border border-[#009B87] text-[#009B87] text-sm font-semibold rounded-lg hover:bg-[#009B87]/5 transition-colors">
                  {showPreview ? "Hide Preview" : "Preview Login"}
                </button>
                <button className="flex-1 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Preview phone */}
          {showPreview && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Login Page Preview</p>
              <div className="w-52 h-96 bg-gray-900 rounded-[2rem] p-3 shadow-2xl border-4 border-gray-800">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                  <div className="h-full flex flex-col items-center justify-center gap-3 p-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <span className="text-white font-black text-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>S</span>
                    </div>
                    <p className="text-white font-bold text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>SME Connect</p>
                    <div className="w-full space-y-2 mt-2">
                      <div className="bg-white/20 rounded-lg px-3 py-2">
                        <p className="text-white/60 text-xs">Email</p>
                      </div>
                      <div className="bg-white/20 rounded-lg px-3 py-2">
                        <p className="text-white/60 text-xs">Password</p>
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 text-center">
                        <p className="text-sm font-bold" style={{ color: primaryColor }}>Sign In</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Domain tab */}
      {tab === "Domain" && (
        <div className="max-w-xl space-y-5">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Custom Domain</h3>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Current Domain</label>
              <input readOnly value="app.smeconnect.co.za" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-gray-50 text-[#6B7280]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Custom Domain</label>
              <input placeholder="e.g. app.yourbrand.co.za" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]" />
            </div>

            <div className="flex items-center gap-2 py-1">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs text-amber-700 font-medium">DNS not verified</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">DNS Configuration</p>
              <div className="bg-gray-50 border border-[#E5E7EB] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      {["Type", "Name", "Value"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-[#6B7280]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 font-mono text-xs text-gray-800">CNAME</td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-800">app</td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-800">proxy.smeconnect.co.za</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs text-[#6B7280]">SSL: <span className="font-semibold text-amber-700">Pending DNS verification</span></span>
            </div>

            <button className="w-full py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
              Verify DNS
            </button>
          </div>
        </div>
      )}

      {/* Mobile App tab */}
      {tab === "Mobile App" && (
        <div className="max-w-xl space-y-5">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>PWA / Mobile App</h3>
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">App Name</label>
              <input defaultValue="SME Connect" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">App Icon</label>
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-4 flex items-center gap-3 hover:border-[#009B87] transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-[#009B87] flex items-center justify-center text-white font-black text-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>S</div>
                <div>
                  <p className="text-xs text-[#6B7280]">Upload 512×512 PNG icon</p>
                  <button className="text-xs text-[#009B87] font-semibold hover:underline">Browse</button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Splash Screen Color</label>
              <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-3 py-2 w-40">
                <input type="color" defaultValue="#009B87" className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                <span className="text-sm font-mono text-gray-700">#009B87</span>
              </div>
            </div>
            <button className="w-full py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors">
              Generate PWA Manifest
            </button>
            <div className="pt-2">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Homescreen Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#009B87] flex items-center justify-center text-white font-black text-2xl shadow-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>S</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">SME Connect</p>
                  <p className="text-xs text-[#6B7280]">app.smeconnect.co.za</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Config tab */}
      {tab === "Email Config" && (
        <div className="max-w-xl space-y-5">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Email Configuration</h3>
            {[
              { label: "From Name", value: "SME Connect", type: "text" },
              { label: "From Email", value: "noreply@smeconnect.co.za", type: "email" },
              { label: "Reply-To Email", value: "support@smeconnect.co.za", type: "email" },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">{field.label}</label>
                <input type={field.type} defaultValue={field.value} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Email Footer Text</label>
              <textarea
                defaultValue="© 2026 SME Connect. All rights reserved. | Unsubscribe"
                rows={3}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87] resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">SendGrid API Key</label>
              <input type="password" placeholder="SG.xxxxxxxxxxxxxxxxxxxx" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#009B87]" />
            </div>
            <div className="flex gap-3 pt-2">
              <button className="flex-1 py-2 border border-[#E5E7EB] text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                Test Email
              </button>
              <button className="flex-1 py-2 bg-[#009B87] text-white text-sm font-semibold rounded-lg hover:bg-[#007f6e] transition-colors flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Save Config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
