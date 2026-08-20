import { PlusIcon, SearchIcon } from 'lucide-react'
import type { TaskPriority, TaskStatus } from '@/types/task'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '@/types/task'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TaskToolbarProps {
  search: string
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  onSearchChange: (value: string) => void
  onStatusChange: (value: TaskStatus | 'all') => void
  onPriorityChange: (value: TaskPriority | 'all') => void
  onAddTask: () => void
}

export function TaskToolbar({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onAddTask,
}: TaskToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <Button onClick={onAddTask} className="w-full lg:w-auto">
        <PlusIcon />
        Add New Task
      </Button>

      <div className="relative w-full lg:flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tasks by title"
          className="pl-8"
          aria-label="Search tasks by title"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as TaskStatus | 'all')}
        >
          <SelectTrigger className="w-full lg:w-44" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TASK_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {TASK_STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priority}
          onValueChange={(value) =>
            onPriorityChange(value as TaskPriority | 'all')
          }
        >
          <SelectTrigger className="w-full lg:w-44" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {TASK_PRIORITIES.map((item) => (
              <SelectItem key={item} value={item}>
                {TASK_PRIORITY_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
