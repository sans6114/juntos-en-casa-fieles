import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin",
  display: "swap",
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
      className={`${inter.className} ${inter.variable} min-h-full text-base leading-normal antialiased`}
    >
      {children}
    </div>
  )
}
