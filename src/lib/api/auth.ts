import type { LoginResponse, LoginSchema, ResponseWrapper } from '../types'
import { urls } from '../urls'
import * as axios from '../utils/axios'

export function login(data: LoginSchema) {
  return axios.post<ResponseWrapper<LoginResponse>>({
    url: urls.login,
    data,
  })
}
