import { revalidatePath } from "next/cache"

/**
 * Rutas que muestran estado de acreditación y quedan stale al escribirlo.
 * Vive acá y no dentro de una action porque la escriben tres caminos distintos
 * —el escáner, el check manual y el ajuste por día— y si cada uno mantuviera su
 * propia lista, agregar una vista nueva significaría acordarse de tres lugares.
 */
export function revalidarVistasDeAsistencia() {
  revalidatePath("/admin/inscripciones", "layout")
  revalidatePath("/admin/asistencias")
}
