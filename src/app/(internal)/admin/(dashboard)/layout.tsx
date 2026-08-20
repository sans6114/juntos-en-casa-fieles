import Image from 'next/image';

import {
  AdminSidebar,
  RoleBadge,
} from '@/components/admin/admin-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { requireSession } from '@/lib/auth-guards';
import { jecAssets } from '@/lib/jec-assets';

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
          <Image
            src={jecAssets.logos.jecBlackPng}
            alt="Juntos en Casa"
            width={22}
            height={22}
            className="size-5 object-contain"
            unoptimized
          />
          <span className="text-sm font-semibold tracking-tight">Portal Admin</span>
          <div className="ml-auto">
            <RoleBadge rol={user.rol} />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
