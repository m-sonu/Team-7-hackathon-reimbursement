import { AdminHeader } from '#/components/admin/AdminHeader'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  useAdminCategoryBills,
  useBulkReimburse,
  useRejectBill,
  useReimburseByPivot,
  useVerifyBill,
} from '#/hooks/queries/admin'
import { Skeleton } from '#/components/ui/skeleton'
import { onLogout } from '#/server/cookies'
import { ROLES } from '#/lib/utils/constant'
import { useI18n } from '#/lib/i18n'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { TanukiMascot } from '#/components/tanuki'
import { ArrowLeft, FileImage, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { z } from 'zod'

const searchSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const Route = createFileRoute('/admin/review/$userId/$batchId')({
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
  const { userId, batchId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { t } = useI18n()

  const queryClient = useQueryClient()
  const token = context.token ?? ''
  const userIdNum = Number(userId)
  const categoryId = Number(batchId)

  const dateFilters = {
    ...(search.startDate && { start_date: search.startDate }),
    ...(search.endDate && { end_date: search.endDate }),
  }

  const { data, isLoading } = useAdminCategoryBills(userIdNum, categoryId, token, dateFilters)
  const verifyMutation = useVerifyBill(userIdNum, categoryId)
  const rejectMutation = useRejectBill(userIdNum, categoryId)
  const bulkMutation = useBulkReimburse(userIdNum, categoryId)
  const reimburseByPivotMutation = useReimburseByPivot(userIdNum, categoryId)

  const bills = data?.data?.data ?? []
  const pivotId = bills[0]?.category_monthly_pivot_id ?? null

  const statusCounts = bills.reduce(
    (acc, bill) => {
      const s = bill.status
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const hasUnreviewedBills = !!(statusCounts['pending'] || statusCounts['under review'])

  const [rejectReasons, setRejectReasons] = useState<Record<number, string>>({})
  const [rejectErrors, setRejectErrors] = useState<Record<number, boolean>>({})
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!lightboxUrl) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxUrl(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxUrl])

  const handleVerify = (billId: number, approveAmount: number) => {
    verifyMutation.mutate(
      { billId, token, approveAmount },
      {
        onSuccess: () => toast.success(t.adminReview.reviewedSuccess),
        onError: () => toast.error('Failed to mark as reviewed.'),
      },
    )
  }

  const handleReject = (billId: number) => {
    const reason = rejectReasons[billId]?.trim() ?? ''
    if (!reason) {
      setRejectErrors((prev) => ({ ...prev, [billId]: true }))
      return
    }
    rejectMutation.mutate(
      { billId, token, reason_for_action: reason },
      {
        onSuccess: () => {
          toast.success(t.adminReview.rejectSuccess)
          setRejectReasons((prev) => ({ ...prev, [billId]: '' }))
          setRejectErrors((prev) => ({ ...prev, [billId]: false }))
        },
        onError: () => toast.error('Failed to reject bill.'),
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

  const handleReimburseByPivot = () => {
    if (!pivotId) return
    reimburseByPivotMutation.mutate(
      { pivotId, token },
      {
        onSuccess: () => {
          toast.success(t.adminReview.reimbursedSuccess)
          queryClient.invalidateQueries({ queryKey: ['adminCategoryBills', userIdNum, categoryId] })
          queryClient.invalidateQueries({ queryKey: ['adminCategoryWiseBills', userIdNum] })
        },
        onError: () => toast.error('Failed to reimburse bills.'),
      },
    )
  }

  const goBack = () =>
    navigate({
      to: '/admin/users/$userId',
      params: { userId },
      search: {
        startDate: search.startDate,
        endDate: search.endDate,
      },
    })

  const categoryName = bills[0]?.category?.name ?? ''
  const pageTitle = t.adminReview.title.replace('{category}', categoryName)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <AdminHeader user={context.user} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 animate-fade-up">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            {t.adminReview.backToEmployeeDetails}
          </button>

          <div className="flex flex-wrap items-center gap-4">
            {bills.length > 0 && (
              <div className="flex items-center gap-2">
                {statusCounts['verified'] && (
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {t.common.statusLabels.verified}: {statusCounts['verified']}
                  </span>
                )}
                {statusCounts['rejected'] && (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    {t.common.statusLabels.rejected}: {statusCounts['rejected']}
                  </span>
                )}
                {statusCounts['pending'] && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {t.common.statusLabels.pending}: {statusCounts['pending']}
                  </span>
                )}
                {statusCounts['reimbursed'] && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {t.common.statusLabels.paid}: {statusCounts['reimbursed']}
                  </span>
                )}
              </div>
            )}
            <div className="text-right">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t.adminReview.totalSubmitted}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {data?.data?.total_amount ?? '—'}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500 px-4 py-2 text-right">
              <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
                {t.adminReview.totalApproved}
              </p>
              <p className="text-xl font-bold text-white">
                {data?.data?.approve_amount ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Page heading */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <TanukiMascot mood="stamping" size="sm" className="shrink-0" />
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
          {statusCounts['verified'] && pivotId ? (
            <Button
              onClick={handleReimburseByPivot}
              disabled={hasUnreviewedBills || reimburseByPivotMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              {reimburseByPivotMutation.isPending ? '…' : t.adminReview.markAsReimbursed}
            </Button>
          ) : null}
        </div>

        {/* Bills list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <TanukiMascot mood="sleeping" size="md" />
            <p className="text-sm text-muted-foreground">{t.adminReview.noExpenses}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(
              bills.reduce<Record<string, typeof bills>>((groups, bill) => {
                const key = bill.billUploadBatch?.title ?? '—'
                if (!groups[key]) groups[key] = []
                groups[key].push(bill)
                return groups
              }, {}),
            ).map(([title, group], idx) => (
              <div key={title} className="animate-fade-up" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      {t.adminReview.titleOfReceipt}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                  </div>
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {group.length === 1
                      ? t.adminReview.billCountSingle
                      : t.adminReview.billCount.replace('{count}', String(group.length))}
                  </span>
                </div>
                <div className="space-y-4">
                  {group.map((bill) => {
                    const isVerified = bill.status === 'verified'
                    const isRejected = bill.status === 'rejected'
                    const isReimbursed = bill.status === 'reimbursed'
                    const isSettled = isVerified || isRejected || isReimbursed
                    const isPending =
                      verifyMutation.isPending &&
                      verifyMutation.variables.billId === bill.id
                    const isRejecting =
                      rejectMutation.isPending &&
                      rejectMutation.variables.billId === bill.id

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
                            <button
                              type="button"
                              onClick={() => setLightboxUrl(bill.file_preview_url)}
                              className="block w-full text-left"
                            >
                              <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-indigo-400 transition-colors cursor-zoom-in">
                                <img
                                  src={bill.file_preview_url}
                                  alt={t.adminReview.receiptPreview}
                                  className="max-h-64 w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.parentElement?.querySelector('.receipt-fallback') as HTMLElement | null
                                    if (fallback) fallback.style.display = 'flex'
                                  }}
                                />
                                <div className="receipt-fallback hidden h-40 w-full items-center justify-center text-sm text-gray-400">
                                  {t.adminReview.noReceipt}
                                </div>
                              </div>
                              <p className="mt-1.5 text-center text-xs text-indigo-500">
                                {t.adminReview.clickToExpand}
                              </p>
                            </button>
                          ) : (
                            <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-400">
                              {t.adminReview.noReceipt}
                            </div>
                          )}
                        </div>

                        {/* Bill details */}
                        <div className="flex flex-col gap-4 p-5">
                          {isSettled && (
                            <div className="self-end">
                              {isVerified && (
                                <Badge variant="success">
                                  {t.adminReview.reviewed}
                                </Badge>
                              )}
                              {isRejected && (
                                <Badge variant="destructive">
                                  {t.adminReview.rejected}
                                </Badge>
                              )}
                              {isReimbursed && (
                                <Badge variant="success">
                                  {t.adminReview.reimbursed}
                                </Badge>
                              )}
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              {t.adminReview.nativeAmount}
                            </p>
                            <p className="mt-0.5 text-lg font-semibold text-gray-900">
                              {bill.amount}
                            </p>
                          </div>

                          {!bill.is_valid && bill.validation_error && (
                            <p className="text-xs text-red-500">
                              {bill.validation_error}
                            </p>
                          )}

                          {isRejected && bill.reason_for_action && (
                            <div className="rounded-md bg-red-50 border border-red-100 px-3 py-2">
                              <p className="text-xs font-medium text-red-600 mb-0.5">
                                {t.adminReview.reasonForRejection}
                              </p>
                              <p className="text-sm text-red-800">{bill.reason_for_action}</p>
                            </div>
                          )}

                          <div>
                            {!isSettled && (
                              <div className="mb-3">
                                <label className="mb-1 block text-xs text-gray-500">
                                  {t.adminReview.reasonForRejection}{' '}
                                  <span className="text-[10px] italic text-gray-400">
                                    ({t.adminReview.rejectRequiresReason})
                                  </span>
                                </label>
                                <textarea
                                  value={rejectReasons[bill.id] ?? ''}
                                  onChange={(e) => {
                                    setRejectReasons((prev) => ({ ...prev, [bill.id]: e.target.value }))
                                    if (rejectErrors[bill.id]) {
                                      setRejectErrors((prev) => ({ ...prev, [bill.id]: false }))
                                    }
                                  }}
                                  rows={2}
                                  placeholder={t.adminReview.reasonForRejectionPlaceholder}
                                  className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm text-gray-700 shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                                {rejectErrors[bill.id] && (
                                  <p className="mt-1 text-xs text-red-500">
                                    {t.adminReview.reasonRequired}
                                  </p>
                                )}
                              </div>
                            )}
                            <p className="mb-2 text-xs font-medium text-gray-500">
                              {t.adminReview.updateStatus}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleVerify(bill.id, bill.amount_raw)}
                                disabled={isSettled || isPending || isRejecting}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                              >
                                {isPending ? '…' : t.adminReview.markAsReviewed}
                              </Button>
                              <Button
                                onClick={() => handleReject(bill.id)}
                                disabled={isSettled || isPending || isRejecting}
                                variant="destructive"
                                className="flex-1 disabled:opacity-50"
                              >
                                {isRejecting ? '…' : t.adminReview.reject}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox overlay */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          <img
            src={lightboxUrl}
            alt={t.adminReview.receiptPreview}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
