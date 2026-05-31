import { AdminHeader } from '#/components/admin/AdminHeader'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useAdminCategoryWiseBills, useUserBulkReimburse } from '#/hooks/queries/admin'
import { onLogout } from '#/server/cookies'
import { ROLES } from '#/lib/utils/constant'
import { useI18n } from '#/lib/i18n'
import {
  createFileRoute,
  redirect,
  useNavigate,
  Link,
} from '@tanstack/react-router'
import { ArrowLeft, Eye } from 'lucide-react'
import * as React from 'react'
import { TanukiLoader, useTanukiPopup } from '#/components/tanuki'
import { z } from 'zod'

const searchSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const Route = createFileRoute('/admin/users/$userId')({
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
  component: AdminUserDetailPage,
})

function AdminUserDetailPage() {
  const context = Route.useRouteContext()
  const { userId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const resolveCategory = (cat: { en: string; jp: string }) =>
    lang === 'ja' ? cat.jp || cat.en : cat.en

  const token = context.token ?? ''
  const currentMonth = new Date().getMonth() + 1
  const [month, setMonth] = React.useState(String(currentMonth))
  const [status, setStatus] = React.useState('all')

  const MONTHS = React.useMemo(
    () => t.common.months.map((label, i) => ({ value: String(i + 1), label })),
    [t],
  )

  const STATUS_OPTIONS = React.useMemo(
    () => [
      { value: 'all', label: t.common.allStatuses },
      { value: 'pending', label: t.common.statusLabels.pending },
      { value: 'under review', label: t.common.statusLabels.submitted },
      { value: 'verified', label: t.common.statusLabels.verified },
      { value: 'rejected', label: t.common.statusLabels.rejected },
      { value: 'reimbursed', label: t.common.statusLabels.paid },
    ],
    [t],
  )

  const STATUS_CONFIG: Partial<
    Record<
      string,
      { label: string; variant: 'info' | 'muted' | 'destructive' | 'success' | 'warning' }
    >
  > = React.useMemo(
    () => ({
      pending: { label: t.common.statusLabels.pending, variant: 'muted' },
      'under review': {
        label: t.common.statusLabels.submitted,
        variant: 'warning',
      },
      verified: { label: t.common.statusLabels.verified, variant: 'info' },
      rejected: {
        label: t.common.statusLabels.rejected,
        variant: 'destructive',
      },
      reimbursed: { label: t.common.statusLabels.paid, variant: 'success' },
    }),
    [t],
  )

  const filters = React.useMemo(
    () => ({
      month: Number(month),
      ...(status !== 'all' && { status }),
      ...(search.startDate && { start_date: search.startDate }),
      ...(search.endDate && { end_date: search.endDate }),
    }),
    [month, status, search.startDate, search.endDate],
  )

  const { data: billsRes, isLoading } = useAdminCategoryWiseBills(
    Number(userId),
    token,
    filters,
  )

  const bills = billsRes?.data?.data ?? []

  const { mutate: markReimbursed, isPending: isReimbursing } = useUserBulkReimburse(Number(userId))
  const { showSuccess, showError } = useTanukiPopup()
  const [loaderDone, setLoaderDone] = React.useState(false)
  React.useEffect(() => { setLoaderDone(false) }, [filters])

  const isFullyReimbursed = React.useMemo(
    () => bills.length > 0 && bills.every((bill) => bill.status === 'reimbursed'),
    [bills],
  )

  const hasVerifiedBills = React.useMemo(
    () => bills.some((bill) => bill.status === 'verified'),
    [bills],
  )

  const canReimburse = React.useMemo(() => {
    if (isFullyReimbursed || bills.length === 0 || status !== 'all') return false
    return bills.every(
      (bill) => bill.status === 'verified' || bill.status === 'rejected' || bill.status === 'reimbursed',
    )
  }, [bills, isFullyReimbursed, status])

  const parseAmount = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0
  const getCurrencyPrefix = (s: string) => s.match(/^([^0-9]+)/)?.[1].trim() ?? ''

  const { displayTotalSubmitted, displayTotalApproved } = React.useMemo(() => {
    if (!isLoading && bills.length > 0 && status === 'all') {
      const prefix = getCurrencyPrefix(bills[0].total_amount)
      const submitted = bills.reduce((sum, b) => sum + parseAmount(b.total_amount), 0)
      const approved = bills.reduce((sum, b) => sum + parseAmount(b.approved_amount), 0)
      const fmt = (n: number) => prefix ? `${prefix} ${n.toFixed(2)}` : n.toFixed(2)

      return {
        displayTotalSubmitted: fmt(submitted),
        displayTotalApproved: fmt(approved),
      }
    }
    return {
      displayTotalSubmitted: '—',
      displayTotalApproved: '—',
    }
  }, [bills, isLoading, status])

  const handleMarkReimbursed = () => {
    markReimbursed(
      { token, month: Number(month) },
      {
        onSuccess: () => showSuccess('ステータス更新！', '変更が反映されました'),
        onError: () => showError('エラーが発生しました', 'もう一度お試しください'),
      },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={context.user} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-fade-up">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate({ to: '/admin/dashboard' })}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            {t.common.backToDashboard}
          </button>

          <div className="flex items-center gap-3">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-32" size="sm">
                <SelectValue placeholder={t.common.month} />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32" size="sm">
                <SelectValue placeholder={t.common.status} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* User summary card */}
        <Card className="mb-6">
          <CardContent className="py-5">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {`Employee #${userId}`}
                </h2>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t.adminUserDetail.totalSubmitted}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {displayTotalSubmitted}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t.adminUserDetail.totalApproved}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {displayTotalApproved}
                  </p>
                </div>
                {isFullyReimbursed ? (
                  <Badge variant="success" className="px-4 py-2 text-sm shrink-0">
                    {t.common.statusLabels.paid}
                  </Badge>
                ) : hasVerifiedBills ? (
                  <Button
                    onClick={handleMarkReimbursed}
                    disabled={isReimbursing || !canReimburse}
                    className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                  >
                    {isReimbursing ? '...' : t.adminUserDetail.markAsReimbursed}
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses table */}
        <Card>
          <div className="border-b border-gray-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-gray-700">
              {t.adminUserDetail.expenses}
            </h3>
          </div>

          {(!loaderDone || isLoading) ? (
            <TanukiLoader message={t.common.loading} onComplete={() => setLoaderDone(true)} />
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.adminUserDetail.colLatestDate}</TableHead>
                <TableHead>{t.common.category}</TableHead>
                <TableHead>{t.adminUserDetail.colNoOfBills}</TableHead>
                <TableHead>{t.adminUserDetail.colSubmittedAmount}</TableHead>
                <TableHead>{t.adminUserDetail.colApprovedAmount}</TableHead>
                <TableHead>{t.common.status}</TableHead>
                <TableHead>{t.common.action}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    {t.common.noExpenses}
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => {
                  const statusCfg = STATUS_CONFIG[bill.status] ?? {
                    label: bill.status,
                    variant: 'muted' as const,
                  }
                  return (
                    <TableRow key={bill.category_id}>
                      <TableCell className="text-gray-600">
                        {bill.updated_at}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {resolveCategory(bill.category)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {bill.bill_count}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {bill.total_amount}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {bill.approved_amount !== '¥0' &&
                        bill.approved_amount !== '0'
                          ? bill.approved_amount
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusCfg.variant}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          to="/admin/review/$userId/$batchId"
                          params={{ userId: userId, batchId: String(bill.category_id) }}
                          search={{
                            startDate: search.startDate,
                            endDate: search.endDate,
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          <Eye className="size-3.5" />
                          {t.adminUserDetail.review}
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          )}
        </Card>
      </div>
    </div>
  )
}
