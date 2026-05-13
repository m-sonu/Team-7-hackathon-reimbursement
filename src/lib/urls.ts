export const urls = {
  login: '/login',
  logout: '/logout',
  userDashboard: (id: number) => `/user/${id}/dashboard`,
  userBills: (id: number) => `/user/${id}/bills`,
  userBillDetails: (id: number) => `/user/bill/${id}`,
  employeeBills: '/employee/bills',
  categories: '/categories',
  bills: '/bills',
  batchPreview: (id: number) => `/batches/${id}/preview`,
  batchSubmit: (id: number) => `/batches/${id}/submit`,
}
