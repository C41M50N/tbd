import { createFileRoute, getRouteApi } from '@tanstack/react-router'

const protectedRouteApi = getRouteApi('/_protected')

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user } = protectedRouteApi.useRouteContext()
  const displayName = user.name ?? user.email ?? 'there'

  return <div>Welcome, {displayName}!</div>
}
