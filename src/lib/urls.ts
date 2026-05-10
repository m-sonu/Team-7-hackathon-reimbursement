export const urls = {
  login: '/login',
  logout: '/logout',
  userDashboard: (id: number) => `/user/${id}/dashboard`,
  userBills: (id: number) => `/user/${id}/bills`,
  employeeBills: '/employee/bills',
  categories: '/categories',
  bills: '/bills',
}
