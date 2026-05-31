import { Button } from '#/components/ui/button'
import { TanukiLoader, TanukiScanner, TanukiStepHead } from '#/components/tanuki'
import type { StepEmotion } from '#/components/tanuki'
import { useBatchPreview, useDeleteBill, useSubmitBatch, useUpdateBill } from '#/hooks/queries/bills'
import { useI18n } from '#/lib/i18n'
import type { BatchPreviewBill } from '#/lib/types'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  DollarSign,
  Loader2,
  Pencil,
  Receipt,
  Trash2,
  X,
} from 'lucide-react'
import * as React from 'react'
import { useTanukiPopup } from '#/components/tanuki'

export const Route = createFileRoute('/_user/review-batch/$batchId')({
  validateSearch: z.object({ skipLoader: z.boolean().optional() }),
  component: ReviewBatchPage,
})

// ---------------------------------------------------------------------------
// Processing steps banner
// ---------------------------------------------------------------------------

function ProcessingBanner({
  labels,
}: {
  labels: {
    processingTitle: string
    stepUploaded: string
    stepScanning: string
    stepReview: string
    almostDone: string
  }
}) {
  const steps: Array<{ label: string; state: 'done' | 'active' | 'pending'; emotion: StepEmotion }> = [
    { label: labels.stepUploaded, state: 'done',    emotion: 'proud'   },
    { label: labels.stepScanning, state: 'active',  emotion: 'focused' },
    { label: labels.stepReview,   state: 'pending', emotion: 'sleepy'  },
  ]

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50 py-12 text-center">
      <p className="mb-6 text-base font-semibold text-gray-800">{labels.processingTitle}</p>
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, i) => (
          <React.Fragment key={step.label}>
            {i > 0 && (
              <div
                className={`h-0.5 w-14 mb-6 ${step.state !== 'pending' ? 'bg-indigo-300' : 'bg-gray-200'}`}
              />
            )}
            <div className="flex flex-col items-center">
              <div
                className={`size-10 rounded-full flex items-center justify-center border-2 overflow-hidden transition-all ${
                  step.state === 'done'
                    ? 'border-emerald-400'
                    : step.state === 'active'
                      ? 'border-purple-600'
                      : 'border-gray-200'
                }`}
              >
                <TanukiStepHead
                  emotion={step.emotion}
                  state={step.state === 'done' ? 'completed' : step.state === 'active' ? 'active' : 'pending'}
                  size={40}
                />
              </div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  step.state === 'done'
                    ? 'text-emerald-600'
                    : step.state === 'active'
                      ? 'text-indigo-600'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
      <TanukiScanner isScanning={true} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status timeline
// ---------------------------------------------------------------------------

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
  labels: { submitted: string; underReview: string; reviewed: string; reimbursed: string }
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

// ---------------------------------------------------------------------------
// BillCard
// ---------------------------------------------------------------------------

type BillCardLabels = {
  receiptPreview: string
  extractedData: string
  amount: string
  billNo: string
  vatNo: string
  validationError: string
  editBill: string
  saveBill: string
  cancelEdit: string
  removeBill: string
  fixBill: string
  statusTimeline: string
  stepSubmitted: string
  stepUnderReview: string
  stepReviewed: string
  stepReimbursed: string
}

function BillCard({
  bill,
  isValid,
  isSaving,
  isRemoving,
  onSave,
  onRemove,
  labels,
  isEditDisabled,
  isFixDisabled,
  editDisabledReason,
  fixDisabledReason,
}: {
  bill: BatchPreviewBill
  isValid: boolean
  isSaving: boolean
  isRemoving: boolean
  onSave: (data: { bill_no: string; vat_no: string; amount: string }) => void
  onRemove: () => void
  labels: BillCardLabels
  isEditDisabled?: boolean
  isFixDisabled?: boolean
  editDisabledReason?: string
  fixDisabledReason?: string
}) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [billNo, setBillNo] = React.useState(bill.bill_no ?? '')
  const [vatNo, setVatNo] = React.useState(bill.vat_no ?? '')
  const [amount, setAmount] = React.useState(String(bill.amount_raw ?? ''))

  // Reset edit state when bill data changes (after a successful save)
  React.useEffect(() => {
    if (!isSaving) {
      setBillNo(bill.bill_no ?? '')
      setVatNo(bill.vat_no ?? '')
      setAmount(String(bill.amount_raw ?? ''))
    }
  }, [bill.bill_no, bill.vat_no, bill.amount_raw, isSaving])

  const isMissingData = bill.validation_error?.includes('Missing') || bill.validation_error?.includes('unreadable')
  const isFix = !isValid && isMissingData
  const actionDisabled = isFix ? (isFixDisabled ?? false) : (isEditDisabled ?? false)
  const actionDisabledReason = isFix ? fixDisabledReason : editDisabledReason

  const handleSave = () => {
    onSave({ bill_no: billNo, vat_no: vatNo, amount })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setBillNo(bill.bill_no ?? '')
    setVatNo(bill.vat_no ?? '')
    setAmount(String(bill.amount_raw ?? ''))
    setIsEditing(false)
  }

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm overflow-hidden ${
        isValid ? 'border-gray-200' : 'border-red-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Receipt preview */}
        <div className="shrink-0 sm:w-52 border-b sm:border-b-0 sm:border-r border-gray-100 bg-gray-50">
          <p className="flex items-center gap-1.5 px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <Receipt className="size-3.5" />
            {labels.receiptPreview}
          </p>
          <div className="px-4 pb-4">
            {bill.file_preview_url ? (
              <a href={bill.file_preview_url} target="_blank" rel="noreferrer" className="block">
                <div className="relative h-44 w-full overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-indigo-400 transition-colors">
                  <img
                    src={bill.file_preview_url}
                    alt={labels.receiptPreview}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.parentElement?.querySelector('.receipt-fallback') as HTMLElement | null
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

        {/* Extracted data */}
        <div className="flex-1 p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {labels.extractedData}
            </p>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
                  >
                    <X className="size-3" />
                    {labels.cancelEdit}
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-6 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSaving ? <Loader2 className="size-3 animate-spin" /> : labels.saveBill}
                  </Button>
                </>
              ) : (
                <>
                  {!isValid && (
                    <button
                      type="button"
                      onClick={onRemove}
                      disabled={isRemoving}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                      {labels.removeBill}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    disabled={actionDisabled}
                    title={actionDisabled ? actionDisabledReason : undefined}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                      actionDisabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Pencil className="size-3" />
                    {isFix ? labels.fixBill : labels.editBill}
                  </button>
                  {isValid ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="size-4 text-red-500" />
                  )}
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            /* Edit form */
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  {labels.amount}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    {labels.billNo}
                  </label>
                  <input
                    type="text"
                    value={billNo}
                    onChange={(e) => setBillNo(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    {labels.vatNo}
                  </label>
                  <input
                    type="text"
                    value={vatNo}
                    onChange={(e) => setVatNo(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Display mode */
            <div className="space-y-2.5">
              <div>
                <p className="text-xs text-gray-500">{labels.amount}</p>
                <p className="text-xl font-bold text-gray-900">{bill.amount}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">{labels.billNo}</p>
                <p className="text-sm font-medium text-gray-900">{bill.bill_no ?? '—'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">{labels.vatNo}</p>
                <p className="text-sm font-medium text-gray-900">{bill.vat_no ?? '—'}</p>
              </div>

              {bill.status === 'under review' && (
                <div className="border-t border-gray-100 pt-3 mt-1">
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {labels.statusTimeline}
                  </p>
                  <StatusTimeline
                    status={bill.status}
                    labels={{
                      submitted: labels.stepSubmitted,
                      underReview: labels.stepUnderReview,
                      reviewed: labels.stepReviewed,
                      reimbursed: labels.stepReimbursed,
                    }}
                  />
                </div>
              )}

              {!isValid && bill.validation_error && (
                <ValidationMessage error={bill.validation_error} label={labels.validationError} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ValidationMessage({ error, label }: { error: string; label: string }) {
  const isMissing = error.includes('Missing') || error.includes('unreadable')
  const isDuplicate = error.includes('Duplicate')
  const isGlobal = error.includes('previous')

  const hint = isMissing
    ? 'Click "Fix" to enter the bill number manually.'
    : isDuplicate
      ? 'Remove one of the duplicate bills.'
      : isGlobal
        ? 'This bill was already submitted. Remove it to continue.'
        : null

  return (
    <div className="mt-3 rounded-md bg-red-50 border border-red-100 px-3 py-2.5">
      <p className="text-xs font-semibold text-red-600 mb-0.5">{label}</p>
      <p className="text-xs text-red-700">{error}</p>
      {hint && <p className="mt-1 text-xs text-red-500 italic">{hint}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function ReviewBatchPage() {
  const { t } = useI18n()
  const context = Route.useRouteContext()
  const { batchId } = Route.useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const token = context.token ?? ''

  const { showSuccess, showError } = useTanukiPopup()

  const { skipLoader } = Route.useSearch()
  const [loaderDone, setLoaderDone] = React.useState(!!skipLoader)
  const { data, isLoading } = useBatchPreview(Number(batchId), token)
  const { mutate: submit, isPending: isSubmitting } = useSubmitBatch()
  const { mutate: updateBillMutate, isPending: isUpdating, variables: updateVars } = useUpdateBill()
  const { mutate: deleteBillMutate, isPending: isDeleting, variables: deleteVars } = useDeleteBill()

  const preview = data?.data
  const aiStatus = preview?.ai_processing ?? 'processing'
  const isProcessing = aiStatus === 'processing'
  const isFailed = aiStatus === 'failed'

  const cardLabels: BillCardLabels = React.useMemo(
    () => ({
      receiptPreview: t.billDetail.receiptPreview,
      extractedData: t.reviewBatch.extractedData,
      amount: t.reviewBatch.amount,
      billNo: t.reviewBatch.billNo,
      vatNo: t.reviewBatch.vatNo,
      validationError: t.reviewBatch.validationError,
      editBill: t.reviewBatch.editBill,
      saveBill: t.reviewBatch.saveBill,
      cancelEdit: t.reviewBatch.cancelEdit,
      removeBill: t.reviewBatch.removeBill,
      fixBill: t.reviewBatch.fixBill,
      statusTimeline: t.billDetail.statusTimeline,
      stepSubmitted: t.billDetail.stepSubmitted,
      stepUnderReview: t.billDetail.stepUnderReview,
      stepReviewed: t.billDetail.stepReviewed,
      stepReimbursed: t.billDetail.stepReimbursed,
    }),
    [t],
  )

  const handleSave = (billId: number, data: { bill_no: string; vat_no: string; amount: string }) => {
    updateBillMutate(
      { billId, data, token },
      {
        onSuccess: () => {
          showSuccess(t.reviewBatch.updateSuccessTitle, t.reviewBatch.updateSuccessBody)
          queryClient.invalidateQueries({ queryKey: ['batchPreview', Number(batchId)] })
        },
        onError: () => showError(t.reviewBatch.errorTitle, t.reviewBatch.errorBody),
      },
    )
  }

  const handleRemove = (billId: number) => {
    deleteBillMutate(
      { billId, token },
      {
        onSuccess: () => {
          showSuccess(t.reviewBatch.removeSuccessTitle, t.reviewBatch.removeSuccessBody)
          queryClient.invalidateQueries({ queryKey: ['batchPreview', Number(batchId)] })
        },
        onError: () => showError(t.reviewBatch.errorTitle, t.reviewBatch.errorBody),
      },
    )
  }

  const handleSubmit = () => {
    submit(
      { batchId: Number(batchId), token },
      {
        onSuccess: () => {
          showSuccess(t.reviewBatch.submitSuccessTitle, t.reviewBatch.submitSuccessBody)
          queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] })
          queryClient.invalidateQueries({ queryKey: ['userBills'] })
          navigate({ to: '/dashboard' })
        },
        onError: (error) => {
          const msg = error.response?.data.message || ''
          showError(t.reviewBatch.errorTitle, msg || t.reviewBatch.errorBody)
        },
      },
    )
  }

  const validBills = preview?.valid_bills ?? []
  const invalidBills = preview?.invalid_bills ?? []
  const currency = preview?.currency ?? ''
  const allBillsUnderReview =
    validBills.length > 0 && validBills.every((b) => b.status === 'under review')

  const fixedBillNos = React.useMemo(
    () =>
      new Set(
        invalidBills
          .filter((b) => b.bill_no !== null && b.status !== 'failed')
          .map((b) => b.bill_no as string),
      ),
    [invalidBills],
  )

  const getEditDisabledReason = (bill: BatchPreviewBill): string | undefined => {
    if (bill.status === 'failed') return 'Cannot edit a failed bill'
    if (bill.status === 'approved' || bill.status === 'rejected')
      return 'Cannot edit an approved or rejected bill'
    if (bill.validation_error?.includes('previous'))
      return 'This bill already exists in a previous submission'
    if (bill.validation_error?.includes('Duplicate'))
      return 'Cannot edit a duplicate bill'
    return undefined
  }

  const getFixDisabledReason = (bill: BatchPreviewBill): string | undefined => {
    const hasMissingData =
      bill.validation_error?.includes('Missing') || bill.validation_error?.includes('unreadable')
    if (hasMissingData) return undefined
    if (bill.status !== 'failed') return 'This bill has already been processed'
    if (bill.bill_no !== null && fixedBillNos.has(bill.bill_no))
      return 'Another duplicate bill has already been fixed'
    return undefined
  }

  const formatTotal = (amount: number) => {
    if (!amount) return `${currency} 0`
    return `${currency} ${amount.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-up">
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
          <h1 className="text-2xl font-bold text-gray-900">{t.reviewBatch.title}</h1>
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

        {(!loaderDone || isLoading) && (
          <TanukiLoader
            message={t.reviewBatch.loadingBills}
            onComplete={() => setLoaderDone(true)}
          />
        )}

        {loaderDone && !isLoading && (
          <>
            {/* AI processing banner */}
            {isProcessing && (
              <ProcessingBanner
                labels={{
                  processingTitle: t.reviewBatch.processingTitle,
                  stepUploaded: t.reviewBatch.stepUploaded,
                  stepScanning: t.reviewBatch.stepScanning,
                  stepReview: t.reviewBatch.stepReview,
                  almostDone: t.reviewBatch.almostDone,
                }}
              />
            )}

            {/* AI processing failed banner */}
            {isFailed && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 py-14 text-center">
                <AlertTriangle className="mb-4 size-10 text-red-500" />
                <p className="text-base font-semibold text-gray-900">Processing Failed</p>
                <p className="mt-1 text-sm text-gray-500 max-w-xs">
                  There was an error processing the bills in this batch. Please try uploading again.
                </p>
              </div>
            )}
          </>
        )}

        {/* Bills list */}
        {loaderDone && !isLoading && aiStatus === 'success' && preview && (
          <div className="space-y-6">
            {/* Valid bills */}
            {validBills.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-gray-700">
                  {t.reviewBatch.validBills} ({validBills.length})
                </h2>
                <div className="space-y-3">
                  {validBills.map((bill) => {
                    const editDisabledReason = getEditDisabledReason(bill)
                    return (
                      <BillCard
                        key={bill.id}
                        bill={bill}
                        isValid
                        isSaving={isUpdating && updateVars?.billId === bill.id}
                        isRemoving={isDeleting && deleteVars?.billId === bill.id}
                        onSave={(data) => handleSave(bill.id, data)}
                        onRemove={() => handleRemove(bill.id)}
                        labels={cardLabels}
                        isEditDisabled={editDisabledReason !== undefined}
                        editDisabledReason={editDisabledReason}
                      />
                    )
                  })}
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
                  {invalidBills.map((bill) => {
                    const editDisabledReason = getEditDisabledReason(bill)
                    const fixDisabledReason = getFixDisabledReason(bill)
                    return (
                      <BillCard
                        key={bill.id}
                        bill={bill}
                        isValid={false}
                        isSaving={isUpdating && updateVars?.billId === bill.id}
                        isRemoving={isDeleting && deleteVars?.billId === bill.id}
                        onSave={(data) => handleSave(bill.id, data)}
                        onRemove={() => handleRemove(bill.id)}
                        labels={cardLabels}
                        isEditDisabled={editDisabledReason !== undefined}
                        editDisabledReason={editDisabledReason}
                        isFixDisabled={fixDisabledReason !== undefined}
                        fixDisabledReason={fixDisabledReason}
                      />
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Fixed footer */}
      {loaderDone && !isLoading && aiStatus === 'success' && preview && !allBillsUnderReview && (
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
              {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {t.reviewBatch.submitForReimbursement}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
