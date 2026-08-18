import { AuthGuard } from '@/components/auth/auth-guard'

/**
 * Everything under /profile requires a signed-in user. The check runs client-side
 * (see AuthGuard) because the previous middleware check relied on a site-wide
 * "session hint" cookie that the security review flagged as overly broad.
 */
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
