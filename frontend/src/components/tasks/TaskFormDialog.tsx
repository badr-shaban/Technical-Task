import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, FileIcon, Loader2Icon, PaperclipIcon, XIcon } from 'lucide-react';
import type { CreateTaskInput, Task } from '@/types/task';
import {
  ALLOWED_ATTACHMENT_ACCEPT,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_TASK_ATTACHMENTS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '@/types/task';
import { formatDate, fromDateOnly, startOfTomorrow, toDateOnlyIso } from '@/utils/date';
import { formatFileSize, isImageMimeType } from '@/utils/file';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().trim().min(1, 'Description is required').max(255, 'Description is too long'),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.date('Due date is required'),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormDialogProps {
  open: boolean;
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
}

function getDefaultValues(task: Task | null): TaskFormValues {
  if (task) {
    return {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: fromDateOnly(task.dueDate),
    };
  }

  return {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: startOfTomorrow(),
  };
}

export function TaskFormDialog({ open, task, onOpenChange, onSubmit }: TaskFormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90svh] overflow-y-auto sm:max-w-lg'>
        {open && (
          <TaskFormFields
            key={task?.id ?? 'new-task'}
            task={task}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TaskFormFields({
  task,
  onOpenChange,
  onSubmit,
}: Omit<TaskFormDialogProps, 'open'>) {
  const isEditing = Boolean(task);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: getDefaultValues(task),
  });

  const visibleAttachments = (task?.attachments ?? []).filter(
    (attachment) => !removedAttachmentIds.includes(attachment.id),
  );

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const incoming = Array.from(fileList);
    const oversized = incoming.find((file) => file.size > MAX_ATTACHMENT_SIZE_BYTES);
    if (oversized) {
      setFileError(`"${oversized.name}" is larger than 5MB`);
      return;
    }

    const nextCount = visibleAttachments.length + pendingFiles.length + incoming.length;
    if (nextCount > MAX_TASK_ATTACHMENTS) {
      setFileError(`A task can have at most ${MAX_TASK_ATTACHMENTS} attachments`);
      return;
    }

    setFileError(null);
    setPendingFiles((current) => [...current, ...incoming]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function submit(values: TaskFormValues) {
    await onSubmit({
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      dueDate: toDateOnlyIso(values.dueDate),
      files: pendingFiles,
      removedAttachmentIds,
    });
    onOpenChange(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit task' : 'Add new task'}</DialogTitle>
        <DialogDescription>{isEditing ? 'Update the details for this task.' : 'Fill in the details to create a task.'}</DialogDescription>
      </DialogHeader>

        <form
          onSubmit={handleSubmit(submit)}
          className='space-y-4'
          noValidate>
          <FieldGroup className='gap-4'>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor='title'>Title</FieldLabel>
              <Input
                id='title'
                placeholder='What needs to be done?'
                aria-invalid={!!errors.title}
                {...register('title')}
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor='description'>Description</FieldLabel>
              <Textarea
                id='description'
                placeholder='Add a short description'
                aria-invalid={!!errors.description}
                {...register('description')}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Field data-invalid={!!errors.status}>
                <FieldLabel>Status</FieldLabel>
                <Controller
                  control={control}
                  name='status'
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}>
                      <SelectTrigger
                        className='w-full'
                        aria-invalid={!!errors.status}>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_STATUSES.map((item) => (
                          <SelectItem
                            key={item}
                            value={item}>
                            {TASK_STATUS_LABELS[item]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.status]} />
              </Field>

              <Field data-invalid={!!errors.priority}>
                <FieldLabel>Priority</FieldLabel>
                <Controller
                  control={control}
                  name='priority'
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}>
                      <SelectTrigger
                        className='w-full'
                        aria-invalid={!!errors.priority}>
                        <SelectValue placeholder='Select priority' />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_PRIORITIES.map((item) => (
                          <SelectItem
                            key={item}
                            value={item}>
                            {TASK_PRIORITY_LABELS[item]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.priority]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.dueDate}>
              <FieldLabel>Due date</FieldLabel>
              <Controller
                control={control}
                name='dueDate'
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type='button'
                        variant='outline'
                        className='w-full justify-start font-normal'
                        aria-invalid={!!errors.dueDate}>
                        <CalendarIcon />
                        {field.value ? formatDate(field.value) : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto p-0'
                      align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError errors={[errors.dueDate]} />
            </Field>

            <Field data-invalid={!!fileError}>
              <FieldLabel>Attachments</FieldLabel>
              <Input
                ref={fileInputRef}
                type='file'
                multiple
                accept={ALLOWED_ATTACHMENT_ACCEPT}
                className='cursor-pointer'
                onChange={(event) => handleFilesSelected(event.target.files)}
              />
              <p className='text-xs text-muted-foreground'>
                Up to {MAX_TASK_ATTACHMENTS} files, 5MB each. Images, PDF, and documents.
              </p>
              {fileError && <FieldError>{fileError}</FieldError>}

              {(visibleAttachments.length > 0 || pendingFiles.length > 0) && (
                <ul className='space-y-2'>
                  {visibleAttachments.map((attachment) => (
                    <li
                      key={attachment.id}
                      className='flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm'>
                      {isImageMimeType(attachment.mimeType) ? (
                        <img
                          src={attachment.url}
                          alt={attachment.originalName}
                          className='size-8 rounded object-cover'
                        />
                      ) : (
                        <FileIcon className='size-4 shrink-0 text-muted-foreground' />
                      )}
                      <a
                        href={attachment.url}
                        target='_blank'
                        rel='noreferrer'
                        className='min-w-0 flex-1 truncate hover:underline'>
                        {attachment.originalName}
                      </a>
                      <span className='text-xs text-muted-foreground'>
                        {formatFileSize(attachment.size)}
                      </span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-xs'
                        aria-label={`Remove ${attachment.originalName}`}
                        onClick={() =>
                          setRemovedAttachmentIds((current) => [...current, attachment.id])
                        }>
                        <XIcon />
                      </Button>
                    </li>
                  ))}
                  {pendingFiles.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}-${index}`}
                      className='flex items-center gap-2 rounded-lg border border-dashed px-2 py-1.5 text-sm'>
                      <PaperclipIcon className='size-4 shrink-0 text-muted-foreground' />
                      <span className='min-w-0 flex-1 truncate'>{file.name}</span>
                      <span className='text-xs text-muted-foreground'>
                        {formatFileSize(file.size)}
                      </span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-xs'
                        aria-label={`Remove ${file.name}`}
                        onClick={() =>
                          setPendingFiles((current) =>
                            current.filter((_, fileIndex) => fileIndex !== index),
                          )
                        }>
                        <XIcon />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className='px-0 mr-1'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className='animate-spin' />}
              {isEditing ? 'Save changes' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
    </>
  );
}
