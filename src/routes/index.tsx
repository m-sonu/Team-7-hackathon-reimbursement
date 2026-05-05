import { useAppForm } from '#/components/ui/form'
import { useLogin } from '#/hooks/queries/auth'
import { loginSchema } from '#/lib/schema'
import type { LoginSchema } from '#/lib/types'

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

const DEFAULT_VALUES: LoginSchema = {
  email: '',
  password: '',
}

function Home() {
  const { mutate, isPending } = useLogin()

  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    validators: {
      onChange: loginSchema,
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value, {
        onSuccess: () => {
          redirect({ to: '/dashboard' })
        },
      })
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl mb-4">
            R
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Sign in to your Reimburshment account
          </p>
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
            {(field) => <field.TextField label="Email" isRequired />}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField label="Password" isRequired type="password" />
            )}
          </form.AppField>

          <form.AppForm>
            <form.SubscribeButton isPending={isPending}>
              Submit
            </form.SubscribeButton>
          </form.AppForm>
        </form>
      </div>
    </div>
  )
}
