import { useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type Over,
  type PointerSensorOptions,
} from '@dnd-kit/core'
import { InboxIcon } from 'lucide-react'
import type { Task, TaskStatus } from '@/types/task'
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@/types/task'
import { TaskCard } from '@/components/tasks/TaskCard'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TaskBoardProps {
  tasks: Task[]
  loading: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => Promise<void>
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>
}

const columnAccent: Record<TaskStatus, string> = {
  todo: 'border-t-slate-400',
  in_progress: 'border-t-blue-500',
  done: 'border-t-emerald-500',
}

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  if (pointerCollisions.length > 0) {
    return pointerCollisions
  }

  return closestCorners(args)
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && (TASK_STATUSES as readonly string[]).includes(value)
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element
    ? Boolean(
        target.closest('button, a, input, textarea, select, [data-no-dnd]'),
      )
    : false
}

class CardPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: (
        { nativeEvent }: ReactPointerEvent,
        { onActivation }: PointerSensorOptions,
      ) => {
        if (!nativeEvent.isPrimary || nativeEvent.button !== 0) {
          return false
        }

        if (isInteractiveTarget(nativeEvent.target)) {
          return false
        }

        onActivation?.({ event: nativeEvent })
        return true
      },
    },
  ]
}

function getDropStatus(over: Over | null): TaskStatus | null {
  if (!over) {
    return null
  }

  const data = over.data.current
  if (data && typeof data === 'object' && 'status' in data && isTaskStatus(data.status)) {
    return data.status
  }

  if (isTaskStatus(over.id)) {
    return over.id
  }

  return null
}

export function TaskBoard({
  tasks,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(
    useSensor(CardPointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const columns = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    }

    for (const task of tasks) {
      grouped[task.status].push(task)
    }

    return grouped
  }, [tasks])

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current
    if (data && typeof data === 'object' && 'task' in data) {
      setActiveTask(data.task as Task)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const task = activeTask
    const nextStatus = getDropStatus(event.over)
    setActiveTask(null)

    if (!task || !nextStatus || task.status === nextStatus) {
      return
    }

    await onStatusChange(task.id, nextStatus)
  }

  if (!loading && tasks.length === 0) {
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
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={(event) => {
        void handleDragEnd(event)
      }}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {TASK_STATUSES.map((status) => (
          <TaskBoardColumn
            key={status}
            status={status}
            tasks={columns[status]}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="rotate-1 opacity-95 shadow-lg">
            <TaskCard
              task={activeTask}
              hideStatus
              onEdit={() => undefined}
              onDelete={async () => undefined}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

interface TaskBoardColumnProps {
  status: TaskStatus
  tasks: Task[]
  loading: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => Promise<void>
}

function TaskBoardColumn({
  status,
  tasks,
  loading,
  onEdit,
  onDelete,
}: TaskBoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex min-h-96 min-w-[280px] flex-col rounded-xl border border-t-4 bg-muted/40 p-3 lg:min-w-0',
        columnAccent[status],
        isOver && 'border-primary bg-primary/5',
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2 px-1">
        <h2 className="text-sm font-medium">{TASK_STATUS_LABELS[status]}</h2>
        <Badge variant="secondary">{loading ? '—' : tasks.length}</Badge>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {loading
          ? Array.from({ length: 2 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-24" />
                </CardFooter>
              </Card>
            ))
          : tasks.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}

        {!loading && tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed px-3 py-10 text-center text-sm text-muted-foreground">
            Drop a task here
          </div>
        )}
      </div>
    </section>
  )
}

interface DraggableTaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => Promise<void>
}

function DraggableTaskCard({ task, onEdit, onDelete }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'task', task, status: task.status },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'cursor-grab touch-none active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} hideStatus onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}
