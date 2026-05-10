import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import TextField from './TextField'
import SubscribeButton from './SubscribeButton'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
  },
  fieldContext,
  formContext,
  formComponents: {
    SubscribeButton,
  },
})

export type UseAppForm = ReturnType<typeof useAppForm>
export const useTypedFormContext = () => {
  const form = useFormContext()
  return form as unknown as UseAppForm
}
