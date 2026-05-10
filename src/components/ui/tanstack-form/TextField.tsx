import { useFieldContext } from '.'
import { Field, FieldDescription, FieldLabel } from '../field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../input-group'
import FieldError from './FieldError'
import { useDisclosure } from '@/hooks/useDisclosure'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import type { InputHTMLAttributes } from 'react'

type Props = {
  label: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  description?: string
  isRequired?: boolean
}

type InputTypeMap = {
  text: string
  email: string
  number: number
  password: string
  url: string
}

type SupportedInputType = keyof InputTypeMap

export default function TextField<T extends SupportedInputType = 'text'>({
  label,
  type = 'text',
  description,
  isRequired,
}: Props) {
  const { isOpen, onToggle } = useDisclosure(true)
  const field = useFieldContext<InputTypeMap[T]>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label} {isRequired && <span className="text-red-400">*</span>}
      </FieldLabel>

      <InputGroup>
        <InputGroupInput
          id={field.name}
          type={isOpen ? type : 'text'}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => {
            const raw = e.target.value
            const parsed =
              type === 'number'
                ? (Number(raw) as InputTypeMap[T])
                : (raw as InputTypeMap[T])
            field.handleChange(parsed)
          }}
          aria-invalid={isInvalid}
          placeholder={label}
          autoComplete="off"
        />
        <PasswordIconAddon
          type={type}
          showPasswordIcon={isOpen}
          togglePasswordIcon={onToggle}
        />
      </InputGroup>
      {!!description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError meta={field.state.meta} />}
    </Field>
  )
}

type PasswordIconAddonProps = {
  showPasswordIcon: boolean
  togglePasswordIcon: () => void
  type: InputHTMLAttributes<HTMLInputElement>['type']
}
export function PasswordIconAddon({
  type,
  showPasswordIcon,
  togglePasswordIcon,
}: PasswordIconAddonProps) {
  if (type !== 'password') return null

  const Icon = showPasswordIcon ? IconEye : IconEyeOff
  return (
    <InputGroupAddon align="inline-end">
      <Icon onClick={togglePasswordIcon} />
    </InputGroupAddon>
  )
}
