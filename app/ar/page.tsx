"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { ARSummaryCards } from "@/components/ARSummaryCards"
import { ARTabs } from "@/components/ARTabs"
import { InvoiceStageCard } from "@/components/InvoiceStageCard"
import {
  getARSummary,
  reconcile,
  fetchSupabaseInvoices,
  getInvoiceStageAnalysis,
  type ARSummary,
  type ReconciliationResult,
  type SupabaseInvoice,
} from "@/lib/arData"

export default function ARDashboard() {
  const [summary, setSummary] = useState<ARSummary | null>(null)
  const [reconciliation, setReconciliation] = useState<ReconciliationResult | null>(null)
  const [allInvoices, setAllInvoices] = useState<SupabaseInvoice[]>([])
  const [stageAnalysis, setStageAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastAtRiskTotal, setLastAtRiskTotal] = useState<number>(0)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load data with individual error handling for each API
      const [summaryData, reconciliationData, invoicesData, stageData] = await Promise.allSettled([
        getARSummary(),
        reconcile(),
        fetchSupabaseInvoices(),
        getInvoiceStageAnalysis(),
      ])

      // Handle successful results
      if (summaryData.status === "fulfilled") {
        setSummary(summaryData.value)
        setLastAtRiskTotal(summaryData.value.atRiskTotal)
      } else {
        console.error("Summary data failed:", summaryData.reason)
      }

      if (reconciliationData.status === "fulfilled") {
        setReconciliation(reconciliationData.value)
      } else {
        console.error("Reconciliation data failed:", reconciliationData.reason)
      }

      if (invoicesData.status === "fulfilled") {
        setAllInvoices(invoicesData.value)
      } else {
        console.error("Invoices data failed:", invoicesData.reason)
      }

      if (stageData.status === "fulfilled") {
        setStageAnalysis(stageData.value)
      } else {
        console.error("Stage analysis failed:", stageData.reason)
      }

      // Check if we have any data at all
      const hasAnyData =
        summaryData.status === "fulfilled" ||
        reconciliationData.status === "fulfilled" ||
        invoicesData.status === "fulfilled" ||
        stageData.status === "fulfilled"

      if (!hasAnyData) {
        setError("Failed to load any AR data. Please check your API connections.")
      }
    } catch (err) {
      console.error("Error loading AR data:", err)
      setError("Failed to load AR data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-neutral-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Loading AR Control Center...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-neutral-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              Unable to load summary data. Please check your API connections.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">AR Control Center</h1>
            <p className="text-neutral-400 mt-1 text-sm">Accounts Receivable Management Dashboard</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg border border-neutral-800 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        {summary.atRiskTotal > 0 && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400 text-sm">
              <strong className="font-semibold">WARNING:</strong> Your 30+ day overdue total is now{" "}
              {formatCurrency(summary.atRiskTotal)}. Call these customers today to collect outstanding balances.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <ARSummaryCards summary={summary} stageAnalysis={stageAnalysis} />

        {/* Invoice Stage Analysis */}
        {stageAnalysis && <InvoiceStageCard stageAnalysis={stageAnalysis} />}

        {/* Tabs */}
        {reconciliation && (
          <ARTabs
            unbilledWork={reconciliation.unbilledWork}
            unpaidInvoices={reconciliation.unpaidInvoices}
            syncIssues={reconciliation.syncIssues}
            allInvoices={allInvoices}
          />
        )}

        <div className="text-center text-neutral-500 text-xs border-t border-neutral-800 pt-6">
          <p>Last updated: {new Date().toLocaleString()} • Data refreshed automatically every 5 minutes</p>
        </div>
      </div>
    </div>
  )
}
