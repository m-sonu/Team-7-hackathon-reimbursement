import { useState } from 'react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { TanukiLoader, TanukiMascot } from '#/components/tanuki'
import { useSubmitBatch, useUserBillDetails } from '#/hooks/queries/bills'
import { useI18n } from '#/lib/i18n'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  DollarSign,
  Loader2,
  Receipt,
} from 'lucide-react'
import { toast } from 'react-toastify'

export const Route = createFileRoute('/_user/bill/$billId')({
  component: BillDetailPage,
})

function getStepDone(
  status: string,
  step: 'submitted' | 'underReview' | 'reviewed' | 'reimbursed',
): boolean {
  const s = status.toLowerCase()
  switch (step) {
    case 'submitted':
      return true
    case 'underReview':
      return ['under review', 'verified', 'rejected', 'reimbursed'].includes(s)
    case 'reviewed':
      return ['verified', 'rejected', 'reimbursed'].includes(s)
    case 'reimbursed':
      return s === 'reimbursed'
  }
}

function StatusTimeline({
  status,
  labels,
}: {
  status: string
  labels: {
    submitted: string
    underReview: string
    reviewed: string
    reimbursed: string
  }
}) {
  const isRejected = status.toLowerCase() === 'rejected'

  const steps = [
    { key: 'submitted' as const, label: labels.submitted },
    { key: 'underReview' as const, label: labels.underReview },
    { key: 'reviewed' as const, label: labels.reviewed },
    { key: 'reimbursed' as const, label: labels.reimbursed },
  ]

  return (
    <ul className="space-y-2">
      {steps.map((step) => {
        const done = getStepDone(status, step.key)
        const isLastRelevant = isRejected && step.key === 'reviewed'
        return (
          <li key={step.key} className="flex items-center gap-2 text-sm">
            {done ? (
              <CheckCircle2
                className={`size-4 shrink-0 ${isLastRelevant ? 'text-red-500' : 'text-emerald-500'}`}
              />
            ) : (
              <Circle className="size-4 shrink-0 text-gray-300" />
            )}
            <span
              className={
                done
                  ? isLastRelevant
                    ? 'text-red-600 font-medium'
                    : 'text-gray-900 font-medium'
                  : 'text-gray-400'
              }
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function BillDetailPage() {
  const context = Route.useRouteContext()
  const { billId } = Route.useParams()
  const { t } = useI18n()
  const token = context.token ?? ''
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useUserBillDetails(Number(billId), token)
  const batch = data?.data
  const [loaderDone, setLoaderDone] = useState(false)

  const bills = batch?.data ?? []
  const hasPendingBills = bills.some((b) => b.status === 'pending')
  const totalRaw = bills.reduce((sum, b) => sum + b.amount_raw, 0)
  const currency = bills[0]?.billUploadBatch?.currency ?? ''
  const totalFormatted = currency
    ? `${currency} ${totalRaw.toLocaleString()}`
    : totalRaw.toLocaleString()

  const { mutate: submit, isPending: isSubmitting } = useSubmitBatch()

  const handleSubmit = () => {
    if (!batch) return
    submit(
      { batchId: batch.id, token },
      {
        onSuccess: () => {
          toast.success(t.reviewBatch.submitSuccess)
          queryClient.invalidateQueries({ queryKey: ['userBillDetails', Number(billId)] })
          queryClient.invalidateQueries({ queryKey: ['userBills'] })
          queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] })
          navigate({ to: '/dashboard' })
        },
        onError: (error) => {
          const msg = error.response?.data.message
          toast.error(msg || 'Failed to submit for reimbursement.')
        },
      },
    )
  }

  const timelineLabels = {
    submitted: t.billDetail.stepSubmitted,
    underReview: t.billDetail.stepUnderReview,
    reviewed: t.billDetail.stepReviewed,
    reimbursed: t.billDetail.stepReimbursed,
  }

  const getBatchStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return {
          label: t.common.statusLabels.verified,
          variant: 'info' as const,
        }
      case 'rejected':
        return {
          label: t.common.statusLabels.rejected,
          variant: 'destructive' as const,
        }
      case 'reimbursed':
      case 'paid':
        return {
          label: t.common.statusLabels.paid,
          variant: 'success' as const,
        }
      case 'pending':
        return {
          label: t.common.statusLabels.pending,
          variant: 'warning' as const,
        }
      default:
        return {
          label: t.common.statusLabels.submitted,
          variant: 'muted' as const,
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="size-4" />
          {t.common.backToDashboard}
        </Link>
      </div>

      {(!loaderDone || isLoading) && (
        <TanukiLoader
          message="請求書を読み込み中..."
          onComplete={() => setLoaderDone(true)}
        />
      )}

      {loaderDone && !isLoading && isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-3">
          <TanukiMascot mood="embarrassed" size="sm" />
          {t.billDetail.loadingError}
        </div>
      )}

      {loaderDone && !isLoading && !isError && batch && (
        <>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {batch.title}
              </h1>
              {batch.category && (
                <p className="mt-1 text-sm text-gray-500">{batch.category}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {(batch.data ?? []).map((bill) => {
              const statusConfig = getBatchStatusConfig(bill.status)
              return (
                <div
                  key={bill.id}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Receipt Preview */}
                    <div className="shrink-0 sm:w-56 border-b sm:border-b-0 sm:border-r border-gray-100 bg-gray-50">
                      <p className="flex items-center gap-1.5 px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <Receipt className="size-3.5" />
                        {t.billDetail.receiptPreview}
                      </p>
                      <div className="px-4 pb-4">
                        {bill.file_preview_url ? (
                          <a
                            href={bill.file_preview_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <div className="relative h-44 w-full overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-indigo-400 transition-colors">
                              <img
                                src={bill.file_preview_url}
                                alt={t.billDetail.receiptPreview}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                  const target = e.currentTarget
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    const fallback = parent.querySelector(
                                      '.receipt-fallback',
                                    ) as HTMLElement
                                    fallback.style.display = 'flex'
                                  }
                                }}
                              />
                              <div className="receipt-fallback hidden h-full w-full items-center justify-center text-gray-300">
                                <DollarSign className="size-10" />
                              </div>
                            </div>
                            <p className="mt-1.5 text-center text-xs text-indigo-600 hover:underline">
                              {t.billDetail.viewReceipt}
                            </p>
                          </a>
                        ) : (
                          <div className="flex h-44 w-full items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-gray-300">
                            <div className="text-center">
                              <DollarSign className="mx-auto size-10" />
                              <p className="mt-1 text-xs text-gray-400">
                                {t.billDetail.noReceipt}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expense Details */}
                    <div className="flex-1 p-5">
                      <p className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {t.billDetail.expenseDetails}
                      </p>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
                        <div>
                          <p className="text-xs text-gray-500">
                            {t.billDetail.amount}
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {bill.amount}
                          </p>
                        </div>

                        {bill.approved_amount &&
                          bill.approved_amount !== bill.amount && (
                            <div>
                              <p className="text-xs text-gray-500">
                                {t.billDetail.approvedAmount}
                              </p>
                              <p className="text-base font-semibold text-emerald-700">
                                {bill.approved_amount}
                              </p>
                            </div>
                          )}

                        <div>
                          <p className="text-xs text-gray-500">
                            {t.billDetail.date}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {bill.created_at}
                          </p>
                        </div>

                        {bill.billUploadBatch?.title && (
                          <div>
                            <p className="text-xs text-gray-500">
                              {t.billDetail.title}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {bill.billUploadBatch.title}
                            </p>
                          </div>
                        )}

                        {bill.category?.name && (
                          <div>
                            <p className="text-xs text-gray-500">
                              {t.billDetail.category}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {bill.category.name}
                            </p>
                          </div>
                        )}

                        {bill.bill_no && (
                          <div>
                            <p className="text-xs text-gray-500">
                              {t.billDetail.billNumber}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {bill.bill_no}
                            </p>
                          </div>
                        )}

                        {bill.vat_no && (
                          <div>
                            <p className="text-xs text-gray-500">
                              {t.billDetail.vatNumber}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {bill.vat_no}
                            </p>
                          </div>
                        )}

                        {bill.vendorContact?.company_name && (
                          <div>
                            <p className="text-xs text-gray-500">
                              {t.billDetail.vendor}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {bill.vendorContact.company_name}
                            </p>
                          </div>
                        )}

                        {bill.vendorContact?.phone && (
                          <div>
                            <p className="text-xs text-gray-500">
                              {t.billDetail.phone}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {bill.vendorContact.phone}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {t.billDetail.statusTimeline}
                        </p>
                        <div className="flex items-start gap-6">
                          <StatusTimeline
                            status={bill.status}
                            labels={timelineLabels}
                          />
                          <div className="ml-auto shrink-0">
                            <Badge variant={statusConfig.variant}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>

    {!isLoading && !isError && batch && hasPendingBills && (
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4 shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {t.reviewBatch.totalAmount}
            </p>
            <p className="text-xl font-bold text-gray-900">{totalFormatted}</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-6"
          >
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t.reviewBatch.submitForReimbursement}
          </Button>
        </div>
      </div>
    )}
    </div>
  )
}
