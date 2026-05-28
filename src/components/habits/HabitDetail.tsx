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
  Cell,
} from "recharts";
import type { Doc } from "../../../convex/_generated/dataModel";

export default function HabitDetail({ habit }: { habit: Doc<"habits"> }) {
  const [open, setOpen] = useState(false);
  const entries = useQuery(api.habits.getEntries, open ? { habitId: habit._id } : "skip");
  const todayEntries = useQuery(api.habits.getTodayEntries, open ? { habitId: habit._id } : "skip");



  // aggregate for current day
  const todayEffort = todayEntries ? todayEntries.reduce((acc, entry) => acc + entry.amountDone, 0) : 0;


  // some metadata
  // const habitMetadata = useQuery(api.habits.getOneByHabitId, open ? { id: habit._id } : "skip");



  const getDatesInRange = (startDate: string, endDate: string) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate).toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const startDate = habit.startDate || (entries && entries.length > 0
    ? entries.reduce((min, e) => e.date < min ? e.date : min, entries[0].date)
    : new Date().toISOString().split('T')[0]);

  const endDate = habit.endDate || (entries && entries.length > 0
    ? entries.reduce((max, e) => e.date > max ? e.date : max, entries[0].date)
    : new Date().toISOString().split('T')[0]);

  const allDates = getDatesInRange(startDate, endDate);

  // get today's index in the allDates array
  const todayFromStart = allDates.indexOf(new Date().toISOString().split('T')[0]);

  const entriesByDate = entries ? entries.reduce((acc, entry) => {
    acc[entry.date] = entry.amountDone;
    return acc;
  }, {} as Record<string, number>) : {};

  // const xAmount = habit.target || 1;
  let currentPrediction = 0;

  // get the number of days between start and end (rounded to 1 digit)
  let durationInDays = 1;
  // condition since there is also duration in the old schema
  if (habit.duration != undefined && habit.startDate !== undefined && habit.endDate !== undefined) {
    durationInDays = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
  } else {
    durationInDays = habit.duration;
  }

  const effortNeedsDone = Number(habit.target || 1) - Number(habit.initialAmount || 0);
  const xAmount = parseFloat((Number(effortNeedsDone) / (durationInDays || 1)).toFixed(1));
  const chartData = allDates.map((date, index) => {
    const amount = entriesByDate[date] || 0;
    if (index === 0) {
      currentPrediction = habit.initialAmount || 0;
    } else {
      currentPrediction += habit.isGood == true ? xAmount : -xAmount;
    }
    currentPrediction = parseFloat(currentPrediction.toFixed(1));

    return {
      date,
      amount,
      predicted: currentPrediction,
    };
  });

  // are you on track or not
  let isOnTrack = false;
  if (todayEffort) {
    if (todayEffort >= xAmount * todayFromStart) {
      isOnTrack = true;
    }
  }

  const unit = habit.unit || "";

  // has the tracking window closed? (today is past the set deadline)
  const todayStr = new Date().toISOString().split('T')[0];
  const isConcluded = !!habit.endDate && todayStr > habit.endDate;

  // did they ultimately hit the goal? cumulative actual vs. target
  const totalLogged = entries ? entries.reduce((acc, e) => acc + e.amountDone, 0) : 0;
  const finalValue = habit.isGood
    ? Number(habit.initialAmount || 0) + totalLogged
    : Number(habit.initialAmount || 0) - totalLogged;
  const goalAchieved = habit.isGood
    ? finalValue >= Number(habit.target || 0)
    : finalValue <= Number(habit.target || 0);

  // flat Duolingo-style palette
  const barColor = habit.isGood ? "#58CC02" : "#FF9600";

  // queries resolve asynchronously — until both are in, any status would be a guess
  const isLoading = entries === undefined || todayEntries === undefined;

  // pick the banner state: loading > concluded > on track > off pace
  const status = isLoading
    ? {
        emoji: "⏳",
        chip: "#E5E5E5",
        border: "#E5E5E5",
        bg: "#F7F7F7",
        titleColor: "#AFAFAF",
        title: "Crunching the numbers…",
        subtitle: "Hang tight while we load your progress.",
      }
    : isConcluded
    ? goalAchieved
      ? {
          emoji: "🏆",
          chip: "#58CC02",
          border: "#D7FFB8",
          bg: "#F0FFE0",
          titleColor: "#58A700",
          title: "Goal complete!",
          subtitle: "Tracking ended — you reached your target. Nice work!",
        }
      : {
          emoji: "🏁",
          chip: "#AFAFAF",
          border: "#E5E5E5",
          bg: "#F7F7F7",
          titleColor: "#777777",
          title: "Tracking ended",
          subtitle: "This habit's window has closed.",
        }
    : isOnTrack
      ? {
          emoji: "💪",
          chip: "#58CC02",
          border: "#D7FFB8",
          bg: "#F0FFE0",
          titleColor: "#58A700",
          title: "You're on track!",
          subtitle: "Keep it up — you're ahead of the curve.",
        }
      : {
          emoji: "👀",
          chip: "#FF4B4B",
          border: "#FFD6D6",
          bg: "#FFF1F1",
          titleColor: "#EA2B2B",
          title: "Off the pace",
          subtitle: "A little more today closes the gap.",
        };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">View Stats</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] rounded-3xl border-2 border-[#E5E5E5] bg-white p-6 sm:p-7 text-[#4B4B4B]">
        <DialogHeader className="space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wide text-[#AFAFAF]">
            {habit.isGood ? "Good habit" : "Bad habit"} · Stats
          </span>
          <DialogTitle className="text-2xl font-extrabold text-[#3C3C3C]">
            {habit.name}
          </DialogTitle>
          <DialogDescription className="text-[#777777]">
            Your daily effort vs. the pace you need.
          </DialogDescription>
        </DialogHeader>

        {/* status banner */}
        <div
          className="mt-5 flex items-center gap-3 rounded-2xl border-2 px-4 py-3"
          style={{ borderColor: status.border, backgroundColor: status.bg }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl"
            style={{ backgroundColor: status.chip }}
          >
            {status.emoji}
          </span>
          <div className="leading-tight">
            <p className="text-base font-extrabold" style={{ color: status.titleColor }}>
              {status.title}
            </p>
            <p className="text-sm text-[#777777]">{status.subtitle}</p>
          </div>
        </div>

        {/* stat tiles */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatTile label="Today" value={isLoading ? "—" : todayEffort} unit={unit} color="#1CB0F5" shadow="#1899D6" />
          <StatTile label="Goal" value={Number(habit.target || 0)} unit={unit} color="#CE82FF" shadow="#A560E8" />
          <StatTile label="Per day" value={xAmount} unit={`${unit}/d`} color={barColor} shadow={habit.isGood ? "#58A700" : "#E08600"} />
        </div>

        {/* chart */}
        <div className="mt-4 rounded-2xl border-2 border-[#E5E5E5] bg-[#F7F7F7] p-4">
          <div className="mb-3 flex items-center gap-4 text-xs font-bold text-[#777777]">
            <LegendDot color={barColor} label="Daily amount" />
            <LegendDot color="#AFAFAF" label="Target pace" dashed />
          </div>
          <div className="h-[260px] w-full">
            {entries === undefined ? (
              <div className="flex h-full items-center justify-center text-sm font-bold text-[#AFAFAF]">
                Loading your progress…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E5E5E5" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#AFAFAF" }}
                    tickFormatter={(val) => {
                      const date = new Date(val);
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis
                    domain={[0, (dataMax: number) => Math.max(dataMax, Number(habit.target) || 0)]}
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#AFAFAF" }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '2px solid #E5E5E5',
                      color: '#3C3C3C',
                      boxShadow: '0 4px 0 #E5E5E5',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                    labelStyle={{ color: '#AFAFAF', fontWeight: 800, marginBottom: 2 }}
                    labelFormatter={(val) =>
                      new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    }
                  />
                  <Bar
                    yAxisId="left"
                    name="Daily amount"
                    dataKey="amount"
                    fill={barColor}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} opacity={index === todayFromStart ? 1 : 0.55} />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="left"
                    name="Target pace"
                    type="monotone"
                    dataKey="predicted"
                    stroke="#AFAFAF"
                    strokeWidth={3}
                    strokeDasharray="6 6"
                    dot={false}
                    activeDot={{ r: 5, fill: "#AFAFAF" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatTile({
  label,
  value,
  unit,
  color,
  shadow,
}: {
  label: string;
  value: number | string;
  unit: string;
  color: string;
  shadow: string;
}) {
  return (
    <div
      className="rounded-2xl bg-white px-3 py-3 text-center"
      style={{ border: `2px solid ${color}`, borderBottomWidth: 4, borderBottomColor: shadow }}
    >
      <p className="text-[0.65rem] font-extrabold uppercase tracking-wide text-[#AFAFAF]">{label}</p>
      <p className="mt-1 flex items-baseline justify-center gap-0.5">
        <span className="text-2xl font-extrabold tabular-nums" style={{ color }}>{value}</span>
      </p>
      {unit && <p className="text-[0.65rem] font-bold text-[#AFAFAF]">{unit}</p>}
    </div>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      {dashed ? (
        <span
          className="h-1 w-4 rounded-full"
          style={{ backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 5px, transparent 5px 9px)` }}
        />
      ) : (
        <span className="h-3 w-3 rounded-md" style={{ backgroundColor: color }} />
      )}
      {label}
    </span>
  );
}
