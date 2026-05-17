import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { LanguageSwitcher } from '#/components/ui/language-switcher'
import { useI18n } from '#/lib/i18n'
import { onLogout } from '#/server/cookies'
import { Link, useRouter } from '@tanstack/react-router'
import { LogOut, Receipt } from 'lucide-react'

type AdminHeaderProps = {
  user?: {
    id: number
    name: string
    email: string
    role: 'Admin' | 'Employee'
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const { t } = useI18n()

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'A'

  const handleLogout = async () => {
    await onLogout()
    router.navigate({ to: '/' })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-700">
            <Receipt className="size-4 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-900">{t.common.appName}</p>
            <p className="text-[10px] text-gray-500">{t.common.tagline}</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            to="/admin/dashboard"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-indigo-50 [&.active]:text-indigo-700"
          >
            {t.common.dashboard}
          </Link>
          <Link
            to="/admin/categories"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 [&.active]:bg-indigo-50 [&.active]:text-indigo-700"
          >
            {t.common.category}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-100 focus:outline-none">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal truncate">
                  {user?.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut />
                {t.common.logOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
