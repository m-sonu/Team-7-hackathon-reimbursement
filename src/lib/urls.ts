export const urls = {
  login: '/login',
  logout: '/logout',
  userDashboard: (id: number) => `/employee/${id}/dashboard`,
  userBills: (id: number) => `/employee/${id}/bills`,
  userBillDetails: (id: number) => `/employee/bill/${id}`,
  employeeBills: '/admin/employee/bills',
  adminCategoryWiseBills: (userId: number) =>
    `/admin/categoryWiseBills/${userId}`,
  adminCategoryBills: (userId: number, categoryId: number) =>
    `/admin/categoryWiseBills/${userId}/${categoryId}`,
  adminVerifyBill: (billId: number) => `/admin/bills/${billId}/verify`,
  adminRejectBill: (billId: number) => `/admin/bills/${billId}/verify`,
  adminBulkReimburse: (batchId: number) =>
    `/admin/bills/${batchId}/bulk-reimburse`,
  adminUserBulkReimburse: '/admin/bills/bulk-reimburse',
  adminReimburseByPivot: '/admin/bills/reimburse-by-pivot',
  categories: '/categories',
  categoryCreate: '/admin/categories',
  categoryUpdate: (id: number) => `/admin/categories/${id}`,
  categoryDelete: (id: number) => `/admin/categories/${id}`,
  bills: '/bills',
  batchPreview: (id: number) => `employee/batches/${id}/preview`,
  batchSubmit: (id: number) => `employee/batches/${id}/submit`,
}
