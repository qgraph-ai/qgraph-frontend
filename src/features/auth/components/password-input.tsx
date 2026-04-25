"use client"

import { Eye, EyeOff } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  toggleAriaLabelShow?: string
  toggleAriaLabelHide?: string
}

export function PasswordInput({
  className,
  toggleAriaLabelShow = "Show password",
  toggleAriaLabelHide = "Hide password",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pe-9", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute end-0.5 top-1/2 -translate-y-1/2"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? toggleAriaLabelHide : toggleAriaLabelShow}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  )
}
