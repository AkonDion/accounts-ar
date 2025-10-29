import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-semibold text-white mb-4 tracking-tight">AR Control Center</h1>
        <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
          Modern accounts receivable management dashboard with real-time insights
        </p>
        <Link
          href="/ar"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-950 font-medium rounded-lg transition-all duration-200 hover:scale-105"
        >
          Open Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
