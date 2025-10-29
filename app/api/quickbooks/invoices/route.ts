import { NextRequest, NextResponse } from 'next/server';
import { getQuickBooksToken } from '@/lib/auth/qboAuth';

export async function GET(request: NextRequest) {
  try {
    const token = await getQuickBooksToken();
    const baseUrl = process.env.QBO_BASE_URL || 'https://quickbooks.api.intuit.com/v3/company/9130352917010696';
    
    // Fetch invoices from QuickBooks Online
    const response = await fetch(`${baseUrl}/invoice`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`QuickBooks API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the response to match our QuickBooksInvoice interface
    const invoices = data.QueryResponse?.Invoice?.map((inv: any) => ({
      qb_invoice_id: inv.Id,
      invoice_number: inv.DocNumber,
      customer_name: inv.CustomerRef?.name || 'Unknown',
      invoice_date: inv.TxnDate,
      due_date: inv.DueDate,
      total_amount: parseFloat(inv.TotalAmt) || 0,
      balance: parseFloat(inv.Balance) || 0,
      status: inv.Balance > 0 ? (inv.DueDate && new Date(inv.DueDate) < new Date() ? 'Overdue' : 'Open') : 'Paid',
    })) || [];

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error in QuickBooks API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
