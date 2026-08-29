"use client"

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react"
import Fuse from "fuse.js"

export type Congregacion = {
  id: string
  nombre: string
}

type CongregacionComboboxProps = {
  congregaciones: Congregacion[]
  query: string
  selectedId: string
  onChange: (query: string, id: string) => void
}

function normalizeQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Fixed regex range to avoid syntax errors
    .toLowerCase()
    .trim()
}

export function CongregacionCombobox({
  congregaciones,
  query,
  selectedId,
  onChange,
}: CongregacionComboboxProps) {
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const fuse = useMemo(
    () => new Fuse(congregaciones, { keys: ["nombre"], threshold: 0.4, ignoreLocation: true }),
    [congregaciones]
  )

  const results = useMemo(() => {
    const normalized = normalizeQuery(query)
    if (!normalized) return congregaciones
    return fuse.search(normalized).map((match) => match.item)
  }, [query, congregaciones, fuse])

  function selectCongregacion(congregacion: Congregacion) {
    onChange(congregacion.nombre, congregacion.id)
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  function handleChange(value: string) {
    let nextId = selectedId
    if (selectedId) {
      const selected = congregaciones.find((c) => c.id === selectedId)
      if (!selected || selected.nombre !== value) {
        nextId = ""
      }
    }
    onChange(value, nextId)
    setIsOpen(true)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setActiveIndex(0)
        return
      }
      setActiveIndex((current) => (current + 1 >= results.length ? 0 : current + 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      if (!isOpen) return
      setActiveIndex((current) => (current - 1 < 0 ? results.length - 1 : current - 1))
    } else if (event.key === "Enter") {
      if (isOpen && activeIndex >= 0 && results[activeIndex]) {
        event.preventDefault()
        selectCongregacion(results[activeIndex])
      }
    } else if (event.key === "Escape") {
      if (isOpen) {
        event.preventDefault()
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
  }

  const activeOption = isOpen && activeIndex >= 0 ? results[activeIndex] : undefined
  const activeOptionId = activeOption ? `${listboxId}-option-${activeOption.id}` : undefined

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id="congregacion-input"
        name="congregacionQuery"
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        autoComplete="off"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        placeholder="Buscá tu congregación"
        className="min-h-12 w-full rounded-[6px] border border-[var(--regla)] bg-transparent px-4 py-3 text-base text-[var(--dato)] placeholder:text-[var(--suave)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foco)]"
      />
      <input type="hidden" name="congregacionId" value={selectedId} />

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Congregaciones sugeridas"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-[6px] border border-[var(--regla)] bg-[var(--sup)] text-sm shadow-[3px_3px_0_0_var(--regla)]"
        >
          {results.length === 0 ? (
            <li role="presentation" className="px-4 py-3 text-[var(--suave)]">
              No encontramos coincidencias. Podés dejarlo así e inscribirte igual.
            </li>
          ) : (
            results.map((congregacion, index) => (
              <li
                key={congregacion.id}
                id={`${listboxId}-option-${congregacion.id}`}
                role="option"
                aria-selected={congregacion.id === selectedId}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCongregacion(congregacion)}
                className={
                  index === activeIndex
                    ? "cursor-pointer bg-[var(--acento)] px-4 py-3 text-[var(--jec-ink)]"
                    : "cursor-pointer px-4 py-3 text-[var(--dato)] hover:bg-[var(--acento)] hover:text-[var(--jec-ink)]"
                }
              >
                {congregacion.nombre}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
