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
        <Card className="bg-white border-neutral-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-neutral-600">Stage 1 Missing</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-red-600 mb-1">{stageBreakdown.stage1Missing}</div>
            <p className="text-xs text-neutral-500">{formatCurrency(totalStage1Missing)} at risk</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-neutral-600">Stage 2 Partial</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-yellow-600 mb-1">{stageBreakdown.stage2Partial}</div>
            <p className="text-xs text-neutral-500">{formatCurrency(totalStage2Partial)} pending</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-neutral-600">Stage 2 Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-emerald-600 mb-1">{stageBreakdown.stage2Complete}</div>
            <p className="text-xs text-neutral-500">{formatCurrency(totalStage2Complete)} ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Stage 1 Missing - Critical Issues */}
      {stageAnalysis.stage1Missing.length > 0 && (
        <Card className="bg-white border-red-200 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5" />
              Stage 1 Missing - Critical Issues
            </CardTitle>
            <CardDescription className="text-neutral-600 text-sm leading-relaxed">
              These invoices exist in QuickBooks but haven't been processed through Stage 1 (Helcim integration). They
              cannot be sent to customers until Stage 1 is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageAnalysis.stage1Missing.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-neutral-900 text-sm font-medium">{invoice.invoice_number}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                        Stage 1 Missing
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600 mt-1">
                      {invoice.billing_name} • {formatDate(invoice.date_issued)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-neutral-900 font-semibold text-sm mb-2">
                      {formatCurrency(invoice.amount_due)}
                    </div>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white text-sm transition-all duration-200 rounded-lg"
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
        <Card className="bg-white border-yellow-200 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-yellow-600 flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              Stage 2 Partial - In Progress
            </CardTitle>
            <CardDescription className="text-neutral-600 text-sm leading-relaxed">
              These invoices have been processed through Stage 1 but are missing Helcim tokens for Stage 2. They need to
              be completed to be sent to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageAnalysis.stage2Partial.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-neutral-900 text-sm font-medium">{invoice.invoice_number}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-600 border border-yellow-200">
                        Stage 2 Partial
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600 mt-1">
                      {invoice.billing_name} • Invoice ID: {invoice.invoice_id}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-neutral-900 font-semibold text-sm mb-2">
                      {formatCurrency(invoice.amount_due)}
                    </div>
                    <Button
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm transition-all duration-200 rounded-lg"
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
        <Card className="bg-white border-emerald-200 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-emerald-600 flex items-center gap-2 text-lg font-semibold">
              <CheckCircle className="h-5 w-5" />
              Stage 2 Complete - Ready to Send
            </CardTitle>
            <CardDescription className="text-neutral-600 text-sm leading-relaxed">
              These invoices are fully processed and ready to be sent to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageAnalysis.stage2Complete.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-neutral-900 text-sm font-medium">{invoice.invoice_number}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Ready to Send
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600 mt-1">
                      {invoice.billing_name} • Token: {invoice.token?.substring(0, 8)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-neutral-900 font-semibold text-sm mb-2">
                      {formatCurrency(invoice.amount_due)}
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition-all duration-200 rounded-lg"
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
