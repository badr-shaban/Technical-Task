export const MAX_TASK_ATTACHMENTS = 10
export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_FILES_PER_UPLOAD = 5

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const
