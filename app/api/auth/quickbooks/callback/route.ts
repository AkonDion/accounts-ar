import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: `OAuth error: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  try {
    // Exchange authorization code for tokens
    const clientId = process.env.QBO_CLIENT_ID;
    const clientSecret = process.env.QBO_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Missing QuickBooks credentials');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:3000/api/auth/quickbooks/callback',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Authorization successful!',
      tokens: {
        access_token: data.access_token?.substring(0, 20) + '...',
        refresh_token: data.refresh_token?.substring(0, 20) + '...',
        expires_in: data.expires_in,
      },
      instructions: {
        step1: 'Copy the refresh_token from the response above',
        step2: 'Add it to your .env.local file as QBO_REFRESH_TOKEN=your_refresh_token',
        step3: 'Restart your development server',
      }
    });

  } catch (error: any) {
    console.error('QuickBooks OAuth callback error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
