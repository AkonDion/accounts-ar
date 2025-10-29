interface TokenCache {
  access_token: string;
  expires_at: number;
}

let tokenCache: TokenCache | null = null;

export async function getZohoFSMToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expires_at) {
    return tokenCache.access_token;
  }

  // Refresh token if expired or not cached
  const refreshToken = process.env.ZOHO_FSM_REFRESH_TOKEN;
  const clientId = process.env.ZOHO_FSM_CLIENT_ID;
  const clientSecret = process.env.ZOHO_FSM_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing Zoho FSM credentials');
  }

  try {
    console.log('Refreshing Zoho FSM token...');
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    console.log('Token refresh response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', errorText);
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Token refresh response:', data);
    
    if (!data.access_token) {
      throw new Error('No access token in response');
    }

    // Cache the token with 50-minute expiry (tokens are valid for ~1 hour)
    tokenCache = {
      access_token: data.access_token,
      expires_at: Date.now() + (50 * 60 * 1000), // 50 minutes
    };

    return data.access_token;
  } catch (error) {
    console.error('Zoho FSM token refresh error:', error);
    throw new Error('Failed to refresh Zoho FSM token');
  }
}

export async function fetchZohoFSMData(endpoint: string): Promise<any> {
  const token = await getZohoFSMToken();
  const baseUrl = process.env.ZOHO_FSM_BASE_URL || 'https://fsm.zoho.com/fsm/v1';

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Authorization': `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    // Token expired, clear cache and retry once
    tokenCache = null;
    const newToken = await getZohoFSMToken();
    
    const retryResponse = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${newToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!retryResponse.ok) {
      throw new Error(`Zoho FSM API error: ${retryResponse.statusText}`);
    }

    return retryResponse.json();
  }

  if (!response.ok) {
    throw new Error(`Zoho FSM API error: ${response.statusText}`);
  }

  return response.json();
}
