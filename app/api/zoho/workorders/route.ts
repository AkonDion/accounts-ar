import { NextRequest, NextResponse } from 'next/server';
import { getZohoFSMToken } from '@/lib/auth/fsmAuth';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting Zoho FSM API call...');
    const token = await getZohoFSMToken();
    console.log('Token retrieved successfully');
    const baseUrl = process.env.ZOHO_FSM_BASE_URL || 'https://fsm.zoho.com/fsm/v1';
    console.log('Base URL:', baseUrl);
    
    // Fetch work orders from Zoho FSM
    const response = await fetch(`${baseUrl}/Work_Orders?per_page=200`, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Zoho FSM API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Response data keys:', Object.keys(data));
    
    // The response structure has data array, not Work_Orders
    const workOrdersData = data.data || [];
    console.log('Work orders data length:', workOrdersData.length);
    
    const workOrders = workOrdersData.filter((wo: any) => wo.Status === 'Completed')
      .map((wo: any) => ({
        work_order_id: wo.id,
        work_order_number: wo.Name,
        status: wo.Status,
        completed_at: wo.Completed_Time || wo.Created_Time,
        territory: wo.Territory?.name || 'Unknown',
        customer_name: wo.Contact?.name || 'Unknown',
        total_estimated_amount: parseFloat(wo.Grand_Total) || 0,
      })) || [];

    console.log('Final work orders count:', workOrders.length);
    return NextResponse.json(workOrders);
  } catch (error) {
    console.error('Error in Zoho FSM API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work orders', details: error.message },
      { status: 500 }
    );
  }
}
