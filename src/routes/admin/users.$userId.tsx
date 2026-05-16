import { AdminHeader } from '#/components/admin/AdminHeader'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
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
import { useAdminCategoryWiseBills } from '#/hooks/queries/admin'
import { onLogout } from '#/server/cookies'
import { ROLES } from '#/lib/utils/constant'
import { useI18n } from '#/lib/i18n'
import type { BillStatus } from '#/lib/types'
import {
  createFileRoute,
  redirect,
  useNavigate,
  Link,
} from '@tanstack/react-router'
import { ArrowLeft, Eye } from 'lucide-react'
import * as React from 'react'
import { toast } from 'react-toastify'
import { z } from 'zod'

const searchSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  totalSubmitted: z.string().optional(),
  totalApproved: z.string().optional(),
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
  const { t } = useI18n()

  const token = context.token ?? ''
  const currentMonth = new Date().getMonth() + 1
  const [month, setMonth] = React.useState(String(currentMonth))
  const [status, setStatus] = React.useState('all')
  const [page, setPage] = React.useState(1)

  const resetPage = () => setPage(1)

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

  const STATUS_CONFIG: Record<
    BillStatus,
    {
      label: string
      variant: 'info' | 'muted' | 'destructive' | 'success' | 'warning'
    }
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
      page,
      per_page: 15,
    }),
    [month, status, page],
  )

  const { data: billsRes, isLoading } = useAdminCategoryWiseBills(
    Number(userId),
    token,
    filters,
  )

  const bills = billsRes?.data ?? []
  const meta = billsRes?.meta

  const handleMarkReimbursed = () => {
    toast.success(t.adminUserDetail.reimbursedSuccess)
  }

  console.log(bills)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={context.user} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
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
            <Select
              value={month}
              onValueChange={(v) => {
                setMonth(v)
                resetPage()
              }}
            >
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

            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v)
                resetPage()
              }}
            >
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
                  {search.name ?? `Employee #${userId}`}
                </h2>
                <p className="text-sm text-gray-500">{search.email ?? ''}</p>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t.adminUserDetail.totalSubmitted}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {search.totalSubmitted ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t.adminUserDetail.totalApproved}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {search.totalApproved ?? '—'}
                  </p>
                </div>
                <Button
                  onClick={handleMarkReimbursed}
                  className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                >
                  {t.adminUserDetail.markAsReimbursed}
                </Button>
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 animate-pulse rounded bg-gray-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : bills.length === 0 ? (
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
                    label: bill.status || t.common.statusLabels.pending,
                    variant: 'warning',
                  }
                  return (
                    <TableRow key={bill.id}>
                      <TableCell className="text-gray-600">
                        {bill.created_date}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {bill.category_name ?? '—'}
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
                          to="/admin/review/$batchId"
                          params={{ batchId: String(bill.id) }}
                          search={{
                            userId: userId,
                            name: search.name,
                            category: bill.category_id.toString(),
                            date: bill.created_date,
                            totalSubmitted: bill.total_amount,
                            totalApproved: bill.approved_amount,
                            empName: search.name,
                            empEmail: search.email,
                            empTotalSubmitted: search.totalSubmitted,
                            empTotalApproved: search.totalApproved,
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

          {meta && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5">
              <p className="text-sm text-gray-500">
                {t.adminUserDetail.pageInfo
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
                      {t.adminUserDetail.prevPage}
                    </PaginationPrevious>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => p + 1)}
                      disabled={meta.current_page >= meta.last_page}
                    >
                      {t.adminUserDetail.nextPage}
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
