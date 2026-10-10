import { SetMetadata } from '@nestjs/common';
import { FeaturePermissions } from '@sme/shared';
import { PERMISSION_KEY } from '../guards/permission.guard';

export const RequirePermission = (perm: keyof FeaturePermissions) =>
  SetMetadata(PERMISSION_KEY, perm);

export const CurrentUser = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createParamDecorator, ExecutionContext } = require('@nestjs/common');
  return createParamDecorator((_: unknown, ctx: typeof ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  })();
};
