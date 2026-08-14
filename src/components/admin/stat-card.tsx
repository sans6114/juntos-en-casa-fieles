import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

type StatCardAccent = "default" | "red"

type StatCardProps = {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  accent?: StatCardAccent
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
}

const accentBorder: Record<StatCardAccent, string> = {
  default: "border-l-neutral-300",
  red: "border-l-[var(--jec-admin-accent)]",
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "default",
  trend,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-l-4 shadow-sm",
        accentBorder[accent],
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
        {trend ? (
          <p className="mt-2 text-xs font-medium text-neutral-700">
            {trend.positive ? "+" : ""}
            {trend.value}% {trend.label}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
