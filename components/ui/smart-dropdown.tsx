"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface SmartDropdownProps {
  children: React.ReactNode
  trigger: React.ReactNode
  className?: string
}

export function SmartDropdown({ children, trigger, className }: SmartDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={5}
        className={`max-h-[50vh] overflow-y-auto ${className || ''}`}
        avoidCollisions={true}
        collisionPadding={10}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}