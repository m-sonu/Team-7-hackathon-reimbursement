import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '#/components/ui/pagination'
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
import { TanukiLoader, TanukiMascot } from '#/components/tanuki'
import { useCategories } from '#/hooks/queries/categories'
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
  labels: Record<
    BillStatus,
    {
      label: string
      variant: 'info' | 'muted' | 'destructive' | 'success' | 'warning'
    }
  >
  rejectReasonLabel: string
}) {
  const config = labels[status]

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
          <p className="font-semibold text-gray-900 mb-1">
            {rejectReasonLabel}
          </p>
          <p>{rejectReason}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

function toDateString(d: Date) {
  return d.toISOString().split('T')[0]
}

function DashboardPage() {
  const context = Route.useRouteContext()
  const { t, lang } = useI18n()

  // i18n uses 'ja' but the API locale key is 'jp'
  const localeKey = lang === 'ja' ? 'jp' : 'en'
  const resolveCategory = (cat: { en: string; jp: string }) =>
    cat[localeKey] || cat.en
  const token = context.token ?? ''
  const userId = context.user?.id ?? 0

  const today = new Date()
  const defaultStart = toDateString(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const defaultEnd = toDateString(today)

  const [startDate, setStartDate] = React.useState(defaultStart)
  const [endDate, setEndDate] = React.useState(defaultEnd)
  const [status, setStatus] = React.useState('all')
  const [categoryId, setCategoryId] = React.useState('all')
  const [page, setPage] = React.useState(1)

  const resetPage = () => setPage(1)

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

  const STATUS_LABELS: Record<
    BillStatus,
    {
      label: string
      variant: 'info' | 'muted' | 'destructive' | 'success' | 'warning'
    }
  > = React.useMemo(
    () => ({
      pending: { label: t.common.statusLabels.pending, variant: 'muted' },
      'under review': { label: t.common.statusLabels.submitted, variant: 'warning' },
      verified: { label: t.common.statusLabels.verified, variant: 'info' },
      rejected: { label: t.common.statusLabels.rejected, variant: 'destructive' },
      reimbursed: { label: t.common.statusLabels.paid, variant: 'success' },
    }),
    [t],
  )

  const filters = React.useMemo(
    () => ({
      start_date: startDate,
      end_date: endDate,
      ...(status !== 'all' && { status }),
      ...(categoryId !== 'all' && { category_id: Number(categoryId) }),
      page,
      per_page: 15,
    }),
    [startDate, endDate, status, categoryId, page],
  )

  const { data: dashboardRes, isLoading: isDashboardLoading } =
    useEmployeeDashboard(userId, token)

  const { data: billsRes, isLoading: isBillsLoading } = useUserBills(
    userId,
    token,
    filters,
  )

  const { data: categoriesRes } = useCategories(token)

  const [loaderDone, setLoaderDone] = React.useState(false)
  React.useEffect(() => { setLoaderDone(false) }, [filters])

  const bills = billsRes?.data ?? []
  const meta = billsRes?.meta
  const categories = categoriesRes?.data ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-fade-up">
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
        <Card className="animate-fade-up delay-75">
          <CardHeader>
            <CardTitle>{t.userDashboard.totalReviewedSubmitted}</CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {dashboardRes?.data?.approved_amount ?? '—'}
                <span className="text-lg font-medium text-gray-400">
                  /{dashboardRes?.data?.amount ?? '—'}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-150">
          <CardHeader>
            <CardTitle>{t.userDashboard.totalReview}</CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {dashboardRes?.data?.total_bills ?? 0}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-[225ms]">
          <CardHeader>
            <CardTitle>{t.userDashboard.categoryBreakdown}</CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4" />
                ))}
              </div>
            ) : dashboardRes?.data?.category_wise_amounts.length ? (
              <ul className="space-y-1.5">
                {dashboardRes.data.category_wise_amounts.map((cat) => (
                  <li
                    key={cat.category_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">{resolveCategory(cat.category)}</span>
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

          {/* Date range */}
          <label className="flex items-center gap-2 text-sm text-gray-600">
            {t.userDashboard.dateFrom}
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                resetPage()
              }}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-gray-700 shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            {t.userDashboard.dateTo}
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                resetPage()
              }}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-gray-700 shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </label>

          {/* Category filter */}
          <Select
            value={categoryId}
            onValueChange={(v) => {
              setCategoryId(v)
              resetPage()
            }}
          >
            <SelectTrigger className="w-36" size="sm">
              <SelectValue placeholder={t.common.category} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.allCategories}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {lang === 'ja' ? (cat.locale?.jp || cat.name) : cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v)
              resetPage()
            }}
          >
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

        {(!loaderDone || isBillsLoading) ? (
          <TanukiLoader message={t.common.loading} onComplete={() => setLoaderDone(true)} />
        ) : (
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
              {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <TanukiMascot mood="searching" size="md" />
                    <p className="text-sm text-muted-foreground">{t.common.noExpenses}</p>
                  </div>
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
                    {bill.category ? resolveCategory(bill.category) : '—'}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {bill.amount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={bill.status}
                      labels={STATUS_LABELS}
                      rejectReasonLabel={t.userDashboard.rejectReason}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/bill/$billId"
                      params={{ billId: String(bill.id) }}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {t.common.viewDetails}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5">
            <p className="text-sm text-gray-500">
              {t.userDashboard.pageInfo
                .replace('{current}', String(meta.current_page))
                .replace('{total}', String(meta.last_page))}
            </p>
            <Pagination className="w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => p - 1)}
                    disabled={meta.current_page <= 1}
                  >
                    {t.userDashboard.prevPage}
                  </PaginationPrevious>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => p + 1)}
                    disabled={meta.current_page >= meta.last_page}
                  >
                    {t.userDashboard.nextPage}
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  )
}
