import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { useI18n } from '#/lib/i18n'
import { Link } from '@tanstack/react-router'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <Empty className="max-w-md border-0">
        <EmptyHeader>
          <EmptyMedia variant="default">
            <span className="text-3xl font-bold text-primary">404</span>
          </EmptyMedia>
          <EmptyTitle className="text-2xl">{t.notFound.title}</EmptyTitle>
          <EmptyDescription>{t.notFound.description}</EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex w-full gap-3">
            <Link to="/dashboard" className="flex-1">
              <Button className="w-full" size="lg">
                {t.common.backToDashboard}
              </Button>
            </Link>
          </div>
          <div className="text-xs text-muted-foreground">
            {t.notFound.errorCode}:&nbsp;
            <code className="rounded bg-muted px-2 py-1 font-mono">404</code>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}
