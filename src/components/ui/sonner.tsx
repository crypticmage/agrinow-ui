"use client"

import type { CSSProperties } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  const isDark = theme === "dark"
  const isLight = theme === "light"

  const baseStyle = isLight
    ? {
        "--normal-bg": "#020617", // near-black
        "--normal-text": "#f9fafb",
        "--normal-border": "#020617",
        "--border-radius": "var(--radius)",
      }
    : isDark
      ? {
          "--normal-bg": "#f9fafb",
          "--normal-text": "#020617",
          "--normal-border": "#020617",
          "--border-radius": "var(--radius)",
        }
      : {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        }

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={baseStyle as CSSProperties}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
