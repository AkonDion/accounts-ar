'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  Search,
  Plus,
  Mail,
  Wrench
} from 'lucide-react';
import { 
  WorkOrder, 
  QuickBooksInvoice, 
  SupabaseInvoice, 
  SyncIssue,
  createInvoice,
  sendReminder,
  fixMapping,
  calculateAge
} from '@/lib/arData';

interface ARTabsProps {
  unbilledWork: WorkOrder[];
  unpaidInvoices: QuickBooksInvoice[];
  syncIssues: SyncIssue[];
  allInvoices: SupabaseInvoice[];
}

export function ARTabs({ 
  unbilledWork, 
  unpaidInvoices, 
  syncIssues, 
  allInvoices 
}: ARTabsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateInvoice = async (workOrderId: string) => {
    try {
      await createInvoice(workOrderId);
      // TODO: Refresh data or show success message
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleSendReminder = async (invoiceNumber: string) => {
    try {
      await sendReminder(invoiceNumber);
      // TODO: Refresh data or show success message
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const handleFixMapping = async (invoiceNumber: string) => {
    try {
      await fixMapping(invoiceNumber);
      // TODO: Refresh data or show success message
    } catch (error) {
      console.error('Error fixing mapping:', error);
    }
  };

  const filteredInvoices = allInvoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.billing_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="unbilled" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger 
            value="unbilled" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Unbilled Work
            <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-400">
              {unbilledWork.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="unpaid" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Unpaid Invoices
            <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-400">
              {unpaidInvoices.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="sync" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Sync Issues
            <Badge variant="secondary" className="ml-2 bg-red-500/20 text-red-400">
              {syncIssues.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            All Invoices
            <Badge variant="secondary" className="ml-2 bg-gray-500/20 text-gray-400">
              {allInvoices.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unbilled" className="space-y-4">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Completed Work Orders Without Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">WO #</TableHead>
                    <TableHead className="text-gray-300">Customer</TableHead>
                    <TableHead className="text-gray-300">Completed At</TableHead>
                    <TableHead className="text-gray-300">Territory</TableHead>
                    <TableHead className="text-gray-300">Est. Amount</TableHead>
                    <TableHead className="text-gray-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unbilledWork.map((workOrder) => (
                    <TableRow key={workOrder.work_order_id} className="border-gray-700">
                      <TableCell className="text-white font-mono">
                        {workOrder.work_order_number}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {workOrder.customer_name}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(workOrder.completed_at)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {workOrder.territory}
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {formatCurrency(workOrder.total_estimated_amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleCreateInvoice(workOrder.work_order_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
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

        <TabsContent value="unpaid" className="space-y-4">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Outstanding Invoice Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Invoice #</TableHead>
                    <TableHead className="text-gray-300">Customer</TableHead>
                    <TableHead className="text-gray-300">Issued</TableHead>
                    <TableHead className="text-gray-300">Age (days)</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Balance</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidInvoices.map((invoice) => {
                    const age = calculateAge(invoice.TxnDate);
                    const isOverdue = age > 30;
                    const status = invoice.Balance > 0 ? (isOverdue ? 'Overdue' : 'Open') : 'Paid';
                    
                    return (
                      <TableRow key={invoice.Id} className="border-gray-700">
                        <TableCell className="text-white font-mono">
                          {invoice.DocNumber}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {invoice.CustomerRef.name}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatDate(invoice.TxnDate)}
                        </TableCell>
                        <TableCell className={isOverdue ? 'text-red-400 font-semibold' : 'text-gray-300'}>
                          {age}
                        </TableCell>
                        <TableCell className="text-white font-semibold">
                          {formatCurrency(invoice.TotalAmt)}
                        </TableCell>
                        <TableCell className="text-white font-semibold">
                          {formatCurrency(invoice.Balance)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              status === 'Overdue' 
                                ? 'border-red-500 text-red-400' 
                                : 'border-yellow-500 text-yellow-400'
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSendReminder(invoice.DocNumber)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Send Reminder
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Supabase ↔ QuickBooks Discrepancies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Invoice #</TableHead>
                    <TableHead className="text-gray-300">Supabase Status</TableHead>
                    <TableHead className="text-gray-300">QuickBooks Status</TableHead>
                    <TableHead className="text-gray-300">Amount Due</TableHead>
                    <TableHead className="text-gray-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncIssues.map((issue, index) => (
                    <TableRow key={index} className="border-gray-700">
                      <TableCell className="text-white font-mono">
                        {issue.invoice_number}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            issue.supabase_status === 'unpaid' 
                              ? 'border-yellow-500 text-yellow-400' 
                              : 'border-green-500 text-green-400'
                          }
                        >
                          {issue.supabase_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            issue.qb_status === 'unpaid' 
                              ? 'border-yellow-500 text-yellow-400' 
                              : 'border-green-500 text-green-400'
                          }
                        >
                          {issue.qb_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {formatCurrency(issue.amount_due)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleFixMapping(issue.invoice_number)}
                          className="bg-red-600 hover:bg-red-700 text-white"
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

        <TabsContent value="all" className="space-y-4">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">All Invoices</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Invoice #</TableHead>
                    <TableHead className="text-gray-300">Customer</TableHead>
                    <TableHead className="text-gray-300">Issued</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Paid</TableHead>
                    <TableHead className="text-gray-300">Due</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">QB Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-gray-700">
                      <TableCell className="text-white font-mono">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {invoice.billing_name}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(invoice.date_issued)}
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatCurrency(invoice.amount_paid)}
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {formatCurrency(invoice.amount_due)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            invoice.amount_due > 0 
                              ? 'border-yellow-500 text-yellow-400' 
                              : 'border-green-500 text-green-400'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            invoice.qb_invoice_id 
                              ? 'border-green-500 text-green-400' 
                              : 'border-gray-500 text-gray-400'
                          }
                        >
                          {invoice.qb_invoice_id ? 'Synced' : 'Not Synced'}
                        </Badge>
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
  );
}
