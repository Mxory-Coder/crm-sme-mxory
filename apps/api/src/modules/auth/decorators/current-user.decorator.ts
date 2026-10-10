import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '@sme/shared';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AccessTokenPayload;
  },
);
