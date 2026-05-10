import { useI18n, type Language } from '#/lib/i18n'

const OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ja', label: '日本語' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n()

  return (
    <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 p-0.5 text-xs font-medium">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLang(opt.value)}
          className={
            lang === opt.value
              ? 'rounded px-2 py-0.5 bg-white text-gray-900 shadow-sm'
              : 'rounded px-2 py-0.5 text-gray-500 hover:text-gray-700'
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
