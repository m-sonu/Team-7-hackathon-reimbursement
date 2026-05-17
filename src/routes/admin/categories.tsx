import { AdminHeader } from '#/components/admin/AdminHeader'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '#/hooks/queries/categories'
import { useI18n } from '#/lib/i18n'
import type { Translations } from '#/lib/i18n'
import type { Category } from '#/lib/types'
import { onLogout } from '#/server/cookies'
import { ROLES } from '#/lib/utils/constant'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { LayoutGrid, Pencil, Plus, Trash2, X, Check } from 'lucide-react'
import * as React from 'react'
import { toast } from 'react-toastify'

export const Route = createFileRoute('/admin/categories')({
  beforeLoad: async ({ context }) => {
    if (!context.token) {
      await onLogout()
      throw redirect({ to: '/' })
    }
    if (context.user?.role !== ROLES.Admin) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminCategoriesPage,
})

type FormState = {
  name: string
  monthly_limit: string
  is_active: boolean
}

const emptyForm = (): FormState => ({
  name: '',
  monthly_limit: '',
  is_active: true,
})

function AdminCategoriesPage() {
  const context = Route.useRouteContext()
  const { t } = useI18n()
  const token = context.token ?? ''

  const { data: res, isLoading } = useCategories(token)
  const categories = res?.data ?? []

  const createMutation = useCreateCategory(token)
  const updateMutation = useUpdateCategory(token)
  const deleteMutation = useDeleteCategory(token)

  // null = no new-row form; 'new' = creating; number = editing category id
  const [editingId, setEditingId] = React.useState<'new' | number | null>(null)
  const [form, setForm] = React.useState<FormState>(emptyForm())

  function openNew() {
    setForm(emptyForm())
    setEditingId('new')
  }

  function openEdit(cat: Category) {
    setForm({
      name: cat.name,
      monthly_limit: cat.monthly_limit != null ? String(cat.monthly_limit) : '',
      is_active: cat.is_active ?? true,
    })
    setEditingId(cat.id)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
  }

  function buildPayload() {
    const limitVal = form.monthly_limit.trim()
    return {
      name: form.name.trim(),
      monthly_limit: limitVal !== '' ? Number(limitVal) : null,
      is_active: form.is_active,
    }
  }

  async function handleSave() {
    if (!form.name.trim()) return

    if (editingId === 'new') {
      await createMutation.mutateAsync(buildPayload(), {
        onSuccess: () => {
          toast.success(t.adminCategories.createSuccess)
          cancelEdit()
        },
        onError: (err) => {
          toast.error(err.response?.data?.message ?? err.message)
        },
      })
    } else if (typeof editingId === 'number') {
      await updateMutation.mutateAsync(
        { id: editingId, ...buildPayload() },
        {
          onSuccess: () => {
            toast.success(t.adminCategories.updateSuccess)
            cancelEdit()
          },
          onError: (err) => {
            toast.error(err.response?.data?.message ?? err.message)
          },
        },
      )
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(t.adminCategories.confirmDelete)) return
    await deleteMutation.mutateAsync(id, {
      onSuccess: () => toast.success(t.adminCategories.deleteSuccess),
      onError: (err) => toast.error(err.response?.data?.message ?? err.message),
    })
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={context.user} />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t.adminCategories.title}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {t.adminCategories.subtitle}
            </p>
          </div>
          {editingId !== 'new' && (
            <Button size="sm" onClick={openNew}>
              <Plus />
              {t.adminCategories.newCategory}
            </Button>
          )}
        </div>

        <Card>
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5 text-sm font-semibold text-gray-700">
            <LayoutGrid className="size-4 text-gray-400" />
            {t.adminCategories.title}
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.adminCategories.colName}</TableHead>
                <TableHead>{t.adminCategories.colMonthlyLimit}</TableHead>
                <TableHead>{t.adminCategories.colStatus}</TableHead>
                <TableHead className="w-28">
                  {t.adminCategories.colActions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editingId === 'new' && (
                <FormRow
                  form={form}
                  onChange={setForm}
                  onSave={handleSave}
                  onCancel={cancelEdit}
                  isSaving={isSaving}
                  t={t.adminCategories}
                />
              )}

              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 animate-pulse rounded bg-gray-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : categories.length === 0 && editingId !== 'new' ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    {t.adminCategories.noCategories}
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) =>
                  editingId === cat.id ? (
                    <FormRow
                      key={cat.id}
                      form={form}
                      onChange={setForm}
                      onSave={handleSave}
                      onCancel={cancelEdit}
                      isSaving={isSaving}
                      t={t.adminCategories}
                    />
                  ) : (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium text-gray-900">
                        {cat.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {cat.monthly_limit != null ? (
                          cat.monthly_limit.toLocaleString()
                        ) : (
                          <span className="italic text-gray-400">
                            {t.adminCategories.noLimit}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cat.is_active !== false ? 'success' : 'muted'
                          }
                        >
                          {cat.is_active !== false
                            ? t.adminCategories.active
                            : t.adminCategories.inactive}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            title={t.adminCategories.editCategory}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title={t.adminCategories.deleteCategory}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}

type FormRowProps = {
  form: FormState
  onChange: React.Dispatch<React.SetStateAction<FormState>>
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  t: Translations['adminCategories']
}

function FormRow({
  form,
  onChange,
  onSave,
  onCancel,
  isSaving,
  t,
}: FormRowProps) {
  function set<T extends keyof FormState>(key: T, value: FormState[T]) {
    onChange((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <TableRow className="bg-indigo-50/40">
      <TableCell>
        <Input
          autoFocus
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={t.placeholderName}
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          value={form.monthly_limit}
          onChange={(e) => set('monthly_limit', e.target.value)}
          placeholder={t.placeholderLimit}
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
        />
      </TableCell>
      <TableCell>
        <button
          type="button"
          onClick={() => set('is_active', !form.is_active)}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
            form.is_active
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {form.is_active ? t.active : t.inactive}
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            disabled={isSaving || !form.name.trim()}
            className="rounded p-1 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
            title={t.saveChanges}
          >
            <Check className="size-4" />
          </button>
          <button
            onClick={onCancel}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title={t.cancel}
          >
            <X className="size-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  )
}
