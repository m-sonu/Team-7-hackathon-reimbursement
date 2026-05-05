import type z from 'zod'
import type { loginSchema } from './schema'

export type LoginSchema = z.infer<typeof loginSchema>
