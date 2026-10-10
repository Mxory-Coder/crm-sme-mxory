"use client";

import { useState } from "react";
import {
  Zap, Mail, MessageSquare, Clock, GitBranch, Phone,
  Tag, UserCheck, Bell, Sparkles, Plus, Play, Save,
  ChevronRight, X, Settings, ArrowRight,
} from "lucide-react";

const NODE_TYPES = [
  { group: "Triggers", items: [
    { type: "MISSED_CALL", label: "Missed Call", icon: Phone, color: "#EF4444" },
    { type: "FORM_SUBMITTED", label: "Form Submitted", icon: Zap, color: "#009B87" },
    { type: "TAG_ADDED", label: "Tag Added", icon: Tag, color: "#8B5CF6" },
    { type: "DATE_TIME", label: "Date / Time", icon: Clock, color: "#F59E0B" },
  ]},
  { group: "Actions", items: [
    { type: "SEND_SMS", label: "Send SMS", icon: MessageSquare, color: "#2563EB" },
    { type: "SEND_EMAIL", label: "Send Email", icon: Mail, color: "#D97706" },
    { type: "WAIT_DELAY", label: "Wait", icon: Clock, color: "#6B7280" },
    { type: "ADD_TAG", label: "Add Tag", icon: Tag, color: "#7C3AED" },
    { type: "ASSIGN_USER", label: "Assign User", icon: UserCheck, color: "#009B87" },
    { type: "NOTIFY", label: "Notify Team", icon: Bell, color: "#F59E0B" },
  ]},
  { group: "Logic", items: [
    { type: "IF_ELSE", label: "If / Else", icon: GitBranch, color: "#8B5CF6" },
    { type: "AI_DECISION", label: "AI Decision", icon: Sparkles, color: "#009B87" },
  ]},
];

type Node = {
  id: string;
  type: string;
  label: string;
  color: string;
  icon: typeof Zap;
  config?: string;
};

const INITIAL_NODES: Node[] = [
  { id: "1", type: "MISSED_CALL", label: "Missed Call", color: "#EF4444", icon: Phone },
  { id: "2", type: "SEND_SMS",    label: "Send SMS",    color: "#2563EB", icon: MessageSquare, config: "Hi {{contact.first_name}}, sorry we missed your call! How can we help?" },
  { id: "3", type: "WAIT_DELAY",  label: "Wait 1 hour", color: "#6B7280", icon: Clock, config: "1 hour" },
  { id: "4", type: "IF_ELSE",     label: "Replied?",    color: "#8B5CF6", icon: GitBranch },
];

