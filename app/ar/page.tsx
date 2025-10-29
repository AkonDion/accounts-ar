"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { ARSummaryCards } from "@/components/ARSummaryCards"
import { ARTabs } from "@/components/ARTabs"
import { InvoiceStageCard } from "@/components/InvoiceStageCard"
import { PaidInvoicesChart } from "@/components/PaidInvoicesChart"
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

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [summaryData, reconciliationData, invoicesData, stageData] = await Promise.allSettled([
        getARSummary(),
        reconcile(),
        fetchSupabaseInvoices(),
        getInvoiceStageAnalysis(),
      ])

      if (summaryData.status === "fulfilled") {
        setSummary(summaryData.value)
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
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-3 text-muted-foreground">
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
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-[1400px] mx-auto">
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-[1400px] mx-auto">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Unable to load summary data. Please check your API connections.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 @container/main">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AR Control Center</h1>
            <p className="text-muted-foreground mt-1 text-sm">Cash Flow & Collections Overview</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg border transition-colors text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {summary.atRiskTotal > 0 && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm leading-relaxed">
              <strong className="font-semibold">WARNING:</strong> Your 30+ day overdue total is now{" "}
              {formatCurrency(summary.atRiskTotal)}. Call these customers today to collect outstanding balances.
            </AlertDescription>
          </Alert>
        )}

        <ARSummaryCards summary={summary} stageAnalysis={stageAnalysis} />

        {allInvoices.length > 0 && <PaidInvoicesChart invoices={allInvoices} />}

        {stageAnalysis && <InvoiceStageCard stageAnalysis={stageAnalysis} />}

        {reconciliation && (
          <ARTabs
            unbilledWork={reconciliation.unbilledWork}
            unpaidInvoices={reconciliation.unpaidInvoices}
            syncIssues={reconciliation.syncIssues}
            allInvoices={allInvoices}
          />
        )}

        <div className="text-center text-muted-foreground text-xs pt-8 border-t">
          <p>© 2025 Comfort Hub | conforthub.ca</p>
        </div>
      </div>
    </div>
  )
}
