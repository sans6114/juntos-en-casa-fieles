"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { KeyRound, Loader2, Mail, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAdmin } from "@/actions"
import { jecAssets } from "@/lib/jec-assets"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Por favor completa todos los campos.")
      return
    }

    startTransition(async () => {
      const response = await loginAdmin(email, password)
      if (response.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        setError(response.message || "Credenciales incorrectas.")
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
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresá tus credenciales para acceder al panel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="animate-in fade-in-50 slide-in-from-top-1 rounded-lg border border-neutral-200 border-l-4 border-l-[var(--jec-admin-accent)] bg-neutral-50 p-3 text-sm font-medium text-neutral-900 duration-200">
                  {error}
                </div>
              )}

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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    disabled={isPending}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    disabled={isPending}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="group/btn relative w-full overflow-hidden bg-black text-white hover:bg-neutral-900"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
