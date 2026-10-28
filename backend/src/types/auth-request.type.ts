import type { Request } from 'express';
import type { JwtPayload } from './payload.types.js';

export interface AuthenticatedRequest extends Request
{
    user: JwtPayload;
    cookies: Record<string, string | undefined>;
}