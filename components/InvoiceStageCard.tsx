'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
// Local utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface InvoiceStageCardProps {
  stageAnalysis: {
    stage1Missing: any[];
    stage2Partial: any[];
    stage2Complete: any[];
    totalStage1Missing: number;
    totalStage2Partial: number;
    totalStage2Complete: number;
    stageBreakdown: {
      stage1Missing: number;
      stage2Partial: number;
      stage2Complete: number;
    };
  };
}

export function InvoiceStageCard({ stageAnalysis }: InvoiceStageCardProps) {
  const { stageBreakdown, totalStage1Missing, totalStage2Partial, totalStage2Complete } = stageAnalysis;

  return (
    <div className="space-y-6">
      {/* Stage Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Stage 1 Missing
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {stageBreakdown.stage1Missing}
            </div>
            <p className="text-xs text-gray-400">
              {formatCurrency(totalStage1Missing)} at risk
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Stage 2 Partial
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {stageBreakdown.stage2Partial}
            </div>
            <p className="text-xs text-gray-400">
              {formatCurrency(totalStage2Partial)} pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Stage 2 Complete
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {stageBreakdown.stage2Complete}
            </div>
            <p className="text-xs text-gray-400">
              {formatCurrency(totalStage2Complete)} ready
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stage 1 Missing - Critical Issues */}
      {stageAnalysis.stage1Missing.length > 0 && (
        <Card className="bg-gray-800 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Stage 1 Missing - Critical Issues
            </CardTitle>
            <CardDescription className="text-gray-400">
              These invoices exist in QuickBooks but haven't been processed through Stage 1 (Helcim integration).
              They cannot be sent to customers until Stage 1 is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageAnalysis.stage1Missing.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">{invoice.invoice_number}</span>
                      <Badge variant="outline" className="border-red-500 text-red-400">
                        Stage 1 Missing
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {invoice.billing_name} • {formatDate(invoice.date_issued)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {formatCurrency(invoice.amount_due)}
                    </div>
                    <Button
                      size="sm"
                      className="mt-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        console.log('Process Stage 1 for:', invoice.invoice_number);
                        // TODO: Implement Stage 1 processing
                      }}
                    >
                      Process Stage 1
                    </Button>
                  </div>
                </div>
              ))}
              {stageAnalysis.stage1Missing.length > 5 && (
                <div className="text-center text-gray-400 text-sm">
                  ... and {stageAnalysis.stage1Missing.length - 5} more invoices
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage 2 Partial - In Progress */}
      {stageAnalysis.stage2Partial.length > 0 && (
        <Card className="bg-gray-800 border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Stage 2 Partial - In Progress
            </CardTitle>
            <CardDescription className="text-gray-400">
              These invoices have been processed through Stage 1 but are missing Helcim tokens for Stage 2.
              They need to be completed to be sent to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageAnalysis.stage2Partial.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">{invoice.invoice_number}</span>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                        Stage 2 Partial
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {invoice.billing_name} • Invoice ID: {invoice.invoice_id}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {formatCurrency(invoice.amount_due)}
                    </div>
                    <Button
                      size="sm"
                      className="mt-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={() => {
                        console.log('Complete Stage 2 for:', invoice.invoice_number);
                        // TODO: Implement Stage 2 completion
                      }}
                    >
                      Complete Stage 2
                    </Button>
                  </div>
                </div>
              ))}
              {stageAnalysis.stage2Partial.length > 5 && (
                <div className="text-center text-gray-400 text-sm">
                  ... and {stageAnalysis.stage2Partial.length - 5} more invoices
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage 2 Complete - Ready to Send */}
      {stageAnalysis.stage2Complete.length > 0 && (
        <Card className="bg-gray-800 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Stage 2 Complete - Ready to Send
            </CardTitle>
            <CardDescription className="text-gray-400">
              These invoices are fully processed and ready to be sent to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageAnalysis.stage2Complete.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">{invoice.invoice_number}</span>
                      <Badge variant="outline" className="border-green-500 text-green-400">
                        Ready to Send
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {invoice.billing_name} • Token: {invoice.token?.substring(0, 8)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {formatCurrency(invoice.amount_due)}
                    </div>
                    <Button
                      size="sm"
                      className="mt-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        console.log('Send invoice:', invoice.invoice_number);
                        // TODO: Implement invoice sending
                      }}
                    >
                      Send Invoice
                    </Button>
                  </div>
                </div>
              ))}
              {stageAnalysis.stage2Complete.length > 5 && (
                <div className="text-center text-gray-400 text-sm">
                  ... and {stageAnalysis.stage2Complete.length - 5} more invoices
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
