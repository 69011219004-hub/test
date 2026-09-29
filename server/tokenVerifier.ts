import crypto from 'crypto';

interface FirebaseCertCache {
  certs: Record<string, string>;
  expiresAt: number;
}

let certCache: FirebaseCertCache = {
  certs: {},
  expiresAt: 0,
};

/**
 * Fetches Google's public X.509 certificates for Firebase Auth ID token verification
 */
async function getGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache.certs && certCache.expiresAt > now) {
    return certCache.certs;
  }

  try {
    const res = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch Google public keys: ${res.statusText}`);
    }

    // Parse Cache-Control header max-age
    const cacheControl = res.headers.get('cache-control') || '';
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    const maxAgeSeconds = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

    const certs = (await res.json()) as Record<string, string>;
    certCache = {
      certs,
      expiresAt: now + maxAgeSeconds * 1000,
    };
    return certs;
  } catch (err) {
    console.error('Error fetching Google certs:', err);
    return certCache.certs || {};
  }
}

export interface VerifiedFirebaseToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  auth_time: number;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
  sub: string;
  firebase?: any;
}

/**
 * Verifies a Firebase ID token securely on the server
 */
export async function verifyFirebaseIdToken(
  token: string,
  projectId: string
): Promise<{ valid: boolean; decoded?: VerifiedFirebaseToken; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode header
    const headerJson = Buffer.from(headerB64, 'base64url').toString('utf-8');
    const header = JSON.parse(headerJson);

    if (header.alg !== 'RS256') {
      return { valid: false, error: `Invalid algorithm: ${header.alg}. Expected RS256` };
    }

    const kid = header.kid;
    if (!kid) {
      return { valid: false, error: 'Token header missing kid' };
    }

    // Decode payload
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson) as VerifiedFirebaseToken;

    const nowSeconds = Math.floor(Date.now() / 1000);

    // Validate claims according to Firebase specs
    const expectedIssuer = `https://securetoken.google.com/${projectId}`;
    if (payload.iss !== expectedIssuer) {
      return { valid: false, error: `Invalid issuer: ${payload.iss}. Expected ${expectedIssuer}` };
    }

    if (payload.aud !== projectId) {
      return { valid: false, error: `Invalid audience: ${payload.aud}. Expected ${projectId}` };
    }

    if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length > 128) {
      return { valid: false, error: 'Invalid or missing subject claim' };
    }

    if (payload.exp <= nowSeconds) {
      return { valid: false, error: `Token has expired (exp: ${payload.exp}, now: ${nowSeconds})` };
    }

    if (payload.auth_time > nowSeconds + 300) {
      return { valid: false, error: 'auth_time is in the future' };
    }

    // Verify cryptographic signature with Google public key
    const certs = await getGooglePublicCerts();
    const cert = certs[kid];
    if (!cert) {
      return { valid: false, error: `Public key not found for kid: ${kid}` };
    }

    const dataToVerify = `${headerB64}.${payloadB64}`;
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(dataToVerify);
    const isValid = verifier.verify(cert, Buffer.from(signatureB64, 'base64url'));

    if (!isValid) {
      return { valid: false, error: 'Cryptographic signature verification failed' };
    }

    return {
      valid: true,
      decoded: {
        ...payload,
        uid: payload.sub,
      },
    };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Token verification exception' };
  }
}
