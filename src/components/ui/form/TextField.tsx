import type { InputHTMLAttributes } from 'react'
import { Field, FieldError, FieldLabel } from '../field'
import { InputGroup, InputGroupInput } from '../input-group'

type Props = {
  label: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  description?: string
  isRequired?: boolean
  name: string
  error?: string
}

export default function TextField({
  label,
  type = 'text',
  isRequired,
  name,
  error,
}: Props) {
  const isInvalid = !!error

  return (
    <Field>
      <FieldLabel htmlFor={name}>
        {label} {isRequired && <span className="text-red-400">*</span>}
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={name}
          type={type}
          name={name}
          aria-invalid={isInvalid}
          placeholder={label}
          autoComplete="off"
        />
      </InputGroup>
      <FieldError errors={error ? [{ message: error }] : []} />
    </Field>
  )
}
