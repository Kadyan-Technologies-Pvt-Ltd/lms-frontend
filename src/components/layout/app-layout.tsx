import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Bell,
  BookOpen,
  Library as LibraryIcon,
  CalendarCheck,
  LayoutDashboard,
  Megaphone,
  Menu,
  Moon,
  Receipt,
  Settings,
  Sofa,
  Sun,
  User,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Suspense, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { authApi } from '@/lib/api/auth'
import { membersApi } from '@/lib/api/members'
import { notificationsApi } from '@/lib/api/notifications'
import { libraryProfileApi } from '@/lib/api/settings'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/auth'
import type { Library } from '@/types/settings'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Members', to: '/admin/members', icon: Users },
  { label: 'Seats', to: '/admin/seats', icon: Sofa },
  { label: 'Payments', to: '/admin/payments', icon: Wallet },
  { label: 'Attendance', to: '/admin/attendance', icon: CalendarCheck },
  { label: 'Books', to: '/admin/books', icon: BookOpen },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Announcements', to: '/admin/announcements', icon: Megaphone },
  { label: 'Expenses', to: '/admin/expenses', icon: Receipt },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

const MEMBER_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/member', icon: LayoutDashboard },
  { label: 'My Profile', to: '/member/profile', icon: User },
  { label: 'My Membership', to: '/member/membership', icon: Wallet },
  { label: 'My Attendance', to: '/member/attendance', icon: CalendarCheck },
  { label: 'Books', to: '/member/books', icon: BookOpen },
  { label: 'Notifications', to: '/member/notifications', icon: Bell },
]

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
    </Button>
  )
}

function SidebarBrand({ library }: { library: Library | undefined }) {
  const name = library?.name || 'Library'
  return (
    // min-w-0 is the part that's easy to miss: a flex child's default
    // min-width is "auto" (its content size), which overrides truncate's
    // overflow-hidden and lets a long name push past the sidebar instead of
    // ever actually clipping. flex-1 + min-w-0 here is what lets it shrink.
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {library?.logo ? (
        <img src={library.logo} alt={name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] text-primary-foreground shadow-sm shadow-primary/30">
          <LibraryIcon className="h-4 w-4" />
        </div>
      )}
      <span className="truncate text-base font-semibold text-gradient-primary" title={name}>
        {name}
      </span>
    </div>
  )
}

function NavLinks({
  nav,
  role,
  layoutIdPrefix,
  onNavigate,
}: {
  nav: NavItem[]
  role: UserRole
  layoutIdPrefix: string
  onNavigate?: () => void
}) {
  const location = useLocation()

  const unreadQuery = useQuery({
    queryKey: ['notifications', { is_read: false }],
    queryFn: () => notificationsApi.list({ is_read: false, page_size: 1 }),
    enabled: role === 'MEMBER',
  })
  const unreadCount = unreadQuery.data?.pagination?.count ?? 0

  return (
    <nav className="flex-1 space-y-1 p-4">
      {nav.map((item) => {
        const isActive = location.pathname === item.to
        const showBadge = item.to === '/member/notifications' && unreadCount > 0
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-accent-foreground ${
              isActive ? 'text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`${layoutIdPrefix}-active-nav`}
                className="absolute inset-0 rounded-md bg-accent shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <item.icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{item.label}</span>
            {showBadge && (
              <Badge variant="destructive" className="relative z-10 ml-auto px-1.5 py-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppLayout({ role }: { role: UserRole }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const nav = role === 'ADMIN' ? ADMIN_NAV : MEMBER_NAV
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const profileQuery = useQuery({
    queryKey: ['members', 'me'],
    queryFn: membersApi.me,
    enabled: role === 'MEMBER',
    staleTime: 60_000,
  })
  const displayName = role === 'MEMBER' ? (profileQuery.data?.full_name ?? '…') : (user?.username ?? '')

  const libraryQuery = useQuery({
    queryKey: ['settings', 'library-profile'],
    queryFn: libraryProfileApi.get,
    staleTime: 5 * 60_000,
  })

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="flex min-h-screen app-shell-bg">
      <aside className="hidden w-64 flex-col border-r md:flex glass-surface">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <SidebarBrand library={libraryQuery.data} />
        </div>
        <NavLinks nav={nav} role={role} layoutIdPrefix="desktop" />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0 glass-surface">
          <SheetTitle className="flex h-16 items-center gap-2 border-b px-6 text-left text-lg font-semibold text-primary">
            <SidebarBrand library={libraryQuery.data} />
          </SheetTitle>
          <NavLinks nav={nav} role={role} layoutIdPrefix="mobile" onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6 glass-surface">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {role === 'ADMIN' ? 'Admin Panel' : 'Member Portal'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-6">
          <Suspense fallback={<PageFallback />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
