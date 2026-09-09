import { AuthGuard } from '@/components/auth/auth-guard'

/**
 * Everything under /package-management requires a signed-in user. Without this
 * guard the page's mount-time fetches raced the session bootstrap and lost on
 * every hard reload, surfacing as "could not load subscription".
 */
export default function PackageManagementLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
