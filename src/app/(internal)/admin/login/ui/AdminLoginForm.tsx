"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { KeyRound, Loader2, Mail, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAdmin, loginAdminGoogle, type LoginAdminState } from "@/actions"
import { jecAssets } from "@/lib/jec-assets"
import { getOAuthLoginErrorMessage } from "@/lib/oauth-login-errors"

type AdminLoginFormProps = {
  oauthError?: string
  oauthReason?: string
}

const initialState: LoginAdminState = { ok: false }

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

function GoogleSubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full"
      disabled={disabled || pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <GoogleIcon className="mr-2 h-4 w-4" />
          Continuar con Google
        </>
      )}
    </Button>
  )
}

export function AdminLoginForm({ oauthError, oauthReason }: AdminLoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!oauthError) return
    window.history.replaceState(null, "", "/admin/login")
  }, [oauthError])

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
          <CardContent className="space-y-4">
            {oauthError ? (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {getOAuthLoginErrorMessage(oauthError, oauthReason)}
              </div>
            ) : null}
            {state.message ? (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {state.message}
              </div>
            ) : null}
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
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
                  <Link
                    href="/admin/forgot-password"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
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

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs text-muted-foreground">o</span>
              <span className="h-px flex-1 bg-neutral-200" />
            </div>

            <form action={loginAdminGoogle}>
              <GoogleSubmitButton disabled={isPending} />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
