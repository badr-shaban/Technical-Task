import { CheckSquareIcon } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function Login() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CheckSquareIcon className="size-4" />
          </span>
          <span className="text-lg font-medium">TaskFlow</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your email and password to access your tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm />
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              Demo account: <span className="font-medium">demo@taskflow.app</span> /{' '}
              <span className="font-medium">password123</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
