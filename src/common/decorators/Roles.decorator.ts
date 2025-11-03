import { SetMetadata } from '@nestjs/common';
import { Roles } from '../enums/Roles.enum';

export const ROLES_KEY = 'roles';
export const customRoleDecorator = (...roles: Roles[]) =>
  SetMetadata(ROLES_KEY, roles);
