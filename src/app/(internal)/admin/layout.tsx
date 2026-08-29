import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin",
  display: "swap",
})

/* Bajado desde el layout raiz: solo admin lo consume. Inter sigue siendo la
 * fuente que se ve (`inter.className`); Geist entra por las variables, que son
 * lo que `globals.css` mapea a --font-sans/--font-mono/--font-heading para los
 * componentes de shadcn que usan esas utilidades. */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin · Juntos En Casa",
  },
  description: "Portal administrativo de Juntos En Casa",
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`admin-shell ${inter.className} ${inter.variable} ${geistSans.variable} ${geistMono.variable} min-h-full text-base leading-normal antialiased`}
    >
      {children}
    </div>
  )
}
