"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "@/actions"
import { jecAssets } from "@/lib/jec-assets"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Ingresá tu correo electrónico.")
      return
    }

    startTransition(async () => {
      const response = await requestPasswordReset(email)
      if (response.ok) {
        toast.success(response.message ?? "Revisá tu correo.")
        setSent(true)
      } else {
        toast.error(response.message ?? "No se pudo procesar la solicitud.")
      }
    })
  }

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
            <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
            <CardDescription>
              {sent
                ? "Si el email está registrado, te enviamos un enlace para restablecer tu contraseña."
                : "Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Revisá tu bandeja de entrada (y la carpeta de spam). El enlace vence en 1 hora.
                </p>
                <Link
                  href="/admin/login"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a iniciar sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      disabled={isPending}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-neutral-900"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar enlace"
                  )}
                </Button>

                <Link
                  href="/admin/login"
                  className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Volver a iniciar sesión
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
