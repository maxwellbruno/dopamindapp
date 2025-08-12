// Authentication utility functions

export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// JWKS token verification utility
export interface PrivyJWKSKey {
  kty: string;
  use: string;
  kid: string;
  n: string;
  e: string;
  alg: string;
}

export interface PrivyJWKSResponse {
  keys: PrivyJWKSKey[];
}

export class PrivyTokenVerifier {
  private static JWKS_URL = 'https://auth.privy.io/api/v1/apps/cme2rnady00odk10bljcc2kr7/jwks.json';
  private static jwksCache: PrivyJWKSResponse | null = null;
  private static cacheExpiry: number = 0;
  
  static async getJWKS(): Promise<PrivyJWKSResponse> {
    const now = Date.now();
    
    // Use cached JWKS if available and not expired (cache for 1 hour)
    if (this.jwksCache && now < this.cacheExpiry) {
      return this.jwksCache;
    }
    
    try {
      const response = await fetch(this.JWKS_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch JWKS: ${response.status}`);
      }
      
      const jwks = await response.json();
      this.jwksCache = jwks;
      this.cacheExpiry = now + (60 * 60 * 1000); // Cache for 1 hour
      
      return jwks;
    } catch (error) {
      console.error('Error fetching JWKS:', error);
      throw error;
    }
  }
  
  static async verifyToken(token: string): Promise<boolean> {
    try {
      // Parse token header to get kid
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const header = JSON.parse(atob(tokenParts[0]));
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Get JWKS
      const jwks = await this.getJWKS();
      
      // Find matching key
      const key = jwks.keys.find(k => k.kid === header.kid);
      if (!key) {
        throw new Error('No matching key found in JWKS');
      }
      
      // Basic validation - in production, use a proper JWT library
      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }
      
      // Check issuer
      if (payload.iss !== 'privy.io') {
        throw new Error('Invalid issuer');
      }
      
      // In a real implementation, you'd verify the signature here
      // For now, we're just doing basic validation
      console.log('Token validated successfully', { kid: header.kid, exp: payload.exp });
      return true;
      
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }
}