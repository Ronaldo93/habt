import { createFileRoute, Link } from '@tanstack/react-router'


export const Route = createFileRoute('/')({ component: Home })



function Home() {
  return (
    <div className=''>
      <h1>Habt</h1>


      {/* view good habits */}
      <Link to="/habits">
        Good habits
      </Link>


      {/* view bad habits */}
    </div>
  )
}
