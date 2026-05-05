import axios from 'axios'
import type { AxiosError, AxiosInstance } from 'axios'
import { cleanData } from '.'

interface RequestParams {
  url: string
  params?: unknown
  data?: unknown
  type?: 'formData' | 'json'
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    return Promise.reject(error)
  },
)

const get = async <T>({ url, params }: RequestParams) => {
  const response = await axiosInstance.get<T>(url, {
    params: cleanData(params),
  })
  return response.data
}

const post = async <T>({ url, data }: RequestParams) => {
  const response = await axiosInstance.post<T>(url, cleanData(data))
  return response.data
}

const formdataPost = async <T>({ url, data }: RequestParams) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
  const response = await axiosInstance.post<T>(url, data, config)
  return response.data
}

const put = async <T>({ url, data }: RequestParams) => {
  const response = await axiosInstance.put<T>(url, data)
  return response.data
}

const patch = async <T>({ url, data }: RequestParams) => {
  const response = await axiosInstance.patch<T>(url, data)
  return response.data
}

const del = async <T>({ url }: RequestParams) => {
  const response = await axiosInstance.delete<T>(url)
  return response.data
}

export { del, get, patch, post, put, formdataPost }
