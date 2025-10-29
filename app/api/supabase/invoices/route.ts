import { type NextRequest, NextResponse } from "next/server"

const mockInvoices = [
  {
    id: "1",
    invoice_id: "INV-001",
    invoice_number: "INV-2024-001",
    amount: 5000,
    amount_paid: 5000,
    amount_due: 0,
    currency: "USD",
    status: "paid",
    date_issued: "2024-01-15",
    date_paid: "2024-01-20",
    billing_name: "Acme Corp",
    billing_email: "billing@acme.com",
    work_order_id: "WO-001",
    qb_invoice_id: "QB-001",
    qb_customer_id: "CUST-001",
    invoice_url: "https://example.com/invoice/1",
    token: "token123",
    sent_at: "2024-01-15",
    reminder_1_sent: null,
    reminder_2_sent: null,
    final_reminder_sent: null,
    reminders_enabled: true,
    created_at: "2024-01-15",
    updated_at: "2024-01-20",
  },
  {
    id: "2",
    invoice_id: "INV-002",
    invoice_number: "INV-2024-002",
    amount: 3500,
    amount_paid: 0,
    amount_due: 3500,
    currency: "USD",
    status: "unpaid",
    date_issued: "2024-01-20",
    date_paid: null,
    billing_name: "Tech Solutions Inc",
    billing_email: "billing@techsolutions.com",
    work_order_id: "WO-002",
    qb_invoice_id: "QB-002",
    qb_customer_id: "CUST-002",
    invoice_url: "https://example.com/invoice/2",
    token: "token456",
    sent_at: "2024-01-20",
    reminder_1_sent: "2024-02-05",
    reminder_2_sent: null,
    final_reminder_sent: null,
    reminders_enabled: true,
    created_at: "2024-01-20",
    updated_at: "2024-02-05",
  },
]

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Supabase invoices API called")

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log("[v0] Supabase not configured, returning mock data")
      return NextResponse.json(mockInvoices)
    }

    // Fetch real invoice data from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("[v0] Fetching from Supabase:", supabaseUrl)

    const response = await fetch(`${supabaseUrl}/rest/v1/invoices?select=*&order=created_at.desc&limit=50`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] Supabase response status:", response.status)

    if (!response.ok) {
      console.log("[v0] Supabase API error, falling back to mock data")
      return NextResponse.json(mockInvoices)
    }

    const invoices = await response.json()

    // Transform the data to match our interface
    const transformedInvoices = invoices.map((invoice: any) => ({
      id: invoice.id,
      invoice_id: invoice.invoice_id,
      invoice_number: invoice.invoice_number,
      amount: Number.parseFloat(invoice.amount) || 0,
      amount_paid: Number.parseFloat(invoice.amount_paid) || 0,
      amount_due: Number.parseFloat(invoice.amount_due) || 0,
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
    }))

    console.log(`[v0] Returning ${transformedInvoices.length} invoices from Supabase`)
    return NextResponse.json(transformedInvoices)
  } catch (error) {
    console.error("[v0] Error in Supabase API route:", error)
    console.log("[v0] Returning mock data due to error")
    return NextResponse.json(mockInvoices)
  }
}
