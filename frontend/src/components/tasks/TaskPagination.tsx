import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { PaginationMeta } from '@/types/task'
import { Button } from '@/components/ui/button'

interface TaskPaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
}

export function TaskPagination({ pagination, onPageChange }: TaskPaginationProps) {
  const { page, limit, total, totalPages } = pagination

  if (total === 0) {
    return null
  }

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
          Previous
        </Button>
        <span className="min-w-24 text-center text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
