"use client"

import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function HorizontalDatePicker({
  startDate,
  daysCount = 5,
  onSelect,
}: {
  startDate?: Date
  daysCount?: number
  onSelect?: (date: Date) => void
}) {
  const baseDate = startDate || new Date()
  const [selected, setSelected] = useState<Date>(baseDate)

  const days = Array.from({ length: daysCount }).map((_, i) => {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + i)
    return date
  })

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
      {days.map((day) => (
        <Button
          key={day.toISOString()}
          variant={day.toDateString() === selected.toDateString() ? "default" : "ghost"}
          className="min-w-[72px] flex-shrink-0 text-sm flex flex-col items-center"
          onClick={() => {
            setSelected(day)
            onSelect?.(day)
          }}
        >
          <span className="font-semibold">{format(day, "d")}</span>
          <span className="text-muted-foreground text-xs">{format(day, "MMM")}</span>
        </Button>
      ))}
    </div>
  )
}
