import { useCallback, useEffect, useState } from 'react'
import type {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from '@/types/task'
import { getErrorMessage } from '@/services/api'
import * as taskService from '@/services/taskService'

export function useTasks() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | 'all'>('all')
  const [priority, setPriority] = useState<TaskPriority | 'all'>('all')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [search])

  const refresh = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      try {
        const data = await taskService.getTasks({
          search: debouncedSearch,
          status,
          priority,
        })
        setTasks(data)
      } catch (caught) {
        setError(getErrorMessage(caught))
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, status, priority],
  )

  useEffect(() => {
    let cancelled = false

    taskService
      .getTasks({
        search: debouncedSearch,
        status,
        priority,
      })
      .then((data) => {
        if (!cancelled) {
          setTasks(data)
          setError(null)
          setLoading(false)
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(getErrorMessage(caught))
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, status, priority])

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      const task = await taskService.createTask(input)
      await refresh()
      return task
    },
    [refresh],
  )

  const updateTask = useCallback(
    async (taskId: string, input: UpdateTaskInput) => {
      const task = await taskService.updateTask(taskId, input)
      await refresh()
      return task
    },
    [refresh],
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      await taskService.deleteTask(taskId)
      await refresh()
    },
    [refresh],
  )

  return {
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
  }
}
