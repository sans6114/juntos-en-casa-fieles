"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAdmin } from "@/actions"
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Shield,
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { jecAssets } from "@/lib/jec-assets"
import { cn } from "@/lib/utils"

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

function RoleBadge({ rol }: { rol: "ADMIN" | "COLABORADOR" }) {
  const isAdmin = rol === "ADMIN"
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-0 text-[10px] font-semibold tracking-wide uppercase",
        isAdmin
          ? "bg-[var(--jec-admin-accent)] text-white"
          : "bg-neutral-200 text-neutral-800"
      )}
    >
      {isAdmin ? "Admin" : "Colaborador"}
    </Badge>
  )
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
                <div className="relative flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-[var(--jec-admin-accent)]/15">
                  <Image
                    src={jecAssets.logos.ivsWhite}
                    alt="Juntos en Casa"
                    width={28}
                    height={28}
                    className="size-7 object-contain"
                    unoptimized
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">
                    Juntos en Casa
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/65">
                    Portal Admin
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            <X className="size-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
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
                        render={
                          <Link href={item.href} onClick={closeSidebar} />
                        }
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        {item.adminOnly ? (
                          <Shield className="ml-auto size-3 opacity-50" />
                        ) : null}
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-1.5">
              Administración
              <span className="rounded bg-[var(--jec-admin-accent)] px-1.5 py-0.5 text-[10px] font-medium text-white">
                Admin
              </span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-2 group-data-[collapsible=icon]:hidden">
              <Avatar className="size-8">
                <AvatarFallback className="bg-neutral-700 text-white">
                  {initials || "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{user.nombre}</p>
                  <RoleBadge rol={user.rol} />
                </div>
                <p className="truncate text-xs text-sidebar-foreground/65">
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
    <div className="flex flex-col gap-1 border-b border-border bg-background px-6 py-5 print:hidden">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export { RoleBadge }
