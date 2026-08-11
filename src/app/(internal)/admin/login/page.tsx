import { AdminLoginForm } from "./ui/AdminLoginForm"

export const dynamic = "force-dynamic"

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string; reason?: string }>
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error, reason } = await searchParams

  return <AdminLoginForm oauthError={error} oauthReason={reason} />
}
