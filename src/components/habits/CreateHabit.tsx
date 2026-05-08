import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from '@tanstack/react-form'
import { useMutation } from 'convex/react'
import { api } from "../../../convex/_generated/api"
import { useState } from "react"

export default function CreateHabit() {
  const createHabitMutation = useMutation(api.habits.create)
  const [open, setOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      name: '',
      isGood: true,
      amountDone: 0,
      target: 1, // dummy value
      notes: 'Dummy note', // dummy value
      duration: 30, // dummy value
      status: 'active',
      unit: 'times',
    },
    onSubmit: async ({ value }) => {
      await createHabitMutation(value)
      setOpen(false)
      form.reset()
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>Create new habit</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>

          {/* group */}
          <FieldGroup className="flex flex-row items-center gap-2 my-4">
            <span className="whitespace-nowrap">I want to</span> 
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => !value ? 'A name is required' : undefined,
              }}
              children={(field) => (
                <div className="flex-1 flex flex-col gap-1">
                  <Input 
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="do something..."
                    required
                  />
                  {field.state.meta.errors ? (
                    <em role="alert" className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</em>
                  ) : null}
                </div>
              )}
            />
          </FieldGroup>

          {/* footer */}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
            </DialogClose>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}