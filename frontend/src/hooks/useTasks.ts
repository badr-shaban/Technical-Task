import { useCallback, useEffect, useState } from 'react'
import type {
  CreateTaskInput,
  PaginationMeta,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from '@/types/task'
import { TASK_PAGE_SIZE } from '@/types/task'
import { getErrorMessage } from '@/services/api'
import * as taskService from '@/services/taskService'

const emptyPagination: PaginationMeta = {
  page: 1,
  limit: TASK_PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

export function useTasks() {
  const [search, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatusValue] = useState<TaskStatus | 'all'>('all')
  const [priority, setPriorityValue] = useState<TaskPriority | 'all'>('all')
  const [page, setPage] = useState(1)
  const [tasks, setTasks] = useState<Task[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = search.trim()
      if (nextSearch === debouncedSearch) {
        return
      }

      setDebouncedSearch(nextSearch)
      setPage(1)
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [search, debouncedSearch])

  const setSearch = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const setStatus = useCallback((value: TaskStatus | 'all') => {
    setStatusValue(value)
    setPage(1)
  }, [])

  const setPriority = useCallback((value: TaskPriority | 'all') => {
    setPriorityValue(value)
    setPage(1)
  }, [])

  const refresh = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      try {
        const result = await taskService.getTasks({
          search: debouncedSearch,
          status,
          priority,
          page,
          limit: TASK_PAGE_SIZE,
        })
        setTasks(result.tasks)
        setPagination(result.pagination)
      } catch (caught) {
        setError(getErrorMessage(caught))
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, status, priority, page],
  )

  useEffect(() => {
    let cancelled = false

    taskService
      .getTasks({
        search: debouncedSearch,
        status,
        priority,
        page,
        limit: TASK_PAGE_SIZE,
      })
      .then((result) => {
        if (cancelled) {
          return
        }

        if (page > result.pagination.totalPages && result.pagination.total > 0) {
          setPage(result.pagination.totalPages)
          return
        }

        setTasks(result.tasks)
        setPagination(result.pagination)
        setError(null)
        setLoading(false)
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
  }, [debouncedSearch, status, priority, page])

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
    pagination,
    loading,
    error,
    search,
    status,
    priority,
    page,
    setSearch,
    setStatus,
    setPriority,
    setPage,
    refresh,
    createTask,
    updateTask,
    deleteTask,
  }
}
