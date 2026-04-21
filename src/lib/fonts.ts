import { Amiri, Geist, Geist_Mono, Vazirmatn } from "next/font/google"

export const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

export const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export const vazirmatn = Vazirmatn({
  variable: "--font-sans-fa",
  subsets: ["arabic", "latin"],
  display: "swap",
})

export const amiri = Amiri({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
})

export const fontVariables = [
  geistSans.variable,
  geistMono.variable,
  vazirmatn.variable,
  amiri.variable,
].join(" ")
