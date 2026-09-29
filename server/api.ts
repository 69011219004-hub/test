import express from 'express';
import type { Request, Response } from 'express';
import { verifyFirebaseIdToken } from './tokenVerifier.ts';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const router = express.Router();
const projectId = firebaseConfig.projectId;

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    projectId,
    authDomain: firebaseConfig.authDomain,
    firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
  });
});

// Verify Firebase Auth token
router.post('/auth/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or malformed Authorization header. Expected Bearer <token>',
      });
    }

    const idToken = authHeader.slice(7).trim();
    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: 'Empty token provided',
      });
    }

    const result = await verifyFirebaseIdToken(idToken, projectId);
    if (!result.valid || !result.decoded) {
      return res.status(401).json({
        success: false,
        error: result.error || 'Invalid Firebase ID Token',
      });
    }

    return res.json({
      success: true,
      message: 'Token successfully verified by Node.js server',
      user: {
        uid: result.decoded.uid,
        email: result.decoded.email,
        email_verified: result.decoded.email_verified,
        name: result.decoded.name,
        picture: result.decoded.picture,
        auth_time: new Date(result.decoded.auth_time * 1000).toISOString(),
        expires_at: new Date(result.decoded.exp * 1000).toISOString(),
        issuer: result.decoded.iss,
      },
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Server token verification error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while verifying token',
    });
  }
});

export default router;
