/**
 * App roles + a simple permission matrix. `role` on the user is a free string;
 * these are the values the admin can assign and what each may do in /admin.
 */
export const ROLES = ["admin", "manager", "cashier", "storekeeper", "client"] as const;
export type Role = (typeof ROLES)[number];

/** Roles that may enter the /admin area at all. */
export const STAFF_ROLES: Role[] = ["admin", "manager", "cashier", "storekeeper"];

export type Permission =
  | "overview"
  | "orders:read"
  | "orders:write"
  | "stock:read"
  | "stock:write"
  | "catalogue:write" // create/edit/delete products, categories, prices
  | "customers:read"
  | "content:write"
  | "media:write" // upload / manage the media library
  | "inbox:read"
  | "settings:write"
  | "alerts:raise"
  | "alerts:resolve"
  | "staff:write" // assign roles
  | "audit:read"; // view the audit log

const MATRIX: Record<Role, Permission[]> = {
  admin: [
    "overview",
    "orders:read",
    "orders:write",
    "stock:read",
    "stock:write",
    "catalogue:write",
    "customers:read",
    "content:write",
    "media:write",
    "inbox:read",
    "settings:write",
    "alerts:raise",
    "alerts:resolve",
    "staff:write",
    "audit:read",
  ],
  manager: [
    "overview",
    "orders:read",
    "orders:write",
    "stock:read",
    "stock:write",
    "customers:read",
    "inbox:read",
    "alerts:raise",
    "alerts:resolve",
  ],
  cashier: ["overview", "orders:read", "orders:write", "stock:read", "alerts:raise"],
  storekeeper: ["overview", "stock:read", "alerts:raise"],
  client: [],
};

export function isRole(v: string | null | undefined): v is Role {
  return !!v && (ROLES as readonly string[]).includes(v);
}

export function isStaff(role: string | null | undefined): boolean {
  return isRole(role) && STAFF_ROLES.includes(role);
}

export function can(role: string | null | undefined, permission: Permission): boolean {
  if (!isRole(role)) return false;
  return MATRIX[role].includes(permission);
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  cashier: "Cashier",
  storekeeper: "Store keeper",
  client: "Customer",
};
