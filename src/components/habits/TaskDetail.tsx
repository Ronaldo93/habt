
import { useState } from "react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

export default function TaskDetail() {
	const [open, setOpen] = useState(false);
	// const updateHabit = useMutation(api.habits.update);

	// const form = useForm({
	// 	defaultValues: {
	// 		amount: 0,
	// 	},
	// 	onSubmit: async ({ value }) => {
	// 		await updateHabit({
	// 			id: habit._id,
	// 			amountDone: habit.amountDone + value.amount,
	// 		});
	// 		setOpen(false);
	// 		form.reset();
	// 	},
	// });
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Log Activity</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Statistics</DialogTitle>
					<DialogDescription>View detailed information about this habit.</DialogDescription>
				</DialogHeader>


			</DialogContent>
		</Dialog>

	);
}