import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { useUserBills } from '#/hooks/queries/bills'
import { useEmployeeDashboard } from '#/hooks/queries/user'
import { useI18n } from '#/lib/i18n'
import type { BillStatus } from '#/lib/types'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangle, Filter, Plus } from 'lucide-react'
import * as React from 'react'

export const Route = createFileRoute('/_user/dashboard')({
  component: DashboardPage,
})

function StatusBadge({
  status,
  rejectReason,
  labels,
  rejectReasonLabel,
}: {
  status: BillStatus
  rejectReason?: string | null
  labels: Record<BillStatus, { label: string; variant: 'info' | 'muted' | 'destructive' | 'success' | 'warning' }>
  rejectReasonLabel: string
}) {
  const config = labels[status] ?? { label: status, variant: 'muted' as const }

  if (status === 'rejected' && rejectReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-default">
            <Badge variant={config.variant}>{config.label}</Badge>
            <AlertTriangle className="size-3.5 text-red-500" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-56">
          <p className="font-semibold text-gray-900 mb-1">{rejectReasonLabel}</p>
          <p>{rejectReason}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

function DashboardPage() {
  const context = Route.useRouteContext()
  const { t } = useI18n()
  const token = context.token ?? ''
  const userId = context.user?.id ?? 0

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
      { value: 'pending', label: t.common.statusLabels.submitted },
      { value: 'verified', label: t.common.statusLabels.verified },
      { value: 'rejected', label: t.common.statusLabels.rejected },
      { value: 'paid', label: t.common.statusLabels.paid },
    ],
    [t],
  )

  const STATUS_LABELS: Record<BillStatus, { label: string; variant: 'info' | 'muted' | 'destructive' | 'success' | 'warning' }> = React.useMemo(
    () => ({
      verified: { label: t.common.statusLabels.verified, variant: 'info' },
      pending: { label: t.common.statusLabels.submitted, variant: 'muted' },
      rejected: { label: t.common.statusLabels.rejected, variant: 'destructive' },
      paid: { label: t.common.statusLabels.paid, variant: 'success' },
    }),
    [t],
  )

  const filters = React.useMemo(
    () => ({
      month: Number(month),
      ...(status !== 'all' && { status }),
    }),
    [month, status],
  )

  const { data: dashboardRes, isLoading: isDashboardLoading } =
    useEmployeeDashboard(userId, token)

  const { data: billsRes, isLoading: isBillsLoading } = useUserBills(
    userId,
    token,
    filters,
  )

  const dashboard = dashboardRes?.data
  const bills = billsRes?.data ?? []

  const uniqueCategories = React.useMemo(() => {
    const cats = bills.map((b) => b.category).filter(Boolean) as string[]
    return [...new Set(cats)]
  }, [bills])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t.userDashboard.title}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {t.userDashboard.subtitle}
          </p>
        </div>
        <Link to="/upload-expense">
          <Button className="gap-1.5 bg-indigo-700 hover:bg-indigo-800">
            <Plus className="size-4" />
            {t.userDashboard.newExpense}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t.userDashboard.totalReviewedSubmitted}</CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.approved_amount ?? '—'}
                <span className="text-lg font-medium text-gray-400">
                  /{dashboard?.amount ?? '—'}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.userDashboard.totalReview}</CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className="h-8 w-12 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.total_bills ?? 0}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.userDashboard.categoryBreakdown}</CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse rounded bg-gray-100"
                  />
                ))}
              </div>
            ) : dashboard?.category_wise_amounts?.length ? (
              <ul className="space-y-1.5">
                {dashboard.category_wise_amounts.map((cat) => (
                  <li
                    key={cat.category_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">{cat.category}</span>
                    <span className="font-medium text-gray-900">
                      {cat.approved_amount}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t.userDashboard.noData}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3.5">
          <Filter className="size-4 text-gray-400 shrink-0" />

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

          <Select defaultValue="all">
            <SelectTrigger className="w-36" size="sm">
              <SelectValue placeholder={t.common.category} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.allCategories}</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36" size="sm">
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

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t.userDashboard.colDate}</TableHead>
              <TableHead>{t.userDashboard.colTitle}</TableHead>
              <TableHead>{t.common.category}</TableHead>
              <TableHead>{t.userDashboard.colAmount}</TableHead>
              <TableHead>{t.common.status}</TableHead>
              <TableHead>{t.common.action}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isBillsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : bills.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  {t.common.noExpenses}
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="text-gray-600">
                    {bill.created_date}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {bill.title}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {bill.category ?? '—'}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {bill.amount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={bill.status}
                      rejectReason={bill.reject_reason}
                      labels={STATUS_LABELS}
                      rejectReasonLabel={t.userDashboard.rejectReason}
                    />
                  </TableCell>
                  <TableCell>
                    <a
                      href={`/user/bill/${bill.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {t.common.viewDetails}
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
