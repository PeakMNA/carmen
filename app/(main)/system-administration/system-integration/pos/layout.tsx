'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { label: 'Operate', href: '/system-administration/system-integration/pos/operate' },
  { label: 'Audit', href: '/system-administration/system-integration/pos/audit' },
  { label: 'Setup', href: '/system-administration/system-integration/pos/setup' },
]

function getCurrentSection(pathname: string): string | null {
  if (pathname.includes('/pos/operate')) return 'Operate'
  if (pathname.includes('/pos/audit')) return 'Audit'
  if (pathname.includes('/pos/setup')) return 'Setup'
  return null
}

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const section = getCurrentSection(pathname)

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/system-administration" className="hover:text-foreground transition-colors">
              System Administration
            </Link>
            <span>/</span>
            <Link href="/system-administration/system-integration" className="hover:text-foreground transition-colors">
              System Integration
            </Link>
            <span>/</span>
            <Link href="/system-administration/system-integration/pos/operate" className="hover:text-foreground transition-colors">
              POS Integration
            </Link>
            {section && (
              <>
                <span>/</span>
                <span className="text-foreground font-medium">{section}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
              <Link href="/system-administration/system-integration">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">POS Integration</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Configure and manage point-of-sale system integrations
          </p>
        </div>
      </div>

      <nav className="flex border-b">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
