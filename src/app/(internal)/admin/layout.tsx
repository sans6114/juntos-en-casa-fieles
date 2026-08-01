import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin",
  display: "swap",
})

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
