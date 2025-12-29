/**
 * Shared Constants
 * Defines constant values used across all microservices
 */

// User roles for role-based access control
const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Event status values
const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

// Attendance status values
const ATTENDANCE_STATUS = {
  REGISTERED: 'REGISTERED',
  CHECKED_IN: 'CHECKED_IN',
  ABSENT: 'ABSENT'
};

module.exports = {
  ROLES,
  HTTP_STATUS,
  EVENT_STATUS,
  ATTENDANCE_STATUS
};
