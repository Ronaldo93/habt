import HabitList from '#/components/habits/HabitList'
import { createFileRoute } from '@tanstack/react-router'
import CreateHabit from '#/components/habits/CreateHabit'

export const Route = createFileRoute('/habits')({
  component: RouteComponent,
})

// create

// read data from db or create demo data in the url

function RouteComponent() {
  // create

  // manually log
  


  return <div>
    <div>Habits</div>

    {/* following are stubs */}
    {/* create habit */}
    <div><CreateHabit /></div>

    {/* view habits (not categorized yet) */}
    <div>
      <HabitList />


    </div>
  </div>
}
