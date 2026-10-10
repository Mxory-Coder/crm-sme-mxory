import { Plus, BookOpen, Edit2, Eye, Users } from "lucide-react";

const COURSES = [
  {
    title: "Business Growth Fundamentals",
    category: "Business",
    categoryColor: "bg-blue-100 text-blue-700",
    enrolled: 38,
    completion: 72,
    lessons: 12,
  },
  {
    title: "Digital Marketing Mastery",
    category: "Marketing",
    categoryColor: "bg-purple-100 text-purple-700",
    enrolled: 24,
    completion: 58,
    lessons: 8,
  },
  {
    title: "Sales Techniques Pro",
    category: "Sales",
    categoryColor: "bg-[#009B87]/10 text-[#009B87]",
    enrolled: 51,
    completion: 81,
    lessons: 10,
  },
  {
    title: "Customer Service Excellence",
    category: "Service",
    categoryColor: "bg-amber-100 text-amber-700",
    enrolled: 29,
    completion: 63,
    lessons: 9,
  },
];

const ENROLLMENTS = [
  { name: "John Dlamini", course: "Business Growth Fundamentals", date: "Jun 1, 2026", progress: 85, status: "Active" },
  { name: "Sarah Molefe", course: "Sales Techniques Pro", date: "Jun 3, 2026", progress: 62, status: "Active" },
  { name: "Priya Singh", course: "Digital Marketing Mastery", date: "Jun 5, 2026", progress: 34, status: "Active" },
  { name: "Thabo Nkosi", course: "Customer Service Excellence", date: "May 28, 2026", progress: 100, status: "Completed" },
  { name: "Nomsa Dube", course: "Business Growth Fundamentals", date: "Jun 10, 2026", progress: 18, status: "Active" },
];

export default function MembershipsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Memberships
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#009B87] hover:bg-[#007A6C] text-white text-sm font-semibold rounded-lg">
          <Plus className="w-4 h-4" /> Create Course
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#009B87]/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-[#009B87]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Active Members</p>
            <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>142</p>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#39B54A]/10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#39B54A]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Courses</p>
            <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>4</p>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <span className="text-amber-600 font-bold text-sm">%</span>
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Avg Completion</p>
            <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>67%</p>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Courses</h2>
        <div className="grid grid-cols-4 gap-4">
          {COURSES.map((c, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3">
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.categoryColor}`}>{c.category}</span>
                <h3 className="font-semibold text-gray-900 text-sm mt-2 leading-tight">{c.title}</h3>
              </div>
              <div className="space-y-1.5 text-xs text-[#6B7280]">
                <div className="flex justify-between">
                  <span>{c.enrolled} enrolled</span>
                  <span>{c.lessons} lessons</span>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Completion</span>
                    <span className="font-medium text-gray-900">{c.completion}%</span>
                  </div>
                  <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#009B87] rounded-full"
                      style={{ width: `${c.completion}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button className="flex-1 flex items-center justify-center gap-1 text-xs border border-[#E5E7EB] py-1.5 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 text-xs border border-[#009B87] py-1.5 rounded-lg hover:bg-[#009B87]/10 text-[#009B87]">
                  <Eye className="w-3 h-3" /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Enrollments */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Enrollments</h2>
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Course</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Progress</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {ENROLLMENTS.map((e, i) => (
                <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                  <td className="px-4 py-3 text-[#6B7280] text-xs">{e.course}</td>
                  <td className="px-4 py-3 text-[#6B7280] text-xs">{e.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden max-w-[80px]">
                        <div className="h-full bg-[#009B87] rounded-full" style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="text-xs text-[#6B7280]">{e.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      e.status === "Completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
