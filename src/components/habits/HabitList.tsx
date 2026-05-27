import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import LogHabitButton from "./JournalLogs";
import HabitDetail from "./HabitDetail";
import { Loader2 } from "lucide-react";
import { stringToDate } from "#/utils/date";
import { differenceInDays } from "date-fns";


interface HabitListProps {
  habits?: any[];
  isLoading?: boolean;
}

export default function HabitList({ habits: propHabits, isLoading }: HabitListProps = {}) {
  const queryHabits = useQuery(api.habits.get);
  const habits = propHabits !== undefined ? propHabits : queryHabits;

  if (isLoading || habits === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-slate-300" />
      </div>
    );
  }

  if (habits !== null && habits.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="text-4xl mb-3">🥚</div>
        <p className="font-medium">No habits here yet.</p>
      </div>
    );
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  return (
    <div className="grid grid-cols-1 gap-4">
      {habits?.map((habit) => {
        // calculate day
        const today = new Date();
        const startDate = stringToDate(habit.startDate);
        const endDate = stringToDate(habit.endDate);


        // TODO: implement the default server-side data filling if user don't specify end period

        // total span of the habit in days (inclusive). Fall back to a single day
        // when there's no end date or start/end land on the same day, so the
        // per-day rate never divides by 0.
        const period = startDate && endDate
          ? Math.max(differenceInDays(endDate, startDate) + 1, 1)
          : 1;

        // days elapsed since the start (inclusive of today), clamped to the span
        // so we don't over-count past the end or go negative before the start.
        const daysElapsed = startDate
          ? Math.min(Math.max(differenceInDays(today, startDate) + 1, 0), period)
          : 1;

        // cumulative amount that should be done by today, not across the whole period
        const perDayRate = habit.target / period;
        const todayTarget = Math.round(perDayRate * daysElapsed);

        // progress toward what should be done by today
        const progress = todayTarget > 0
          ? Math.min(100, Math.round((habit.amountDone / todayTarget) * 100))
          : 0;
        const isCompleted = progress >= 100;
        const isEnded = habit.endDate && habit.endDate < todayStr;

        // bar color: muted when ended, green when done, else blue (good) / rose (bad)
        const barColor = isEnded ? 'bg-slate-300' : isCompleted ? 'bg-green-500' : habit.isGood ? 'bg-blue-400' : 'bg-rose-400';

        return (
          <div
            key={habit._id}
            className={`flex items-center gap-4 bg-white border rounded-2xl p-4 transition-colors ${isEnded ? 'border-slate-200 opacity-60' : isCompleted ? 'border-green-300' : 'border-slate-200 hover:border-slate-300'}`}
          >
            {/* status icon */}
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0">
              {isEnded ? '⏱️' : isCompleted ? '✅' : habit.isGood ? '🌱' : '🔥'}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              {/* name + today's amount */}
              <div className="flex justify-between items-baseline gap-2">
                <h3 className={`font-semibold truncate ${isEnded ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {habit.name}
                </h3>
                <span className="text-xs text-slate-400 shrink-0">
                  {habit.amountDone} / {todayTarget || '∞'} {habit.unit}
                </span>
              </div>

              {/* progress toward today's target */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <HabitDetail habit={habit} />
              {!isEnded && <LogHabitButton habit={habit} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
