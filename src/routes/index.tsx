import { useAppForm } from '#/components/ui/tanstack-form'
import { LanguageSwitcher } from '#/components/ui/language-switcher'
import { useLogin } from '#/hooks/queries/auth'
import { useI18n } from '#/lib/i18n'
import { loginSchema } from '#/lib/schema'
import type { LoginSchema } from '#/lib/types'
import { ROLES } from '#/lib/utils/constant'
import { onLogin } from '#/server/cookies'

import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Receipt } from 'lucide-react'
import { useTanukiPopup } from '#/components/tanuki'

const DEFAULT_VALUES: LoginSchema = {
  email: '',
  password: '',
}

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async ({ context }) => {
    if (context.token) {
      if (context.user?.role === ROLES.Admin) {
        throw redirect({ to: '/admin/dashboard' })
      }
      throw redirect({ to: '/dashboard' })
    }
  },
})

function Home() {
  const router = useRouter()
  const { mutate, isPending } = useLogin()
  const { t } = useI18n()
  const { showError } = useTanukiPopup()

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    validators: {
      onChange: loginSchema,
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value, {
        onSuccess: async ({ data }) => {
          await onLogin({
            data: {
              token: data.token,
              user: {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
              },
            },
          })
          if (data.user.role === ROLES.Admin) {
            router.navigate({ to: '/admin/dashboard' })
            return
          }
          router.navigate({ to: '/dashboard' })
        },
        onError: (error) => {
          showError('エラーが発生しました', error.response?.data.message ?? 'もう一度お試しください')
        },
      })
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-up">
        <div className="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-700 text-white mb-4">
            <Receipt className="size-6" />
          </div>
          <h2 className="text-xs font-semibold tracking-widest text-indigo-600 uppercase mb-1">
            {t.common.appName}
          </h2>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t.login.welcome}
          </h1>
          <p className="text-sm text-slate-500 mt-2">{t.login.subtitle}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-5"
        >
          <form.AppField name="email">
            {(field) => (
              <field.TextField label={t.common.email} isRequired />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label={t.common.password}
                isRequired
                type="password"
              />
            )}
          </form.AppField>

          <form.AppForm>
            <form.SubscribeButton isPending={isPending}>
              {t.common.submit}
            </form.SubscribeButton>
          </form.AppForm>
        </form>
      </div>
    </div>
  )
}
