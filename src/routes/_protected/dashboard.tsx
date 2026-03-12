import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user } = Route.useRouteContext()
  const displayName = user.name ?? user.email ?? 'there'

  return <div>Welcome, {displayName}!</div>
}
