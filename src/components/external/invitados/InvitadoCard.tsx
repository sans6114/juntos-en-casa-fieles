"use client"

import Image from "next/image"
import { useId, useState } from "react"

import { cn } from "@/lib/utils"

import type { Invitado } from "./data"

type InvitadoCardProps = {
  invitado: Invitado
}

export function InvitadoCard({ invitado }: InvitadoCardProps) {
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const nameId = useId()
  const revealed = pinned || hovered || focused
  const accentColor =
    invitado.accent === "amber" ? "var(--jec-amber)" : "var(--jec-ember)"

  return (
    <button
      type="button"
      aria-pressed={revealed}
      aria-labelledby={revealed ? nameId : undefined}
      aria-label={
        revealed
          ? undefined
          : "Invitado misterioso. Pulsá para revelar quién es."
      }
      onClick={() => setPinned((prev) => !prev)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false)
        setPinned(false)
      }}
      className={cn(
        "group relative aspect-[3/4] w-full overflow-hidden bg-[var(--jec-ink-soft)] text-left",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-amber)]"
      )}
    >
      <Image
        src={invitado.imageSrc}
        alt={revealed ? invitado.name : ""}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className={cn(
          "object-cover object-center transition-[filter,transform] duration-500 ease-out",
          "motion-reduce:transition-none",
          revealed
            ? "scale-100 grayscale-0"
            : "scale-105 grayscale contrast-125 brightness-90"
        )}
      />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
          revealed ? "opacity-0" : "opacity-[0.55]"
        )}
        style={{
          backgroundColor: accentColor,
          mixBlendMode: "color",
        }}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-[var(--jec-ink)]/25 transition-opacity duration-500 motion-reduce:transition-none",
          revealed ? "opacity-0" : "opacity-100"
        )}
      />

      <span
        aria-hidden
        className={cn(
          "jec-display pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
          "text-7xl font-extrabold leading-none md:text-8xl",
          "transition-opacity duration-300 motion-reduce:transition-none",
          revealed ? "opacity-0" : "opacity-100"
        )}
        style={{ color: accentColor }}
      >
        ?
      </span>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[var(--jec-ink)] via-[var(--jec-ink)]/80 to-transparent px-4 pb-5 pt-16",
          "transition-opacity duration-300 motion-reduce:transition-none",
          revealed ? "opacity-100" : "opacity-0"
        )}
      >
        <p
          id={nameId}
          className="jec-display text-lg font-extrabold tracking-tight text-[var(--jec-bone)] md:text-xl"
        >
          {invitado.name}
        </p>
      </div>
    </button>
  )
}
