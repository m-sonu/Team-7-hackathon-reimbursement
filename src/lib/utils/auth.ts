import { ROLES } from './constant'

type Role = (typeof ROLES)[keyof typeof ROLES]

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const hierarchy = {
    [ROLES.Employee]: 0,
    [ROLES.Admin]: 1,
  }

  return hierarchy[userRole] >= hierarchy[requiredRole]
}
