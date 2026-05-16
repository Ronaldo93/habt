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

export default function CreateHabit({ initialIsGood = true }: { initialIsGood?: boolean }) {
  const createHabitMutation = useMutation(api.habits.create)
  const [open, setOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      name: '',
      isGood: initialIsGood,
      initialAmount: 0,
      target: 1, // dummy value
      notes: 'Dummy note', // dummy value
      duration: 30, // dummy value
      status: 'active',
      unit: 'times',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    onSubmit: async ({ value }) => {
      await createHabitMutation(value)
      setOpen(false)
      form.reset()
    },
    validators: {
      onSubmit: ({ value }) => {
        if (Date.parse(value.endDate) <= Date.parse(value.startDate)) {
          return 'End date must be after start date'
        }
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={initialIsGood ? "outline" : "destructive"}>
          {initialIsGood ? "New Good Habit" : "New Bad Habit"}
        </Button>
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
            <DialogTitle>Create new {form.getFieldValue('isGood') ? 'good' : 'bad'} habit</DialogTitle>
            <DialogDescription>
              {form.getFieldValue('isGood')
                ? "Focus on building a positive routine."
                : "Track and reduce a negative behavior."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 my-4">
            {/* Name Field */}
            <FieldGroup className="flex flex-row items-center gap-2">
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
                      placeholder={form.getFieldValue('isGood') ? "read daily..." : "stop smoking..."}
                      required
                    />
                    {field.state.meta.errors ? (
                      <em role="alert" className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</em>
                    ) : null}
                  </div>
                )}
              />
            </FieldGroup>

            {/* Initial Amount Field */}
            <form.Field
              name="initialAmount"
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <label htmlFor="initialAmount" className="text-sm font-medium">
                    Initial amount done {form.getFieldValue('isGood') ? '(usually 0)' : ''}
                  </label>
                  <Input
                    id="initialAmount"
                    type="number"
                    min="0"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    This will be recorded as your progress for today.
                  </p>
                </div>
              )}
            />


            <form.Field
              name="target"
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <label htmlFor="target" className="text-sm font-medium">
                    Target amount to do {form.getFieldValue('isGood') ? '(usually 1)' : ''}
                  </label>
                  <Input
                    id="target"
                    type="number"
                    min="0"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="startDate"
                validators={{
                  onChange: ({ value }) => !value ? 'Required' : undefined,
                }}
                children={(field) => (
                  <div className="flex flex-col gap-1">
                    <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                    />
                    {field.state.meta.errors && (
                      <em role="alert" className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</em>
                    )}
                  </div>
                )}
              />

              <form.Field
                name="endDate"
                validators={{
                  onChange: ({ value }) => !value ? 'Required' : undefined,
                }}
                children={(field) => (
                  <div className="flex flex-col gap-1">
                    <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                    />
                    {field.state.meta.errors && (
                      <em role="alert" className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</em>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting, state.errors]}
              children={([canSubmit, isSubmitting, errors]) => (
                <div className="flex flex-row gap-2 w-full justify-end">
                  {errors && <em role="alert" className="text-red-500 text-xs">{errors}</em>}
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? "Saving..." : "Create Habit"}
                  </Button>
                </div>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}