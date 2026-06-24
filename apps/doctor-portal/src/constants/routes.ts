export const ROUTES = {
  login: "/login",
  activateAccount: "/activate-account",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  patients: "/my-patients",
  patient360: (id: string) => `/my-patients/${id}`,
  appointments: "/appointments",
  reports: "/reports",
  settings: "/settings",
};
