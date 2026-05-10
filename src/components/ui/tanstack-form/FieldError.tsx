import type { AnyFieldMeta } from '@tanstack/react-form'
import { FieldError as ShadCnFieldError } from '../field'

type Props = {
  meta: AnyFieldMeta
}
export default function FieldError({ meta }: Props) {
  if (!meta.isTouched) return null

  const unique = Array.from(
    new Map(
      meta.errors.map((e) => [`${e.code}-${e.path.join('.')}`, e]),
    ).values(),
  )

  return unique.map(({ message }, index) => (
    <ShadCnFieldError key={index}>{message}</ShadCnFieldError>
  ))
}
