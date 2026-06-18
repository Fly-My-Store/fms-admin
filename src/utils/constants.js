export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  PERMISSIONS: 'auth_permissions'
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DEFAULT: '/dashboard',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  CONTACT_US: '/contact-us',
  FORGOT_PASSWORD: '/forget-pass',
  RESET_PASSWORD: '/reset-pass',
  VERIFY_CODE: '/verify-code',
  CHECK_MAIL: '/check-mail',
  ERROR_500: '/500',
  COMING_SOON: '/coming-soon',
  UNDER_CONSTRUCTION: '/pages/under-construction',
  APP_DOWNLOADS: '/downloads'
};

export const TABLE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
  SUSPENDED: 3,
  DELETED: 4
};

// ==============================
// Global Application Enums
// ==============================
// ==============================
// Global Application Enums (Superset)
// Keep these enums the single source of truth across models/controllers/services
// ==============================

export const RECORD_STATUS = Object.freeze({
  ACTIVE: 1,
  INACTIVE: 2,
  ARCHIVED: 3
});

export const RECORD_STATUS_ARRAY = [
  { key: 1, value: 'ACTIVE' },
  { key: 2, value: 'INACTIVE' },
  { key: 3, value: 'ARCHIVED' }
];

export const USER_TYPES = Object.freeze({
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  RIDER: 'RIDER',
  CUSTOMER: 'CUSTOMER'
});

export const ROLE_DOMAIN = Object.freeze({
  ADMIN: 'ADMIN',
  SELLER: 'SELLER'
});

export const ATTRIBUTE_DEF_DATA_TYPES = Object.freeze({
  TEXT: 'text',
  INT: 'int',
  DECIMAL: 'decimal',
  BOOLEAN: 'bool',
  JSON: 'json'
});

export const ATTRIBUTE_DEF_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
});

export const ACCOUNT_STATUS = Object.freeze({
  ACTIVE: 1,
  INACTIVE: 2,
  SUSPENDED: 3,
  DELETED: 4
});

export const KYC_STATUS = Object.freeze({
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RESUBMIT: 'RESUBMIT'
});

// Superset to cover both your current Order model states and catalog flows
export const ORDER_STATUS = Object.freeze({
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PACKING: 'PACKING',
  PACKED: 'PACKED',
  DISPATCHED: 'DISPATCHED',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
  REFUNDED: 'REFUNDED'
});

// Event types that describe key order lifecycle transitions
export const ORDER_EVENT_TYPE = Object.freeze({
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_PACKED: 'ORDER_PACKED',
  ORDER_DISPATCHED: 'ORDER_DISPATCHED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_REFUNDED: 'ORDER_REFUNDED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  DELIVERY_ASSIGNED: 'DELIVERY_ASSIGNED',
  DELIVERY_COMPLETED: 'DELIVERY_COMPLETED'
});

// High-level payment status (business view)
export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
});

// Gateway lifecycle states (provider view) – used by Payment model
export const PAYMENT_GATEWAY_STATUS = Object.freeze({
  CREATED: 'CREATED',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
});

// Gateway providers supported by the platform
export const PAYMENT_GATEWAY_TYPE = Object.freeze({
  RAZORPAY: 'RAZORPAY',
  STRIPE: 'STRIPE',
  CASHFREE: 'CASHFREE',
  PAYU: 'PAYU',
  PAYTM: 'PAYTM'
});

export const PAYMENT_MODE = Object.freeze({
  COD: 'COD',
  ONLINE: 'ONLINE',
  WALLET: 'WALLET',
  UPI: 'UPI',
  CARD: 'CARD'
});

export const CART_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  CHECKED_OUT: 'CHECKED_OUT',
  ABANDONED: 'ABANDONED'
});

export const INVENTORY_MOVEMENT_TYPE = Object.freeze({
  IN: 'IN',
  OUT: 'OUT',
  ADJUSTMENT: 'ADJUSTMENT'
});

// Reasons used in InventoryMovement model
export const INVENTORY_REASON = Object.freeze({
  SALE: 'SALE',
  REFUND: 'REFUND',
  MANUAL: 'MANUAL',
  ADJUST: 'ADJUST'
});

export const STORE_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  UNDER_REVIEW: 'UNDER_REVIEW',
  CLOSED: 'CLOSED'
});

// Expanded to include PENDING and FAILED used by delivery model
export const DELIVERY_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED'
});

export const JOB_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
});

export const SUPPORT_TICKET_STATUS = Object.freeze({
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
});

export const REFUND_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED'
});
export const VEHICLE_TYPE = Object.freeze({
  BIKE: 'BIKE',
  SCOOTER: 'SCOOTER',
  CAR: 'CAR',
  CYCLE: 'CYCLE'
});

export const RIDER_AVAILABILITY_STATUS = Object.freeze({
  OFFLINE: 'OFFLINE',
  IDLE: 'IDLE',
  ASSIGNED: 'ASSIGNED',
  ON_TRIP: 'ON_TRIP'
});
