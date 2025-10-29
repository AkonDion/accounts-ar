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
        <TabsList className="grid w-full grid-cols-4 bg-white border border-neutral-200 p-1 rounded-2xl shadow-sm">
          <TabsTrigger
            value="unbilled"
            className="data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 text-neutral-600 transition-all duration-200 rounded-xl"
          >
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Unbilled Work</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
              {unbilledWork.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="unpaid"
            className="data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 text-neutral-600 transition-all duration-200 rounded-xl"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Unpaid Invoices</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
              {unpaidInvoices.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="sync"
            className="data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 text-neutral-600 transition-all duration-200 rounded-xl"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Sync Issues</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">{syncIssues.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 text-neutral-600 transition-all duration-200 rounded-xl"
          >
            <span className="text-sm font-medium">All Invoices</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-neutral-200 text-neutral-700">
              {allInvoices.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unbilled" className="space-y-6 mt-6">
          <Card className="border-neutral-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-neutral-900 text-lg font-semibold">
                Completed Work Orders Without Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200 hover:bg-transparent">
                    <TableHead className="text-neutral-600 font-medium text-xs">WO #</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Customer</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Completed At</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Territory</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Est. Amount</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unbilledWork.map((workOrder) => (
                    <TableRow
                      key={workOrder.work_order_id}
                      className="border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                      <TableCell className="text-neutral-900 font-mono text-sm">
                        {workOrder.work_order_number}
                      </TableCell>
                      <TableCell className="text-neutral-700 text-sm">{workOrder.customer_name}</TableCell>
                      <TableCell className="text-neutral-600 text-sm">{formatDate(workOrder.completed_at)}</TableCell>
                      <TableCell className="text-neutral-600 text-sm">{workOrder.territory}</TableCell>
                      <TableCell className="text-neutral-900 font-semibold text-sm">
                        {formatCurrency(workOrder.total_estimated_amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleCreateInvoice(workOrder.work_order_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors rounded-lg"
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
          <Card className="border-neutral-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-neutral-900 text-lg font-semibold">Outstanding Invoice Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200 hover:bg-transparent">
                    <TableHead className="text-neutral-600 font-medium text-xs">Invoice #</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Customer</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Issued</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Age (days)</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Amount</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Balance</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Status</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidInvoices.map((invoice) => {
                    const age = calculateAge(invoice.TxnDate)
                    const isOverdue = age > 30
                    const status = invoice.Balance > 0 ? (isOverdue ? "Overdue" : "Open") : "Paid"

                    return (
                      <TableRow key={invoice.Id} className="border-neutral-200 hover:bg-neutral-50 transition-colors">
                        <TableCell className="text-neutral-900 font-mono text-sm">{invoice.DocNumber}</TableCell>
                        <TableCell className="text-neutral-700 text-sm">{invoice.CustomerRef.name}</TableCell>
                        <TableCell className="text-neutral-600 text-sm">{formatDate(invoice.TxnDate)}</TableCell>
                        <TableCell
                          className={isOverdue ? "text-red-600 font-semibold text-sm" : "text-neutral-600 text-sm"}
                        >
                          {age}
                        </TableCell>
                        <TableCell className="text-neutral-900 font-semibold text-sm">
                          {formatCurrency(invoice.TotalAmt)}
                        </TableCell>
                        <TableCell className="text-neutral-900 font-semibold text-sm">
                          {formatCurrency(invoice.Balance)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              status === "Overdue"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-yellow-50 text-yellow-600 border border-yellow-200"
                            }`}
                          >
                            {status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSendReminder(invoice.DocNumber)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm transition-colors rounded-lg"
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
          <Card className="border-neutral-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-neutral-900 text-lg font-semibold">
                Supabase ↔ QuickBooks Discrepancies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200 hover:bg-transparent">
                    <TableHead className="text-neutral-600 font-medium text-xs">Invoice #</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Supabase Status</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">QuickBooks Status</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Amount Due</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncIssues.map((issue, index) => (
                    <TableRow key={index} className="border-neutral-200 hover:bg-neutral-50 transition-colors">
                      <TableCell className="text-neutral-900 font-mono text-sm">{issue.invoice_number}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            issue.supabase_status === "unpaid"
                              ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}
                        >
                          {issue.supabase_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            issue.qb_status === "unpaid"
                              ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}
                        >
                          {issue.qb_status}
                        </span>
                      </TableCell>
                      <TableCell className="text-neutral-900 font-semibold text-sm">
                        {formatCurrency(issue.amount_due)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleFixMapping(issue.invoice_number)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm transition-colors rounded-lg"
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
          <Card className="border-neutral-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-neutral-900 text-lg font-semibold">All Invoices</CardTitle>
              <div className="flex items-center gap-2 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500 focus:border-neutral-400 rounded-xl"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200 hover:bg-transparent">
                    <TableHead className="text-neutral-600 font-medium text-xs">Invoice #</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Customer</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Issued</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Amount</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Paid</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Due</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">Status</TableHead>
                    <TableHead className="text-neutral-600 font-medium text-xs">QB Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-neutral-200 hover:bg-neutral-50 transition-colors">
                      <TableCell className="text-neutral-900 font-mono text-sm">{invoice.invoice_number}</TableCell>
                      <TableCell className="text-neutral-700 text-sm">{invoice.billing_name}</TableCell>
                      <TableCell className="text-neutral-600 text-sm">{formatDate(invoice.date_issued)}</TableCell>
                      <TableCell className="text-neutral-900 font-semibold text-sm">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="text-neutral-600 text-sm">{formatCurrency(invoice.amount_paid)}</TableCell>
                      <TableCell className="text-neutral-900 font-semibold text-sm">
                        {formatCurrency(invoice.amount_due)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            invoice.amount_due > 0
                              ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            invoice.qb_invoice_id
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
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
