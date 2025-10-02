export const CATEGORY_FORM_CONSTANTS = {
  NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\s-_]+$/,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
    PATTERN: /^[a-zA-Z0-9\s.,;:!'"()\-&_]*$/,
  },
};
