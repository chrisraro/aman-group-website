"use client"

import Link from "next/link"
import { Button, type ButtonProps } from "@/components/ui/button"

export function ContactButton({ children = "Contact Us", className, ...props }: ButtonProps) {
  return (
    <Link href="/contact">
      <Button className={className} {...props}>
        {children}
      </Button>
    </Link>
  )
}
