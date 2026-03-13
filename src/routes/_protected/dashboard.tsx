import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user } = Route.useRouteContext()
  const displayName = user.name ?? user.email ?? 'there'

  return (
    <main className="mx-auto w-full max-w-5xl px-8 py-12">
      <h2 className="mb-4 text-2xl font-bold">Dashboard</h2>
      <span className="text-lg text-gray-700">
        Welcome, {displayName}!
      </span>
    </main>
  )
}
