import * as React from 'react'
import { cn } from '#/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
      }}
      className={cn('rounded-md animate-shimmer', className)}
      {...props}
    />
  )
}

export { Skeleton }
