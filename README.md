# AR Control Center

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Zoho FSM OAuth Credentials
ZOHO_FSM_CLIENT_ID=<your-client-id>
ZOHO_FSM_CLIENT_SECRET=<your-client-secret>
ZOHO_FSM_REFRESH_TOKEN=<your-refresh-token>
ZOHO_FSM_BASE_URL=https://fsm.zoho.com/fsm/v1

# QuickBooks Online OAuth Credentials
QBO_CLIENT_ID=<your-client-id>
QBO_CLIENT_SECRET=<your-client-secret>
QBO_REFRESH_TOKEN=<your-refresh-token>
QBO_REALM_ID=<your-realm-id>
QBO_BASE_URL=https://quickbooks.api.intuit.com/v3/company/<your-realm-id>

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000/ar](http://localhost:3000/ar) in your browser.

## Features

- **Dark Mode First**: Clean, minimal, high-contrast interface
- **Automatic Token Refresh**: Handles OAuth token refresh for both Zoho FSM and QuickBooks Online
- **Real-time Reconciliation**: Identifies unbilled work, unpaid invoices, and sync issues
- **At-Risk Monitoring**: Highlights 30+ day overdue balances with warnings
- **Action Buttons**: Create invoices, send reminders, and fix mapping issues

## Architecture

- **Frontend**: Next.js 14 with App Router, React, TypeScript, TailwindCSS
- **UI Components**: shadcn/ui with dark theme
- **Authentication**: Automatic OAuth token refresh for external APIs
- **Data Layer**: Reconciliation logic between Zoho FSM, QuickBooks Online, and Supabase
- **External APIs**: Zoho FSM REST API, QuickBooks Online API

## Database Schema

The `public.invoices` table structure:
- `id` (uuid, PK)
- `invoice_id` (bigint)
- `invoice_number` (string)
- `amount`, `amount_paid`, `amount_due` (decimal)
- `currency` (string)
- `status` (string)
- `date_issued`, `date_paid` (timestamp)
- `billing_name`, `billing_email` (string)
- `work_order_id` (string, nullable)
- `qb_invoice_id`, `qb_customer_id` (string, nullable)
- `invoice_url` (string, nullable)
- `created_at`, `updated_at` (timestamp)

## API Endpoints

- `/ar` - Main dashboard page
- Authentication helpers in `lib/auth/`
- Data reconciliation in `lib/arData.ts`
