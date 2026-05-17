import { z } from 'zod'
import { envSchema } from '../schema'
import { DEVELOPMENT, PRODUCTION } from '../constant'

function validateEnv() {
  try {
    const parsed = envSchema.parse({
      NODE_ENV: import.meta.env.VITE_NODE_ENV,
      BACKEND_API: import.meta.env.VITE_BACKEND_API,
    })
    return {
      ...parsed,
      isProd: parsed.NODE_ENV === PRODUCTION,
      isDev: parsed.NODE_ENV === DEVELOPMENT,
    } as const
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`,
      )
      throw new Error(
        `❌ Invalid environment variables:\n${errorMessages.join('\n')}`,
      )
    }
    throw error
  }
}

export const env = validateEnv()

type Env = ReturnType<typeof validateEnv>

export const getEnv = (): Readonly<Env> => env

if (process.env.EXPO_NODE_ENV !== PRODUCTION) {
  validateEnv()
}
