"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="group inline-flex h-10 w-10 items-center justify-center rounded-full border"
    >
      {isDark ? (
        // 🌙 Moon
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M20.99 13.28A8 8 0 1 1 10.72 3.01 6 6 0 1 0 20.99 13.28Z" />
        </svg>
      ) : (
        // ☀️ Sun
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
        </svg>
      )}
    </button>
  )
}