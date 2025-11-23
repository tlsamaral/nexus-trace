import dayjs from "dayjs"

// ------------------------------
// 🔹 Formatar moeda (R$)
// ------------------------------
export function formatCurrency(value: number | null | undefined) {
  if (!value) return "R$ 0,00"
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

// ------------------------------
// 🔹 Formatar datas ISO
// ------------------------------
export function formatDate(value: string | null, mask = "DD/MM/YYYY HH:mm:ss") {
  if (!value) return "—"
  return dayjs(value).format(mask)
}

// ------------------------------
// 🔹 Formatar números inteiros
// ------------------------------
export function formatInt(value: number | null | undefined) {
  return value ? value.toLocaleString("pt-BR") : "0"
}

// ------------------------------
// 🔹 Formatar risco médio (24h)
// Ex.: 1054 → "1.054"
// ------------------------------
export function formatRisk(value: number | null | undefined) {
  return value ? value.toFixed(2) : "0.00"
}