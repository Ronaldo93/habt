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

  // the pace line walks from initialAmount (the day-1 mark) to target across the
  // duration. compute each point directly from its index rather than accumulating a
  // rounded per-day step — accumulation compounds the rounding error over a long
  // duration and drifts past target (e.g. ends at -1 instead of 0). interpolating
  // against (length - 1) anchors the line: exactly paceStart on day 1, exactly
  // target on the last date. direction falls out of the sign of (target - paceStart).
  const paceStart = Number(habit.initialAmount || 0);
  const target = Number(habit.target || 1);
  const effortNeedsDone = target - paceStart;
  // per-day slope, kept for the "Per day" stat tile (signed: < 0 when declining)
  const xAmount = parseFloat((effortNeedsDone / (durationInDays || 1)).toFixed(1));
  const lastIndex = Math.max(allDates.length - 1, 1);
  const chartData = allDates.map((date, index) => {
    const amount = entriesByDate[date] || 0;
    currentPrediction = parseFloat(
      (paceStart + effortNeedsDone * (index / lastIndex)).toFixed(1)
    );
    return {
      date,
      amount,
      predicted: currentPrediction,
    };
  });

  // on track? compare the actual standing against today's pace mark (the predicted
  // line at today's index). good habits should be at/above it; bad habits at/below.
  const totalLoggedSoFar = entries ? entries.reduce((acc, e) => acc + e.amountDone, 0) : 0;
  const standingNow = habit.isGood ? totalLoggedSoFar : paceStart - totalLoggedSoFar;
  const paceNow = todayFromStart >= 0 && chartData[todayFromStart]
    ? chartData[todayFromStart].predicted
    : paceStart;
  const isOnTrack = habit.isGood ? standingNow >= paceNow : standingNow <= paceNow;

  const unit = habit.unit || "";


  // has the tracking window closed? (today is past the set deadline)
  const todayStr = new Date().toISOString().split('T')[0];


  // has the task been archive if the habit is still available and archived
  const isArchive = habit.isArchive && habit.endDate && todayStr < habit.endDate;
  const isConcluded = !!habit.endDate && todayStr > habit.endDate;

  // did they ultimately hit the goal? actual standing vs. target.
  // good: effort climbed from 0 → standing = total logged, must reach target.
  // bad: level came down from initialAmount → standing = initial − logged, must drop to target.
  const totalLogged = entries ? entries.reduce((acc, e) => acc + e.amountDone, 0) : 0;
  const finalValue = habit.isGood ? totalLogged : paceStart - totalLogged;
  const goalAchieved = habit.isGood
    ? finalValue >= Number(habit.target || 0)
    : finalValue <= Number(habit.target || 0);

  // flat Duolingo-style palette + a lighter top stop for gradient bars
  const barColor = habit.isGood ? "#58CC02" : "#FF9600";
  const barColorTop = habit.isGood ? "#7BE63E" : "#FFB13D";

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
    : isArchive ?
      {
        emoji: "📦",
        chip: "#AFAFAF",
        border: "#E5E5E5",
        bg: "#F2F2F2",
        titleColor: "#777777",
        title: "Archived",
        subtitle: "This habit is archived — tracking is paused.",
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
      <DialogContent
        className="max-h-[90vh] overflow-y-auto overflow-x-hidden sm:max-w-[560px] rounded-[28px] border border-white/70 p-6 sm:p-7 text-[#4B4B4B]"
        style={{
          // grain (top layer) blended over the soft gradient (bottom layer)
          backgroundColor: "#ffffff",
          backgroundImage: `url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.9'%20numOctaves='4'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.55'/%3E%3C/svg%3E"), linear-gradient(180deg, #ffffff 0%, #F6FBEF 100%)`,
          backgroundBlendMode: "soft-light, normal",
          boxShadow: `0 1px 0 rgba(255,255,255,0.9) inset, 0 24px 60px -12px ${barColor}40, 0 18px 40px rgba(23,58,64,0.18)`,
        }}
      >
        {/* decorative color glow for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${barColorTop}55, transparent 70%)` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, #1CB0F540, transparent 70%)` }}
        />

        <DialogHeader className="relative space-y-1 duration-500 animate-in fade-in slide-in-from-bottom-2">
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
          className="relative mt-5 flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 duration-500 animate-in fade-in slide-in-from-bottom-2"
          style={{
            borderColor: status.border,
            background: `linear-gradient(135deg, ${status.bg}, #ffffff 85%)`,
            boxShadow: `0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 20px -10px ${status.chip}80`,
            animationDelay: "60ms",
            animationFillMode: "both",
          }}
        >
          {/* soft colored accent strip */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1"
            style={{ backgroundColor: status.chip }}
          />
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl shadow-sm"
            style={{
              background: `linear-gradient(145deg, color-mix(in oklab, ${status.chip} 65%, white), ${status.chip})`,
              boxShadow: `0 4px 10px -2px ${status.chip}80`,
            }}
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
        <div
          className="mt-4 grid grid-cols-3 gap-3 duration-500 animate-in fade-in slide-in-from-bottom-2"
          style={{ animationDelay: "120ms", animationFillMode: "both" }}
        >
          <StatTile label="Today" value={isLoading ? "—" : todayEffort} unit={unit} color="#1CB0F5" shadow="#1899D6" />
          <StatTile label="Goal" value={Number(habit.target || 0)} unit={unit} color="#CE82FF" shadow="#A560E8" />
          <StatTile label="Per day" value={xAmount} unit={`${unit}/d`} color={barColor} shadow={habit.isGood ? "#58A700" : "#E08600"} />
        </div>

        {/* chart */}
        <div
          className="relative mt-4 rounded-2xl border border-[#E5E5E5] bg-gradient-to-b from-white to-[#F4F8EE] p-4 shadow-sm duration-500 animate-in fade-in slide-in-from-bottom-2"
          style={{ animationDelay: "180ms", animationFillMode: "both" }}
        >
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
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={barColorTop} />
                      <stop offset="100%" stopColor={barColor} />
                    </linearGradient>
                  </defs>
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
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} opacity={index === todayFromStart ? 1 : 0.5} />
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
      className="rounded-2xl px-3 py-3 text-center transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        border: `2px solid ${color}`,
        borderBottomWidth: 4,
        borderBottomColor: shadow,
        background: `linear-gradient(160deg, #ffffff, color-mix(in oklab, ${color} 12%, white))`,
        boxShadow: `0 1px 0 rgba(255,255,255,0.8) inset, 0 6px 14px -8px ${shadow}99`,
      }}
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
