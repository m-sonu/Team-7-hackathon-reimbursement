import { AdminHeader } from '#/components/admin/AdminHeader'
import { Badge } from '#/components/ui/badge'
import { Card } from '#/components/ui/card'
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
import { TanukiLoader, TanukiMascot } from '#/components/tanuki'
import { useEmployeeBills } from '#/hooks/queries/admin'
import { onLogout } from '#/server/cookies'
import { ROLES } from '#/lib/utils/constant'
import { useI18n } from '#/lib/i18n'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Filter, Users } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

function toDateString(d: Date) {
  return d.toISOString().split('T')[0]
}

const dashboardSearchSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const Route = createFileRoute('/admin/dashboard')({
  validateSearch: dashboardSearchSchema,
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
  const search = Route.useSearch()

  const token = context.token ?? ''

  const today = new Date()
  const defaultStart = toDateString(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const defaultEnd = toDateString(today)

  const startDate = search.startDate ?? defaultStart
  const endDate = search.endDate ?? defaultEnd
  const [status, setStatus] = React.useState('all')
  const [page, setPage] = React.useState(1)

  const resetPage = () => setPage(1)

  const STATUS_OPTIONS = React.useMemo(
    () => [
      { value: 'all', label: t.common.allStatuses },
      { value: 'under review', label: t.common.statusLabels.pending },
      { value: 'verified', label: t.common.statusLabels.verified },
      { value: 'rejected', label: t.common.statusLabels.rejected },
      { value: 'reimbursed', label: t.common.statusLabels.paid },
    ],
    [t],
  )

  const filters = React.useMemo(
    () => ({
      start_date: startDate,
      end_date: endDate,
      ...(status !== 'all' && { status }),
      page,
      per_page: 15,
    }),
    [startDate, endDate, status, page],
  )

  const { data: res, isLoading } = useEmployeeBills(token, filters)
  const employees = res?.data?.data ?? []
  const meta = res?.meta

  const [loaderDone, setLoaderDone] = React.useState(false)
  React.useEffect(() => { setLoaderDone(false) }, [filters])

  function billsCountBadge(count: number) {
    return <Badge variant="muted">{count}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={context.user} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-fade-up">
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
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="size-4 text-gray-400 shrink-0" />

              <label className="flex items-center gap-2 text-sm text-gray-600">
                {t.adminDashboard.dateFrom}
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => {
                    navigate({ search: (prev) => ({ ...prev, startDate: e.target.value }) })
                    resetPage()
                  }}
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-gray-700 shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-600">
                {t.adminDashboard.dateTo}
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => {
                    navigate({ search: (prev) => ({ ...prev, endDate: e.target.value }) })
                    resetPage()
                  }}
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-gray-700 shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </label>

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

          {(!loaderDone || isLoading) ? (
            <TanukiLoader message={t.common.loading} onComplete={() => setLoaderDone(true)} />
          ) : (
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
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <TanukiMascot mood="sleeping" size="md" />
                      <p className="text-sm text-muted-foreground">{t.adminDashboard.noSubmissions}</p>
                    </div>
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
                      {emp.total_amount}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {emp.approved_amount}
                    </TableCell>
                    <TableCell>{billsCountBadge(emp.bills_count)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          navigate({
                            to: '/admin/users/$userId',
                            params: { userId: String(emp.id) },
                            search: {
                              startDate,
                              endDate,
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
          )}

          {meta && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5">
              <p className="text-sm text-gray-500">
                {t.adminDashboard.pageInfo
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
                      {t.adminDashboard.prevPage}
                    </PaginationPrevious>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => p + 1)}
                      disabled={meta.current_page >= meta.last_page}
                    >
                      {t.adminDashboard.nextPage}
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
