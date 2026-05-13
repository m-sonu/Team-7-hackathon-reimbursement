import { AdminHeader } from '#/components/admin/AdminHeader'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useAdminCategoryBills, useBulkReimburse, useVerifyBill } from '#/hooks/queries/admin'
import { onLogout } from '#/server/cookies'
import { ROLES } from '#/lib/utils/constant'
import { useI18n } from '#/lib/i18n'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, FileImage } from 'lucide-react'
import * as React from 'react'
import { toast } from 'react-toastify'
import { z } from 'zod'

const searchSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  totalSubmitted: z.string().optional(),
  totalApproved: z.string().optional(),
  empName: z.string().optional(),
  empEmail: z.string().optional(),
  empTotalSubmitted: z.string().optional(),
  empTotalApproved: z.string().optional(),
})

export const Route = createFileRoute('/admin/review/$batchId')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context }) => {
    if (!context.token) {
      await onLogout()
      throw redirect({ to: '/' })
    }
    if (context.user?.role !== ROLES.Admin) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminReviewPage,
})

function AdminReviewPage() {
  const context = Route.useRouteContext()
  const { batchId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { t } = useI18n()

  const token = context.token ?? ''
  const userId = Number(search.userId)
  const categoryId = Number(batchId)

  const { data, isLoading } = useAdminCategoryBills(userId, categoryId, token)
  const verifyMutation = useVerifyBill(userId, categoryId)
  const bulkMutation = useBulkReimburse()

  const bills = data?.data ?? []

  const handleVerify = (billId: number) => {
    verifyMutation.mutate(
      { billId, token },
      {
        onSuccess: () => toast.success(t.adminReview.reviewedSuccess),
        onError: () => toast.error('Failed to mark as reviewed.'),
      },
    )
  }

  const handleBulkReimburse = () => {
    bulkMutation.mutate(
      { batchId: categoryId, token },
      {
        onSuccess: () => toast.success(t.adminReview.reimbursedSuccess),
        onError: () => toast.error('Failed to reimburse bills.'),
      },
    )
  }

  const goBack = () =>
    navigate({
      to: '/admin/users/$userId',
      params: { userId: search.userId },
      search: {
        name: search.empName,
        email: search.empEmail,
        totalSubmitted: search.empTotalSubmitted,
        totalApproved: search.empTotalApproved,
      },
    })

  const pageTitle = t.adminReview.title.replace(
    '{category}',
    search.category ?? '',
  )
  const submittedBy = t.adminReview.submittedBy
    .replace('{name}', search.name ?? '')
    .replace('{date}', search.date ?? '')

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <AdminHeader user={context.user} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            {t.adminReview.backToEmployeeDetails}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t.adminReview.totalSubmitted}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {search.totalSubmitted ?? '—'}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500 px-4 py-2 text-right">
              <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
                {t.adminReview.totalApproved}
              </p>
              <p className="text-xl font-bold text-white">
                {search.totalApproved ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          {(search.name || search.date) && (
            <p className="mt-1 text-sm text-gray-500">{submittedBy}</p>
          )}
        </div>

        {/* Bills list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : bills.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {t.adminReview.noExpenses}
          </p>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => {
              const isVerified = bill.status === 'verified'
              const isPending = verifyMutation.isPending && verifyMutation.variables?.billId === bill.id

              return (
                <div
                  key={bill.id}
                  className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white sm:grid-cols-2"
                >
                  {/* Receipt preview */}
                  <div className="border-b border-gray-100 p-5 sm:border-b-0 sm:border-r">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <FileImage className="size-3.5" />
                      {t.adminReview.receiptPreview}
                    </p>
                    {bill.file_preview_url ? (
                      <img
                        src={bill.file_preview_url}
                        alt={t.adminReview.receiptPreview}
                        className="max-h-64 w-full rounded-lg object-contain"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-400">
                        {t.adminReview.noReceipt}
                      </div>
                    )}
                  </div>

                  {/* Bill details */}
                  <div className="flex flex-col gap-4 p-5">
                    {isVerified && (
                      <div className="self-end">
                        <Badge variant="success">{t.adminReview.reviewed}</Badge>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {t.adminReview.amount}
                      </p>
                      <p className="mt-0.5 text-lg font-semibold text-gray-900">
                        {bill.amount}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {t.adminReview.titleOfReceipt}
                      </p>
                      <p className="mt-0.5 font-semibold text-gray-900">
                        {bill.title}
                      </p>
                    </div>

                    {!bill.is_valid && bill.validation_error && (
                      <p className="text-xs text-red-500">
                        {bill.validation_error}
                      </p>
                    )}

                    {!isVerified && (
                      <div>
                        <p className="mb-2 text-xs font-medium text-gray-500">
                          {t.adminReview.updateStatus}
                        </p>
                        <Button
                          onClick={() => handleVerify(bill.id)}
                          disabled={isPending}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          {isPending
                            ? '…'
                            : t.adminReview.markAsReviewed}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl justify-end">
          <Button
            onClick={handleBulkReimburse}
            disabled={bulkMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {bulkMutation.isPending ? '…' : t.adminReview.markAsReimbursed}
          </Button>
        </div>
      </div>
    </div>
  )
}
