import { cloudinary } from '../config/cloudinary'
import { AppError } from './AppError'

export interface CloudinaryUploadResult {
  publicId: string
  url: string
  resourceType: string
}

export function uploadBufferToCloudinary(
  file: Express.Multer.File,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'taskflow/tasks',
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(new AppError('Failed to upload file to Cloudinary', 500))
          return
        }

        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          resourceType: result.resource_type,
        })
      },
    )

    stream.end(file.buffer)
  })
}

export async function destroyCloudinaryFile(
  publicId: string,
  resourceType = 'image',
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}
