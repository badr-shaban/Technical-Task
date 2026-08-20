import { useState } from 'react'
import { CalendarIcon, PaperclipIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { Task, TaskPriority, TaskStatus } from '@/types/task'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/types/task'
import { formatDate } from '@/utils/date'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const statusStyles: Record<TaskStatus, string> = {
  todo: 'border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  in_progress:
    'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
  done: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
}

const priorityStyles: Record<TaskPriority, string> = {
  low: 'border-transparent bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
  medium:
    'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  high: 'border-transparent bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => Promise<void>
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const snippet =
    task.description.length > 120
      ? `${task.description.slice(0, 120)}…`
      : task.description

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await onDelete(task)
      setConfirmOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="pr-16">{task.title}</CardTitle>
          <CardAction className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${task.title}`}
              onClick={() => onEdit(task)}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${task.title}`}
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2Icon />
            </Button>
          </CardAction>
          <CardDescription>{snippet}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge className={cn(statusStyles[task.status])}>
            {TASK_STATUS_LABELS[task.status]}
          </Badge>
          <Badge className={cn(priorityStyles[task.priority])}>
            {TASK_PRIORITY_LABELS[task.priority]}
          </Badge>
        </CardContent>
        <CardFooter className="flex-wrap gap-2 text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarIcon className="size-3.5" />
            Due {formatDate(task.dueDate)}
          </span>
          {task.attachments?.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <PaperclipIcon className="size-3.5" />
              {task.attachments.length}
            </span>
          )}
        </CardFooter>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task</DialogTitle>
            <DialogDescription>
              This will permanently remove &ldquo;{task.title}&rdquo;. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
