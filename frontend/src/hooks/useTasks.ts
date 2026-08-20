import { useCallback, useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateTaskInput,
  PaginatedTasks,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from '@/types/task'
import { TASK_PAGE_SIZE } from '@/types/task'
import { getErrorMessage } from '@/services/api'
import * as taskService from '@/services/taskService'
import { taskKeys } from '@/lib/queryKeys'

interface UseTasksOptions {
  pageSize?: number
}

export function useTasks({ pageSize = TASK_PAGE_SIZE }: UseTasksOptions = {}) {
  const queryClient = useQueryClient()
  const [search, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatusValue] = useState<TaskStatus | 'all'>('all')
  const [priority, setPriorityValue] = useState<TaskPriority | 'all'>('all')
  const [page, setPage] = useState(1)

  const filters = {
    search: debouncedSearch,
    status,
    priority,
    page,
    limit: pageSize,
  }

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

  const tasksQuery = useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskService.getTasks(filters),
    placeholderData: keepPreviousData,
  })

  const pagination = tasksQuery.data?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
  }
  if (tasksQuery.isSuccess && page > pagination.totalPages) {
    setPage(Math.max(1, pagination.totalPages))
  }

  const invalidateTasks = useCallback(
    () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
    [queryClient],
  )

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.createTask(input),
    onSuccess: () => invalidateTasks(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      taskService.updateTask(taskId, input),
    onSuccess: () => invalidateTasks(),
  })

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => invalidateTasks(),
  })

  const moveStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      taskService.updateTask(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      const previous = queryClient.getQueriesData<PaginatedTasks>({
        queryKey: taskKeys.lists(),
      })

      queryClient.setQueriesData<PaginatedTasks>(
        { queryKey: taskKeys.lists() },
        (current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            tasks: current.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task,
            ),
          }
        },
      )

      return { previous }
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: () => {
      void invalidateTasks()
    },
  })

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) {
      await queryClient.resetQueries({ queryKey: taskKeys.all })
      return
    }

    await queryClient.invalidateQueries({ queryKey: taskKeys.all })
  }, [queryClient])

  const createTask = useCallback(
    (input: CreateTaskInput) => createMutation.mutateAsync(input),
    [createMutation],
  )

  const updateTask = useCallback(
    (taskId: string, input: UpdateTaskInput) =>
      updateMutation.mutateAsync({ taskId, input }),
    [updateMutation],
  )

  const deleteTask = useCallback(
    (taskId: string) => deleteMutation.mutateAsync(taskId),
    [deleteMutation],
  )

  const moveTaskStatus = useCallback(
    (taskId: string, nextStatus: TaskStatus) =>
      moveStatusMutation.mutateAsync({ taskId, status: nextStatus }),
    [moveStatusMutation],
  )

  return {
    tasks: tasksQuery.data?.tasks ?? [],
    pagination,
    loading: tasksQuery.isLoading,
    error: tasksQuery.error ? getErrorMessage(tasksQuery.error) : null,
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
    moveTaskStatus,
  }
}
