import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission, FeaturePermissions, AccessTokenPayload } from '@sme/shared';

export const PERMISSION_KEY = 'required_permission';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<keyof FeaturePermissions>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) return true;

    const user: AccessTokenPayload = context.switchToHttp().getRequest().user;
    if (!user) return false;
    if (user.isOwner) return true;

    if (!hasPermission(user, required)) {
      throw new ForbiddenException(`Permission required: ${required}`);
    }
    return true;
  }
}
