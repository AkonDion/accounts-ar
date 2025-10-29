"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react"
// Local utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface InvoiceStageCardProps {
  stageAnalysis: {
    stage1Missing: any[]
    stage2Partial: any[]
    stage2Complete: any[]
    totalStage1Missing: number
    totalStage2Partial: number
    totalStage2Complete: number
    stageBreakdown: {
      stage1Missing: number
      stage2Partial: number
      stage2Complete: number
    }
  }
}

export function InvoiceStageCard({ stageAnalysis }: InvoiceStageCardProps) {
  const { stageBreakdown, totalStage1Missing, totalStage2Partial, totalStage2Complete } = stageAnalysis

  return (
    <div className="space-y-6">
      {/* Stage Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400">Stage 1 Missing</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-400">{stageBreakdown.stage1Missing}</div>
            <p className="text-xs text-neutral-500 mt-1">{formatCurrency(totalStage1Missing)} at risk</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400">Stage 2 Partial</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-yellow-400">{stageBreakdown.stage2Partial}</div>
            <p className="text-xs text-neutral-500 mt-1">{formatCurrency(totalStage2Partial)} pending</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400">Stage 2 Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-400">{stageBreakdown.stage2Complete}</div>
            <p className="text-xs text-neutral-500 mt-1">{formatCurrency(totalStage2Complete)} ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Stage 1 Missing - Critical Issues */}
      {stageAnalysis.stage1Missing.length > 0 && (
        <Card className="bg-neutral-900 border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5" />
              Stage 1 Missing - Critical Issues
            </CardTitle>
            <CardDescription className="text-neutral-400 text-sm leading-relaxed">
              These invoices exist in QuickBooks but haven't been processed through Stage 1 (Helcim integration). They
              cannot be sent to customers until Stage 1 is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageAnalysis.stage1Missing.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white text-sm">{invoice.invoice_number}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        Stage 1 Missing
                      </span>
                    </div>
                    <div className="text-sm text-neutral-400 mt-1">
                      {invoice.billing_name} • {formatDate(invoice.date_issued)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm">{formatCurrency(invoice.amount_due)}</div>
                    <Button
                      size="sm"
                      className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
                      onClick={() => {
                        console.log("Process Stage 1 for:", invoice.invoice_number)
                        // TODO: Implement Stage 1 processing
                      }}
                    >
                      Process Stage 1
                    </Button>
                  </div>
                </div>
              ))}
              {stageAnalysis.stage1Missing.length > 5 && (
                <div className="text-center text-neutral-500 text-sm pt-2">
                  ... and {stageAnalysis.stage1Missing.length - 5} more invoices
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage 2 Partial - In Progress */}
      {stageAnalysis.stage2Partial.length > 0 && (
        <Card className="bg-neutral-900 border-yellow-500/50">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              Stage 2 Partial - In Progress
            </CardTitle>
            <CardDescription className="text-neutral-400 text-sm leading-relaxed">
              These invoices have been processed through Stage 1 but are missing Helcim tokens for Stage 2. They need to
              be completed to be sent to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageAnalysis.stage2Partial.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white text-sm">{invoice.invoice_number}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        Stage 2 Partial
                      </span>
                    </div>
                    <div className="text-sm text-neutral-400 mt-1">
                      {invoice.billing_name} • Invoice ID: {invoice.invoice_id}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm">{formatCurrency(invoice.amount_due)}</div>
                    <Button
                      size="sm"
                      className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm transition-colors"
                      onClick={() => {
                        console.log("Complete Stage 2 for:", invoice.invoice_number)
                        // TODO: Implement Stage 2 completion
                      }}
                    >
                      Complete Stage 2
                    </Button>
                  </div>
                </div>
              ))}
              {stageAnalysis.stage2Partial.length > 5 && (
                <div className="text-center text-neutral-500 text-sm pt-2">
                  ... and {stageAnalysis.stage2Partial.length - 5} more invoices
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage 2 Complete - Ready to Send */}
      {stageAnalysis.stage2Complete.length > 0 && (
        <Card className="bg-neutral-900 border-green-500/50">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2 text-lg font-semibold">
              <CheckCircle className="h-5 w-5" />
              Stage 2 Complete - Ready to Send
            </CardTitle>
            <CardDescription className="text-neutral-400 text-sm leading-relaxed">
              These invoices are fully processed and ready to be sent to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageAnalysis.stage2Complete.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white text-sm">{invoice.invoice_number}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        Ready to Send
                      </span>
                    </div>
                    <div className="text-sm text-neutral-400 mt-1">
                      {invoice.billing_name} • Token: {invoice.token?.substring(0, 8)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm">{formatCurrency(invoice.amount_due)}</div>
                    <Button
                      size="sm"
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm transition-colors"
                      onClick={() => {
                        console.log("Send invoice:", invoice.invoice_number)
                        // TODO: Implement invoice sending
                      }}
                    >
                      Send Invoice
                    </Button>
                  </div>
                </div>
              ))}
              {stageAnalysis.stage2Complete.length > 5 && (
                <div className="text-center text-neutral-500 text-sm pt-2">
                  ... and {stageAnalysis.stage2Complete.length - 5} more invoices
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
