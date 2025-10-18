export const AdminRoutes = {
  BASE: '/admin',
  USERS: '/users',

  USER_STATUS: (id: string) => `/users/${id}/status`,
};

export const PaymentRoutes = {
  BASE: '/payment',

  CREATE_CHECKOUT: '/create-checkout-session',
  HISTORY_TRAINER: '/trainer',
  HISTORY_ADMIN: '',
  PURCHASED: '/purchased',
  TOP_CATEGORIES: '/top-categories',
  TOP_PROGRAMS: '/top-programs',
  TOP_CATEGORIES_TRAINER: '/top-categories/trainer',
  TOP_PROGRAMS_TRAINER: '/top-programs/trainer',
  REVENUE_CHART_ADMIN: '/revenue-chart',
  REVENUE_CHART_TRAINER: '/revenue-chart/trainer',

  ENTROLLED: (programId: string) => `/entrolled/${programId}`,
};

export const AuthRoutes = {
  BASE: '/auth',

  SIGNUP: '/signup',
  LOGIN: '/login',
  LOGOUT: '/logout',
  REFRESH_TOKEN: '/refresh-token',
  VERIFY_OTP: '/verify-otp',
  RESENT_OTP: '/resent-otp',
  SEND_OTP: '/send-otp',
  VERIFY_FORGOT_OTP: '/verify-forgot-otp',
  RESET_PASSWORD: '/reset-password',
  GOOGLE_SIGNUP: '/google-signup',
  PROTECTED: '/protected',
};

export const CategoryRoutes = {
  BASE: '/category',

  SUBCATEGORIES: '/subcategories',
  TABLE: '/table',
  CHECK_NAME: '/check-name',

  STATUS: (categoryId: string) => `/status/${categoryId}`,
  BY_CategoryID: (categoryId: string) => `/${categoryId}`,
};

export const ProgramRoutes = {
  BASE: '/program',

  DRAFT: '/draft',
  TRAINER: '/trainer',
  CATEGORY: '/category',

  CATEGORY_BY_ID: (categoryId: string) => `/category/${categoryId}`,
  APPROVAL_STATUS: (programId: string) => `/approvalStatus/${programId}`,
};

export const SessionRoutes = {
  BASE: '/session',
  DRAFT: '/draft',
};

export const ProfileRouter = {
  USER_BASE: '/user',
  FILE_BASE: '/file',

  PROFILE: '/profile',
  PASSWORD: '/password',
  VERIFY_RESUME: '/resume',

  UPLOAD: `/profile/upload`,
  IMAGE: '/profile/image',
};
