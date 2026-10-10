import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Stores the raw request body on req.rawBody for Twilio/Meta webhook
 * signature validation. Applied only to /webhooks/* routes.
 */
@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request & { rawBody?: Buffer }, _res: Response, next: NextFunction) {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      req.rawBody = Buffer.concat(chunks);
      next();
    });
  }
}
