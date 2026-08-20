import { Loader2Icon } from 'lucide-react'

export function PageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading</span>
    </div>
  )
}
