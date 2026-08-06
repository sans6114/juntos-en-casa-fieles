import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Separator } from "@/components/ui/separator"
import { requireSession } from "@/lib/auth-guards"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireSession()

  return (
    <SidebarProvider>
      <AdminSidebar
        user={{
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
        }}
      />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden print:hidden">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium">Portal Admin</span>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
