import type { LoginSchema } from '../types'
import { urls } from '../urls'
import * as axios from '../utils/axios'

export function login(data: LoginSchema) {
  return axios.post({
    url: urls.login,
    data,
  })
}
