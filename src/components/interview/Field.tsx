import type { ReactNode } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { Path } from 'react-hook-form'
import type { InterviewFormData } from '../../types/interview'

type Name = Path<InterviewFormData>

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <header className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function FieldError({ name }: { name: Name }) {
  const { getFieldState, formState } = useFormContext<InterviewFormData>()
  const error = getFieldState(name, formState).error
  return error ? <p className="mt-1 text-sm text-red-700" role="alert">{String(error.message)}</p> : null
}

function fieldId(name: string) {
  return name.replaceAll('.', '-')
}

const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'

export function TextField({ name, label, type = 'text', placeholder, required = false }: {
  name: Name; label: string; type?: string; placeholder?: string; required?: boolean
}) {
  const { register } = useFormContext<InterviewFormData>()
  const id = fieldId(name)
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-800">{label}{required && <span aria-hidden="true"> *</span>}</label>
      <input id={id} type={type} placeholder={placeholder} className={inputClass} {...register(name)} />
      <FieldError name={name} />
    </div>
  )
}

export function TextAreaField({ name, label, placeholder, required = false, rows = 4 }: {
  name: Name; label: string; placeholder?: string; required?: boolean; rows?: number
}) {
  const { register } = useFormContext<InterviewFormData>()
  const id = fieldId(name)
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-800">{label}{required && <span aria-hidden="true"> *</span>}</label>
      <textarea id={id} rows={rows} placeholder={placeholder} className={`${inputClass} min-h-28 resize-y`} {...register(name)} />
      <FieldError name={name} />
    </div>
  )
}

export function SelectField({ name, label, options, required = false }: {
  name: Name; label: string; options: readonly (string | { value: string; label: string })[]; required?: boolean
}) {
  const { register } = useFormContext<InterviewFormData>()
  const id = fieldId(name)
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-800">{label}{required && <span aria-hidden="true"> *</span>}</label>
      <select id={id} className={inputClass} {...register(name)}>
        <option value="">Selecione</option>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const label = typeof option === 'string' ? option : option.label
          return <option key={value} value={value}>{label}</option>
        })}
      </select>
      <FieldError name={name} />
    </div>
  )
}

export function ChoiceGroup({ name, label, options, multiple = false, required = false }: {
  name: Name; label: string; options: readonly string[]; multiple?: boolean; required?: boolean
}) {
  const { register } = useFormContext<InterviewFormData>()
  const id = fieldId(name)
  const type = multiple ? 'checkbox' : 'radio'
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-800">{label}{required && <span aria-hidden="true"> *</span>}</legend>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option, index) => (
          <label key={option} htmlFor={`${id}-${index}`} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 has-checked:border-blue-300 has-checked:bg-blue-50">
            <input id={`${id}-${index}`} type={type} value={option} className="size-4 shrink-0 accent-blue-700" {...register(name)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <FieldError name={name} />
    </fieldset>
  )
}

export function RadioScale({ label, required = false }: { label: string; required?: boolean }) {
  const { setValue, control } = useFormContext<InterviewFormData>()
  const name = 'urgency.rating'
  const rating = useWatch({ control, name })
  const id = fieldId(name)
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-800">{label}{required && <span aria-hidden="true"> *</span>}</legend>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((number) => (
          <label key={number} htmlFor={`${id}-${number}`} className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-gray-200 py-3 text-sm hover:bg-gray-50 has-checked:border-blue-400 has-checked:bg-blue-50">
            <input
              id={`${id}-${number}`}
              name={name}
              type="radio"
              value={String(number)}
              checked={String(rating) === String(number)}
              className="size-4 accent-blue-700"
              onChange={() => setValue(name, number, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })}
            />
            <span className="font-semibold">{number}</span>
          </label>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500"><span>1 — Baixa prioridade</span><span>5 — Preciso resolver logo</span></div>
      <FieldError name={name} />
    </fieldset>
  )
}

export function InlineCheck({ name, label }: { name: Name; label: string }) {
  const { register } = useFormContext<InterviewFormData>()
  return <label className="mt-2 inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="size-4 accent-blue-700" {...register(name)} />{label}</label>
}

export function ConditionalField({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border-l-2 border-blue-300 bg-blue-50/60 p-4">{children}</div>
}
