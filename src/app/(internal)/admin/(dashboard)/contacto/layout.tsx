import { Fraunces } from "next/font/google"
import { requireAdmin } from "@/lib/auth-guards"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-contacto-display",
  display: "swap",
})

export default async function ContactoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div
      className={`${fraunces.variable} contacto-scope min-h-full bg-[var(--contacto-bg)]`}
      style={
        {
          "--contacto-bg": "#f7f4ef",
          "--contacto-surface": "#fffdf9",
          "--contacto-ink": "#1c1917",
          "--contacto-muted": "#57534e",
          "--contacto-border": "#e7e0d6",
          "--contacto-accent": "#b45309",
          "--contacto-done": "#0f766e",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}
