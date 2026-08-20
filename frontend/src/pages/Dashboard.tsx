import { useState } from 'react'
import { toast } from 'sonner'
import { AlertCircleIcon } from 'lucide-react'
import type { CreateTaskInput, Task } from '@/types/task'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { getErrorMessage } from '@/services/api'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { TaskGrid } from '@/components/tasks/TaskGrid'
import { TaskToolbar } from '@/components/tasks/TaskToolbar'
import { Button } from '@/components/ui/button'

export function Dashboard() {
  const { user } = useAuth()
  const {
    tasks,
    loading,
    error,
    search,
    status,
    priority,
    setSearch,
    setStatus,
    setPriority,
    refresh,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  function openCreate() {
    setSelectedTask(null)
    setDialogOpen(true)
  }

  function openEdit(task: Task) {
    setSelectedTask(task)
    setDialogOpen(true)
  }

  async function handleSubmit(input: CreateTaskInput) {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, input)
        toast.success('Task updated')
        return
      }

      await createTask(input)
      toast.success('Task created')
    } catch (caught) {
      toast.error(getErrorMessage(caught))
      throw caught
    }
  }

  async function handleDelete(task: Task) {
    try {
      await deleteTask(task.id)
      toast.success('Task deleted')
    } catch (caught) {
      toast.error(getErrorMessage(caught))
      throw caught
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {user
            ? `Welcome back, ${user.name}. Manage and filter your tasks.`
            : 'Manage and filter your tasks.'}
        </p>
      </div>

      <TaskToolbar
        search={search}
        status={status}
        priority={priority}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onAddTask={openCreate}
      />

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refresh(true)}
          >
            Try again
          </Button>
        </div>
      )}

      <TaskGrid
        tasks={tasks}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <TaskFormDialog
        open={dialogOpen}
        task={selectedTask}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
