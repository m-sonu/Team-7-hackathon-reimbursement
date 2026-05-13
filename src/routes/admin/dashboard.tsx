import { AdminHeader } from '#/components/admin/AdminHeader'
import { Badge } from '#/components/ui/badge'
import { Card } from '#/components/ui/card'
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
import { useEmployeeBills } from '#/hooks/queries/admin'
import { onLogout } from '#/server/cookies'
import { ROLES } from '#/lib/utils/constant'
import { useI18n } from '#/lib/i18n'
import type { BillStatus } from '#/lib/types'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Filter, Users } from 'lucide-react'
import * as React from 'react'

export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: async ({ context }) => {
    if (!context.token) {
      await onLogout()
      throw redirect({ to: '/' })
    }
    if (context.user?.role !== ROLES.Admin) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const context = Route.useRouteContext()
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

  const filters = React.useMemo(
    () => ({
      month: Number(month),
      ...(status !== 'all' && { status }),
    }),
    [month, status],
  )

  const { data: res, isLoading } = useEmployeeBills(token, filters)
  const employees = res?.data.data ?? []

  function actionStatusBadge(empStatus: BillStatus) {
    if (empStatus === 'reimbursed') {
      return <Badge variant="success">{t.common.statusLabels.done}</Badge>
    }
    if (empStatus === 'verified') {
      return <Badge variant="info">{t.common.statusLabels.verified}</Badge>
    }
    if (empStatus === 'rejected') {
      return (
        <Badge variant="destructive">{t.common.statusLabels.rejected}</Badge>
      )
    }
    return <Badge variant="warning">{t.common.statusLabels.pending}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={context.user} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t.adminDashboard.title}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {t.adminDashboard.subtitle}
          </p>
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users className="size-4 text-gray-400" />
              {t.adminDashboard.employeeOverview}
            </div>
            <div className="flex items-center gap-3">
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

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.adminDashboard.colEmployee}</TableHead>
                <TableHead>{t.common.email}</TableHead>
                <TableHead>{t.adminDashboard.colTotalSubmitted}</TableHead>
                <TableHead>{t.adminDashboard.colTotalReimbursed}</TableHead>
                <TableHead>{t.adminDashboard.colActionStatus}</TableHead>
                <TableHead>{t.common.action}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 animate-pulse rounded bg-gray-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    {t.adminDashboard.noSubmissions}
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium text-gray-900">
                      {emp.name}
                    </TableCell>
                    <TableCell className="text-gray-600">{emp.email}</TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {emp.amount}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {emp.approved_amount}
                    </TableCell>
                    <TableCell>{actionStatusBadge(emp.status)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          navigate({
                            to: '/admin/users/$userId',
                            params: { userId: String(emp.id) },
                            search: {
                              name: emp.name,
                              email: emp.email,
                              totalSubmitted: emp.amount,
                              totalApproved: emp.approved_amount,
                            },
                          })
                        }
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {t.common.viewDetails}
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