export default function WorkflowBuilderPage() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [selected, setSelected] = useState<Node | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");

  function addNode(item: typeof NODE_TYPES[0]["items"][0]) {
    const newNode: Node = {
      id: String(Date.now()),
      type: item.type,
      label: item.label,
      color: item.color,
      icon: item.icon,
    };
    setNodes((n) => [...n, newNode]);
    setSelected(newNode);
    setShowPanel(false);
  }

  function removeNode(id: string) {
    setNodes((n) => n.filter((node) => node.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -mx-6 -mt-6 overflow-hidden">
      {/* Left panel: node library */}
      <div className="w-56 shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col overflow-y-auto">
        <div className="px-4 py-3 border-b border-[#E5E7EB]">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Add Step</p>
        </div>
        {NODE_TYPES.map((group) => (
          <div key={group.group} className="px-3 py-2">
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5 px-1">{group.group}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addNode(item)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F4F9F9] text-left group transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}18` }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F4F9F9]" style={{
        backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}>
        {/* Builder top bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#E5E7EB] shrink-0">
          <div className="flex items-center gap-3">
            <input
              defaultValue="Missed Call Text Back"
              className="text-sm font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-[#E5E7EB] focus:border-[#009B87] focus:outline-none px-1 py-0.5"
            />
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              {status === "published" ? "Published" : "Draft"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] bg-white text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50">
              <Play className="w-3.5 h-3.5" /> Test
            </button>
            <button
              onClick={() => setStatus("draft")}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] bg-white text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>
            <button
              onClick={() => setStatus("published")}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#009B87] hover:bg-[#007A6C] text-white text-xs font-semibold rounded-lg"
            >
              <Zap className="w-3.5 h-3.5" /> Publish
            </button>
          </div>
        </div>

        {/* Node chain */}
        <div className="flex-1 overflow-auto p-8">
          <div className="flex flex-col items-center gap-0 w-full max-w-sm mx-auto">
            {nodes.map((node, i) => (
              <div key={node.id} className="flex flex-col items-center w-full">
                {/* Node card */}
                <div
                  onClick={() => setSelected(node)}
                  className={`w-full bg-white rounded-xl border-2 px-4 py-3 cursor-pointer hover:shadow-md transition-all ${
                    selected?.id === node.id
                      ? "border-[#009B87] shadow-md shadow-[#009B87]/10"
                      : "border-[#E5E7EB] hover:border-[#009B87]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${node.color}18` }}>
                      <node.icon className="w-4.5 h-4.5" style={{ color: node.color, width: 18, height: 18 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{node.label}</p>
                      {node.config && (
                        <p className="text-xs text-[#6B7280] truncate mt-0.5">{node.config}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(node); }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-lg"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-3.5 h-3.5 text-[#9CA3AF] hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  {/* Branch labels for IF_ELSE */}
                  {node.type === "IF_ELSE" && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-[#F3F4F6]">
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Yes branch</span>
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">No branch</span>
                    </div>
                  )}
                </div>

                {/* Connector arrow */}
                {i < nodes.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div className="w-px h-4 bg-[#D1D5DB]" />
                    <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF] rotate-90" />
                    <div className="w-px h-4 bg-[#D1D5DB]" />
                  </div>
                )}
              </div>
            ))}

            {/* Add step button */}
            <div className="flex flex-col items-center mt-0">
              {nodes.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="w-px h-4 bg-[#D1D5DB]" />
                  <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF] rotate-90" />
                  <div className="w-px h-4 bg-[#D1D5DB]" />
                </div>
              )}
              <button
                onClick={() => setShowPanel(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-dashed border-[#009B87]/40 hover:border-[#009B87] text-[#009B87] text-sm font-semibold rounded-xl hover:bg-[#009B87]/4 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Step
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: node config */}
      {selected && (
        <div className="w-72 shrink-0 bg-white border-l border-[#E5E7EB] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${selected.color}18` }}>
                <selected.icon className="w-4 h-4" style={{ color: selected.color }} />
              </div>
              <p className="text-sm font-semibold text-gray-900">{selected.label}</p>
            </div>
            <button onClick={() => setSelected(null)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-[#9CA3AF]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selected.type === "SEND_SMS" && (
              <div>
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">Message</label>
                <textarea
                  rows={4}
                  defaultValue={selected.config ?? ""}
                  className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87] resize-none"
                  placeholder="Hi {{contact.first_name}}..."
                />
                <p className="text-[10px] text-[#9CA3AF] mt-1">Use {"{{contact.first_name}}"} for merge tags</p>
              </div>
            )}
            {selected.type === "SEND_EMAIL" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">Subject</label>
                  <input className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B87]/30" placeholder="Following up on your enquiry" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">Body</label>
                  <textarea rows={5} className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 resize-none" placeholder="Hi {{contact.first_name}},..." />
                </div>
              </>
            )}
            {selected.type === "WAIT_DELAY" && (
              <div>
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">Wait Duration</label>
                <div className="flex gap-2">
                  <input type="number" defaultValue={1} className="w-20 text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B87]/30" />
                  <select className="flex-1 text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B87]/30">
                    <option>Minutes</option>
                    <option>Hours</option>
                    <option>Days</option>
                  </select>
                </div>
              </div>
            )}
            {selected.type === "IF_ELSE" && (
              <div>
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">Condition</label>
                <select className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 mb-2">
                  <option>Contact replied</option>
                  <option>Tag exists</option>
                  <option>Custom field value</option>
                  <option>Opportunity stage</option>
                </select>
              </div>
            )}
            {(selected.type === "MISSED_CALL" || selected.type === "FORM_SUBMITTED" || selected.type === "TAG_ADDED") && (
              <div className="bg-[#F4F9F9] rounded-xl p-3 text-sm text-[#6B7280]">
                This is the trigger that starts the workflow. No configuration needed.
              </div>
            )}
            {selected.type === "AI_DECISION" && (
              <div>
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-1.5">AI Instruction</label>
                <textarea rows={3} className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 resize-none" placeholder="e.g. Is this lead a good fit for our premium package?" />
                <p className="text-[10px] text-[#009B87] mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Claude will decide which branch to take
                </p>
              </div>
            )}

            <button className="w-full py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
              Save Step
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
