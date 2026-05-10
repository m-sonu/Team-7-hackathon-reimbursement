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
import { useUserBills } from '#/hooks/queries/bills'
import { onLogout } from '#/server/cookies'
import { ROLES } from '#/lib/utils/constant'
import { useI18n } from '#/lib/i18n'
import type { BillStatus } from '#/lib/types'
import {
  createFileRoute,
  redirect,
  useNavigate,
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

  const MONTHS = React.useMemo(
    () => t.common.months.map((label, i) => ({ value: String(i + 1), label })),
    [t],
  )

  const STATUS_OPTIONS = React.useMemo(
    () => [
      { value: 'all', label: t.common.allStatuses },
      { value: 'pending', label: t.common.statusLabels.pending },
      { value: 'verified', label: t.common.statusLabels.verified },
      { value: 'rejected', label: t.common.statusLabels.rejected },
      { value: 'paid', label: t.common.statusLabels.paid },
    ],
    [t],
  )

  const STATUS_CONFIG: Record<
    BillStatus,
    { label: string; variant: 'info' | 'muted' | 'destructive' | 'success' | 'warning' }
  > = React.useMemo(
    () => ({
      verified: { label: t.common.statusLabels.verified, variant: 'info' },
      pending: { label: t.common.statusLabels.pending, variant: 'warning' },
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

  const { data: billsRes, isLoading } = useUserBills(
    Number(userId),
    token,
    filters,
  )

  const bills = billsRes?.data ?? []

  const handleMarkReimbursed = () => {
    toast.success(t.adminUserDetail.reimbursedSuccess)
  }

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
                    {Array.from({ length: 7 }).map((_, j) => (
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
                    label: bill.status,
                    variant: 'muted' as const,
                  }
                  return (
                    <TableRow key={bill.id}>
                      <TableCell className="text-gray-600">
                        {bill.created_date}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {bill.category ?? '—'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {bill.bills_count}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {bill.amount}
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
                        <a
                          href={`/admin/review/${bill.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          <Eye className="size-3.5" />
                          {t.adminUserDetail.review}
                        </a>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
