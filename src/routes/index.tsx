import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="mx-auto w-full px-4 pb-8 pt-14">
      <Link to="/login" className="inline-flex rounded bg-blue-500 px-4 py-2 text-white">
        Sign In
      </Link>
    </main>
  )
}
