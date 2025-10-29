import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Supabase invoices API called - fetching real data');
    
    // Fetch real invoice data from Supabase
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/invoices?select=*&order=created_at.desc&limit=50`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.statusText}`);
    }

    const invoices = await response.json();
    
    // Transform the data to match our interface
    const transformedInvoices = invoices.map((invoice: any) => ({
      id: invoice.id,
      invoice_id: invoice.invoice_id,
      invoice_number: invoice.invoice_number,
      amount: parseFloat(invoice.amount) || 0,
      amount_paid: parseFloat(invoice.amount_paid) || 0,
      amount_due: parseFloat(invoice.amount_due) || 0,
      currency: invoice.currency,
      status: invoice.status,
      date_issued: invoice.date_issued,
      date_paid: invoice.date_paid,
      billing_name: invoice.billing_name,
      billing_email: invoice.billing_email,
      work_order_id: invoice.work_order_id,
      qb_invoice_id: invoice.qb_invoice_id,
      qb_customer_id: invoice.qb_customer_id,
      invoice_url: invoice.invoice_url,
      token: invoice.token,
      sent_at: invoice.sent_at,
      reminder_1_sent: invoice.reminder_1_sent,
      reminder_2_sent: invoice.reminder_2_sent,
      final_reminder_sent: invoice.final_reminder_sent,
      reminders_enabled: invoice.reminders_enabled,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
    }));

    console.log(`Returning ${transformedInvoices.length} invoices from Supabase`);
    return NextResponse.json(transformedInvoices);
  } catch (error) {
    console.error('Error in Supabase API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
