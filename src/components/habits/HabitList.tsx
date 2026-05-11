import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardTitle } from "../ui/card";
import LogHabitButton from "./JournalLogs";
import HabitDetail from "./HabitDetail";

export default function HabitList() {
  const habits = useQuery(api.habits.get);

  return (
    <div className="mx-20 space-y-4 mt-8">
      {habits?.map((habit) => (
        <Card key={habit._id} className={`border-2 p-4 ${habit.isGood ? 'border-green-800/80' : 'border-red-800/80'}`}>
          <CardTitle className="mb-2">{habit.name}</CardTitle>
          <CardContent className="p-0 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Progress: <span className="font-medium text-foreground">{habit.amountDone}</span> / {habit.target || '∞'} {habit.unit}
            </div>
            <div className="flex gap-2">
              <HabitDetail habit={habit} />
              <LogHabitButton habit={habit} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}