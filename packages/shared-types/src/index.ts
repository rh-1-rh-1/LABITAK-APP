export type OrderStatus = 
  | "pending"
  | "accepted"
  | "weighing"
  | "awaiting_customer"
  | "preparing"
  | "ready"
  | "driver_assigned"
  | "picked_up"
  | "arrived"
  | "delivered"
  | "cancelled";

export type PricingType = "fixed" | "by_weight";

export type UserRole = 
  | "customer"
  | "driver"
  | "vendor_staff"
  | "vendor_owner"
  | "admin";
