import { obtenerContactosSinIglesia } from "@/actions"
import { ContactoBoard } from "./ui/ContactoBoard"

export default async function ContactoPage() {
  const rows = await obtenerContactosSinIglesia()

  return <ContactoBoard rows={rows} />
}
