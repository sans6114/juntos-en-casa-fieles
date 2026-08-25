import { AdminHeader } from "@/components/admin/admin-sidebar"
import { QrScanner } from "@/components/admin/qr-scanner"
import { requireSession } from "@/lib/auth-guards"

export const metadata = {
  title: "Escanear QR | Juntos en Casa",
}

export default async function EscanearQrPage() {
  await requireSession()

  return (
    <>
      <AdminHeader 
        title="Escanear QR" 
        description="Escanea el código QR de un asistente para confirmar su asistencia de hoy." 
      />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <QrScanner />
      </div>
    </>
  )
}
