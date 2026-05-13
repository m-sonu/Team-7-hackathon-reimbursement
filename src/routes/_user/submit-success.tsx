import { Button } from '#/components/ui/button'
import { useI18n } from '#/lib/i18n'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { z } from 'zod'

const searchSchema = z.object({
  title: z.string().optional(),
  date: z.string().optional(),
  category: z.string().optional(),
  amount: z.string().optional(),
})

export const Route = createFileRoute('/_user/submit-success')({
  validateSearch: searchSchema,
  component: SubmitSuccessPage,
})

function SubmitSuccessPage() {
  const search = Route.useSearch()
  const { t } = useI18n()
  const navigate = useNavigate()

  const rows = [
    { label: t.submitSuccess.labelTitle, value: search.title },
    { label: t.submitSuccess.labelDate, value: search.date },
    { label: t.submitSuccess.labelCategory, value: search.category },
    { label: t.submitSuccess.labelAmount, value: search.amount },
  ].filter((r) => r.value)

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        {/* Icon */}
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-9 text-emerald-500" strokeWidth={1.75} />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900">
          {t.submitSuccess.heading}
        </h1>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          {t.submitSuccess.subtitle}
        </p>

        {/* Details */}
        {rows.length > 0 && (
          <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
            <p className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
              {t.submitSuccess.detailsTitle}
            </p>
            <dl className="space-y-2">
              {rows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-500 shrink-0">{row.label}:</dt>
                  <dd className="font-medium text-gray-900 text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => navigate({ to: '/upload-expense' })}
            className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
          >
            {t.submitSuccess.submitAnother}
          </Button>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto">
              {t.submitSuccess.backToDashboard}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
