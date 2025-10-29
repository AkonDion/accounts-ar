"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, FileText } from "lucide-react"
import type { ARSummary } from "@/lib/arData"

interface ARSummaryCardsProps {
  summary: ARSummary
  stageAnalysis?: {
    stageBreakdown: {
      stage1Missing: number
      stage2Partial: number
      stage2Complete: number
    }
  }
}

export function ARSummaryCards({ summary, stageAnalysis }: ARSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatChange = (change: number) => {
    if (change === 0) return null

    const isPositive = change > 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const color = isPositive ? "text-red-500" : "text-green-500"

    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
      </div>
    )
  }

  const cards = [
    {
      title: "Unbilled Work",
      value: formatCurrency(summary.unbilledWorkTotal),
      change: summary.unbilledWorkChange,
      icon: FileText,
      description: "Completed work orders without invoices",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Unpaid Invoices",
      value: formatCurrency(summary.unpaidInvoicesTotal),
      change: summary.unpaidInvoicesChange,
      icon: DollarSign,
      description: "Outstanding invoice balances",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "At Risk",
      value: formatCurrency(summary.atRiskTotal),
      change: summary.atRiskChange,
      icon: AlertTriangle,
      description: "30+ day overdue balances",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
  ]

  // Add Stage 1 Missing card only if we have stage analysis data
  if (stageAnalysis) {
    cards.push({
      title: "Stage 1 Missing",
      value: stageAnalysis.stageBreakdown.stage1Missing.toString(),
      change: 0,
      icon: AlertTriangle,
      description: "Invoices missing Stage 1 processing",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="border-neutral-800 bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-white mb-2">{card.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500 leading-relaxed">{card.description}</p>
                {formatChange(card.change)}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
