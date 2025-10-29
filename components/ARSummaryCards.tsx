"use client"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

  const cards = [
    {
      title: "Unbilled Work",
      value: formatCurrency(summary.unbilledWorkTotal),
      change: summary.unbilledWorkChange,
      icon: FileText,
      description: "Trending up this month",
      subtitle: "Completed work orders without invoices",
      isNegative: false,
    },
    {
      title: "Unpaid Invoices",
      value: formatCurrency(summary.unpaidInvoicesTotal),
      change: summary.unpaidInvoicesChange,
      icon: DollarSign,
      description: summary.unpaidInvoicesChange < 0 ? "Down from last period" : "Up from last period",
      subtitle: "Outstanding invoice balances",
      isNegative: summary.unpaidInvoicesChange > 0,
    },
    {
      title: "At Risk",
      value: formatCurrency(summary.atRiskTotal),
      change: summary.atRiskChange,
      icon: AlertTriangle,
      description: summary.atRiskChange > 0 ? "Needs immediate attention" : "Improving collection rate",
      subtitle: "30+ day overdue balances",
      isNegative: true,
    },
  ]

  if (stageAnalysis) {
    cards.push({
      title: "Stage 1 Missing",
      value: stageAnalysis.stageBreakdown.stage1Missing.toString(),
      change: 0,
      icon: AlertTriangle,
      description: "Critical processing required",
      subtitle: "Invoices missing Stage 1 processing",
      isNegative: true,
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const showBadge = card.change !== 0
        const TrendIcon = card.change > 0 ? TrendingUp : TrendingDown

        return (
          <Card key={card.title} className="relative @container/card">
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{card.value}</CardTitle>
              {showBadge && (
                <CardAction>
                  <Badge variant="outline" className="gap-1">
                    <TrendIcon className="h-3 w-3" />
                    {card.change > 0 ? "+" : ""}
                    {card.change.toFixed(1)}%
                  </Badge>
                </CardAction>
              )}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.description} <Icon className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground">{card.subtitle}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
