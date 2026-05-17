import { Button } from '#/components/ui/button'
import { useBatchPreview, useSubmitBatch } from '#/hooks/queries/bills'
import { useI18n } from '#/lib/i18n'
import type { BatchPreviewBill } from '#/lib/types'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Loader2,
  Receipt,
} from 'lucide-react'
import * as React from 'react'
import { toast } from 'react-toastify'

export const Route = createFileRoute('/_user/review-batch/$batchId')({
  component: ReviewBatchPage,
})

function BillCard({
  bill,
  currency: _currency,
  isValid,
  labels,
}: {
  bill: BatchPreviewBill
  currency: string
  isValid: boolean
  labels: {
    receiptPreview: string
    extractedData: string
    amount: string
    billNo: string
    vatNo: string
    validationError: string
  }
}) {
  return (
    <div
      className={`rounded-xl border bg-white shadow-sm overflow-hidden ${
        isValid ? 'border-gray-200' : 'border-red-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Receipt Preview */}
        <div className="shrink-0 sm:w-52 border-b sm:border-b-0 sm:border-r border-gray-100 bg-gray-50">
          <p className="flex items-center gap-1.5 px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <Receipt className="size-3.5" />
            {labels.receiptPreview}
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
                    alt={labels.receiptPreview}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback =
                        e.currentTarget.parentElement?.querySelector(
                          '.receipt-fallback',
                        ) as HTMLElement | null
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  <div className="receipt-fallback hidden h-full w-full items-center justify-center text-gray-300">
                    <DollarSign className="size-10" />
                  </div>
                </div>
              </a>
            ) : (
              <div className="flex h-44 w-full items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-gray-300">
                <DollarSign className="size-10" />
              </div>
            )}
          </div>
        </div>

        {/* Extracted Data */}
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {labels.extractedData}
            </p>
            {isValid ? (
              <CheckCircle2 className="size-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="size-4 text-red-500" />
            )}
          </div>

          <div className="space-y-2.5">
            <div>
              <p className="text-xs text-gray-500">{labels.amount}</p>
              <p className="text-xl font-bold text-gray-900">{bill.amount}</p>
            </div>

            {bill.bill_no && (
              <div>
                <p className="text-xs text-gray-500">{labels.billNo}</p>
                <p className="text-sm font-medium text-gray-900">
                  {bill.bill_no}
                </p>
              </div>
            )}

            {bill.vat_no && (
              <div>
                <p className="text-xs text-gray-500">{labels.vatNo}</p>
                <p className="text-sm font-medium text-gray-900">
                  {bill.vat_no}
                </p>
              </div>
            )}

            {!isValid && bill.validation_error && (
              <div className="mt-3 rounded-md bg-red-50 border border-red-100 px-3 py-2">
                <p className="text-xs font-semibold text-red-600 mb-0.5">
                  {labels.validationError}
                </p>
                <p className="text-xs text-red-700">{bill.validation_error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewBatchPage() {
  const { t } = useI18n()
  const context = Route.useRouteContext()
  const { batchId } = Route.useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const token = context.token ?? ''

  const { data, isLoading } = useBatchPreview(Number(batchId), token)
  const { mutate: submit, isPending: isSubmitting } = useSubmitBatch()

  const preview = data?.data
  const aiStatus = preview?.ai_processing ?? 'processing'
  const isProcessing = aiStatus === 'processing'
  const isFailed = aiStatus === 'failed'

  const cardLabels = React.useMemo(
    () => ({
      receiptPreview: t.billDetail.receiptPreview,
      extractedData: t.reviewBatch.extractedData,
      amount: t.reviewBatch.amount,
      billNo: t.reviewBatch.billNo,
      vatNo: t.reviewBatch.vatNo,
      validationError: t.reviewBatch.validationError,
    }),
    [t],
  )

  const handleSubmit = () => {
    submit(
      { batchId: Number(batchId), token },
      {
        onSuccess: () => {
          toast.success(t.reviewBatch.submitSuccess)
          queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] })
          queryClient.invalidateQueries({ queryKey: ['userBills'] })
          navigate({ to: '/dashboard' })
        },
        onError: (error) => {
          const msg = error.response?.data.message || ''
          if (msg) toast.error(msg)
        },
      },
    )
  }

  const validBills = preview?.valid_bills ?? []
  const invalidBills = preview?.invalid_bills ?? []
  const currency = preview?.currency ?? ''

  const formatTotal = (amount: number) => {
    if (!amount) return `${currency} 0`
    return `${currency} ${amount.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            {t.common.backToDashboard}
          </Link>
        </div>

        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {t.reviewBatch.title}
          </h1>
          {preview && (
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{preview.title}</span>
              {preview.category && <span>{preview.category}</span>}
              {preview.currency && <span>{preview.currency}</span>}
            </div>
          )}
        </div>

        {/* Month note */}
        <p className="mb-6 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
          {t.reviewBatch.monthNote}
        </p>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-5 flex gap-4"
              >
                <div className="h-44 w-52 shrink-0 animate-pulse rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-3 pt-1">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-4 animate-pulse rounded bg-gray-100"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI processing banner */}
        {!isLoading && isProcessing && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 py-14 text-center">
            <Loader2 className="mb-4 size-10 animate-spin text-indigo-500" />
            <p className="text-base font-semibold text-gray-900">
              {t.reviewBatch.processingTitle}
            </p>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              {t.reviewBatch.processingSubtitle}
            </p>
          </div>
        )}

        {/* AI processing failed banner */}
        {!isLoading && isFailed && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 py-14 text-center">
            <AlertTriangle className="mb-4 size-10 text-red-500" />
            <p className="text-base font-semibold text-gray-900">
              Processing Failed
            </p>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              There was an error processing the bills in this batch. Please try
              uploading again.
            </p>
          </div>
        )}

        {/* Bills list */}
        {!isLoading && aiStatus === 'success' && preview && (
          <div className="space-y-6">
            {/* Valid bills */}
            {validBills.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-gray-700">
                  {t.reviewBatch.validBills} ({validBills.length})
                </h2>
                <div className="space-y-3">
                  {validBills.map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      currency={currency}
                      isValid
                      labels={cardLabels}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Invalid bills */}
            {invalidBills.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-red-600">
                  {t.reviewBatch.invalidBills} ({invalidBills.length})
                </h2>
                <div className="space-y-3">
                  {invalidBills.map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      currency={currency}
                      isValid={false}
                      labels={cardLabels}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Fixed footer */}
      {!isLoading && aiStatus === 'success' && preview && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4 shadow-lg">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t.reviewBatch.totalAmount}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatTotal(preview.totals.valid)}
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || validBills.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-6"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              {t.reviewBatch.submitForReimbursement}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
