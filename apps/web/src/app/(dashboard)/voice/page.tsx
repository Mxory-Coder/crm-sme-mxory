import { Phone } from "lucide-react"

export default function VoicePage() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-[#009B87]/10 rounded-full flex items-center justify-center mx-auto">
          <Phone className="w-10 h-10 text-[#009B87]" />
        </div>
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>Voice AI</h1>
        <p className="text-gray-500">This feature is coming soon.</p>
      </div>
    </div>
  )
}
