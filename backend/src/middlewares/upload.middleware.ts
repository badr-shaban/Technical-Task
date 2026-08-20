import multer from 'multer'
import { AppError } from '../utils/AppError'
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_FILES_PER_UPLOAD,
} from '../utils/attachment.constants'

const storage = multer.memoryStorage()

export const taskAttachmentUpload = multer({
  storage,
  limits: {
    fileSize: MAX_ATTACHMENT_SIZE_BYTES,
    files: MAX_FILES_PER_UPLOAD,
  },
  fileFilter(_req, file, callback) {
    if (
      !ALLOWED_ATTACHMENT_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number],
      )
    ) {
      callback(new AppError('File type is not allowed', 400))
      return
    }

    callback(null, true)
  },
}).array('files', MAX_FILES_PER_UPLOAD)
