/**
 * @file express.d.ts
 * @description Single source of truth for Express Request augmentation.
 *              All middleware attach to this interface — no more `req: any`.
 * @module backend/types
 */

import 'express';
import type { Document } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      /** Authenticated user payload decoded from JWT */
      user?: {
        id: string;
        _id?: string;
        role: string;
        email?: string;
      };
      /** Organization ID extracted from x-organization-id header */
      organizationId?: string;
      /** Populated membership document (set by requireOrganization) */
      membership?: any;
      /** API key document (set by requireApiKey) */
      apiKey?: {
        orgId: string;
        scopes: string[];
        plan: string;
        name: string;
      };
      /** Unique request correlation ID (set by requestId middleware) */
      id?: string;
    }
  }
}

export {};
