// CLAVE PERSISTIDA: alimenta Congregacion.nombreNormalizado @unique.
// Cambiar este algoritmo exige una migracion de backfill (ver
// prisma/migrations/20260827200000_congregacion_estado_normalizado). No es la
// normalizacion de busqueda del combobox (esa es local en
// CongregacionCombobox.tsx y libre de cambiar sin migracion).
export function normalizarNombreCongregacion(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}
