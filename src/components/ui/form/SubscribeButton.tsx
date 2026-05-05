'use client'

import { useStore } from '@tanstack/react-form'
import { useFormContext } from '.'
import { Button } from '../button'
import { Field } from '../field'
import type { PropsWithChildren } from 'react'

export default function SubscribeButton({
  children,
  isPending = false,
}: PropsWithChildren<{ isPending?: boolean }>) {
  const form = useFormContext()

  const [isSubmitting, canSubmit] = useStore(form.store, (state) => [
    state.isSubmitting,
    state.canSubmit,
  ])
  return (
    <Field>
      <Button type="submit" disabled={isSubmitting || !canSubmit || isPending}>
        {children}
      </Button>
    </Field>
  )
}
