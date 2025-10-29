"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, DollarSign, AlertTriangle, Search, Plus, Mail, Wrench } from "lucide-react"
import {
  type WorkOrder,
  type QuickBooksInvoice,
  type SupabaseInvoice,
  type SyncIssue,
  createInvoice,
  sendReminder,
  fixMapping,
  calculateAge,
} from "@/lib/arData"

interface ARTabsProps {
  unbilledWork: WorkOrder[]
  unpaidInvoices: QuickBooksInvoice[]
  syncIssues: SyncIssue[]
  allInvoices: SupabaseInvoice[]
}

export function ARTabs({ unbilledWork, unpaidInvoices, syncIssues, allInvoices }: ARTabsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleCreateInvoice = async (workOrderId: string) => {
    try {
      await createInvoice(workOrderId)
      // TODO: Refresh data or show success message
    } catch (error) {
      console.error("Error creating invoice:", error)
    }
  }

  const handleSendReminder = async (invoiceNumber: string) => {
    try {
      await sendReminder(invoiceNumber)
      // TODO: Refresh data or show success message
    } catch (error) {
      console.error("Error sending reminder:", error)
    }
  }

  const handleFixMapping = async (invoiceNumber: string) => {
    try {
      await fixMapping(invoiceNumber)
      // TODO: Refresh data or show success message
    } catch (error) {
      console.error("Error fixing mapping:", error)
    }
  }

  const filteredInvoices = allInvoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.billing_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="unbilled" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-neutral-900 border border-neutral-800 p-1">
          <TabsTrigger
            value="unbilled"
            className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400 transition-all duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Unbilled Work</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
              {unbilledWork.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="unpaid"
            className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400 transition-all duration-200"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Unpaid Invoices</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
              {unpaidInvoices.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="sync"
            className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400 transition-all duration-200"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Sync Issues</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">
              {syncIssues.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400 transition-all duration-200"
          >
            <span className="text-sm font-medium">All Invoices</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-neutral-700 text-neutral-400">
              {allInvoices.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unbilled" className="space-y-6 mt-6">
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg font-semibold">Completed Work Orders Without Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-800 hover:bg-transparent">
                    <TableHead className="text-neutral-400 font-medium">WO #</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Customer</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Completed At</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Territory</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Est. Amount</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unbilledWork.map((workOrder) => (
                    <TableRow
                      key={workOrder.work_order_id}
                      className="border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                    >
                      <TableCell className="text-white font-mono text-sm">{workOrder.work_order_number}</TableCell>
                      <TableCell className="text-neutral-300 text-sm">{workOrder.customer_name}</TableCell>
                      <TableCell className="text-neutral-400 text-sm">{formatDate(workOrder.completed_at)}</TableCell>
                      <TableCell className="text-neutral-400 text-sm">{workOrder.territory}</TableCell>
                      <TableCell className="text-white font-semibold text-sm">
                        {formatCurrency(workOrder.total_estimated_amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleCreateInvoice(workOrder.work_order_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unpaid" className="space-y-6 mt-6">
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg font-semibold">Outstanding Invoice Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-800 hover:bg-transparent">
                    <TableHead className="text-neutral-400 font-medium">Invoice #</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Customer</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Issued</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Age (days)</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Amount</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Balance</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Status</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidInvoices.map((invoice) => {
                    const age = calculateAge(invoice.TxnDate)
                    const isOverdue = age > 30
                    const status = invoice.Balance > 0 ? (isOverdue ? "Overdue" : "Open") : "Paid"

                    return (
                      <TableRow
                        key={invoice.Id}
                        className="border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                      >
                        <TableCell className="text-white font-mono text-sm">{invoice.DocNumber}</TableCell>
                        <TableCell className="text-neutral-300 text-sm">{invoice.CustomerRef.name}</TableCell>
                        <TableCell className="text-neutral-400 text-sm">{formatDate(invoice.TxnDate)}</TableCell>
                        <TableCell
                          className={isOverdue ? "text-red-400 font-semibold text-sm" : "text-neutral-400 text-sm"}
                        >
                          {age}
                        </TableCell>
                        <TableCell className="text-white font-semibold text-sm">
                          {formatCurrency(invoice.TotalAmt)}
                        </TableCell>
                        <TableCell className="text-white font-semibold text-sm">
                          {formatCurrency(invoice.Balance)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              status === "Overdue"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            }`}
                          >
                            {status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSendReminder(invoice.DocNumber)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm transition-colors"
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Send Reminder
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6 mt-6">
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg font-semibold">Supabase ↔ QuickBooks Discrepancies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-800 hover:bg-transparent">
                    <TableHead className="text-neutral-400 font-medium">Invoice #</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Supabase Status</TableHead>
                    <TableHead className="text-neutral-400 font-medium">QuickBooks Status</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Amount Due</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncIssues.map((issue, index) => (
                    <TableRow key={index} className="border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                      <TableCell className="text-white font-mono text-sm">{issue.invoice_number}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            issue.supabase_status === "unpaid"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}
                        >
                          {issue.supabase_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            issue.qb_status === "unpaid"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}
                        >
                          {issue.qb_status}
                        </span>
                      </TableCell>
                      <TableCell className="text-white font-semibold text-sm">
                        {formatCurrency(issue.amount_due)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleFixMapping(issue.invoice_number)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
                        >
                          <Wrench className="h-4 w-4 mr-1" />
                          Fix Mapping
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-6 mt-6">
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg font-semibold">All Invoices</CardTitle>
              <div className="flex items-center gap-2 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-800 hover:bg-transparent">
                    <TableHead className="text-neutral-400 font-medium">Invoice #</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Customer</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Issued</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Amount</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Paid</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Due</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Status</TableHead>
                    <TableHead className="text-neutral-400 font-medium">QB Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                      <TableCell className="text-white font-mono text-sm">{invoice.invoice_number}</TableCell>
                      <TableCell className="text-neutral-300 text-sm">{invoice.billing_name}</TableCell>
                      <TableCell className="text-neutral-400 text-sm">{formatDate(invoice.date_issued)}</TableCell>
                      <TableCell className="text-white font-semibold text-sm">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="text-neutral-400 text-sm">{formatCurrency(invoice.amount_paid)}</TableCell>
                      <TableCell className="text-white font-semibold text-sm">
                        {formatCurrency(invoice.amount_due)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            invoice.amount_due > 0
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            invoice.qb_invoice_id
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-neutral-700 text-neutral-400 border border-neutral-600"
                          }`}
                        >
                          {invoice.qb_invoice_id ? "Synced" : "Not Synced"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
