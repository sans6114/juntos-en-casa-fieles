import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { jecAssets } from "@/lib/jec-assets"
import { cn } from "@/lib/utils"
import { ResetPasswordForm } from "./ui/ResetPasswordForm"

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(220,38,38,0.08),_transparent_55%)]"
      />
      <div className="relative w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-3 text-center">
          <Image
            src={jecAssets.logos.jecBlackPng}
            alt="Juntos en Casa"
            width={180}
            height={64}
            className="h-14 w-auto object-contain"
            priority
          />
          <p className="text-sm text-muted-foreground">Portal de Administración</p>
        </div>

        <Card className="border-neutral-200 shadow-lg shadow-black/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Nueva contraseña</CardTitle>
            <CardDescription>
              {token
                ? "Elegí una nueva contraseña para tu cuenta."
                : "El enlace es inválido o está incompleto."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  El enlace de recuperación no es válido. Solicitá uno nuevo desde la página de
                  recuperación.
                </p>
                <Link
                  href="/admin/forgot-password"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Solicitar nuevo enlace
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
