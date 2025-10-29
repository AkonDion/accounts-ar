import { fetchZohoFSMData } from './auth/fsmAuth';
import { fetchQuickBooksData } from './auth/qboAuth';

export interface WorkOrder {
  work_order_id: string;
  work_order_number: string;
  status: string;
  completed_at: string;
  territory: string;
  customer_name: string;
  total_estimated_amount: number;
}

export interface QuickBooksInvoice {
  Id: string;
  DocNumber: string;
  TxnDate: string;
  DueDate: string;
  TotalAmt: number;
  Balance: number;
  CustomerRef: {
    value: string;
    name: string;
  };
  PrivateNote?: string;
  LinkedTxn?: Array<{
    TxnId: string;
    TxnType: string;
  }>;
}

export interface SupabaseInvoice {
  id: string;
  invoice_id: number | null;
  invoice_number: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  date_issued: string;
  date_paid: string | null;
  billing_name: string;
  billing_email: string;
  work_order_id: string | null;
  qb_invoice_id: string | null;
  qb_customer_id: string | null;
  invoice_url: string | null;
  token: string | null;
  sent_at: string | null;
  reminder_1_sent: string | null;
  reminder_2_sent: string | null;
  final_reminder_sent: string | null;
  reminders_enabled: boolean;
  created_at: string;
  updated_at: string;
  // Stage information
  invoice_stage: 'Stage 1 Missing' | 'Stage 2 Partial' | 'Stage 2 Complete' | 'Unknown Stage';
}

export interface SyncIssue {
  invoice_number: string;
  supabase_status: string;
  qb_status: string;
  amount_due: number;
}

export interface ReconciliationResult {
  unbilledWork: WorkOrder[];
  unpaidInvoices: QuickBooksInvoice[];
  syncIssues: SyncIssue[];
}

export interface ARSummary {
  unbilledWorkTotal: number;
  unpaidInvoicesTotal: number;
  atRiskTotal: number;
  unbilledWorkChange: number;
  unpaidInvoicesChange: number;
  atRiskChange: number;
}

// Mock data for development
// No mock data - using real data from APIs

export async function fetchCompletedWorkOrders(): Promise<WorkOrder[]> {
  try {
    // Use Zoho FSM API with proper authentication
    const response = await fetch('/api/zoho/workorders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Zoho FSM API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching completed work orders:', error);
    return []; // Return empty array instead of mock data
  }
}

export async function fetchQuickBooksInvoices(): Promise<QuickBooksInvoice[]> {
  try {
    // Fetch from n8n webhook only
    const webhookResponse = await fetch('https://nodechain.dev/webhook/097c4202-c6f0-454c-9f5f-8aae3484d6f1', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!webhookResponse.ok) {
      throw new Error(`QuickBooks webhook error: ${webhookResponse.statusText}`);
    }
    
    const data = await webhookResponse.json();
    return data.QueryResponse?.Invoice || [];
  } catch (error) {
    console.error('Error fetching QuickBooks invoices from webhook:', error);
    return []; // Return empty array if webhook fails
  }
}

