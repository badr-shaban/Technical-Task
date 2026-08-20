import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CheckSquareIcon, Columns3Icon, LayoutGridIcon, LogOutIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function navClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
    isActive
      ? 'bg-accent font-medium text-accent-foreground'
      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
  )
}

export function AppHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      toast.success('Signed out')
      navigate('/login')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckSquareIcon className="size-4" />
            </span>
            <span className="text-sm sm:text-base">TaskFlow</span>
          </Link>

          {user && (
            <nav className="flex items-center gap-1">
              <NavLink to="/" end className={navClassName}>
                <LayoutGridIcon className="size-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>
              <NavLink to="/board" className={navClassName}>
                <Columns3Icon className="size-4" />
                <span className="hidden sm:inline">Board</span>
              </NavLink>
            </nav>
          )}
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2.5">
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[160px] truncate text-sm sm:inline">
                  {user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOutIcon />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
