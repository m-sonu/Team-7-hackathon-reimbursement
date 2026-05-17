import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

export const loginCookieSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  user: z.object({
    id: z.number(),
    name: z.string().min(1, 'User Name is required'),
    email: z.string().min(1, 'User Email is required'),
    role: z.enum(['Admin', 'Employee']),
  }),
})

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  BACKEND_API: z.url(),
})
