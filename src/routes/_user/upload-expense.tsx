import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useCreateBill } from '#/hooks/queries/bills'
import { useCategories } from '#/hooks/queries/categories'
import { useI18n } from '#/lib/i18n'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ImageIcon, Upload, X } from 'lucide-react'
import * as React from 'react'
import { toast } from 'react-toastify'

export const Route = createFileRoute('/_user/upload-expense')({
  component: UploadExpensePage,
})

const CURRENCIES = ['NPR', 'YEN', 'USD'] as const

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILES = 3

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadExpensePage() {
  const context = Route.useRouteContext()
  const { t } = useI18n()
  const navigate = useNavigate()
  const token = context.token ?? ''

  const [title, setTitle] = React.useState('')
  const [categoryId, setCategoryId] = React.useState('')
  const [currency, setCurrency] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { data: categoriesRes } = useCategories(token)
  const categories = categoriesRes?.data ?? []

  const { mutate: createBill, isPending } = useCreateBill()

  const addFiles = React.useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return
      const valid: File[] = []
      const invalid: string[] = []

      Array.from(incoming).forEach((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) {
          invalid.push(f.name)
        } else {
          valid.push(f)
        }
      })

      if (invalid.length > 0) {
        setErrors((prev) => ({ ...prev, files: t.uploadExpense.errImageOnly }))
        return
      }

      setFiles((prev) => {
        const combined = [...prev, ...valid]
        if (combined.length > MAX_FILES) {
          setErrors((prev2) => ({
            ...prev2,
            files: t.uploadExpense.errFilesMax,
          }))
          return combined.slice(0, MAX_FILES)
        }
        setErrors((prev2) => {
          const next = { ...prev2 }
          delete next.files
          return next
        })
        return combined
      })
    },
    [t],
  )

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.files
      return next
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = 'Required'
    if (!categoryId) next.category = 'Required'
    if (!currency) next.currency = 'Required'
    if (files.length === 0) next.files = t.uploadExpense.errFilesRequired
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('currency', currency)
    formData.append('category_id', categoryId)
    files.forEach((f) => formData.append('files[]', f))

    createBill(
      { data: formData, token },
      {
        onSuccess: (res) => {
          toast.success(t.uploadExpense.successMessage)
          navigate({
            to: '/review-batch/$batchId',
            params: { batchId: String(res.data.batch_id) },
          })
        },
        onError: (error) => {
          const msg = error.response?.data?.message
          if (msg) toast.error(msg)
        },
      },
    )
  }

  const isSubmitDisabled =
    isPending ||
    !title.trim() ||
    !categoryId ||
    !currency ||
    files.length === 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t.common.uploadExpense}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">{t.uploadExpense.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            {t.uploadExpense.formTitle}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setErrors((prev) => {
                const next = { ...prev }
                delete next.title
                return next
              })
            }}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-500 ${
              errors.title
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 focus:border-indigo-500'
            }`}
            placeholder={t.uploadExpense.formTitle}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Category + Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t.common.category}
            </label>
            <Select value={categoryId} onValueChange={(v) => {
              setCategoryId(v)
              setErrors((prev) => {
                const next = { ...prev }
                delete next.category
                return next
              })
            }}>
              <SelectTrigger className={errors.category ? 'border-red-400' : ''}>
                <SelectValue placeholder={t.common.category} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t.uploadExpense.currency}
            </label>
            <Select value={currency} onValueChange={(v) => {
              setCurrency(v)
              setErrors((prev) => {
                const next = { ...prev }
                delete next.currency
                return next
              })
            }}>
              <SelectTrigger className={errors.currency ? 'border-red-400' : ''}>
                <SelectValue placeholder={t.uploadExpense.currency} />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="mt-1 text-xs text-red-500">{errors.currency}</p>
            )}
          </div>
        </div>

        {/* Upload card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`m-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
              isDragging
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            <Upload className="mb-3 size-10 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              {t.uploadExpense.dragAndDrop}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {t.uploadExpense.orClickToBrowse}
            </p>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              disabled={files.length >= MAX_FILES}
            >
              {t.uploadExpense.browseFiles}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {/* File error */}
          {errors.files && (
            <p className="px-4 pb-2 text-xs text-red-500">{errors.files}</p>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3">
              <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t.uploadExpense.uploadedFiles} ({files.length})
              </p>
              <ul className="space-y-2">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ImageIcon className="size-4 shrink-0 text-indigo-500" />
                      <span className="truncate text-sm text-gray-700">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-gray-400">
                        {formatBytes(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        aria-label={t.uploadExpense.removeFile}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit */}
          <div className="border-t border-gray-100 p-4">
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isPending ? '…' : t.common.submit}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
