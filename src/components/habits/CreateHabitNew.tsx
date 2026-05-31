import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog"
import { Field, useForm, type ReactFormApi } from '@tanstack/react-form'
import { useState } from "react"
import { FieldGroup, FieldLabel } from "../ui/field"
import type { Form } from "radix-ui"

// form data needed
// - habit name
// - (in development) measurement
// - bad habit name
// - estimate on how much the bad habit done
// - how much to be done for consider good?
// - timeline to get to this level.
interface habitForm {
  habitName: string,
  // measurement is a wip
  badHabitName: string,
  initialBadHabit: number,
  goodHabitThreshold: number,
  habitEndDate: string
}

const defaultValues: habitForm = {
  habitName: "",
  badHabitName: "",
  initialBadHabit: 0,
  goodHabitThreshold: 0,
  habitEndDate: ""
}
// all of the detail must be filled (some will autofill based
// on user client data)


export default function CreateHabitNew() {
  const [open, setOpen] = useState(false)

  const form = useForm({
    defaultValues: {

    },
    onSubmit: async ({ value }) => {

    },
    validators: {

    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={``}
        >
          Start a new habit
        </Button>
      </DialogTrigger>
      {/* create a new one */}

      <DialogContent>

      </DialogContent>


    </Dialog>
  )
}


// form for multiple user
function FirstForm({ form }) {
  return (
    <div>
      <h1>First, what habit do you want to nurture?</h1>
      <FieldGroup>
        <form.Field
          name="habitName"
        />
      </FieldGroup>
    </div>
  )
}
