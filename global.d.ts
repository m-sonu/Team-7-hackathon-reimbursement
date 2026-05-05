import '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidateQueries?: string[] | readonly string[]
    }
  }
}
