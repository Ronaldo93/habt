import { Card, CardTitle } from "../ui/card";

export default function HabitList() {
  return <div className="mx-20 ">

    {/* example of a card */}
    {/* good one had green */}
    <Card className="border-green-800/80 border-2 p-4">
        {/* title */}
        <CardTitle>Test habit</CardTitle>
    </Card>
    {/* bad one had red */}
    <Card className="border-red-800/80 border-2 p-4">
        {/* title */}
        <CardTitle>Habit</CardTitle>
    </Card>

  </div>;
}