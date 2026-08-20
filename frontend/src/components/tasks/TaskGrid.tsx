import { InboxIcon } from 'lucide-react'
import type { Task } from '@/types/task'
import { TASK_PAGE_SIZE } from '@/types/task'
import { TaskCard } from '@/components/tasks/TaskCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

interface TaskGridProps {
  tasks: Task[]
  loading: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => Promise<void>
}

export function TaskGrid({ tasks, loading, onEdit, onDelete }: TaskGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: TASK_PAGE_SIZE }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <InboxIcon className="mb-3 size-10 text-muted-foreground" />
        <h2 className="text-base font-medium">No tasks found</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Try a different search or filter, or add a new task to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
