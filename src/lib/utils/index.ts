import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

export function cleanData<T>(input: T): T {
  if (Array.isArray(input)) {
    const cleaned = input
      .map((item) => cleanData(item))
      .filter((item) => !isEmpty(item))
    return cleaned as T
  }

  if (input !== null && typeof input === 'object') {
    const obj = input as Record<string, object>
    const cleanedObj: Record<string, object> = {}

    for (const key of Object.keys(obj)) {
      const cleanedValue = cleanData(obj[key])
      if (!isEmpty(cleanedValue)) {
        cleanedObj[key] = cleanedValue
      }
    }

    return cleanedObj as T
  }

  return input
}
