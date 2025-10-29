"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { SupabaseInvoice } from "@/lib/arData"
import { useMemo, useState } from "react"

interface PaidInvoicesChartProps {
  invoices: SupabaseInvoice[]
}

type TimeRange = "7days" | "30days" | "3months"

export function PaidInvoicesChart({ invoices }: PaidInvoicesChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3months")

  const chartData = useMemo(() => {
    // Filter paid invoices
    const paidInvoices = invoices.filter((inv) => inv.status === "paid" && inv.date_paid)

    // Determine date range
    const now = new Date()
    const daysBack = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Group by date
    const dateMap = new Map<string, { count: number; amount: number }>()

    paidInvoices.forEach((invoice) => {
      if (!invoice.date_paid) return
      const paidDate = new Date(invoice.date_paid)
      if (paidDate < startDate) return

      const dateKey = paidDate.toISOString().split("T")[0]
      const existing = dateMap.get(dateKey) || { count: 0, amount: 0 }
      dateMap.set(dateKey, {
        count: existing.count + 1,
        amount: existing.amount + invoice.amount_paid,
      })
    })

    // Fill in missing dates and sort
    const result = []
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split("T")[0]
      const data = dateMap.get(dateKey) || { count: 0, amount: 0 }
      result.push({
        date: dateKey,
        dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count: data.count,
        amount: data.amount,
      })
    }

    return result
  }, [invoices, timeRange])

  const totalPaid = useMemo(() => {
    return chartData.reduce((sum, day) => sum + day.amount, 0)
  }, [chartData])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Paid Invoices</CardTitle>
          <CardDescription>
            Total for the last {timeRange === "7days" ? "7 days" : timeRange === "30days" ? "30 days" : "3 months"}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("3months")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              timeRange === "3months" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Last 3 months
          </button>
          <button
            onClick={() => setTimeRange("30days")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              timeRange === "30days" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setTimeRange("7days")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              timeRange === "7days" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Last 7 days
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            amount: {
              label: "Amount Paid",
              color: "hsl(var(--chart-1))",
            },
            count: {
              label: "Invoice Count",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="dateLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="amount"
              type="monotone"
              fill="url(#fillAmount)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="count"
              type="monotone"
              fill="url(#fillCount)"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
