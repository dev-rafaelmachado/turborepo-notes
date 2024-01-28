import { RouterOutput, trpc } from '../utils/trpc'

import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { useState } from 'react'

const formSchema = z.object({
  text: z.string().min(3).max(255),
})

type FormSchema = z.infer<typeof formSchema>

export const AppBody = () => {
  const utils = trpc.useUtils()
  const [open, setOpen] = useState<boolean>(false)

  const getNotes = trpc.getNotes.useQuery(undefined, {
    staleTime: 1000 * 60 * 60,
  })

  const createNoteMutation = trpc.createNote.useMutation({
    onSuccess(data, variables) {
      console.log('onSuccess', variables)
      utils.getNotes.setData(
        undefined,
        (oldQueryData: RouterOutput['getNotes'] | undefined) =>
          [
            ...(oldQueryData ?? []),
            {
              id: data.id,
              text: variables.text,
            },
          ] as RouterOutput['getNotes'],
      )
    },
  })
  const deleteNoteMutation = trpc.deleteNote.useMutation({
    onSuccess(_, variables) {
      console.log('onSuccess', variables)
      utils.getNotes.setData(
        undefined,
        (oldQueryData: RouterOutput['getNotes'] | undefined) =>
          (oldQueryData ?? []).filter((note) => note.id !== variables.id),
      )
    },
  })

  const methods = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  })
  const { handleSubmit, control } = methods

  const createNote = (data: FormSchema) => {
    createNoteMutation.mutate({
      text: data.text,
    })
    setOpen(!open)
  }

  const deleteNote = (id: number) => {
    deleteNoteMutation.mutate({
      id,
    })
  }

  console.log('getNotes', getNotes.data)

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-900 flex-col gap-4">
      <Dialog open={open}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(!open)} variant="outline">
            New Note
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new note</DialogTitle>
            <DialogDescription>Here you can add a new note</DialogDescription>
          </DialogHeader>

          <Form {...methods}>
            <form onSubmit={handleSubmit(createNote)} className="space-y-8">
              <FormField
                control={control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Text" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the text of the note
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <div className="flex gap-4 w-full flex-wrap items-center justify-center">
        {getNotes?.data?.map((note) => (
          <button
            key={note.id}
            onClick={() => deleteNote(note.id)}
            className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {note.text}
            </h5>
          </button>
        ))}
      </div>

      <button className="absolute top-2 right-2">Zerar</button>
    </div>
  )
}
