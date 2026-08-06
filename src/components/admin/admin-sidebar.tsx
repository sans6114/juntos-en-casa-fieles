"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAdmin } from "@/actions"
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Table2,
  Users,
  X,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const inscripcionesItems = [
  {
    title: "Vista general",
    href: "/admin/inscripciones",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    title: "Grilla",
    href: "/admin/inscripciones/grilla",
    icon: Table2,
    adminOnly: false,
  },
]

type AdminSidebarProps = {
  user: {
    nombre: string
    email: string
    rol: "ADMIN" | "COLABORADOR"
  }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const isAdmin = user.rol === "ADMIN"
  const isInscripcionesSection = pathname.startsWith("/admin/inscripciones")
  const initials = user.nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const closeSidebar = () => {
    if (isMobile) setOpenMobile(false)
  }

  const visibleInscripciones = inscripcionesItems.filter(
    (item) => isAdmin || !item.adminOnly
  )

  return (
    <Sidebar collapsible="icon" className="print:hidden">
      <SidebarHeader>
        <div className="flex items-start gap-1">
          <SidebarMenu className="min-w-0 flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={
                  <Link
                    href={
                      isAdmin
                        ? "/admin/inscripciones"
                        : "/admin/inscripciones/grilla"
                    }
                    onClick={closeSidebar}
                  />
                }
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ClipboardList className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Juntos en Casa</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Portal Admin
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 md:hidden"
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            <X className="size-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isInscripcionesSection}
                  tooltip="Inscripciones"
                >
                  <ClipboardList />
                  <span>Inscripciones</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {visibleInscripciones.map((item) => (
                    <SidebarMenuSubItem key={item.href}>
                      <SidebarMenuSubButton
                        isActive={pathname === item.href}
                        render={<Link href={item.href} onClick={closeSidebar} />}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>

              {isAdmin ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname.startsWith("/admin/contacto")}
                      tooltip="Contacto"
                      render={
                        <Link href="/admin/contacto" onClick={closeSidebar} />
                      }
                    >
                      <MessageCircle />
                      <span>Contacto</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname.startsWith("/admin/usuarios")}
                      tooltip="Usuarios"
                      render={
                        <Link href="/admin/usuarios" onClick={closeSidebar} />
                      }
                    >
                      <Users />
                      <span>Usuarios</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 rounded-lg border bg-background p-2 group-data-[collapsible=icon]:hidden">
              <Avatar className="size-8">
                <AvatarFallback>{initials || "AD"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.nombre}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              onClick={async () => {
                await logoutAdmin()
                closeSidebar()
              }}
            >
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function AdminHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col gap-1 border-b bg-background px-6 py-5 print:hidden">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
