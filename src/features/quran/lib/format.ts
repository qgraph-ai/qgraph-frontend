const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const

export function toArabicDigits(value: number): string {
  return String(value)
    .split("")
    .map((ch) => (ch >= "0" && ch <= "9" ? ARABIC_INDIC_DIGITS[Number(ch)] : ch))
    .join("")
}

export function padSurahNumber(n: number): string {
  return String(n).padStart(3, "0")
}
