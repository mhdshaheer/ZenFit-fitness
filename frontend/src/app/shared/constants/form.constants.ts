export const FORM_CONSTANTS = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 32,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
    ERROR_MESSAGES: {
      required: 'Password is required',
      minlength: 'Password must be at least 8 characters long',
      pattern:
        'Password must contain uppercase, lowercase, number, and special character',
    },
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  PHONE: {
    PATTERN: /^\+?[0-9]{10,15}$/,
  },
};