export async function fetchSupabaseInvoices(): Promise<SupabaseInvoice[]> {
  try {
    // Use Supabase MCP integration
    const response = await fetch('/api/supabase/invoices', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching Supabase invoices:', error);
    return []; // Return empty array instead of mock data
  }
}

export function calculateAge(dateIssued: string): number {
  const issued = new Date(dateIssued);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - issued.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isAtRisk(invoice: SupabaseInvoice): boolean {
  const age = calculateAge(invoice.date_issued);
  return invoice.amount_due > 0 && age > 30;
}

export async function reconcile(): Promise<ReconciliationResult> {
  const [workOrders, qbInvoices, supabaseInvoices] = await Promise.all([
    fetchCompletedWorkOrders(),
    fetchQuickBooksInvoices(),
    fetchSupabaseInvoices(),
  ]);

  // Find unbilled work (completed work orders without corresponding QuickBooks invoices)
  // Map by customer name and amount for accurate matching
  const billedWorkOrderIds = new Set(supabaseInvoices.map(inv => inv.work_order_id).filter(Boolean));
  const qbInvoiceCustomers = new Set(
    qbInvoices.map(inv => `${inv.CustomerRef.name}-${inv.TotalAmt}`)
  );
  
  const unbilledWork = workOrders.filter(wo => {
    const workOrderKey = `${wo.customer_name}-${wo.total_estimated_amount}`;
    return !billedWorkOrderIds.has(wo.work_order_id) && !qbInvoiceCustomers.has(workOrderKey);
  });

  // Find unpaid invoices (QuickBooks Balance > 0)
  const unpaidInvoices = qbInvoices.filter(inv => inv.Balance > 0);

  // Find sync issues (discrepancies between Supabase and QuickBooks)
  const syncIssues: SyncIssue[] = [];
  
  for (const supabaseInv of supabaseInvoices) {
    if (supabaseInv.qb_invoice_id) {
      const qbInv = qbInvoices.find(qb => qb.Id === supabaseInv.qb_invoice_id);
      if (qbInv) {
        // Check for status discrepancies
        const supabaseStatus = supabaseInv.amount_due > 0 ? 'unpaid' : 'paid';
        const qbStatus = qbInv.Balance > 0 ? 'unpaid' : 'paid';
        
        if (supabaseStatus !== qbStatus) {
          syncIssues.push({
            invoice_number: supabaseInv.invoice_number,
            supabase_status: supabaseStatus,
            qb_status: qbStatus,
            amount_due: supabaseInv.amount_due,
          });
        }
      }
    }
  }

  return {
    unbilledWork,
    unpaidInvoices,
    syncIssues,
  };
}

export async function getARSummary(): Promise<ARSummary> {
  const reconciliation = await reconcile();
  const supabaseInvoices = await fetchSupabaseInvoices();

  // Calculate totals
  const unbilledWorkTotal = reconciliation.unbilledWork.reduce(
    (sum, wo) => sum + wo.total_estimated_amount,
    0
  );

  const unpaidInvoicesTotal = reconciliation.unpaidInvoices.reduce(
    (sum, inv) => sum + inv.Balance,
    0
  );

  const atRiskTotal = supabaseInvoices
    .filter(isAtRisk)
    .reduce((sum, inv) => sum + inv.amount_due, 0);

  // TODO: Implement real change calculations by comparing with historical data
  // For now, return zero changes until historical data tracking is implemented
  return {
    unbilledWorkTotal,
    unpaidInvoicesTotal,
    atRiskTotal,
    unbilledWorkChange: 0, // TODO: Calculate vs last 7 days
    unpaidInvoicesChange: 0, // TODO: Calculate vs last 7 days
    atRiskChange: 0, // TODO: Calculate vs last 7 days
  };
}

export async function createInvoice(workOrderId: string): Promise<void> {
  console.log('Creating invoice for work order:', workOrderId);
  // TODO: Implement invoice creation logic
  // 1. Get work order details
  // 2. Create invoice in QuickBooks
  // 3. Store invoice in Supabase
  // 4. Link work order to invoice
}

export async function sendReminder(invoiceNumber: string): Promise<void> {
  console.log('Sending reminder for invoice:', invoiceNumber);
  // TODO: Implement reminder sending logic
  // 1. Get invoice details
  // 2. Send email reminder
  // 3. Log reminder activity
}

export async function fixMapping(invoiceNumber: string): Promise<void> {
  console.log('Fixing mapping for invoice:', invoiceNumber);
  // TODO: Implement mapping fix logic
  // 1. Identify sync issue
  // 2. Update Supabase record
  // 3. Verify QuickBooks status
}

export interface CustomerMapping {
  customerName: string;
  fsmWorkOrders: WorkOrder[];
  qbInvoices: QuickBooksInvoice[];
  supabaseInvoices: SupabaseInvoice[];
  totalUnbilled: number;
  totalUnpaid: number;
  mappingStatus: 'matched' | 'unbilled' | 'unpaid' | 'sync_issue';
}

export async function getCustomerMappings(): Promise<CustomerMapping[]> {
  const [workOrders, qbInvoices, supabaseInvoices] = await Promise.all([
    fetchCompletedWorkOrders(),
    fetchQuickBooksInvoices(),
    fetchSupabaseInvoices(),
  ]);

  // Get all unique customer names
  const allCustomers = new Set([
    ...workOrders.map(wo => wo.customer_name),
    ...qbInvoices.map(inv => inv.CustomerRef.name),
    ...supabaseInvoices.map(inv => inv.billing_name),
  ]);

  const mappings: CustomerMapping[] = [];

  for (const customerName of allCustomers) {
    const fsmWorkOrders = workOrders.filter(wo => wo.customer_name === customerName);
    const qbInvoicesForCustomer = qbInvoices.filter(inv => inv.CustomerRef.name === customerName);
    const supabaseInvoicesForCustomer = supabaseInvoices.filter(inv => inv.billing_name === customerName);

    const totalUnbilled = fsmWorkOrders.reduce((sum, wo) => sum + wo.total_estimated_amount, 0);
    const totalUnpaid = qbInvoicesForCustomer.reduce((sum, inv) => sum + inv.Balance, 0);

    let mappingStatus: CustomerMapping['mappingStatus'] = 'matched';
    if (totalUnbilled > 0 && totalUnpaid === 0) mappingStatus = 'unbilled';
    else if (totalUnpaid > 0 && totalUnbilled === 0) mappingStatus = 'unpaid';
    else if (totalUnbilled > 0 && totalUnpaid > 0) mappingStatus = 'sync_issue';

    mappings.push({
      customerName,
      fsmWorkOrders,
      qbInvoices: qbInvoicesForCustomer,
      supabaseInvoices: supabaseInvoicesForCustomer,
      totalUnbilled,
      totalUnpaid,
      mappingStatus,
    });
  }

  return mappings.sort((a, b) => b.totalUnbilled + b.totalUnpaid - (a.totalUnbilled + a.totalUnpaid));
}

export interface InvoiceStageAnalysis {
  stage1Missing: SupabaseInvoice[];
  stage2Partial: SupabaseInvoice[];
  stage2Complete: SupabaseInvoice[];
  totalStage1Missing: number;
  totalStage2Partial: number;
  totalStage2Complete: number;
  stageBreakdown: {
    stage1Missing: number;
    stage2Partial: number;
    stage2Complete: number;
  };
}

export function determineInvoiceStage(invoice: SupabaseInvoice): SupabaseInvoice['invoice_stage'] {
  if (invoice.invoice_id === null && invoice.token === null) {
    return 'Stage 1 Missing';
  } else if (invoice.invoice_id !== null && invoice.token !== null) {
    return 'Stage 2 Complete';
  } else if (invoice.invoice_id !== null && invoice.token === null) {
    return 'Stage 2 Partial';
  } else {
    return 'Unknown Stage';
  }
}

export async function getInvoiceStageAnalysis(): Promise<InvoiceStageAnalysis> {
  const supabaseInvoices = await fetchSupabaseInvoices();
  
  // Add stage information to each invoice
  const invoicesWithStages = supabaseInvoices.map(invoice => ({
    ...invoice,
    invoice_stage: determineInvoiceStage(invoice)
  }));

  const stage1Missing = invoicesWithStages.filter(inv => inv.invoice_stage === 'Stage 1 Missing');
  const stage2Partial = invoicesWithStages.filter(inv => inv.invoice_stage === 'Stage 2 Partial');
  const stage2Complete = invoicesWithStages.filter(inv => inv.invoice_stage === 'Stage 2 Complete');

  const totalStage1Missing = stage1Missing.reduce((sum, inv) => sum + inv.amount_due, 0);
  const totalStage2Partial = stage2Partial.reduce((sum, inv) => sum + inv.amount_due, 0);
  const totalStage2Complete = stage2Complete.reduce((sum, inv) => sum + inv.amount_due, 0);

  return {
    stage1Missing,
    stage2Partial,
    stage2Complete,
    totalStage1Missing,
    totalStage2Partial,
    totalStage2Complete,
    stageBreakdown: {
      stage1Missing: stage1Missing.length,
      stage2Partial: stage2Partial.length,
      stage2Complete: stage2Complete.length,
    }
  };
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
