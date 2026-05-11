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
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
	ComposedChart,
	Bar,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import type { Doc } from "../../../convex/_generated/dataModel";

export default function HabitDetail({ habit }: { habit: Doc<"habits"> }) {
	const [open, setOpen] = useState(false);
	const entries = useQuery(api.habits.getEntries, open ? { habitId: habit._id } : "skip");

	// Format data for Recharts
	const sortedEntries = entries
		? [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		: [];

	const xAmount = habit.target || 1;
	let currentPrediction = 0;

	const chartData = sortedEntries.map((entry, index) => {
		if (index === 0) {
			currentPrediction = entry.amountDone;
		} else {
			currentPrediction += habit.isGood ? xAmount : -xAmount;
		}

		return {
			date: entry.date,
			amount: entry.amountDone,
			predicted: currentPrediction,
		};
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary" size="sm">View Stats</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] bg-slate-200">
				<DialogHeader>
					<DialogTitle>{habit.name} Statistics</DialogTitle>
					<DialogDescription>View detailed activity information about this habit over time.</DialogDescription>
				</DialogHeader>

				<div className="mt-4 h-[300px] w-full">
					{entries === undefined ? (
						<div className="h-full flex items-center justify-center">Loading...</div>
					) : chartData.length === 0 ? (
						<div className="h-full flex items-center justify-cebg-slate-200ed-foreground">No data available for this habit yet.</div>
					) : (
						<ResponsiveContainer width="100%" height="100%">
							<ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
								<XAxis
									dataKey="date"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 12, fill: "black" }}
									tickFormatter={(val) => {
										const date = new Date(val);
										return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
									}}
								/>
								<YAxis
									yAxisId="left"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 12, fill: "black" }}
								/>
								{/* <YAxis
									yAxisId="right"
									orientation="right"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 12, fill: "white" }}
								/> */}
								<Tooltip
									cursor={{ fill: 'rgba(255,255,255,0.1)' }}
									contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
									itemStyle={{ color: 'white' }}
								/>
								<Legend wrapperStyle={{ paddingTop: '20px' }} />
								<Bar
									yAxisId="left"
									name="Daily Amount"
									dataKey="amount"
									fill="#10b981"
									radius={[4, 4, 0, 0]}
								/>
								<Line
									yAxisId="left"
									name="Predicted Trend"
									type="monotone"
									dataKey="predicted"
									stroke="#f59e0b"
									strokeWidth={2}
									strokeDasharray="5 5"
									dot={false}
								/>
							</ComposedChart>
						</ResponsiveContainer>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}