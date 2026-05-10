import { useState } from "react";
import { useMutation } from "convex/react";
import { useForm } from "@tanstack/react-form";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export default function LogHabitButton({ habit }: { habit: any }) {
  const [open, setOpen] = useState(false);
  const logActivity = useMutation(api.habits.logActivity);

  const form = useForm({
    defaultValues: {
      amount: 0,
    },
    onSubmit: async ({ value }) => {
      await logActivity({
        habitId: habit._id,
        amount: value.amount,
      });
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Log Activity</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Habit: {habit.name}</DialogTitle>
          <DialogDescription>
            Enter the amount you've done. It will be added to your current progress ({habit.amountDone} {habit.unit}).
          </DialogDescription>
        </DialogHeader>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 py-4"
        >
          <form.Field
            name="amount"
            validators={{
              onChange: ({ value }) => (value <= 0 ? "Amount must be positive" : undefined),
            }}
            children={(field) => (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field.name} className="text-right">
                  Amount
                </Label>
                <div className="col-span-3">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="w-full"
                  />
                  {field.state.meta.errors ? (
                    <em className="text-sm text-red-500 mt-1 block" role="alert">
                      {field.state.meta.errors.join(", ")}
                    </em>
                  ) : null}
                </div>
              </div>
            )}
          />
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}