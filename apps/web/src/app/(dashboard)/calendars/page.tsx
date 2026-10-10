"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Video } from "lucide-react";

const APPOINTMENTS = [
  { day: 5, title: "Discovery Call - John Dlamini", time: "10:00 AM" },
  { day: 12, title: "Site Visit - Priya Singh", time: "2:00 PM" },
  { day: 18, title: "Follow-up Call", time: "9:00 AM" },
  { day: 22, title: "Onboarding - Nomsa Dube", time: "11:00 AM" },
  { day: 25, title: "Demo Call", time: "3:00 PM" },
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarsPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // June 2026: 1st = Monday, 30 days
  const startDayOfWeek = 0; // Monday = 0
  const daysInMonth = 30;
  const today = 22;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const apptsByDay: Record<number, typeof APPOINTMENTS> = {};
  for (const a of APPOINTMENTS) {
    if (!apptsByDay[a.day]) apptsByDay[a.day] = [];
    apptsByDay[a.day].push(a);
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Calendars
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
            <button className="p-1 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900">June 2026</span>
            <button className="p-1 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#E5E7EB]">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-[#6B7280] uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                const appts = day ? apptsByDay[day] ?? [] : [];
                const isToday = day === today;
                const isSelected = day === selectedDay;
                return (
                  <div
                    key={di}
                    onClick={() => day && setSelectedDay(day)}
                    className={`h-24 border-b border-r border-[#E5E7EB] p-1.5 cursor-pointer transition-colors ${
                      day ? "hover:bg-[#F4F9F9]" : "bg-gray-50"
                    } ${isSelected ? "bg-[#F4F9F9]" : ""}`}
                  >
                    {day && (
                      <>
                        <div className="flex justify-end mb-1">
                          <span
                            className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full ${
                              isToday
                                ? "bg-[#009B87] text-white font-bold"
                                : "text-gray-700"
                            }`}
                          >
                            {day}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {appts.map((a, ai) => (
                            <div
                              key={ai}
                              className="text-[10px] bg-[#009B87]/10 text-[#009B87] rounded px-1 py-0.5 truncate"
                            >
                              {a.time} {a.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Upcoming Panel */}
        <div className="w-72 space-y-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Appointments</h2>
            <div className="space-y-3">
              {APPOINTMENTS.map((a, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-900 leading-tight">{a.title}</p>
                    <p className="text-[10px] text-[#6B7280] mt-0.5">Jun {a.day} · {a.time}</p>
                  </div>
                  <button className="shrink-0 flex items-center gap-1 px-2 py-1 border border-[#009B87] text-[#009B87] text-[10px] font-semibold rounded-lg hover:bg-[#009B87]/10">
                    <Video className="w-3 h-3" /> Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
