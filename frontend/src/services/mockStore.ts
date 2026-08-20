import type { AuthResponse, RegisterPayload, User } from '@/types/auth'
import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '@/types/task'
import { ApiError } from '@/services/api'

const USERS_KEY = 'taskflow.users'
const TASKS_KEY = 'taskflow.tasks'

const DEMO_USER_ID = 'user-demo'

interface StoredUser extends User {
  password: string
}

interface TokenPayload {
  sub: string
  email: string
  name: string
}

function encodePayload(payload: TokenPayload): string {
  return btoa(encodeURIComponent(JSON.stringify(payload)))
}

function decodePayload(encoded: string): TokenPayload {
  return JSON.parse(decodeURIComponent(atob(encoded))) as TokenPayload
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function seedIfNeeded(): void {
  const users = readJson<StoredUser[]>(USERS_KEY, [])
  const tasks = readJson<Task[]>(TASKS_KEY, [])

  if (users.length === 0) {
    writeJson(USERS_KEY, [
      {
        id: DEMO_USER_ID,
        name: 'Alex Morgan',
        email: 'demo@taskflow.app',
        password: 'password123',
      },
    ])
  }

  if (tasks.length === 0) {
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    writeJson(TASKS_KEY, [
      {
        id: 'task-1',
        title: 'Draft project brief',
        description:
          'Outline goals, success metrics, and the first sprint for the assessment.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(now + day).toISOString(),
        userId: DEMO_USER_ID,
      },
      {
        id: 'task-2',
        title: 'Design dashboard layout',
        description:
          'Sketch a responsive header, toolbar, and task card grid for desktop and mobile.',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(now + 2 * day).toISOString(),
        userId: DEMO_USER_ID,
      },
      {
        id: 'task-3',
        title: 'Wire mock API services',
        description:
          'Simulate auth and task CRUD with loading delays so the UI can be demoed immediately.',
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - day).toISOString(),
        userId: DEMO_USER_ID,
      },
      {
        id: 'task-4',
        title: 'Polish empty and error states',
        description:
          'Add skeletons, empty copy, and toast feedback for create, update, and delete.',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now + 4 * day).toISOString(),
        userId: DEMO_USER_ID,
      },
      {
        id: 'task-5',
        title: 'Prepare interview walkthrough',
        description:
          'Capture the main user flows: register, login, filter tasks, and edit a due date.',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(now + 3 * day).toISOString(),
        userId: DEMO_USER_ID,
      },
    ] satisfies Task[])
  }
}

function getUsers(): StoredUser[] {
  seedIfNeeded()
  return readJson<StoredUser[]>(USERS_KEY, [])
}

function getTasks(): Task[] {
  seedIfNeeded()
  return readJson<Task[]>(TASKS_KEY, [])
}

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

function createToken(user: StoredUser): string {
  return `header.${encodePayload({
    sub: user.id,
    email: user.email,
    name: user.name,
  })}.signature`
}

export function parseToken(token: string): TokenPayload {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new ApiError('Unauthorized', 401)
  }

  try {
    return decodePayload(parts[1])
  } catch {
    throw new ApiError('Unauthorized', 401)
  }
}

export function requireUser(token: string | null): User {
  if (!token) {
    throw new ApiError('Unauthorized', 401)
  }

  const payload = parseToken(token)
  const user = getUsers().find((item) => item.id === payload.sub)

  if (!user) {
    throw new ApiError('Unauthorized', 401)
  }

  return toPublicUser(user)
}

export function loginUser(email: string, password: string): AuthResponse {
  const user = getUsers().find(
    (item) => item.email.toLowerCase() === email.toLowerCase(),
  )

  if (!user || user.password !== password) {
    throw new ApiError('Invalid email or password', 401)
  }

  return {
    token: createToken(user),
    user: toPublicUser(user),
  }
}

export function registerUser(payload: RegisterPayload): AuthResponse {
  const users = getUsers()
  const email = payload.email.trim().toLowerCase()

  if (users.some((item) => item.email.toLowerCase() === email)) {
    throw new ApiError('An account with this email already exists', 409)
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    email,
    password: payload.password,
  }

  writeJson(USERS_KEY, [...users, user])

  return {
    token: createToken(user),
    user: toPublicUser(user),
  }
}

export function listTasks(userId: string, filters: TaskFilters = {}): Task[] {
  const search = filters.search?.trim().toLowerCase() ?? ''
  const status = filters.status && filters.status !== 'all' ? filters.status : undefined
  const priority =
    filters.priority && filters.priority !== 'all' ? filters.priority : undefined

  return getTasks()
    .filter((task) => task.userId === userId)
    .filter((task) => (search ? task.title.toLowerCase().includes(search) : true))
    .filter((task) => (status ? task.status === status : true))
    .filter((task) => (priority ? task.priority === priority : true))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export function createTaskRecord(userId: string, input: CreateTaskInput): Task {
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate,
    userId,
  }

  writeJson(TASKS_KEY, [...getTasks(), task])
  return task
}

export function updateTaskRecord(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
): Task {
  const tasks = getTasks()
  const index = tasks.findIndex((task) => task.id === taskId && task.userId === userId)

  if (index === -1) {
    throw new ApiError('Task not found', 404)
  }

  const current = tasks[index]
  const updated: Task = {
    ...current,
    ...input,
    title: input.title?.trim() ?? current.title,
    description: input.description?.trim() ?? current.description,
  }

  const next = [...tasks]
  next[index] = updated
  writeJson(TASKS_KEY, next)
  return updated
}

export function deleteTaskRecord(userId: string, taskId: string): void {
  const tasks = getTasks()
  const exists = tasks.some((task) => task.id === taskId && task.userId === userId)

  if (!exists) {
    throw new ApiError('Task not found', 404)
  }

  writeJson(
    TASKS_KEY,
    tasks.filter((task) => !(task.id === taskId && task.userId === userId)),
  )
}
