import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import HabitList from "#/components/habits/HabitList";
import CreateHabit from "#/components/habits/CreateHabit";

export const Route = createFileRoute("/habits")({
  component: RouteComponent,
});

function RouteComponent() {
  const habits = useQuery(api.habits.get);
  const loading = habits === undefined;

  // today as yyyy-mm-dd (local time) — used to split active vs. ended habits
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // a habit is "ended" once its end date is in the past; everything else is active
  const active = habits?.filter(
    (h) => h.isArchive === false || !h.endDate && !h.isArchive || h.endDate >= todayStr && !h.isArchive,
  );
  const ended = habits?.filter(
    (h) => h.isArchive || (h.endDate && h.endDate < todayStr),
  );

  // daily summary: how many active habits have reached their goal. cumulativeAmount
  // is the actual standing — good habits climb up to target, bad habits come down.
  const total = active?.length ?? 0;
  const done =
    active?.filter((h) =>
      h.isGood
        ? h.cumulativeAmount >= (h.target ?? 0)
        : h.cumulativeAmount <= (h.target ?? 0),
    ).length ?? 0;

  return (
    <div className="page-wrap max-w-2xl mx-auto py-12 px-4 font-sans">
      {/* header: greeting, create buttons, and a slim daily progress bar */}
      <header className="mb-10 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Today</h1>
            <p className="text-slate-500">
              {done} of {total} habits done
            </p>
          </div>
          <div className="flex gap-2">
            <CreateHabit initialIsGood={true} />
            <CreateHabit initialIsGood={false} />
          </div>
        </div>
        {/* <div className="h-2 bg-slate-100 rounded-full overflow-hidden"> */}
        {/*   <div */}
        {/*     className="h-full bg-green-500 transition-all duration-700" */}
        {/*     style={{ width: `${total ? (done / total) * 100 : 0}%` }} */}
        {/*   /> */}
        {/* </div> */}
      </header>

      {/* active habits */}
      <HabitList habits={active} isLoading={loading} />

      {/* ended habits — only shown when there are any */}
      {ended && ended.length > 0 && (
        <section className="mt-10 pt-6 border-t border-slate-200">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
            Ended
          </h2>
          <HabitList habits={ended} isLoading={false} />
        </section>
      )}
    </div>
  );
}
