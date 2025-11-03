import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/Roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requireRole = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // for route that dont need role to access
    if (!requireRole) return true;

    // check the role of the log in user
    const loginUser = context.switchToHttp().getRequest().user;
    if (!loginUser || !loginUser.role) return false;

    return requireRole.includes(loginUser.role);
  }
}
