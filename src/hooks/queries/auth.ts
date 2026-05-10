import { login } from '#/lib/api/auth'
import type {
  ApiError,
  LoginResponse,
  LoginSchema,
  ResponseWrapper,
} from '#/lib/types'
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export function useLogin() {
  return useMutation<
    ResponseWrapper<LoginResponse>,
    AxiosError<ApiError>,
    LoginSchema
  >({
    mutationFn: (data) => login(data),
  })
}
