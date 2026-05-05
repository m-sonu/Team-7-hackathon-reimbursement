import { login } from '#/lib/api/auth'
import type { LoginSchema } from '#/lib/types'
import { useMutation } from '@tanstack/react-query'

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginSchema) => login(data),
  })
}
