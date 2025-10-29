interface TokenCache {
  access_token: string;
  expires_at: number;
}

let tokenCache: TokenCache | null = null;

export async function getQuickBooksToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expires_at) {
    return tokenCache.access_token;
  }

  // Refresh token if expired or not cached
  const refreshToken = process.env.QBO_REFRESH_TOKEN;
  const clientId = process.env.QBO_CLIENT_ID;
  const clientSecret = process.env.QBO_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing QuickBooks credentials');
  }

  try {
    // Create Basic Auth header
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    
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
    console.error('QuickBooks token refresh error:', error);
    throw new Error('Failed to refresh QuickBooks token');
  }
}

export async function fetchQuickBooksData(endpoint: string): Promise<any> {
  const token = await getQuickBooksToken();
  const baseUrl = process.env.QBO_BASE_URL || 'https://quickbooks.api.intuit.com/v3/company/9130352917010696';

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (response.status === 401) {
    // Token expired, clear cache and retry once
    tokenCache = null;
    const newToken = await getQuickBooksToken();
    
    const retryResponse = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${newToken}`,
        'Accept': 'application/json',
      },
    });

    if (!retryResponse.ok) {
      throw new Error(`QuickBooks API error: ${retryResponse.statusText}`);
    }

    return retryResponse.json();
  }

  if (!response.ok) {
    throw new Error(`QuickBooks API error: ${response.statusText}`);
  }

  return response.json();
}
